export const onRequest = async (context: any) => {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Without Cloudflare KV, we cannot track IP-based limits persistently across different edge nodes.
  // We return null for counts to tell the client: "Use your local localStorage for tracking, but I'll still proxy the requests."
  
  return new Response(JSON.stringify({
    allowed: true,
    remaining: null, // Signals client to use local state
    limit: 15,
    resetsAt: 'midnight'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
