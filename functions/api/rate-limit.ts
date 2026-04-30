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

  // Without KV or Durable Objects, server-side tracking is limited to the current edge node.
  // We'll return the default limit for now to ensure the UI doesn't break.
  // Production suggestion: Connect a Cloudflare KV namespace.
  
  return new Response(JSON.stringify({
    allowed: true,
    remaining: 15,
    limit: 15,
    resetsAt: 'midnight'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
