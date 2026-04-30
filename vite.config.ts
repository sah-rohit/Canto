import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// ─── Server-side IP rate limiting store ──────────────────────────────────────
// KEY: IP address only (cross-browser tracking — all browsers on same IP share the pool)
const ipRateLimits: Map<string, { count: number; date: string }> = new Map();
const IP_DAILY_LIMIT = 15;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || '0.0.0.0';
}

function checkIPRateLimit(ip: string): { allowed: boolean; remaining: number; limit: number } {
  const today = todayStr();
  const entry = ipRateLimits.get(ip);

  if (!entry || entry.date !== today) {
    ipRateLimits.set(ip, { count: 0, date: today });
    return { allowed: true, remaining: IP_DAILY_LIMIT, limit: IP_DAILY_LIMIT };
  }

  const remaining = Math.max(0, IP_DAILY_LIMIT - entry.count);
  return { allowed: remaining > 0, remaining, limit: IP_DAILY_LIMIT };
}

function recordIPSearch(ip: string): void {
  const today = todayStr();
  const entry = ipRateLimits.get(ip);

  if (!entry || entry.date !== today) {
    ipRateLimits.set(ip, { count: 1, date: today });
  } else {
    entry.count++;
  }
}

// ─── Helper: read request body ────────────────────────────────────────────────
async function readBody(req: any): Promise<string> {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }
  return body;
}

