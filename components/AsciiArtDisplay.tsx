import React, { useState, useEffect } from 'react';
import { AsciiArtData } from '../services/aiService';

interface AsciiArtDisplayProps {
  artData: AsciiArtData | null;
  topic: string;
  onWordClick?: (word: string) => void;
}

const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({ artData, topic, onWordClick }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Art');
  const [mutatedArt, setMutatedArt] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (artData) {
      setMutatedArt(artData.art);
      setEditText(artData.art);
    }
  }, [artData]);

  if (!artData) return null;

  const isStreaming = artData.art.endsWith('▌') || artData.art.endsWith('|');
  const visibleContent = isStreaming ? artData.art.slice(0, -1) : mutatedArt;
  const accessibilityLabel = `ASCII art for ${topic}`;

  const renderInteractiveArt = (text: string) => {
    if (isStreaming) return text;
    const regex = /([a-zA-Z0-9]{3,})|(\S)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let keyCount = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const wordMatch = match[1];
      const charMatch = match[2];

      if (wordMatch && onWordClick) {
        parts.push(
          <span 
            key={keyCount++} 
            onClick={() => onWordClick(wordMatch)}
            className="interactive-word"
            style={{ cursor: 'pointer', position: 'relative', zIndex: 2 }}
            title={`Search ${wordMatch}`}
          >
            {wordMatch}
          </span>
        );
      } else if (charMatch) {
         parts.push(
            <span 
              key={keyCount++} 
              className="interactive-char"
            >
               {charMatch}
            </span>
         );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  const handleCopy = () => {
    if (artData) {
      const copyText = visibleContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(() => {
          setCopyStatus('Copied!');
          setTimeout(() => setCopyStatus('Copy Art'), 2000);
        }).catch(() => {
          fallbackCopy(copyText);
          setCopyStatus('Copied!');
          setTimeout(() => setCopyStatus('Copy Art'), 2000);
        });
      } else {
        fallbackCopy(copyText);
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy Art'), 2000);
      }
    }
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

  const handleSaveEdit = () => {
    setMutatedArt(editText);
    setIsEditing(false);
    // Download as text file option
    const blob = new Blob([editText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-art.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {isEditing ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={visibleContent.split('\n').length + 2}
            style={{
              width: '100%',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              fontFamily: 'monospace',
              fontSize: '0.85em',
              padding: '1rem',
              outline: 'none',
              borderRadius: '2px',
              whiteSpace: 'pre'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={handleSaveEdit}
              style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8em', borderRadius: '4px' }}
            >
              💾 Save & Download
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8em', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <pre 
            className="ascii-art" 
            aria-label={accessibilityLabel}
            style={{
              whiteSpace: 'pre',
              overflowX: 'auto',
              maxWidth: '100%',
              textAlign: 'left',
              fontFamily: 'monospace',
              lineHeight: '1.2',
              fontSize: '0.85em',
              color: 'var(--text-muted)',
              marginBottom: '1rem'
            }}
          >
            {renderInteractiveArt(visibleContent)}
            {isStreaming && <span className="blinking-cursor">|</span>}
          </pre>
          {!isStreaming && (
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem' }}>
              <button 
                onClick={handleCopy}
                style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.82em', fontFamily: 'monospace' }}
              >
                {copyStatus}
              </button>
              <button 
                onClick={() => { setEditText(visibleContent); setIsEditing(true); }}
                style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.82em', fontFamily: 'monospace' }}
              >
                ✏️ Edit Art
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AsciiArtDisplay;
