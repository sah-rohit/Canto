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
When reference context is provided, use it to ensure factual accuracy — but never echo the context labels, source names, raw metadata, file paths, or citation markers. Synthesise the facts into clean prose only.`;

// ─── Server API client ───────────────────────────────────────────────────────

async function callServerAI(
  provider: 'ollama' | 'groq' | 'github' | 'cloudflare' | 'gemini',
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
            // OpenAI-compatible format (Groq, Ollama Cloud, GitHub)
            let text = json?.choices?.[0]?.delta?.content;
            if (!text) {
              // Ollama native format
              text = json?.message?.content;
            }
            if (!text) {
              // Gemini streamGenerateContent format
              text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
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

// ─── Provider lists ──────────────────────────────────────────────────────────

type ProviderEntry = { provider: 'ollama' | 'groq' | 'github' | 'cloudflare' | 'gemini'; model: string; name: string };

/**
 * Standard provider order — Mini & Standard depth.
 * Fast, cost-efficient models first.
 */
const PROVIDERS: ProviderEntry[] = [
  { provider: 'gemini',     model: 'gemini-1.5-flash',              name: 'Gemini (Direct)' },
  { provider: 'groq',       model: 'llama-3.1-8b-instant',          name: 'Llama (Groq)' },
  { provider: 'github',     model: 'DeepSeek-V3',                   name: 'DeepSeek V3 (GitHub)' },
  { provider: 'github',     model: 'grok-3-mini',                   name: 'Grok mini 3 (GitHub)' },
  { provider: 'cloudflare', model: 'google/gemini-3.1-flash-lite',  name: 'Gemini Flash Lite (CF1)' },
  { provider: 'cloudflare', model: 'openai/gpt-4.1-mini',           name: 'GPT-4.1 mini (CF2)' },
  { provider: 'ollama',     model: 'qwen3-next:80b-cloud',          name: 'Qwen3 Next 80B (Ollama)' },
  { provider: 'ollama',     model: 'nemotron-3-nano:30b-cloud',     name: 'Nemotron 3 Nano 30B (Ollama)' },
];

/**
 * Deep depth provider order — Ollama large models first for maximum quality,
 * then fall back to the standard chain.
 */
const PROVIDERS_DEEP: ProviderEntry[] = [
  { provider: 'ollama',     model: 'qwen3-next:80b-cloud',          name: 'Qwen3 Next 80B (Ollama)' },
  { provider: 'ollama',     model: 'nemotron-3-nano:30b-cloud',     name: 'Nemotron 3 Nano 30B (Ollama)' },
  { provider: 'gemini',     model: 'gemini-1.5-flash',              name: 'Gemini (Direct)' },
  { provider: 'groq',       model: 'llama-3.1-8b-instant',          name: 'Llama (Groq)' },
  { provider: 'github',     model: 'DeepSeek-V3',                   name: 'DeepSeek V3 (GitHub)' },
  { provider: 'github',     model: 'grok-3-mini',                   name: 'Grok mini 3 (GitHub)' },
  { provider: 'cloudflare', model: 'google/gemini-3.1-flash-lite',  name: 'Gemini Flash Lite (CF1)' },
  { provider: 'cloudflare', model: 'openai/gpt-4.1-mini',           name: 'GPT-4.1 mini (CF2)' },
];

/**
 * Lightweight provider order for Precision Viewport & Word/Concept hover.
 * Prioritises the fastest, lowest-latency models; no credit charge.
 */
const PROVIDERS_HOVER: ProviderEntry[] = [
  { provider: 'groq',       model: 'llama-3.1-8b-instant',          name: 'Llama (Groq)' },
  { provider: 'cloudflare', model: 'google/gemini-3.1-flash-lite',  name: 'Gemini Flash Lite (CF1)' },
  { provider: 'gemini',     model: 'gemini-1.5-flash',              name: 'Gemini (Direct)' },
  { provider: 'cloudflare', model: 'openai/gpt-4.1-mini',           name: 'GPT-4.1 mini (CF2)' },
  { provider: 'github',     model: 'grok-3-mini',                   name: 'Grok mini 3 (GitHub)' },
  { provider: 'github',     model: 'DeepSeek-V3',                   name: 'DeepSeek V3 (GitHub)' },
  { provider: 'ollama',     model: 'qwen3-next:80b-cloud',          name: 'Qwen3 Next 80B (Ollama)' },
  { provider: 'ollama',     model: 'nemotron-3-nano:30b-cloud',     name: 'Nemotron 3 Nano 30B (Ollama)' },
];

/**
 * ASCII art provider order — Cloudflare Workers AI first (structured JSON output
 * works well), then the rest of the chain as fallback.
 */
const PROVIDERS_ASCII: ProviderEntry[] = [
  { provider: 'cloudflare', model: 'google/gemini-3.1-flash-lite',  name: 'Gemini Flash Lite (CF1)' },
  { provider: 'cloudflare', model: 'openai/gpt-4.1-mini',           name: 'GPT-4.1 mini (CF2)' },
  { provider: 'groq',       model: 'llama-3.1-8b-instant',          name: 'Llama (Groq)' },
  { provider: 'gemini',     model: 'gemini-1.5-flash',              name: 'Gemini (Direct)' },
  { provider: 'github',     model: 'DeepSeek-V3',                   name: 'DeepSeek V3 (GitHub)' },
  { provider: 'github',     model: 'grok-3-mini',                   name: 'Grok mini 3 (GitHub)' },
  { provider: 'ollama',     model: 'qwen3-next:80b-cloud',          name: 'Qwen3 Next 80B (Ollama)' },
  { provider: 'ollama',     model: 'nemotron-3-nano:30b-cloud',     name: 'Nemotron 3 Nano 30B (Ollama)' },
];

// ─── Unified fallback wrappers ────────────────────────────────────────────────

async function* streamWithFallback(
  messages: ChatMessage[],
  providerList: ProviderEntry[] = PROVIDERS,
): AsyncGenerator<string, void, undefined> {
  for (const p of providerList) {
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
  providerList: ProviderEntry[] = PROVIDERS,
): Promise<string> {
  let lastErr: Error = new Error('No providers configured');
  for (const p of providerList) {
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
  enabledSources: string[] = ['Wikipedia', 'NASA', 'CORE', 'Web Search'],
  lens: string = 'Standard',
  depth: string = 'Standard'
): AsyncGenerator<string, void, undefined> {
  // Fetch knowledge context in parallel with starting the stream
  let contextBlock = '';
  try {
    const ctx = await fetchKnowledgeContext(topic);
    contextBlock = buildContextBlock(ctx, enabledSources);
  } catch {
    // Continue without context if knowledge fetch fails
  }

  let depthPrompt = `Break down the text logically into exactly 3 clear paragraphs.`;
  if (depth === 'Mini') {
    depthPrompt = `Break down the text into exactly 1 clear paragraph. Be extremely concise.`;
  } else if (depth === 'Deep') {
    depthPrompt = `Break down the text into at least 5-6 paragraphs. Include exhaustive bullet points and edge cases.`;
  }

  let lensPrompt = '';
  if (lens !== 'Standard') {
    lensPrompt = `\nLENS / PERSPECTIVE: Write strictly from a "${lens}" viewpoint, focusing on that specific tone and angle.`;
  }

  const prompt = `Provide a rich, encyclopedia-style entry for: "${topic}".
