/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
}

const InteractiveContent: React.FC<{
  content: string;
  onWordClick: (word: string) => void;
  isStreaming?: boolean;
}> = ({ content, onWordClick, isStreaming }) => {
  const [copyStatus, setCopyStatus] = useState<string>('Copy');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isStreaming]);

  useEffect(() => {
    return () => {
      // Guard: speechSynthesis may not exist in all browsers
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
    // Strip markdown links for copying plain text roughly
    const plainText = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_~`]/g, '');
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

  const handleTTS = () => {
    // Guard: speechSynthesis may not be available in all browsers
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const plainText = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_~`]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
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
    strong: ({ children }: any) => <strong style={{ fontWeight: '900', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'inherit' }}>【{children}】</strong>,
    em: ({ children }: any) => <em style={{ fontStyle: 'italic', fontWeight: '200', letterSpacing: '0.05em' }}>/ {children} /</em>,
    p: ({ children }: any) => <p style={{ margin: '0 0 1rem 0', lineHeight: '1.8' }}>{children}</p>,
    ul: ({ children }: any) => <ul style={{ listStyleType: 'none', paddingLeft: '1rem', marginBottom: '1rem', lineHeight: '1.8', borderLeft: '1px solid var(--border-color)' }}>{children}</ul>,
    ol: ({ children }: any) => <ol style={{ listStyleType: 'decimal-leading-zero', paddingLeft: '2rem', marginBottom: '1rem', lineHeight: '1.8' }}>{children}</ol>,
    li: ({ children }: any) => <li style={{ marginBottom: '0.5rem', position: 'relative' }}>{children}</li>,
    table: ({ children }: any) => <div style={{ overflowX: 'auto', marginBottom: '1rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', fontSize: '0.9em' }}>{children}</table></div>,
    th: ({ children }: any) => <th style={{ borderBottom: '2px solid var(--border-color)', padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', background: 'var(--input-bg)' }}>{children}</th>,
    td: ({ children }: any) => <td style={{ borderBottom: '1px solid var(--border-color)', padding: '0.75rem' }}>{children}</td>,
  };

  return (
    <div>
      <div className="markdown-body" style={{ lineHeight: '1.8' }}>
        <Markdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
          {content + (isStreaming ? ' \u2588' : '')}
        </Markdown>
        <div ref={bottomRef} style={{ height: 1, padding: 0, margin: 0 }} />
      </div>
      
      {!isStreaming && content.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
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
            onClick={handleShare}
            style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}
          >
            Share Link
          </button>
        </div>
      )}
    </div>
  );
};

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, onWordClick }) => {
  if (!content) return null;
  return <InteractiveContent content={content} onWordClick={onWordClick} isStreaming={isLoading} />;
};

export default ContentDisplay;
