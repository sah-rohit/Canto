/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cloudflareTextToSpeech } from '../services/aiService';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
  topic?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  fontSize?: number;
  isReadingMode?: boolean;
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
}> = ({ content, onWordClick, isStreaming, topic, isFavorite, onToggleFavorite, fontSize = 100, isReadingMode }) => {
  const [copyStatus, setCopyStatus] = useState<string>('Copy');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [ttsWordIndex, setTtsWordIndex] = useState<number>(-1);
  const [ttsWords, setTtsWords] = useState<string[]>([]);
  const [highlightBox, setHighlightBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wordSpanRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const handleSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text && text.length > 2) {
      setSelectedText(text);
      // Clamp popup position so it stays within viewport
      const vw = window.innerWidth;
      const x = Math.min(Math.max(e.clientX, 80), vw - 80);
      setPopupPos({ x, y: e.clientY - 48 });
    } else {
      setPopupPos(null);
    }
  };

  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isStreaming]);

  // Update highlight box position when the active TTS word changes
  useEffect(() => {
    if (ttsWordIndex < 0) {
      setHighlightBox(null);
      return;
    }
    const span = wordSpanRefs.current.get(ttsWordIndex);
    if (!span || !contentRef.current) { setHighlightBox(null); return; }
    const spanRect = span.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();
    setHighlightBox({
      top: spanRect.top - containerRect.top + contentRef.current.scrollTop,
      left: spanRect.left - containerRect.left,
      width: spanRect.width,
      height: spanRect.height,
    });
    // Scroll the word into view smoothly
    span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [ttsWordIndex]);

  useEffect(() => {
    return () => {
      // Stop browser TTS
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Stop Cloudflare TTS audio element
      const audio = document.getElementById('canto-tts-audio') as HTMLAudioElement | null;
      if (audio) { audio.pause(); audio.remove(); }
    };
  }, []);

  // Close download menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Strip markdown for plain text export
  const getPlainText = (): string => {
    return content
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links
      .replace(/[*_~`]/g, '')                     // formatting
      .replace(/```ascii\n?/g, '')                // ascii blocks
      .replace(/```\n?/g, '');                    // code blocks
  };

  // Fallback copy using execCommand for browsers without Clipboard API
  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try { document.execCommand('copy'); } catch (e) { /* silent */ }
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

  const stopTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const existingAudio = document.getElementById('canto-tts-audio') as HTMLAudioElement | null;
    if (existingAudio) { existingAudio.pause(); existingAudio.remove(); }
    setIsSpeaking(false);
    setTtsWordIndex(-1);
    setTtsWords([]);
    setHighlightBox(null);
    wordSpanRefs.current.clear();
  };

  const handleTTS = async () => {
    if (isSpeaking) { stopTTS(); return; }

    const plainText = getPlainText();
    // Tokenise into words for highlight tracking
    const words = plainText.match(/\S+/g) || [];
    setTtsWords(words);
    wordSpanRefs.current.clear();
    setIsSpeaking(true);
    setTtsWordIndex(0);

    // ── Try Cloudflare TTS first ──────────────────────────────────
    try {
      const audioBuffer = await cloudflareTextToSpeech(plainText);
      if (audioBuffer) {
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.id = 'canto-tts-audio';
        document.body.appendChild(audio);

        // Estimate word timing from audio duration once metadata loads
        audio.onloadedmetadata = () => {
          const duration = audio.duration;
          const msPerWord = words.length > 0 ? (duration * 1000) / words.length : 300;
          let idx = 0;
          const advance = () => {
            if (idx >= words.length) return;
            setTtsWordIndex(idx++);
            setTimeout(advance, msPerWord);
          };
          advance();
        };

        audio.onended = () => {
          URL.revokeObjectURL(url);
          audio.remove();
          stopTTS();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audio.remove();
          stopTTS();
        };
        await audio.play();
        return;
      }
    } catch {
      // fall through to browser TTS
    }

    // ── Browser speechSynthesis fallback with word boundary events ──
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      stopTTS();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onboundary = (e) => {
      if (e.name !== 'word') return;
      // Find which word index corresponds to this char offset
      let charCount = 0;
      for (let i = 0; i < words.length; i++) {
        if (charCount >= e.charIndex) { setTtsWordIndex(i); break; }
        charCount += words[i].length + 1; // +1 for space
      }
    };
    utterance.onend = () => stopTTS();
    utterance.onerror = () => stopTTS();
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Canto', text: 'Check out this topic on Canto!', url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      // Fallback for browsers without Clipboard API
      const input = document.createElement('input');
      input.value = url;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      try { document.execCommand('copy'); } catch (e) { /* silent */ }
      document.body.removeChild(input);
    }
  };

  const handleDownloadTxt = () => {
    const plainText = getPlainText();
    const header = `CANTO — ${(topic || 'Article').toUpperCase()}\n${'═'.repeat(50)}\n\n`;
    const footer = `\n\n${'─'.repeat(50)}\nGenerated by Canto · ${new Date().toLocaleDateString()}\nhttps://canto.sonatainteractive.com`;
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

  const handleDownloadPdf = () => {
    // Create a print-friendly version and use browser's native print-to-PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback: download as TXT if popup blocked
      handleDownloadTxt();
      return;
    }

    const plainText = getPlainText();
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Canto — ${topic || 'Article'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono&display=swap');
    body { font-family: 'Inter', sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.8; }
    h1 { font-size: 2em; font-weight: 900; letter-spacing: 0.05em; border-bottom: 3px solid #0b0f19; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
    pre { font-family: 'JetBrains Mono', monospace; background: #f4f4f8; border: 1px solid #ddd; padding: 1rem; border-radius: 6px; font-size: 0.85em; line-height: 1.3; overflow-x: auto; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 2px solid #eee; font-size: 0.85em; color: #666; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${topic || 'Article'}</h1>
  <div style="white-space: pre-wrap;">${plainText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="footer">Generated by Canto · ${new Date().toLocaleDateString()}</div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
    setDownloadMenuOpen(false);
  };

  const MULTI_WORD_CONCEPTS = [
    'operating system', 'windows 11', 'artificial intelligence', 'computer science', 'united states', 'new york', 'web development',
    'machine learning', 'data science', 'software engineering', 'world war', 'deep learning', 'general relativity', 'quantum mechanics',
    'silicon valley', 'information technology', 'google chrome', 'macos sequoia', 'macos tahoe', 'apple silicon'
  ];

  const STOP_WORDS = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'were', 'was', 'are', 'is', 'a', 'an', 'to', 'in', 'on', 'of', 'it', 'be', 'by', 'as', 'at', 'or', 'an', 'not', 'but', 'if', 'then', 'else', 'they', 'them', 'their', 'our', 'your', 'his', 'her', 'its', 'about', 'more', 'some', 'any', 'all', 'can', 'will', 'would', 'could', 'should', 'has', 'had', 'been', 'do', 'does', 'did', 'which', 'who', 'whom', 'where', 'when', 'why', 'how'
  ]);

  // Running word index counter used during TTS render to assign refs
  const ttsRenderWordIdx = useRef(0);

  // Reset word counter before each render when TTS is active
  if (isSpeaking) ttsRenderWordIdx.current = 0;

  const renderClickableText = (text: string) => {
    // 1. Identify all common multi-word concepts and proper nouns (Capitalized consecutive words)
    const matches: { phrase: string; index: number }[] = [];
    
    // Check common multi-word concepts (case-insensitive)
    for (const concept of MULTI_WORD_CONCEPTS) {
      const regex = new RegExp(`\\b${concept}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ phrase: match[0], index: match.index });
      }
    }

    // Check proper noun phrases (at least 2 capitalized words, e.g., Windows 11, Operating System)
    const propNounRegex = /\b[A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)+\b/g;
    let propMatch;
    while ((propMatch = propNounRegex.exec(text)) !== null) {
      // Avoid duplicate or overlapping matches
      if (!matches.some(m => m.index <= propMatch!.index && (m.index + m.phrase.length) >= propMatch!.index)) {
        matches.push({ phrase: propMatch[0], index: propMatch.index });
      }
    }

    // Sort matches by index descending so we can replace from end to start without breaking indices
    matches.sort((a, b) => b.index - a.index);

    // Create chunks using the found phrase indices
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
        return (
          <span
            key={`p-${idx}`}
            className="interactive-word clickable-any-word text-glow"
            onClick={() => onWordClick(phrase)}
            style={{
              cursor: 'pointer',
              display: 'inline-block',
              borderBottom: '1px dotted transparent',
              transition: 'all 0.15s ease',
              textShadow: '0 0 10px var(--accent-color)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottomColor = 'var(--accent-color)';
              e.currentTarget.style.textShadow = '0 0 15px var(--accent-color), 0 0 30px var(--accent-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottomColor = 'transparent';
              e.currentTarget.style.textShadow = '0 0 10px var(--accent-color)';
            }}
          >
            {phrase}
          </span>
        );
      }

      const words = chunk.split(/([a-zA-Z0-9]+)/);
      return words.map((wordChunk, wordIdx) => {
        if (/^[a-zA-Z0-9]{4,}$/.test(wordChunk) && !STOP_WORDS.has(wordChunk.toLowerCase())) {
          const thisWordIdx = isSpeaking ? ttsRenderWordIdx.current++ : -1;
          const isActive = isSpeaking && thisWordIdx === ttsWordIndex;
          return (
            <span
              key={`w-${idx}-${wordIdx}`}
              ref={isSpeaking ? (el) => { if (el) wordSpanRefs.current.set(thisWordIdx, el); } : undefined}
              className="interactive-word clickable-any-word"
              onClick={() => onWordClick(wordChunk)}
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                borderBottom: isActive
                  ? '2px solid var(--accent-color)'
                  : '1px dotted transparent',
                color: isActive ? 'var(--accent-color)' : 'inherit',
                transition: 'color 0.1s ease, border-color 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderBottomColor = 'var(--accent-color)';
                  e.currentTarget.style.textShadow = '0 0 10px var(--accent-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                  e.currentTarget.style.textShadow = 'none';
                }
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
      return renderClickableText(node);
    }
    if (React.isValidElement(node)) {
      return React.cloneElement(node as any, {
        children: React.Children.map((node.props as any).children, wrapClickable)
      });
    }
    if (Array.isArray(node)) {
      return node.map(wrapClickable);
    }
    return node;
  };

  const MarkdownComponents = {
    // Render ```ascii ... ``` blocks as styled ASCII diagrams
    code: ({ node, inline, className, children, ...props }: any) => {
      const isAsciiBlock = !inline && className === 'language-ascii';
      if (isAsciiBlock) {
        return (
          <pre
            className="ascii-art living-ascii"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '1rem',
              overflowX: 'auto',
              margin: '1.5rem 0',
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
      // Inline code
      return (
        <code
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '3px',
            padding: '0.1em 0.4em',
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
      // Decode href in case it's URI encoded
      const decodedTopic = href ? decodeURIComponent(href) : '';
      
      // Handle aesthetic modifiers
      if (decodedTopic === '#glow') {
         return <span className="text-glow">{children}</span>;
      }
      if (decodedTopic === '#outline') {
         return <span className="text-outline">{children}</span>;
      }
      if (decodedTopic === '#distort') {
         return <span className="text-distort">{children}</span>;
      }

      return (
        <button
          onClick={(e) => { e.preventDefault(); onWordClick(decodedTopic); }}
          className="interactive-word"
          style={{ fontWeight: '600', display: 'inline', borderBottom: '1px dotted currentColor', paddingBottom: '1px' }}
          aria-label={`Learn more about ${decodedTopic}`}
          disabled={isStreaming}
        >
          {children}
        </button>
      );
    },
    strong: ({ children }: any) => <strong style={{ fontWeight: '900', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'inherit' }}>【{wrapClickable(children)}】</strong>,
    em: ({ children }: any) => <em style={{ fontStyle: 'italic', fontWeight: '200', letterSpacing: '0.05em' }}>/ {wrapClickable(children)} /</em>,
    p: ({ children }: any) => <p style={{ margin: '0 0 1rem 0', lineHeight: '1.8' }}>{wrapClickable(children)}</p>,
    ul: ({ children }: any) => <ul style={{ listStyleType: 'none', paddingLeft: '1rem', marginBottom: '1rem', lineHeight: '1.8', borderLeft: '1px solid var(--border-color)' }}>{children}</ul>,
    ol: ({ children }: any) => <ol style={{ listStyleType: 'decimal-leading-zero', paddingLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>{children}</ol>,
    li: ({ children }: any) => <li style={{ marginBottom: '0.5rem', position: 'relative' }}>{wrapClickable(children)}</li>,
    table: ({ children }: any) => <div style={{ overflowX: 'auto', marginBottom: '1rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', fontSize: '0.9em' }}>{children}</table></div>,
    th: ({ children }: any) => <th style={{ borderBottom: '2px solid var(--border-color)', padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', background: 'var(--input-bg)' }}>{wrapClickable(children)}</th>,
    td: ({ children }: any) => <td style={{ borderBottom: '1px solid var(--border-color)', padding: '0.75rem' }}>{wrapClickable(children)}</td>,
  };

  return (
    <div style={{ position: 'relative' }} ref={contentRef}>
      {/* ── TTS word-highlight overlay ── */}
      {isSpeaking && highlightBox && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: highlightBox.top - 2,
            left: highlightBox.left - 3,
            width: highlightBox.width + 6,
            height: highlightBox.height + 4,
            background: 'var(--accent-color)',
            opacity: 0.18,
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: 5,
            transition: 'top 0.1s ease, left 0.1s ease, width 0.1s ease',
            borderBottom: '1px solid var(--accent-color)',
          }}
        />
      )}
      {/* ── TTS status bar — matches site's monospace / border aesthetic ── */}
      {isSpeaking && ttsWordIndex >= 0 && ttsWords[ttsWordIndex] && (
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '2px',
            padding: '0.5rem 1.2rem',
            fontFamily: 'monospace',
            fontSize: '0.85em',
            color: 'var(--text-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9998,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            maxWidth: '80vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {/* Stop button — same style as nav-btn */}
          <button
            onClick={stopTTS}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.9em',
              padding: 0,
              pointerEvents: 'auto',
              textDecoration: 'underline',
            }}
          >
            Stop
          </button>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8em', letterSpacing: '0.05em' }}>
            ▶
          </span>
          <span style={{ color: 'var(--accent-color)', letterSpacing: '0.03em' }}>
            {ttsWords[ttsWordIndex]}
          </span>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>
            {ttsWordIndex + 1}/{ttsWords.length}
          </span>
        </div>
      )}

      <div className="markdown-body tts-content" onMouseUp={handleSelection} style={{ lineHeight: '1.8', position: 'relative' }}>
        <Markdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
          {content + (isStreaming ? ' \u2588' : '')}
        </Markdown>
        <div ref={bottomRef} style={{ height: 1, padding: 0, margin: 0 }} />
      </div>

      {popupPos && (
        <div style={{
          position: 'fixed',
          top: `${popupPos.y}px`,
          left: `${popupPos.x}px`,
          transform: 'translateX(-50%)',
          background: 'var(--bg-color)',
          border: '1px solid var(--accent-color)',
          padding: '0.4rem 0.8rem',
          borderRadius: '2px',
          boxShadow: '0 0 15px rgba(var(--accent-color-rgb), 0.4)',
          zIndex: 9999,
          fontFamily: 'monospace',
          fontSize: '0.8em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fade-in 0.15s ease-out',
          pointerEvents: 'auto'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Search:</span>
          <button 
            onClick={() => {
              onWordClick(selectedText);
              setPopupPos(null);
            }}
            style={{
              background: 'var(--accent-color)',
              border: 'none',
              color: 'var(--bg-color, #0b0f19)',
              padding: '0.2rem 0.6rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85em',
              fontFamily: 'monospace'
            }}
          >
            "{selectedText.length > 15 ? selectedText.slice(0, 15) + '...' : selectedText}"
          </button>
          <button 
            onClick={() => setPopupPos(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '1em',
              padding: '0 0.2rem'
            }}
          >
            ×
          </button>
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
            onClick={handleTTS}
            style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            {isSpeaking ? 'Stop TTS' : 'Listen TTS'}
          </button>
          <button 
            onClick={onToggleFavorite}
            style={{ textDecoration: 'underline', color: isFavorite ? 'var(--accent-color)' : 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            {isFavorite ? '★ Unstar' : '☆ Star'}
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
                marginBottom: '0.5rem',
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '0.25rem 0',
                minWidth: '140px',
                zIndex: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <button 
                  onClick={handleDownloadTxt}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem',
                    border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85em',
                    fontFamily: 'monospace', color: 'var(--text-color)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📄 Save as .TXT
                </button>
                <button 
                  onClick={handleDownloadPdf}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem',
                    border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85em',
                    fontFamily: 'monospace', color: 'var(--text-color)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📑 Save as .PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, onWordClick, topic, isFavorite, onToggleFavorite, fontSize, isReadingMode }) => {
  if (!content) return null;
  return (
    <div className={`content-display ${isLoading ? 'loading' : ''} ${isReadingMode ? 'reading-mode' : ''}`} style={{ fontSize: `${fontSize}%` }}>
      <InteractiveContent 
        content={content} 
        onWordClick={onWordClick} 
        isStreaming={isLoading} 
        topic={topic} 
        isFavorite={isFavorite} 
        onToggleFavorite={onToggleFavorite} 
        fontSize={fontSize}
        isReadingMode={isReadingMode}
      />
    </div>
  );
};

export default ContentDisplay;