// ─── Helper: set CORS + security headers ──────────────────────────────────────
function setCors(res: any): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function setSecurityHeaders(res: any): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        legacy({
          targets: ['defaults', 'not IE 11', 'safari >= 12', 'chrome >= 70', 'firefox >= 65', 'edge >= 79'],
          additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
          renderLegacyChunks: true,
          modernPolyfills: true,
        }),
        {
          name: 'canto-api-middleware',
          configureServer(server) {

            // ── Security headers on all responses ──
            server.middlewares.use((req, res, next) => {
              setSecurityHeaders(res);
              next();
            });

            // ═══════════════════════════════════════════════════════════════════
            //  /api/rate-limit — Server-side IP-only rate limiting
            //  IP is the sole key — switching browsers does NOT reset credits
            // ═══════════════════════════════════════════════════════════════════
            server.middlewares.use('/api/rate-limit', async (req, res) => {
              if (req.method === 'OPTIONS') { setCors(res); res.statusCode = 204; res.end(); return; }
              setCors(res);

              const ip = getClientIP(req);
              const status = checkIPRateLimit(ip);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(status));
            });

            // ═══════════════════════════════════════════════════════════════════
            //  /api/rate-limit-record — Record a search (IP-keyed)
            // ═══════════════════════════════════════════════════════════════════
            server.middlewares.use('/api/rate-limit-record', async (req, res) => {
              if (req.method === 'OPTIONS') { setCors(res); res.statusCode = 204; res.end(); return; }
              setCors(res);

              const ip = getClientIP(req);
              recordIPSearch(ip);
              const status = checkIPRateLimit(ip);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, ...status }));
            });

            // ═══════════════════════════════════════════════════════════════════
            //  /api/knowledge — Multi-source knowledge aggregation
            // ═══════════════════════════════════════════════════════════════════
            server.middlewares.use('/api/knowledge', async (req, res) => {
              if (req.method === 'OPTIONS') { setCors(res); res.statusCode = 204; res.end(); return; }
              if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
              setCors(res);
              res.setHeader('Content-Type', 'application/json');

              const body = await readBody(req);
              let topic = '';
              try {
                topic = JSON.parse(body).topic;
              } catch {
                res.statusCode = 400; res.end('{}'); return;
              }

              if (!topic) { res.end('{}'); return; }

              const encoded = encodeURIComponent(topic);
              const results: Record<string, string> = {};

              const fetchWithTimeout = async (url: string, opts: RequestInit = {}, ms = 5000): Promise<Response> => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), ms);
                try {
                  return await fetch(url, { ...opts, signal: controller.signal });
                } finally {
                  clearTimeout(timer);
                }
              };

              const tasks = [
                // ── Wikipedia ────────────────────────────────────────────────
                (async () => {
                  try {
                    const wikiRes = await fetchWithTimeout(
                      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
                      { headers: { 'User-Agent': 'CantoEncyclopedia/1.0 (contact@sonatainteractive.com)', 'Accept': 'application/json' } }
                    );
                    if (wikiRes.ok) {
                      const data = await wikiRes.json();
                      if (data.extract) {
                        results.wikipedia = data.extract.slice(0, 1500);
                      }
                    }
                  } catch (e: any) {
                    console.warn('[Knowledge] Wikipedia failed:', e.message);
                  }
                })(),

                // ── Internet Archive (Open Library) ──────────────────────────
                (async () => {
                  try {
                    const iaRes = await fetchWithTimeout(
                      `https://openlibrary.org/search.json?q=${encoded}&limit=3`,
                      { headers: { 'User-Agent': 'CantoEncyclopedia/1.0' } }
                    );
                    if (iaRes.ok) {
                      const data = await iaRes.json();
                      if (data.docs && data.docs.length > 0) {
                        const summaries = data.docs.slice(0, 3).map((d: any) => {
                          const author = d.author_name?.[0] || 'Unknown';
                          const year = d.first_publish_year || 'N/A';
                          return `"${d.title}" by ${author} (${year})`;
                        });
                        results.internetArchive = `Related books: ${summaries.join('; ')}`;
                      }
                    }
                  } catch (e: any) {
                    console.warn('[Knowledge] Internet Archive failed:', e.message);
                  }
                })(),

                // ── NASA ─────────────────────────────────────────────────────
                (async () => {
                  try {
                    const nasaRes = await fetchWithTimeout(
                      `https://images-api.nasa.gov/search?q=${encoded}&media_type=image&page_size=3`
                    );
                    if (nasaRes.ok) {
                      const data = await nasaRes.json();
                      const items = data?.collection?.items;
                      if (items && items.length > 0) {
                        const descriptions = items.slice(0, 2).map((item: any) => {
                          const desc = item?.data?.[0]?.description || '';
                          return desc.slice(0, 300);
                        }).filter(Boolean);
                        if (descriptions.length > 0) {
                          results.nasa = descriptions.join(' | ');
                        }
                      }
                    }
                  } catch (e: any) {
                    console.warn('[Knowledge] NASA failed:', e.message);
                  }
                })(),

                // ── CORE (academic papers) ───────────────────────────────────
                (async () => {
                  try {
                    const coreKey = env.CORE_API_KEY;
                    if (!coreKey) return;
                    const coreRes = await fetchWithTimeout(
                      `https://api.core.ac.uk/v3/search/works?q=${encoded}&limit=3`,
                      { headers: { 'Authorization': `Bearer ${coreKey}`, 'Accept': 'application/json' } }
                    );
                    if (coreRes.ok) {
                      const data = await coreRes.json();
                      if (data.results && data.results.length > 0) {
                        const papers = data.results.slice(0, 3).map((p: any) => {
                          const authors = p.authors?.map((a: any) => a.name).join(', ') || 'Unknown';
                          const abstract = p.abstract?.slice(0, 200) || '';
                          return `"${p.title}" (${authors})${abstract ? ': ' + abstract : ''}`;
                        });
                        results.core = papers.join('\n');
                      }
                    }
                  } catch (e: any) {
                    console.warn('[Knowledge] CORE failed:', e.message);
                  }
                })(),
              ];

              await Promise.allSettled(tasks);
              res.end(JSON.stringify(results));
            });

            // ═══════════════════════════════════════════════════════════════════
            //  /api/ai — AI provider proxy (Groq, Ollama, HuggingFace, Gemini)
            // ═══════════════════════════════════════════════════════════════════
            server.middlewares.use('/api/ai', async (req, res) => {
              if (req.method === 'OPTIONS') {
                setCors(res);
                res.setHeader('Access-Control-Max-Age', '86400');
                res.statusCode = 204;
                res.end();
                return;
              }

              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              setCors(res);

              const body = await readBody(req);
              let data;
              try {
                data = JSON.parse(body);
              } catch {
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
              }

              const { provider, model, messages, stream } = data;

              let endpoint = '';
              let apiKey = '';
              let headers: Record<string, string> = { 'Content-Type': 'application/json' };
              let requestBody: Record<string, unknown> = {};

              if (provider === 'ollama') {
                endpoint = 'https://ollama.com/v1/chat/completions';
                apiKey = model.includes('kimi') ? env.OLLAMA_KIMI_KEY : env.OLLAMA_DEEPSEEK_KEY;
                headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = { model, messages, temperature: 0.7, max_tokens: 1024, stream };
              } else if (provider === 'groq') {
                endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                apiKey = env.GROQ_API_KEY;
                headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = { model, messages, temperature: 0.7, max_tokens: 1024, stream };
              } else if (provider === 'huggingface') {
                endpoint = `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`;
                apiKey = env.HUGGINGFACE_KEY || '';
                if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = { model, messages, temperature: 0.7, max_tokens: 512, stream: false };
              } else if (provider === 'gemini') {
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${env.GEMINI_KEY || env.API_KEY}`;
                apiKey = '';
                headers = { 'Content-Type': 'application/json' };
                const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
                requestBody = {
                  contents: [{ role: 'user', parts: [{ text: lastUserMsg?.content || messages[messages.length - 1]?.content || '' }] }],
                  generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
                };
              }

              if (stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
              }

              try {
                const apiRes = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(requestBody) });

                if (!apiRes.ok) {
                  const errText = await apiRes.text();
                  res.statusCode = apiRes.status;
                  res.end(errText);
                  return;
                }

                if (stream) {
                  const reader = apiRes.body?.getReader();
                  const decoder = new TextDecoder();
                  if (reader) {
                    let buffer = '';
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      buffer += decoder.decode(value, { stream: true });
                      const lines = buffer.split('\n');
                      buffer = lines.pop() || '';
                      for (const line of lines) {
                        if (line.trim()) res.write(line + '\n');
                      }
                    }
                  }
                  res.end();
                } else {
                  const json = await apiRes.json();
                  let transformed = json;
                  if (provider === 'huggingface') {
                    const content = json?.choices?.[0]?.message?.content;
                    if (content) transformed = { message: { content } };
                  }
                  res.end(JSON.stringify(transformed));
                }
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          },
        },
      ],
      // SECURITY: No API keys exposed to client bundle
      define: {
        'process.env.API_KEY': JSON.stringify('SERVER_SIDE_ONLY'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.')
        }
      },
      build: {
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
          compress: { drop_console: false },
        },
      },
    };
});