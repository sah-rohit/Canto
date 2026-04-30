import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

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
          name: 'ai-api-middleware',
          configureServer(server) {
            server.middlewares.use('/api/ai', async (req, res) => {
              if (req.method === 'OPTIONS') {
                // CORS preflight
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

              // Handle preflight by reading body after headers are set
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

              let body = '';
              for await (const chunk of req) {
                body += chunk;
              }

              let data;
              try {
                data = JSON.parse(body);
              } catch {
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
              }

              const { provider, model, messages, stream } = data;

              // Map provider names to actual endpoints
              let endpoint = '';
              let apiKey = '';
              let headers: Record<string, string> = { 'Content-Type': 'application/json' };
              let requestBody: Record<string, unknown> = {};

              if (provider === 'ollama') {
                endpoint = 'https://ollama.com/v1/chat/completions';
                // Select the correct key based on the model
                apiKey = model.includes('kimi') ? env.OLLAMA_KIMI_KEY : env.OLLAMA_DEEPSEEK_KEY;
                headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = {
                  model,
                  messages,
                  temperature: 0.7,
                  max_tokens: 1024,
                  stream,
                };
              } else if (provider === 'groq') {
                endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                apiKey = env.GROQ_API_KEY;
                headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = {
                  model,
                  messages,
                  temperature: 0.7,
                  max_tokens: 1024,
                  stream,
                };
              } else if (provider === 'huggingface') {
                // HuggingFace Inference API — OpenAI-compatible router endpoint
                endpoint = `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`;
                apiKey = env.HUGGINGFACE_KEY || '';
                if (apiKey) {
                  headers['Authorization'] = `Bearer ${apiKey}`;
                }
                requestBody = {
                  model,
                  messages,
                  temperature: 0.7,
                  max_tokens: 512,
                  stream: false,
                };
              } else if (provider === 'gemini') {
                // Google Gemini API
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${env.GEMINI_KEY || env.API_KEY}`;
                apiKey = '';
                headers = { 'Content-Type': 'application/json' };
                const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
                requestBody = {
                  contents: [{
                    role: 'user',
                    parts: [{ text: lastUserMsg?.content || messages[messages.length - 1]?.content || '' }]
                  }],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                  },
                };
              }
              
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

              if (stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
              }

              try {
                const apiRes = await fetch(endpoint, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(requestBody),
                });

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
                  
                  // Transform response to standard format
                  let transformed = json;
                  if (provider === 'huggingface') {
                    // HF OpenAI-compatible format: { choices: [{ message: { content: "..." } }] }
                    const content = json?.choices?.[0]?.message?.content;
                    if (content) {
                      transformed = { message: { content } };
                    }
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
      define: {
        'process.env.OLLAMA_DEEPSEEK_KEY': JSON.stringify(env.OLLAMA_DEEPSEEK_KEY),
        'process.env.OLLAMA_KIMI_KEY':     JSON.stringify(env.OLLAMA_KIMI_KEY),
        'process.env.GROQ_API_KEY':        JSON.stringify(env.GROQ_API_KEY),
        'process.env.HUGGINGFACE_KEY':     JSON.stringify(env.HUGGINGFACE_KEY),
        'process.env.API_KEY':             JSON.stringify(env.GROQ_API_KEY || env.HUGGINGFACE_KEY),
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