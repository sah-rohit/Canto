import React, { useState, useEffect, useRef, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { playSearchComplete, playWordClick, isSoundEnabled, setSoundEnabled } from '../services/soundService';
import { explainThis } from '../services/aiService';

declare global {
  interface Window {
    katex?: any;
  }
}

// ─── Precision Viewport Positioning ─────────────────────────────────────────
interface TooltipRect {
  top: number;
  left: number;
  placement: 'above' | 'below';
  arrowLeft: number;
}

function computeTooltipPosition(
  anchorRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  margin = 8
): TooltipRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer above; fall back to below if not enough room
  const spaceAbove = anchorRect.top;
  const spaceBelow = vh - anchorRect.bottom;
  const placement: 'above' | 'below' = spaceAbove >= tooltipHeight + margin ? 'above' : 'below';

  // Horizontal: center on anchor, clamp to viewport with padding
  const idealLeft = anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;
  const clampedLeft = Math.max(8, Math.min(idealLeft, vw - tooltipWidth - 8));

  // Arrow offset relative to tooltip box
  const arrowLeft = Math.max(12, Math.min(
    anchorRect.left + anchorRect.width / 2 - clampedLeft,
    tooltipWidth - 12
  ));

  const top = placement === 'above'
    ? anchorRect.top - tooltipHeight - margin
    : anchorRect.bottom + margin;

  return { top, left: clampedLeft, placement, arrowLeft };
}

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
  topic?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  fontSize?: number;
  isReadingMode?: boolean;
  onExplainClick?: (action: 'Simplify' | 'Go deeper' | 'Show sources for this claim', text: string) => void;
  sources?: { wikipedia?: string; wikipediaTitle?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
}

// ─── Source URL builder ───────────────────────────────────────────────────────
interface SourceEntry {
  label: string;
  url: string;
  snippet?: string;
  type: 'wikipedia' | 'nasa' | 'core' | 'internetArchive' | 'crawler';
}

function buildSourceEntries(
  topic: string,
  sources?: { wikipedia?: string; wikipediaTitle?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string }
): SourceEntry[] {
  if (!sources) return [];
  const enc = encodeURIComponent(topic || '');
  const entries: SourceEntry[] = [];

  if (sources.wikipedia) {
    // Use canonical Wikipedia title if available for a precise URL
    const wikiSlug = sources.wikipediaTitle
      ? encodeURIComponent(sources.wikipediaTitle.replace(/ /g, '_'))
      : enc;
    entries.push({
      label: 'Wikipedia',
      url: `https://en.wikipedia.org/wiki/${wikiSlug}`,
      snippet: sources.wikipedia.slice(0, 200),
      type: 'wikipedia',
    });
  }
  if (sources.nasa) {
    entries.push({
      label: 'NASA Images',
      url: `https://images.nasa.gov/search-results?q=${enc}`,
      snippet: sources.nasa.slice(0, 200),
      type: 'nasa',
    });
  }
  if (sources.core) {
    entries.push({
      label: 'CORE Academic',
      url: `https://core.ac.uk/search?q=${enc}`,
      snippet: sources.core.slice(0, 200),
      type: 'core',
    });
  }
  if (sources.internetArchive) {
    entries.push({
      label: 'Open Library',
      url: `https://openlibrary.org/search?q=${enc}`,
      snippet: sources.internetArchive.slice(0, 200),
      type: 'internetArchive',
    });
  }
  if (sources.crawler) {
    entries.push({
      label: 'Web Search (DuckDuckGo)',
      url: `https://duckduckgo.com/?q=${enc}`,
      snippet: sources.crawler.slice(0, 200),
      type: 'crawler',
    });
  }
  return entries;
}

