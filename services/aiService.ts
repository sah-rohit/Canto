/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canto AI Service - Client-side wrapper for server-side API
 * All requests go through /api/ai which handles CORS and API key security.
 * Knowledge context is fetched from /api/knowledge to improve accuracy.
 */

import { fetchKnowledgeContext, buildContextBlock } from './knowledgeService';

// ─── Shared types ────────────────────────────────────────────────────────────

export interface AsciiArtData {
  art: string;
  text?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PERSONA = `You are Canto, an infinite AI encyclopedia with a poetic, precise voice.
The current year is 2026. Therefore, use 2026 as your present-day temporal context.
For instance, the latest macOS version as of today is macOS Tahoe (version 26), released in late 2025 following macOS Sequoia.
Always weave the latest real-world facts provided in the reference context into your response.
You always write in plain text / Markdown. Never use HTML tags.
Keep a consistent tone: concise, insightful, slightly literary.
When reference context is provided, use it to ensure factual accuracy and cite specific details.`;

// ─── Server API client ───────────────────────────────────────────────────────

async function callServerAI(
  provider: 'ollama' | 'groq',
  model: string,
  messages: ChatMessage[],
  stream: boolean = false
): Promise<AsyncGenerator<string, void, undefined> | string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, model, messages, stream }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider} HTTP ${response.status}: ${err}`);
  }

  if (stream) {
    // Return async generator for streaming
    return (async function* (): AsyncGenerator<string, void, undefined> {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          let trimmed = line.trim();
          if (!trimmed) continue;

          // Handle SSE "data: " prefix from OpenAI-compatible APIs
          if (trimmed.startsWith('data: ')) {
            trimmed = trimmed.slice(6).trim();
          }
          // OpenAI SSE termination signal
          if (trimmed === '[DONE]') return;
          if (!trimmed) continue;

          try {
            const json = JSON.parse(trimmed);
            // OpenAI-compatible format (Groq, Ollama Cloud)
            let text = json?.choices?.[0]?.delta?.content;
            if (!text) {
              // Ollama native format
              text = json?.message?.content;
            }
            if (text) yield text;
            if (json?.done === true) return;
          } catch {
            // Skip malformed lines
          }
        }
      }
    })();
  } else {
    const json = await response.json();
    const text = json?.message?.content || json?.choices?.[0]?.message?.content || '';
    if (!text) throw new Error('Empty response');
    return text;
  }
}

// ─── Unified fallback wrapper ────────────────────────────────────────────────

const PROVIDERS: Array<{ provider: 'ollama' | 'groq'; model: string; name: string }> = [
  { provider: 'groq', model: 'llama-3.1-8b-instant', name: 'Llama (Groq)' },
  { provider: 'ollama', model: 'deepseek-v3.2:cloud', name: 'DeepSeek v3.2' },
  { provider: 'ollama', model: 'kimi-k2.5:cloud', name: 'Kimi' },
];

async function* streamWithFallback(
  messages: ChatMessage[],
): AsyncGenerator<string, void, undefined> {
  for (const p of PROVIDERS) {
    try {
      let gotAny = false;
      const stream = await callServerAI(p.provider, p.model, messages, true) as AsyncGenerator<string, void, undefined>;

      for await (const chunk of stream) {
        gotAny = true;
        yield chunk;
      }
      if (gotAny) return;
    } catch (err) {
      console.warn(`[Canto] ${(err as Error).message} — trying next provider`);
    }
  }
  throw new Error('ALL_PROVIDERS_FAILED');
}

async function callWithFallback(
  messages: ChatMessage[],
): Promise<string> {
  let lastErr: Error = new Error('No providers configured');
  for (const p of PROVIDERS) {
    try {
      const result = await callServerAI(p.provider, p.model, messages, false) as string;
      return result;
    } catch (err) {
      lastErr = err as Error;
      console.warn(`[Canto] ${lastErr.message} — trying next provider`);
    }
  }
  throw lastErr;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Streams an encyclopedia-style definition for a topic.
 * First fetches context from Wikipedia, NASA, CORE, Internet Archive
 * to improve factual accuracy.
 */
export async function* streamDefinition(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  // Fetch knowledge context in parallel with starting the stream
  let contextBlock = '';
  try {
    const ctx = await fetchKnowledgeContext(topic);
    contextBlock = buildContextBlock(ctx);
  } catch {
    // Continue without context if knowledge fetch fails
  }

  const prompt = `Provide a rich, encyclopedia-style entry for: "${topic}".
${contextBlock}

FORMATTING RULES:
1. Identify key terms and format them as Markdown links: [Key Term](Key Term)
   Do NOT link the current topic "${topic}" itself.
2. Use **bold** for critical concepts, *italic* for nuance or etymology.
3. Use bullet lists (* item) or numbered lists (1. item) for enumerations.
4. Use Markdown tables when comparing multiple items.
5. Do NOT use headers (no # ## ###).
6. When reference context is provided, weave verified facts naturally into your response for accuracy.
7. Present a clean, well-structured, professional article. Do NOT output unrefined headers or raw uncleaned titles like '/ The Tesseract /' or similar escape patterns. Format all text cleanly.
8. CRITICAL: Heavily prioritize facts, dates, and version numbers found in the REFERENCE CONTEXT (especially the WEB SEARCH / CRAWLER section) over your internal pre-trained weights. Always use 2026 as the baseline present-day temporal context.

VISUAL ENRICHMENT — include at least one ASCII visual per response inside a fenced code block tagged \`\`\`ascii:
Choose the type that best fits the concept:
- Mind-map, Flow diagram, Hierarchy / pyramid, Timeline, Spectrum / scale

AESTHETIC EFFECTS (use sparingly for 1-2 key words only):
- Glowing: [Word](#glow)
- Outlined: [Word](#outline)
- Glitch/distort: [Word](#distort)`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    { role: 'user', content: prompt },
  ];

  try {
    yield* streamWithFallback(messages);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'ALL_PROVIDERS_FAILED') {
      yield `Error: All AI providers are currently unavailable. Please try again later.`;
      throw new Error('ALL_PROVIDERS_FAILED');
    }
    yield `Error: ${msg}`;
    throw err;
  }
}

