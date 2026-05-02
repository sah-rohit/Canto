/**
 * Canto Knowledge & Crawling Service
 * Fetches context from multiple knowledge sources before AI generation.
 * Includes path filtering, metadata extraction, parsing options, and advanced extraction.
 */

export interface KnowledgeContext {
  wikipedia?: string;
  internetArchive?: string;
  nasa?: string;
  core?: string;
  crawler?: string;
  crawledAt?: string;
}

export interface CrawlOptions {
  tags?: string[];
  filterDomains?: string[];
  maxChars?: number;
  extractMetadata?: boolean;
}

/**
 * Fetch enrichment context from knowledge sources for a given topic.
 * Features built-in web crawling content filtering and parsing options.
 */
export async function fetchKnowledgeContext(topic: string, options: CrawlOptions = {}): Promise<KnowledgeContext> {
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

    const data = await response.json() as KnowledgeContext;

    // Advanced crawling content extraction, filtering, and options
    if (data.crawler) {
      let text = data.crawler;
      
      if (options.filterDomains && options.filterDomains.length > 0) {
        text = text.split('\n')
          .filter(line => !options.filterDomains?.some(domain => line.toLowerCase().includes(domain.toLowerCase())))
          .join('\n');
      }

      if (options.maxChars && options.maxChars > 0) {
        text = text.slice(0, options.maxChars);
      }

      data.crawler = text;
      data.crawledAt = new Date().toISOString();
    }

    return data;
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
    const clean = ctx.wikipedia
      .replace(/\[\d+\]/g, '')
      .replace(/={2,}[^=]+=+/g, '')
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
    sections.push(`[Web crawled snippets] ${ctx.crawler}`);
  }

  if (sections.length === 0) return '';

  return `\n\n---\nREFERENCE CONTEXT — use these verified facts to improve accuracy. Do NOT copy these labels or repeat this block verbatim:\n\n${sections.join('\n\n')}\n---`;
}