const InteractiveContent: React.FC<{
  content: string;
  onWordClick: (word: string) => void;
  isStreaming?: boolean;
  topic?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  fontSize?: number;
  isReadingMode?: boolean;
  onExplainClick?: (action: 'Simplify' | 'Go deeper' | 'Show sources for this claim', text: string) => void;
  sources?: { wikipedia?: string; wikipediaTitle?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
}> = ({ content, onWordClick, isStreaming, topic, isFavorite, onToggleFavorite, fontSize = 100, isReadingMode, onExplainClick, sources }) => {
  const [copyStatus, setCopyStatus] = useState<string>('Copy');
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; placement: 'above' | 'below'; arrowLeft: number } | null>(null);
  const [explainAnswer, setExplainAnswer] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [inArticleSearch, setInArticleSearch] = useState('');
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago'>('APA');
  const [isTocVisible, setIsTocVisible] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [complexityScore, setComplexityScore] = useState<number | null>(null);
  const [isPrintView, setIsPrintView] = useState(false);

  // Precision word/concept hover tooltip
  const [wordDefPos, setWordDefPos] = useState<{
    top: number; left: number; placement: 'above' | 'below'; arrowLeft: number;
    word: string; def: string;
  } | null>(null);
  const wordDefRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject KaTeX
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.head.removeChild(script);
      } catch (e) {}
    };
  }, []);

  // ─── Reading progress tracker ─────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight;
      const scrolled = Math.max(0, -rect.top);
      setReadingProgress(Math.min(100, Math.round((scrolled / total) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Complexity score ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!content || content.length < 50) return;
    const words = content.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
    const longWords = words.filter(w => w.length > 8).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
    const avgSentLen = sentences > 0 ? words.length / sentences : 0;
    // Flesch-Kincaid-inspired score (0-100, higher = more complex)
    const score = Math.min(100, Math.round((longWords / Math.max(words.length, 1)) * 100 + avgSentLen * 0.5));
    setComplexityScore(score);
  }, [content]);

  // ─── Precision selection popup ────────────────────────────────────────────
  const handleSelection = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const text = selection.toString().trim();
    if (text && text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      // Popup width ~380px; height ~52px (without answer)
      const pos = computeTooltipPosition(rect, 380, 52);
      setPopupPos(pos);
      setSelectedText(text);
      setExplainAnswer(null);
    } else {
      setPopupPos(null);
    }
  }, []);

  // ─── Precision word hover/double-click tooltip ───────────────────────────
  const handleWordHover = useCallback((e: React.MouseEvent, word: string, def: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Tooltip ~240px wide, ~60px tall
    const pos = computeTooltipPosition(rect, 240, 60);
    setWordDefPos({ ...pos, word, def });
  }, []);

  const handleWordDoubleClick = useCallback((e: React.MouseEvent, word: string) => {
    if (!word || word.length < 3) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = computeTooltipPosition(rect, 240, 60);
    setWordDefPos({
      ...pos,
      word,
      def: `Retrieving definition for "${word}"…`,
    });
    setTimeout(() => {
      setWordDefPos(prev => prev && prev.word === word ? {
        ...prev,
        def: `"${word}" — a key concept in the context of ${topic || 'this article'}. Click to explore the full entry.`,
      } : prev);
    }, 600);
  }, [topic]);

  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (!isStreaming && content.length > 100) {
      playSearchComplete();
    }
  }, [isStreaming, content.length]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getPlainText = (): string => {
    return content
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .replace(/```ascii\n?/g, '')
      .replace(/```\n?/g, '');
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(textarea);
  };

  const handleCopy = () => {
    const plainText = getPlainText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(plainText).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      }).catch(() => {
        fallbackCopy(plainText);
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      });
    } else {
      fallbackCopy(plainText);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Canto', text: 'Check out this topic on Canto!', url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      fallbackCopy(url);
    }
  };

  const handleDownloadTxt = () => {
    const plainText = getPlainText();
    const header = `CANTO — ${(topic || 'Article').toUpperCase()}\n${'═'.repeat(50)}\n\n`;
    const footer = `\n\n${'─'.repeat(50)}\nGenerated by Canto\nhttps://github.com/sah-rohit/Canto`;
    const blob = new Blob([header + plainText + footer], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canto-${(topic || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadMenuOpen(false);
  };

  const getCitation = () => {
    const title = (topic || 'Untitled Article').toUpperCase();
    const dateStr = '2026';
    const site = 'Canto: AI Galactica Encyclopedia';
    const sourceEntries = buildSourceEntries(topic || '', sources);
    const citationUrls = sourceEntries.length > 0
      ? sourceEntries.map(s => s.url)
      : [`https://en.wikipedia.org/wiki/${encodeURIComponent(topic || '')}`];
    const url = citationUrls.join('; ');

    if (citationStyle === 'APA') {
      return `Canto. (${dateStr}). ${title}. ${site}. Retrieved from ${url}`;
    } else if (citationStyle === 'MLA') {
      return `"${title}." ${site}, ${dateStr}, ${url}.`;
    }
    return `Canto. ${dateStr}. "${title}." ${site}. ${url}`;
  };

  const STOP_WORDS = new Set(['the', 'and', 'for', 'are', 'not', 'but', 'you', 'with', 'this', 'that', 'your', 'from']);

  const renderClickableOriginal = (text: string) => {
    if (!text || typeof text !== 'string') return text;

    // Direct inline LaTeX math regex parsing to ensure it parses perfectly and invokes KaTeX CDN directly
    const mathDisplayRegex = /\$\$([\s\S]+?)\$\$/g;
    const mathInlineRegex = /\$([\s\S]+?)\$/g;

    let processedHtml = text;
    if (window.katex) {
      try {
        processedHtml = text.replace(mathDisplayRegex, (_, tex) => window.katex.renderToString(tex, { displayMode: true }));
        processedHtml = processedHtml.replace(mathInlineRegex, (_, tex) => window.katex.renderToString(tex, { displayMode: false }));
      } catch (e) {}
    }

    if (processedHtml !== text) {
      return <span dangerouslySetInnerHTML={{ __html: processedHtml }} />;
    }

    const matches: { phrase: string; index: number }[] = [];
    const concepts = (topic || '').split(/\s+/).filter(w => w.length > 3);
    for (const concept of concepts) {
      const regex = new RegExp(`\\b${concept}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ phrase: match[0], index: match.index });
      }
    }

    const propNounRegex = /\b[A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)+\b/g;
    let propMatch;
    while ((propMatch = propNounRegex.exec(text)) !== null) {
      if (!matches.some(m => m.index <= propMatch!.index && (m.index + m.phrase.length) >= propMatch!.index)) {
        matches.push({ phrase: propMatch[0], index: propMatch.index });
      }
    }

    matches.sort((a, b) => b.index - a.index);

    let processedText = text;
    const phrasesById: Record<string, string> = {};
    matches.forEach((m, idx) => {
      const id = `__PHRASE_${idx}__`;
      phrasesById[id] = m.phrase;
      processedText = processedText.slice(0, m.index) + id + processedText.slice(m.index + m.phrase.length);
    });

    const chunks = processedText.split(/(__PHRASE_\d+__)/);

    return chunks.map((chunk, idx) => {
      if (phrasesById[chunk]) {
        const phrase = phrasesById[chunk];
        const isClickable = phrase.length >= 4 && !STOP_WORDS.has(phrase.toLowerCase());

        return (
          <span
            key={`phrase-${idx}`}
            className="interactive-word clickable-any-word"
            onClick={isClickable ? () => onWordClick(phrase) : undefined}
            onDoubleClick={(e) => handleWordDoubleClick(e, phrase)}
            onMouseEnter={(e) => {
              if (isClickable) {
                handleWordHover(e, phrase, `Conceptual term related to ${topic || 'current article'}.`);
              }
            }}
            onMouseLeave={() => setWordDefPos(null)}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              display: 'inline-block',
              transition: 'all 0.15s ease',
            }}
          >
            {phrase}
          </span>
        );
      }

      const words = chunk.split(/([a-zA-Z0-9]+)/);
      return words.map((wordChunk, wordIdx) => {
        if (/^[a-zA-Z0-9]+$/.test(wordChunk)) {
          const isClickable = /^[A-Z]/.test(wordChunk) && !STOP_WORDS.has(wordChunk.toLowerCase());

          return (
            <span
              key={`word-${idx}-${wordIdx}`}
              className={`interactive-word ${isClickable ? 'clickable-any-word' : ''}`}
              onClick={isClickable ? () => { onWordClick(wordChunk); playWordClick(); } : undefined}
              onDoubleClick={(e) => handleWordDoubleClick(e, wordChunk)}
              onMouseEnter={(e) => {
                if (isClickable) {
                  handleWordHover(e, wordChunk, `Context definition for "${wordChunk}" within this article.`);
                }
              }}
              onMouseLeave={() => setWordDefPos(null)}
              style={{
                cursor: isClickable ? 'pointer' : 'default',
                display: 'inline-block',
                transition: 'all 0.15s ease',
              }}
            >
              {wordChunk}
            </span>
          );
        }
        return wordChunk;
      });
    });
  };

  const wrapClickable = (node: any): any => {
    if (typeof node === 'string') {
      return inArticleSearch.trim()
        ? renderHighlightedSearch(node)
        : renderClickableOriginal(node);
    }
    if (Array.isArray(node)) {
      return node.map((child, i) => <React.Fragment key={i}>{wrapClickable(child)}</React.Fragment>);
    }
    if (node && node.props && node.props.children) {
      return React.cloneElement(node, {
        ...node.props,
        children: wrapClickable(node.props.children),
      });
    }
    return node;
  };

  const renderHighlightedSearch = (text: string) => {
    const term = inArticleSearch.trim();
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return (
          <mark key={i} style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)', padding: '0 2px' }}>
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const MarkdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const isAsciiBlock = !inline && className === 'language-ascii';
      if (isAsciiBlock) {
        return (
          <pre
            className="ascii-art living-ascii"
            style={{
              background: 'none',
              borderLeft: '2.5px solid var(--border-color)',
              paddingLeft: '1rem',
              overflowX: 'auto',
              margin: '1rem 0',
              fontSize: '0.82em',
              lineHeight: '1.4',
              textAlign: 'left',
            }}
            aria-label="ASCII diagram"
          >
            {String(children).replace(/\n$/, '')}
          </pre>
        );
      }
      return (
        <code
          style={{
            background: 'none',
            borderBottom: '1px dotted var(--border-color)',
            padding: '0 0.2em',
            fontSize: '0.9em',
            fontFamily: 'monospace',
          }}
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ href, children }: any) => {
      const decodedTopic = href ? decodeURIComponent(href) : '';
      return (
        <button
          onClick={(e) => { e.preventDefault(); onWordClick(decodedTopic); }}
          className="interactive-word"
          style={{ fontWeight: '600', display: 'inline', borderBottom: '1px dotted currentColor', paddingBottom: '1px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}
          aria-label={`Learn more about ${decodedTopic}`}
          disabled={isStreaming}
        >
          {children}
        </button>
      );
    },
    strong: ({ children }: any) => <strong style={{ fontWeight: 'bold' }}>{wrapClickable(children)}</strong>,
    em: ({ children }: any) => <em style={{ fontStyle: 'italic' }}>{wrapClickable(children)}</em>,
    p: ({ children }: any) => <p style={{ margin: '0 0 1rem 0', lineHeight: '1.8' }}>{wrapClickable(children)}</p>,
    ul: ({ children }: any) => <ul style={{ listStyleType: 'none', paddingLeft: '1rem', marginBottom: '1rem', lineHeight: '1.8', borderLeft: '1px solid var(--border-color)' }}>{children}</ul>,
    ol: ({ children }: any) => <ol style={{ listStyleType: 'decimal-leading-zero', paddingLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>{children}</ol>,
    li: ({ children }: any) => <li style={{ marginBottom: '0.5rem', position: 'relative' }}>{wrapClickable(children)}</li>,
    table: ({ children }: any) => <div style={{ overflowX: 'auto', marginBottom: '1rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid var(--border-color)', fontSize: '0.9em' }}>{children}</table></div>,
    th: ({ children }: any) => <th style={{ borderBottom: '2px solid var(--border-color)', padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>{wrapClickable(children)}</th>,
    td: ({ children }: any) => <td style={{ borderBottom: '1px solid var(--border-color)', padding: '0.5rem' }}>{wrapClickable(children)}</td>,
  };

  const headers: { level: number; text: string }[] = [];
  content.split('\n').forEach(line => {
    const match = line.match(/^(##|###) (.+)/);
    if (match) {
      headers.push({ level: match[1].length, text: match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') });
    }
  });

  return (
    <div style={{ position: 'relative' }} ref={contentRef}>

      {/* ── Reading Progress Bar ── */}
      {!isStreaming && content.length > 200 && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '2px',
          background: 'var(--border-color)',
          marginBottom: '1rem',
        }}>
          <div style={{
            height: '100%',
            width: `${readingProgress}%`,
            background: 'var(--accent-color)',
            transition: 'width 0.2s ease',
          }} />
        </div>
      )}

      {/* ── Article Meta Bar ── */}
      {!isStreaming && content.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.75em',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {complexityScore !== null && (
            <span title="Lexical complexity score (0=simple, 100=dense)">
              Complexity:{' '}
              <span style={{ color: complexityScore > 65 ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                {complexityScore > 65 ? 'Advanced' : complexityScore > 35 ? 'Intermediate' : 'Accessible'}
              </span>
              {' '}({complexityScore}/100)
            </span>
          )}
          <span>~{Math.max(1, Math.round(content.split(/\s+/).length / 200))} min read</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <button
            onClick={() => setIsPrintView(v => !v)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '1em', textDecoration: 'underline', padding: 0 }}
          >
            {isPrintView ? 'Exit Print View' : 'Print View'}
          </button>
        </div>
      )}

      {/* ── Table of Contents ── */}
      {headers.length > 0 && (
        <div style={{ marginBottom: '1.5rem', fontFamily: 'monospace', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.9em', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Table of Contents</h4>
            <button onClick={() => setIsTocVisible(!isTocVisible)} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8em' }}>
              {isTocVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          {isTocVisible && (
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '0.5rem', fontSize: '0.85em' }}>
              {headers.map((h, i) => (
                <li key={i} style={{ paddingLeft: h.level === 3 ? '1rem' : 0, marginBottom: '0.4rem' }}>
                  • <a href={`#${h.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} style={{ color: 'var(--text-color)', textDecoration: 'underline' }}>{h.text}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── In-Article Search Bar ── */}
      {!isStreaming && content.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', fontFamily: 'monospace', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Find in Article:</span>
          <input
            type="text"
            value={inArticleSearch}
            onChange={(e) => setInArticleSearch(e.target.value)}
            placeholder="Search within this page..."
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              fontFamily: 'monospace',
              fontSize: '0.9em',
              outline: 'none',
              padding: '0.2rem 0.5rem',
              flex: 1,
              minWidth: '150px'
            }}
          />
          {inArticleSearch && (
            <button
              onClick={() => setInArticleSearch('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85em', textDecoration: 'underline' }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className={`markdown-body tts-content${isStreaming ? ' streaming-active' : ''}${isPrintView ? ' print-view' : ''}`} onMouseUp={handleSelection} style={{ lineHeight: '1.8', position: 'relative' }}>
        <Markdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
          {content}
        </Markdown>
        <div ref={bottomRef} style={{ height: 1, padding: 0, margin: 0 }} />
      </div>

      {/* ── Sources Citation ── */}
      {!isStreaming && content.length > 0 && (() => {
        const sourceEntries = buildSourceEntries(topic || '', sources);
        return (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontFamily: 'monospace' }}>
            {/* Citation style header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setSourcesExpanded(v => !v)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85em', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>{sourcesExpanded ? '▼' : '▶'}</span>
                Sources &amp; Citation
                {sourceEntries.length > 0 && (
                  <span style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'normal', textTransform: 'none', letterSpacing: 0 }}>
                    ({sourceEntries.length} verified)
                  </span>
                )}
              </button>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                {(['APA', 'MLA', 'Chicago'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setCitationStyle(style)}
                    style={{ background: 'none', border: 'none', padding: 0, textDecoration: citationStyle === style ? 'underline' : 'none', color: citationStyle === style ? 'var(--accent-color)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.82em' }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Citation text */}
            <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.82em', color: 'var(--text-muted)', wordBreak: 'break-word', lineHeight: '1.6', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.8rem' }}>
              {getCitation()}
            </p>

            {/* Expanded source list with real URLs and snippets */}
            {sourcesExpanded && (
              <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {sourceEntries.length === 0 ? (
                  <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>No external sources were loaded for this article.</span>
                ) : sourceEntries.map(entry => {
                  const isOpen = expandedSource === entry.type;
                  return (
                    <div key={entry.type} style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setExpandedSource(isOpen ? null : entry.type)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.82em', color: isOpen ? 'var(--accent-color)' : 'var(--text-color)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>{isOpen ? '[-]' : '[+]'}</span>
                          {entry.label}
                        </button>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75em', color: 'var(--accent-color)', textDecoration: 'underline', fontFamily: 'monospace' }}
                        >
                          ↗ {entry.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      </div>
                      {isOpen && entry.snippet && (
                        <p style={{ margin: '0.3rem 0 0.3rem 0.8rem', fontSize: '0.78em', color: 'var(--text-muted)', lineHeight: '1.5', fontStyle: 'italic' }}>
                          &ldquo;{entry.snippet}{entry.snippet.length >= 200 ? '…' : ''}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Precision Word/Concept Hover Tooltip ── */}
      {wordDefPos && (
        <div
          ref={wordDefRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${wordDefPos.top}px`,
            left: `${wordDefPos.left}px`,
            background: 'var(--bg-color)',
            border: '1px solid var(--accent-color)',
            padding: '0.45rem 0.7rem',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '0.78em',
            maxWidth: '240px',
            width: 'max-content',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            animation: 'fade-in 0.1s ease',
            lineHeight: '1.4',
          }}
        >
          {/* Arrow pointing to the word */}
          <div style={{
            position: 'absolute',
            [wordDefPos.placement === 'above' ? 'bottom' : 'top']: '-6px',
            left: `${wordDefPos.arrowLeft}px`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            ...(wordDefPos.placement === 'above'
              ? { borderTop: '6px solid var(--accent-color)' }
              : { borderBottom: '6px solid var(--accent-color)' }),
          }} />
          <strong style={{ color: 'var(--accent-color)' }}>{wordDefPos.word}</strong>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>—</span>
          <span>{wordDefPos.def}</span>
        </div>
      )}

      {/* ── Precision Selection Popup ── */}
      {popupPos && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: `${popupPos.top}px`,
            left: `${popupPos.left}px`,
            background: 'var(--bg-color)',
            border: '1px solid var(--accent-color)',
            padding: '0.6rem 0.9rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '0.8em',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            animation: 'fade-in 0.15s ease-out',
            pointerEvents: 'auto',
            maxWidth: '380px',
            width: 'max-content',
          }}
        >
          {/* Arrow pointing to the selection */}
          <div style={{
            position: 'absolute',
            [popupPos.placement === 'above' ? 'bottom' : 'top']: '-6px',
            left: `${popupPos.arrowLeft}px`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            ...(popupPos.placement === 'above'
              ? { borderTop: '6px solid var(--accent-color)' }
              : { borderBottom: '6px solid var(--accent-color)' }),
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { onWordClick(selectedText); setPopupPos(null); }}
              style={{ background: 'var(--accent-color)', border: 'none', color: 'var(--bg-color, #0b0f19)', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', fontFamily: 'monospace', flexShrink: 0 }}
            >
              &ldquo;{selectedText.length > 14 ? selectedText.slice(0, 14) + '…' : selectedText}&rdquo;
            </button>
            {(['Simplify', 'Go Deeper', 'Show Sources'] as const).map(action => (
              <button
                key={action}
                onClick={async () => {
                  setIsExplaining(true);
                  setExplainAnswer('Synthesizing verified knowledge…');
                  try {
                    const res = await explainThis(selectedText, action);
                    setExplainAnswer(res);
                  } catch {
                    setExplainAnswer('Error retrieving answer from AI.');
                  } finally {
                    setIsExplaining(false);
                  }
                }}
                disabled={isExplaining}
                style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--text-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.82em' }}
              >
                {action}
              </button>
            ))}
            <button
              onClick={() => setPopupPos(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '1.1em', padding: '0 0.2rem', marginLeft: 'auto' }}
            >
              ×
            </button>
          </div>
          {(isExplaining || explainAnswer) && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.5', maxHeight: '200px', overflowY: 'auto' }}>
              {explainAnswer}
            </div>
          )}
        </div>
      )}

      {!isStreaming && content.length > 0 && (
        <div className="content-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={handleCopy}
            style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            {copyStatus}
          </button>

          <button
            onClick={() => { const next = !soundOn; setSoundOn(next); setSoundEnabled(next); }}
            title={soundOn ? 'Sound effects on' : 'Sound effects off'}
            style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            {soundOn ? 'Sound: On' : 'Sound: Off'}
          </button>
          <button 
            onClick={onToggleFavorite}
            style={{ textDecoration: 'underline', color: isFavorite ? 'var(--accent-color)' : 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            {isFavorite ? 'Unstar' : 'Star'}
          </button>
          <button 
            onClick={handleShare}
            style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            Share Link
          </button>

          {/* ── Download dropdown ── */}
          <div style={{ position: 'relative' }} ref={downloadRef}>
            <button 
              onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
              style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
            >
              Download ▾
            </button>
            {downloadMenuOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                minWidth: '110px',
                zIndex: 100
              }}>
                <button onClick={handleDownloadTxt} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--text-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.82em', textAlign: 'left' }}>
                  Plain Text
                </button>
                <button onClick={handleShare} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--text-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.82em', textAlign: 'left' }}>
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, onWordClick, topic, isFavorite, onToggleFavorite, fontSize, isReadingMode, onExplainClick, sources }) => {
  return (
    <div style={{ fontSize: `${fontSize}%`, fontFamily: 'monospace', width: '100%' }}>
      <InteractiveContent
        content={content}
        onWordClick={onWordClick}
        isStreaming={isLoading}
        topic={topic}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        fontSize={fontSize}
        isReadingMode={isReadingMode}
        onExplainClick={onExplainClick}
        sources={sources}
      />
    </div>
  );
};

export default ContentDisplay;
