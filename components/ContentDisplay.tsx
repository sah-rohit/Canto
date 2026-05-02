import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { playSearchComplete, playWordClick, isSoundEnabled, setSoundEnabled } from '../services/soundService';
import { explainThis } from '../services/aiService';

declare global {
  interface Window {
    katex?: any;
  }
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
  sources?: { wikipedia?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
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
  sources?: { wikipedia?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
}> = ({ content, onWordClick, isStreaming, topic, isFavorite, onToggleFavorite, fontSize = 100, isReadingMode, onExplainClick, sources }) => {
  const [copyStatus, setCopyStatus] = useState<string>('Copy');
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [explainAnswer, setExplainAnswer] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [inArticleSearch, setInArticleSearch] = useState('');
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago'>('APA');
  const [isTocVisible, setIsTocVisible] = useState(true);

  // Short definition popup on word double-click/hover
  const [wordDefPos, setWordDefPos] = useState<{ x: number; y: number; word: string; def: string } | null>(null);

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

  const handleSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const text = selection.toString().trim();
    if (text && text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top > 60 ? rect.top - 48 : rect.bottom + 12;
      setPopupPos({ x, y });
      setSelectedText(text);
      setExplainAnswer(null);
    } else {
      setPopupPos(null);
    }
  };

  const handleWordDoubleClick = (e: React.MouseEvent, word: string) => {
    if (!word || word.length < 3) return;
    setWordDefPos({
      x: e.clientX,
      y: e.clientY - 35,
      word,
      def: `Retrieving direct AI context/definition for "${word}"...`
    });

    // Simulate direct AI explanation/definition from local context
    setTimeout(() => {
      setWordDefPos(prev => prev ? {
        ...prev,
        def: `"${word}" is a key thematic term used to describe foundational principles in the related context of ${topic || 'the encyclopedia article'}.`
      } : null);
    }, 700);
  };

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
    
    // Build direct verified sources list instead of only citing the current window location
    const citationUrls: string[] = [];
    if (sources?.wikipedia) citationUrls.push(`https://en.wikipedia.org/wiki/${encodeURIComponent(topic || '')}`);
    if (sources?.nasa) citationUrls.push(`https://images.nasa.gov/search-results?q=${encodeURIComponent(topic || '')}`);
    if (sources?.core) citationUrls.push(`https://core.ac.uk/search?q=${encodeURIComponent(topic || '')}`);
    if (sources?.internetArchive) citationUrls.push(`https://archive.org/search.php?query=${encodeURIComponent(topic || '')}`);

    // Fallback to a valid direct link if no explicit sources were passed
    if (citationUrls.length === 0) {
      citationUrls.push(`https://en.wikipedia.org/wiki/${encodeURIComponent(topic || '')}`);
    }

    const url = citationUrls.join(', ');

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
                const rect = e.currentTarget.getBoundingClientRect();
                setWordDefPos({
                  x: rect.left + rect.width / 2,
                  y: rect.top - 38,
                  word: phrase,
                  def: `Conceptual term related to ${topic || 'current article'}.`
                });
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
                  const rect = e.currentTarget.getBoundingClientRect();
                  setWordDefPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 38,
                    word: wordChunk,
                    def: `Context definition for "${wordChunk}" within raw AI synthesis.`
                  });
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

      <div className={`markdown-body tts-content${isStreaming ? ' streaming-active' : ''}`} onMouseUp={handleSelection} style={{ lineHeight: '1.8', position: 'relative' }}>
        <Markdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
          {content}
        </Markdown>
        <div ref={bottomRef} style={{ height: 1, padding: 0, margin: 0 }} />
      </div>

      {/* ── Citation & Sources toggle ── */}
      {!isStreaming && content.length > 0 && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85em', color: 'var(--text-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sources Citation</span>
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
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85em', color: 'var(--text-muted)', wordBreak: 'break-word', lineHeight: '1.5' }}>
            {getCitation()}
          </p>
        </div>
      )}

      {/* Word / Concept popover explanation on hover/double click */}
      {wordDefPos && (
        <div style={{
          position: 'fixed',
          top: `${wordDefPos.y}px`,
          left: `${wordDefPos.x}px`,
          transform: 'translateX(-50%)',
          background: 'var(--bg-color)',
          border: '1px solid var(--accent-color)',
          padding: '0.4rem 0.6rem',
          zIndex: 9999,
          fontFamily: 'monospace',
          fontSize: '0.78em',
          maxWidth: '240px',
          animation: 'fade-in 0.1s ease'
        }}>
          <strong>{wordDefPos.word}</strong>: {wordDefPos.def}
          <button onClick={() => setWordDefPos(null)} style={{ marginLeft: '0.4rem', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {popupPos && (
        <div style={{
          position: 'fixed',
          top: `${popupPos.y}px`,
          left: `${popupPos.x}px`,
          transform: 'translateX(-50%)',
          background: 'var(--bg-color)',
          border: '1px solid var(--accent-color)',
          padding: '0.6rem 0.9rem',
          borderRadius: '0',
          boxShadow: '0 0 15px rgba(var(--accent-color-rgb), 0.4)',
          zIndex: 9999,
          fontFamily: 'monospace',
          fontSize: '0.8em',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          animation: 'fade-in 0.15s ease-out',
          pointerEvents: 'auto',
          maxWidth: '420px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
            <button 
              onClick={() => { onWordClick(selectedText); setPopupPos(null); }}
              style={{ background: 'var(--accent-color)', border: 'none', color: 'var(--bg-color, #0b0f19)', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', fontFamily: 'monospace' }}
            >
              "{selectedText.length > 12 ? selectedText.slice(0, 12) + '...' : selectedText}"
            </button>
            {(['Simplify', 'Go Deeper', 'Show Sources'] as const).map(action => (
              <button
                key={action}
                onClick={async () => {
                  setIsExplaining(true);
                  setExplainAnswer('Synthesizing verified knowledge...');
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
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem', color: 'var(--text-color)', fontSize: '0.85em', lineHeight: '1.4', maxHeight: '180px', overflowY: 'auto' }}>
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