/**
 * Generates a random interesting word or concept.
 */
export async function getRandomWord(): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    {
      role: 'user',
      content:
        'Generate a single, random, interesting English word or a two-word concept (noun, verb, adjective, or proper noun). Respond with ONLY the word or concept — no punctuation, no explanation.',
    },
  ];
  const result = await callWithFallback(messages);
  return result.trim().replace(/^["']|["']$/g, '');
}

/**
 * Generates ASCII art for a topic.
 * Uses a much more specific prompt to generate RECOGNIZABLE art,
 * not just random symbols.
 */
export async function generateAsciiArt(topic: string): Promise<AsciiArtData> {
  const prompt = `Create ASCII art that VISUALLY REPRESENTS "${topic}".

CRITICAL RULES:
1. The art must be RECOGNIZABLE as "${topic}" — a viewer should be able to identify it.
2. Use standard ASCII characters: letters, numbers, symbols like / \\ | _ - = + ( ) [ ] { } < > . , : ; ! @ # $ % ^ & *
3. Also use box-drawing: │ ─ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ and blocks: ░ ▒ ▓ █ ▀ ▄
4. Size: 10-18 lines tall, 25-45 characters wide
5. Use \\n for newlines inside the JSON string

EXAMPLES of what RECOGNIZABLE means:
- "Cat" → draw a cat face/body shape
- "Tree" → draw a tree with trunk and branches
- "Computer" → draw a monitor/laptop shape
- "Heart" → draw a heart shape
- "Sun" → draw a sun with rays
- "Mountain" → draw a mountain peak shape
- "Microsoft" → draw the Windows logo (4 squares grid)
- "Guitar" → draw the silhouette of a guitar

For "${topic}", think about its most ICONIC VISUAL FORM and draw THAT shape.

Return ONLY a JSON object: {"art": "your_ascii_art_here"}
No markdown fences. Start with { end with }.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a skilled ASCII artist. You create recognizable visual art using text characters. Return only valid JSON with one key "art". The art MUST be visually recognizable as the topic.' },
    { role: 'user', content: prompt },
  ];

  let lastErr: Error = new Error('No providers');
  for (const p of PROVIDERS) {
    try {
      const raw = await callServerAI(p.provider, p.model, messages, false) as string;
      let cleaned = raw.trim();

      // Robust extraction for malformed JSON or markdown fences
      let artContent = '';
      
      // 1. Try JSON.parse (happy path)
      try {
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objMatch) {
          const parsed = JSON.parse(objMatch[0]);
          if (parsed.art) artContent = parsed.art;
        }
      } catch {
        // 2. Fallback: Manual string extraction if JSON is malformed
        const artMatch = cleaned.match(/"art":\s*"([\s\S]*?)"\s*\}/);
        if (artMatch) {
          artContent = artMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        } else {
          // 3. Last resort: just use the whole string if it looks like art
          if (cleaned.includes('\n') && cleaned.length > 20) artContent = cleaned;
        }
      }

      // Cleanup and Validation
      artContent = artContent.trim();
      
      // Filter out model refusals or empty responses
      const isRefusal = /cannot|sorry|unable|draw|generate/i.test(artContent.slice(0, 50)) && artContent.length < 100;
      if (artContent.length > 10 && !isRefusal) {
        return { art: artContent };
      }
      
      throw new Error('Invalid or empty art content');
    } catch (err) {
      lastErr = err as Error;
      console.warn(`[Canto art] ${lastErr.message} — trying next provider`);
    }
  }

  // Fallback: If all else fails, try one last time with a very simple text-only prompt
  try {
    const simpleMessages: ChatMessage[] = [
      { role: 'user', content: `Draw a very simple, small ASCII art icon for "${topic}". Use only 5-8 lines. No explanation, just the art.` }
    ];
    const raw = await callWithFallback(simpleMessages);
    if (raw && raw.length > 5 && !raw.includes('{')) return { art: raw.trim() };
  } catch {}

  throw lastErr;
}

/**
 * Fetches a "Did you know?" fact about a topic.
 */
export async function fetchDidYouKnow(topic: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    {
      role: 'user',
      content: `Give one surprising, 1–2 sentence "Did you know?" fact about "${topic}". Start directly with the fact. No Markdown, no labels.`,
    },
  ];
  try {
    const result = await callWithFallback(messages);
    return result.trim();
  } catch {
    return `Facts about ${topic} are currently hidden in the void.`;
  }
}

/**
 * Fetches related topics.
 */
export async function fetchRelatedTopics(topic: string): Promise<string[]> {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'Return only valid JSON arrays. No extra text.' },
    {
      role: 'user',
      content: `Return a JSON array of exactly 3 strings: interesting topics related to "${topic}". Example: ["topic1","topic2","topic3"]`,
    },
  ];
  try {
    const raw = await callWithFallback(messages);
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    if (!arrMatch) return [];
    const parsed = JSON.parse(arrMatch[0]);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String).slice(0, 3);
    }
    return [];
  } catch {
    return [];
  }
}