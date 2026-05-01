export const onRequest = async (context: any) => {
  const { request, env } = context;

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

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { topic } = await request.json();
  if (!topic) return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });

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
          { headers: { 'User-Agent': 'CantoEncyclopedia/1.0', 'Accept': 'application/json' } }
        );
        if (wikiRes.ok) {
          const data = await wikiRes.json();
          if (data.extract) results.wikipedia = data.extract.slice(0, 1500);
        }
      } catch (e) {}
    })(),

    // ── Internet Archive ──────────────────────────
    (async () => {
      try {
        const iaRes = await fetchWithTimeout(
          `https://openlibrary.org/search.json?q=${encoded}&limit=3`
        );
        if (iaRes.ok) {
          const data = await iaRes.json();
          if (data.docs && data.docs.length > 0) {
            results.internetArchive = data.docs.slice(0, 3).map((d: any) => 
              `"${d.title}" by ${d.author_name?.[0] || 'Unknown'} (${d.first_publish_year || 'N/A'})`
            ).join('; ');
          }
        }
      } catch (e) {}
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
          if (items?.length > 0) {
            results.nasa = items.slice(0, 2).map((i: any) => i.data?.[0]?.description?.slice(0, 300)).join(' | ');
          }
        }
      } catch (e) {}
    })(),

    // ── CORE ───────────────────────────────────
    (async () => {
      try {
        const coreKey = env.CORE_API_KEY;
        if (!coreKey) return;
        const coreRes = await fetchWithTimeout(
          `https://api.core.ac.uk/v3/search/works?q=${encoded}&limit=3`,
          { headers: { 'Authorization': `Bearer ${coreKey}` } }
        );
        if (coreRes.ok) {
          const data = await coreRes.json();
          if (data.results?.length > 0) {
            results.core = data.results.slice(0, 3).map((p: any) => 
              `"${p.title}" (${p.authors?.map((a: any) => a.name).join(', ') || 'Unknown'}): ${p.abstract?.slice(0, 200) || ''}`
            ).join('\n');
          }
        }
      } catch (e) {}
    })(),

    // ── Web Crawler / Real-Time Parser with Dual Mode ─────────────────
    (async () => {
      try {
        const snippets: string[] = [];
        // Try HTML mode first
        try {
          const ddgRes = await fetchWithTimeout(
            `https://html.duckduckgo.com/html/?q=${encoded}`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0' } }
          );
          if (ddgRes.ok) {
            const text = await ddgRes.text();
            const matches = text.matchAll(/(?:class="result__snippet"|class="result-snippet")[^>]*>(.*?)<\/(?:a|td)>/gi);
            for (const match of matches) {
              let s = match[1].replace(/<[^>]*>/g, '').trim();
              if (s) snippets.push(s);
            }
          }
        } catch {}

        // Fallback to Lite mode if no snippets found
        if (snippets.length === 0) {
          try {
            const liteRes = await fetchWithTimeout(
              `https://lite.duckduckgo.com/lite/?q=${encoded}`,
              { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
            );
            if (liteRes.ok) {
              const text = await liteRes.text();
              const matches = text.matchAll(/class="result-snippet"[^>]*>(.*?)<\/td>/gi);
              for (const match of matches) {
                let s = match[1].replace(/<[^>]*>/g, '').trim();
                if (s) snippets.push(s);
              }
            }
          } catch {}
        }

        if (snippets.length > 0) {
          results.crawler = snippets.slice(0, 5).join('\n\n');
        }
      } catch (e) {}
    })(),
  ];

  await Promise.allSettled(tasks);

  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
