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
      requestBody = { model, messages, temperature: 0.7, max_tokens: 1024, stream };
    } else if (provider === 'github') {
      // GitHub Models — OpenAI-compatible endpoint
      endpoint = 'https://models.inference.ai.azure.com/chat/completions';
      apiKey = model.toLowerCase().includes('grok')
        ? env.GITHUB_GROK_KEY
        : env.GITHUB_DEEPSEEK_KEY;
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = { model, messages, temperature: 0.7, max_tokens: 1024, stream };
    } else if (provider === 'huggingface') {
      endpoint = `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`;
      apiKey = env.HUGGINGFACE_KEY || '';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = { model, messages, temperature: 0.7, max_tokens: 512, stream: false };
    } else if (provider === 'gemini') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${env.GEMINI_KEY || env.API_KEY}`;
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
    
    if (stream) {
      responseHeaders.set('Content-Type', 'text/event-stream');
      responseHeaders.set('Cache-Control', 'no-cache');
      responseHeaders.set('Connection', 'keep-alive');
      return new Response(apiRes.body, { headers: responseHeaders });
    } else {
      const json = await apiRes.json();
      let transformed = json;
      if (provider === 'huggingface') {
        const content = json?.choices?.[0]?.message?.content;
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
