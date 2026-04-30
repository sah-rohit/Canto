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
 */
export function buildContextBlock(ctx: KnowledgeContext): string {
  const sections: string[] = [];

  if (ctx.wikipedia) {
    sections.push(`── WIKIPEDIA ──\n${ctx.wikipedia}`);
  }
  if (ctx.internetArchive) {
    sections.push(`── INTERNET ARCHIVE ──\n${ctx.internetArchive}`);
  }
  if (ctx.nasa) {
    sections.push(`── NASA ──\n${ctx.nasa}`);
  }
  if (ctx.core) {
    sections.push(`── ACADEMIC (CORE) ──\n${ctx.core}`);
  }

  if (sections.length === 0) return '';

  return `\n\nREFERENCE CONTEXT (use these verified sources to improve accuracy):\n${sections.join('\n\n')}`;
}
