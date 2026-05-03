export const onRequest = async (context: any) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();
    const { provider, model, messages, stream } = data;

    let endpoint = '';
    let apiKey = '';
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let requestBody: Record<string, any> = {};

    if (provider === 'ollama') {
      endpoint = 'https://ollama.com/v1/chat/completions';
      // qwen3-next uses key slot 1 (OLLAMA_DEEPSEEK_KEY), nemotron uses key slot 2 (OLLAMA_KIMI_KEY)
      apiKey = model.includes('nemotron') ? env.OLLAMA_KIMI_KEY : env.OLLAMA_DEEPSEEK_KEY;
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = { model, messages, temperature: 0.7, max_tokens: 1024, stream };
    } else if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      apiKey = env.GROQ_API_KEY;
      headers['Authorization'] = `Bearer ${apiKey}`;
      // Keep max_tokens low to avoid Groq's 6000 TPM limit
      requestBody = { model, messages, temperature: 0.7, max_tokens: 800, stream };
    } else if (provider === 'github') {
      // GitHub Models — OpenAI-compatible endpoint
      endpoint = 'https://models.inference.ai.azure.com/chat/completions';
      apiKey = model.toLowerCase().includes('grok')
        ? env.GITHUB_GROK_KEY
        : env.GITHUB_DEEPSEEK_KEY;
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = { model, messages, temperature: 0.7, max_tokens: 1024, stream };
    } else if (provider === 'cloudflare') {
      // Cloudflare Workers AI — map friendly model names to real CF model IDs
      const CF_MODEL_MAP: Record<string, { accountKey: 'CF_ACCOUNT_1' | 'CF_ACCOUNT_2'; cfId: string }> = {
        'google/gemini-3.1-flash-lite': { accountKey: 'CF_ACCOUNT_1', cfId: '@cf/google/gemini-flash-1.5' },
        'openai/gpt-4.1-mini':          { accountKey: 'CF_ACCOUNT_2', cfId: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
      };
      const mapped = CF_MODEL_MAP[model];
      const cfAccountId = mapped?.accountKey === 'CF_ACCOUNT_2' ? env.CF_ACCOUNT_2_ID : env.CF_ACCOUNT_1_ID;
      const cfToken     = mapped?.accountKey === 'CF_ACCOUNT_2' ? env.CF_ACCOUNT_2_TOKEN : env.CF_ACCOUNT_1_TOKEN;
      const cfModelId   = mapped?.cfId ?? (model.startsWith('@') ? model : `@cf/${model}`);
      endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${cfModelId}`;
      apiKey = cfToken;
      headers['Authorization'] = `Bearer ${apiKey}`;
      // CF Workers AI does not support SSE streaming — always non-stream
      requestBody = { messages, max_tokens: 1024 };
    } else if (provider === 'huggingface') {
      endpoint = `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`;
      apiKey = env.HUGGINGFACE_KEY || '';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = { model, messages, temperature: 0.7, max_tokens: 512, stream: false };
    } else if (provider === 'gemini') {
      const method = stream ? 'streamGenerateContent' : 'generateContent';
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}?key=${env.GEMINI_KEY || env.API_KEY}`;
      headers = { 'Content-Type': 'application/json' };
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
      requestBody = {
        contents: [{ role: 'user', parts: [{ text: lastUserMsg?.content || messages[messages.length - 1]?.content || '' }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      };
    }

    if (!apiKey && provider !== 'gemini') {
      console.error(`[Canto AI] Missing API key for provider: ${provider}`);
      return new Response(JSON.stringify({ error: `API Key for ${provider} is not configured.` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`[Canto AI] ${provider} API error (${apiRes.status}):`, errText);
      return new Response(errText, { status: apiRes.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    // Cloudflare Workers AI always returns JSON — handle separately
    if (provider === 'cloudflare') {
      const json = await apiRes.json();
      const content = json?.result?.response ?? json?.choices?.[0]?.message?.content ?? '';
      if (!content) {
        return new Response(JSON.stringify({ error: 'Empty CF response', raw: json }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      if (stream) {
        // Emit as a single SSE event so the client stream parser works
        const chunk = JSON.stringify({ choices: [{ delta: { content }, finish_reason: null }] });
        const body = `data: ${chunk}\n\ndata: [DONE]\n\n`;
        return new Response(body, {
          headers: {
            ...responseHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });
      }
      return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (stream) {
      responseHeaders.set('Content-Type', 'text/event-stream');
      responseHeaders.set('Cache-Control', 'no-cache');
      responseHeaders.set('Connection', 'keep-alive');

      // Gemini streaming returns newline-delimited JSON, not SSE.
      // Transform it into proper SSE so the client parser works uniformly.
      if (provider === 'gemini') {
        const reader = apiRes.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            if (!reader) { controller.close(); return; }
            let buffer = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                  const json = JSON.parse(trimmed);
                  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const chunk = JSON.stringify({ choices: [{ delta: { content: text }, finish_reason: null }] });
                    controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
                  }
                } catch { /* skip malformed */ }
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          },
        });
        return new Response(readable, { headers: responseHeaders });
      }

      return new Response(apiRes.body, { headers: responseHeaders });
    } else {
      const json = await apiRes.json();
      let transformed = json;
      if (provider === 'huggingface') {
        const content = json?.choices?.[0]?.message?.content;
        if (content) transformed = { message: { content } };
      } else if (provider === 'gemini') {
        const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) transformed = { message: { content } };
      }
      return new Response(JSON.stringify(transformed), {
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    console.error(`[Canto AI] Fatal error:`, err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