${contextBlock}

FORMATTING RULES:
1. ${depthPrompt}
   ${lensPrompt}
2. Identify at least 15-20 relevant nouns, key concepts, technologies, terms, and topics, and format them as Markdown links: [Key Term](Key Term). This allows the user to click any of these words to instantly search them.
   Do NOT link the current topic "${topic}" itself.
3. Use **bold** for critical concepts, *italic* for nuance or etymology.
4. Use bullet lists (* item) or numbered lists (1. item) for enumerations.
5. Use Markdown tables when comparing multiple items.
6. For headers, use ## and ### for sections to auto-generate a Table of Contents.
7. CRITICAL: Do NOT reproduce, echo, or quote the REFERENCE CONTEXT labels, source names, or raw metadata. Weave verified facts naturally into flowing prose only.
8. Present a clean, well-structured, professional article. Do NOT output raw section labels, file paths, IDs, citation markers, or any text that looks like system metadata.
9. CRITICAL: Heavily prioritize facts, dates, and version numbers from the REFERENCE CONTEXT over your internal weights. Always use 2026 as the baseline present-day temporal context.

VISUAL ENRICHMENT — include at least one ASCII visual per response inside a fenced code block tagged \`\`\`ascii:
Choose the type that best fits the concept:
- Mind-map, Flow diagram, Hierarchy / pyramid, Timeline, Spectrum / scale`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    { role: 'user', content: prompt },
  ];

  try {
    yield* streamWithFallback(messages, depth === 'Deep' ? PROVIDERS_DEEP : PROVIDERS);
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
  for (const p of PROVIDERS_ASCII) {
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



/**
 * Generates 3 suggested follow-up research questions for a topic.
 */
export async function fetchSuggestedFollowUps(topic: string, content: string): Promise<string[]> {
  const snippet = content.slice(0, 600);
  const messages: ChatMessage[] = [
    { role: 'system', content: 'Return only valid JSON arrays. No extra text.' },
    {
      role: 'user',
      content: `Based on this encyclopedia entry about "${topic}", generate exactly 3 compelling follow-up research questions a curious reader would want to explore next. Make them specific and thought-provoking. Return as JSON array: ["question1","question2","question3"]\n\nEntry snippet: ${snippet}`,
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

/**
 * Generates a concise 2-3 sentence summary of an article.
 */
export async function generateSummary(topic: string, content: string): Promise<string> {
  const snippet = content.slice(0, 1200);
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    {
      role: 'user',
      content: `Write a concise 2-3 sentence summary of this encyclopedia entry about "${topic}". Capture the most essential facts. No Markdown, no labels, plain prose only.\n\nEntry: ${snippet}`,
    },
  ];
  try {
    const result = await callWithFallback(messages);
    return result.trim();
  } catch {
    return `A comprehensive entry about ${topic}.`;
  }
}

/**
 * Returns a short 1-sentence definition for a word or phrase, derived from
 * the article context first, then AI as fallback. Does NOT consume credits.
 */
export async function getWordDefinition(word: string, articleContext: string): Promise<string> {
  // First try to extract a definition from the article context itself (free, instant)
  if (articleContext && articleContext.length > 50) {
    const sentences = articleContext.split(/(?<=[.!?])\s+/);
    const match = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
    if (match && match.length < 300) {
      const clean = match.trim().replace(/^[#*\->\s]+/, '');
      if (clean.length > 20) return clean.endsWith('.') ? clean : clean + '.';
    }
  }

  // Fall back to a quick AI call using the fastest/lightest providers (no credit charge)
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a concise dictionary. Respond with exactly one sentence defining the given term. No markdown, no labels, plain prose only.' },
    { role: 'user', content: `Define "${word}" in one sentence.` },
  ];
  try {
    const result = await callWithFallback(messages, PROVIDERS_HOVER);
    return result.trim().split(/\n/)[0];
  } catch {
    return `A term or concept: ${word}.`;
  }
}

export async function explainThis(selectedText: string, action: string): Promise<string> {
  const actLower = (action || '').toLowerCase();
  let taskInstruction = '';
  if (actLower.includes('simplify')) {
    taskInstruction = 'Simplify this text completely. Use easy words and clear sentences.';
  } else if (actLower.includes('deep') || actLower.includes('deeper')) {
    taskInstruction = 'Provide a deep dive into this topic. Add technical details and scholarly context.';
  } else {
    taskInstruction = 'Cite specific potential Wikipedia pages, academic articles, or primary sources where this concept is mentioned.';
  }

  const prompt = `Task: ${taskInstruction}
  
Text to analyze: "${selectedText}"

Provide exactly 1 or 2 concise paragraphs with the requested explanation/sources. No markdown headers. Use plain text or light inline formatting.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    { role: 'user', content: prompt }
  ];

  try {
    return await callWithFallback(messages, PROVIDERS_HOVER);
  } catch {
    return "Error: Could not retrieve answer from AI context.";
  }
}

export async function fetchAdvancedLabFeature(topic: string, feature: string, extraPrompt: string = ''): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    {
      role: 'user',
      content: `Analyze the topic "${topic}" and provide the following layer or feature: "${feature}".\n${extraPrompt}\nFormat output in professional Markdown with descriptive subsections.`,
    },
  ];
  try {
    return await callWithFallback(messages);
  } catch {
    return `Error retrieving "${feature}" for this topic.`;
  }
}

export async function gradeQuiz(topic: string, questions: string[], answers: Record<number, string>): Promise<string> {
  const qAndAString = questions.map((q, i) => `Question ${i + 1}: ${q}\nUser Answer: ${answers[i] || 'No answer provided.'}`).join('\n\n');
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PERSONA },
    {
      role: 'user',
      content: `Evaluate the user's answers for the following quiz on the topic "${topic}":\n\n${qAndAString}\n\nTask:\n1. Grade each answer carefully. If it is correct, award points. If it is unattempted or wrong, state that clearly.\n2. For wrong or unattempted questions, output the correct answer right below the user's answer and provide a short, clear explanation of where they went wrong.\n3. Compute an overall score out of 100% and place it at the top.\nMaintain the Raw Encyclopedic Format and Structure (no emojis, monospace-friendly).`,
    },
  ];
  try {
    return await callWithFallback(messages);
  } catch {
    return `Error grading the quiz.`;
  }
}

export async function generateVisualInfographic(topic: string, promptExtra: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are an advanced graphics SVG generation engine. You return only raw valid SVG code starting with <svg> and ending with </svg>.' },
    { role: 'user', content: promptExtra },
  ];
  try {
    return await callWithFallback(messages);
  } catch {
    return `Error generating visualization.`;
  }
}

// ─── Fact-Check ───────────────────────────────────────────────────────────────

export interface FactCheckSource {
  name: string;
  status: 'verified' | 'partial' | 'not_found';
  note: string;
  url?: string;
}

export interface FactCheckResult {
  verdict: 'verified' | 'mostly_verified' | 'mixed' | 'unverified';
  confidence: number; // 0–100
  summary: string;
  sources: FactCheckSource[];
  checkedAt: string;
}

/**
 * Performs a real multi-source fact-check of the generated article content.
 * Fetches fresh knowledge context and cross-references it against the article,
 * then uses AI to produce a structured verdict. No credit charge.
 */
export async function factCheckContent(
  topic: string,
  articleContent: string,
  knowledgeSources: { wikipedia?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string }
): Promise<FactCheckResult> {
  // Build a compact evidence block from available sources
  const evidence: string[] = [];
  if (knowledgeSources.wikipedia) evidence.push(`[Wikipedia] ${knowledgeSources.wikipedia.slice(0, 600)}`);
  if (knowledgeSources.nasa)      evidence.push(`[NASA]      ${knowledgeSources.nasa.slice(0, 400)}`);
  if (knowledgeSources.core)      evidence.push(`[CORE]      ${knowledgeSources.core.slice(0, 400)}`);
  if (knowledgeSources.internetArchive) evidence.push(`[OpenLib]   ${knowledgeSources.internetArchive.slice(0, 300)}`);
  if (knowledgeSources.crawler)   evidence.push(`[Web]       ${knowledgeSources.crawler.slice(0, 400)}`);

  const sourceCount = evidence.length;
  const articleSnippet = articleContent.slice(0, 1200);

  const prompt = `You are a rigorous fact-checker. Cross-reference the article excerpt against the provided source evidence and return a JSON fact-check report.

ARTICLE EXCERPT (about "${topic}"):
${articleSnippet}

SOURCE EVIDENCE (${sourceCount} sources):
${evidence.join('\n\n')}

Return ONLY valid JSON matching this exact schema (no markdown, no extra text):
{
  "verdict": "verified" | "mostly_verified" | "mixed" | "unverified",
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence plain-text summary of what was verified, what was uncertain, and why>",
  "sources": [
    {
      "name": "<source name e.g. Wikipedia>",
      "status": "verified" | "partial" | "not_found",
      "note": "<one sentence: what this source confirmed or contradicted>"
    }
  ]
}

Rules:
- "verified": all major claims corroborated by 2+ sources
- "mostly_verified": most claims corroborated, minor gaps
- "mixed": some claims verified, some unverifiable or contradicted
- "unverified": insufficient evidence to corroborate key claims
- Be honest — if a source had no relevant data, mark it "not_found"
- confidence reflects how much of the article content is backed by the evidence`;

  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a precise fact-checking engine. Return only valid JSON. No markdown fences, no extra text.' },
    { role: 'user', content: prompt },
  ];

  try {
    const raw = await callWithFallback(messages, PROVIDERS_HOVER);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]) as Omit<FactCheckResult, 'checkedAt'>;

    // Attach real source URLs
    const urlMap: Record<string, string> = {
      'Wikipedia':    `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/ /g, '_'))}`,
      'NASA':         `https://images.nasa.gov/search-results?q=${encodeURIComponent(topic)}`,
      'CORE':         `https://core.ac.uk/search?q=${encodeURIComponent(topic)}`,
      'OpenLib':      `https://openlibrary.org/search?q=${encodeURIComponent(topic)}`,
      'Web':          `https://duckduckgo.com/?q=${encodeURIComponent(topic)}`,
    };
    const sources: FactCheckSource[] = (parsed.sources || []).map((s: any) => ({
      ...s,
      url: urlMap[s.name] || undefined,
    }));

    // If fewer sources were in evidence, mark missing ones as not_found
    const allSourceNames = ['Wikipedia', 'NASA', 'CORE', 'OpenLib', 'Web'];
    const presentNames = new Set(sources.map(s => s.name));
    for (const name of allSourceNames) {
      if (!presentNames.has(name) && !knowledgeSources[name.toLowerCase() as keyof typeof knowledgeSources]) {
        sources.push({ name, status: 'not_found', note: 'Source not available for this topic.', url: urlMap[name] });
      }
    }

    return {
      verdict: parsed.verdict || 'mixed',
      confidence: Math.min(100, Math.max(0, parsed.confidence ?? 50)),
      summary: parsed.summary || 'Fact-check completed.',
      sources,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    // Graceful fallback — build a basic result from what we know
    const sources: FactCheckSource[] = [
      { name: 'Wikipedia',  status: knowledgeSources.wikipedia  ? 'partial' : 'not_found', note: knowledgeSources.wikipedia  ? 'Wikipedia summary was available and used in generation.' : 'No Wikipedia data retrieved.', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}` },
      { name: 'NASA',       status: knowledgeSources.nasa       ? 'partial' : 'not_found', note: knowledgeSources.nasa       ? 'NASA image data was available.' : 'No NASA data retrieved.',       url: `https://images.nasa.gov/search-results?q=${encodeURIComponent(topic)}` },
      { name: 'CORE',       status: knowledgeSources.core       ? 'partial' : 'not_found', note: knowledgeSources.core       ? 'Academic papers were referenced.' : 'No academic data retrieved.',  url: `https://core.ac.uk/search?q=${encodeURIComponent(topic)}` },
      { name: 'OpenLib',    status: knowledgeSources.internetArchive ? 'partial' : 'not_found', note: knowledgeSources.internetArchive ? 'Open Library books referenced.' : 'No library data retrieved.', url: `https://openlibrary.org/search?q=${encodeURIComponent(topic)}` },
      { name: 'Web',        status: knowledgeSources.crawler    ? 'partial' : 'not_found', note: knowledgeSources.crawler    ? 'Web search snippets were used.' : 'No web data retrieved.',        url: `https://duckduckgo.com/?q=${encodeURIComponent(topic)}` },
    ];
    const verifiedCount = sources.filter(s => s.status !== 'not_found').length;
    return {
      verdict: verifiedCount >= 3 ? 'mostly_verified' : verifiedCount >= 1 ? 'mixed' : 'unverified',
      confidence: verifiedCount * 18,
      summary: `${verifiedCount} of 5 knowledge sources were available during generation. Full AI cross-reference could not be completed.`,
      sources,
      checkedAt: new Date().toISOString(),
    };
  }
}



