/**
 * Canto Knowledge Service
 * Fetches context from multiple knowledge sources before AI generation.
 * All requests go through /api/knowledge server-side proxy.
 */

export interface KnowledgeContext {
  wikipedia?: string;
  internetArchive?: string;
  nasa?: string;
  core?: string;
  crawler?: string;
}

/**
 * Fetch enrichment context from knowledge sources for a given topic.
 * Results are merged into a single context block for the AI prompt.
 */
export async function fetchKnowledgeContext(topic: string): Promise<KnowledgeContext> {
  try {
    const response = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      console.warn('[Canto Knowledge] Failed to fetch context:', response.status);
      return {};
    }

    return await response.json() as KnowledgeContext;
  } catch (err) {
    console.warn('[Canto Knowledge] Error:', err);
    return {};
  }
}

/**
 * Build a context block from knowledge sources for the AI prompt.
 * Uses clean instruction-framed labels so the AI treats this as
 * reference data, not content to echo verbatim.
 */
export function buildContextBlock(ctx: KnowledgeContext): string {
  const sections: string[] = [];

  if (ctx.wikipedia) {
    // Sanitise: strip any leftover HTML entities or wiki markup
    const clean = ctx.wikipedia
      .replace(/\[\d+\]/g, '')          // strip [1] citation markers
      .replace(/={2,}[^=]+=+/g, '')     // strip == Section == headers
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (clean.length > 20) sections.push(`[Wikipedia summary] ${clean}`);
  }
  if (ctx.internetArchive) {
    sections.push(`[Related books] ${ctx.internetArchive}`);
  }
  if (ctx.nasa) {
    sections.push(`[NASA image data] ${ctx.nasa}`);
  }
  if (ctx.core) {
    sections.push(`[Academic papers] ${ctx.core}`);
  }
  if (ctx.crawler) {
    sections.push(`[Web search snippets] ${ctx.crawler}`);
  }

  if (sections.length === 0) return '';

  return `\n\n---\nREFERENCE CONTEXT — use these verified facts to improve accuracy. Do NOT copy these labels or repeat this block verbatim:\n\n${sections.join('\n\n')}\n---`;
}
