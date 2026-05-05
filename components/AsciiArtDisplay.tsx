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
  const [artStylePicker, setArtStylePicker] = useState<'minimalist' | 'retro' | 'scientific'>('minimalist');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [artHistory, setArtHistory] = useState<{ topic: string; art: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('canto_art_history') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    if (artData) {
      setMutatedArt(artData.art);
      setEditText(artData.art);
      setArtHistory(prev => {
        const next = [{ topic, art: artData.art }, ...prev.filter(x => x.topic !== topic)].slice(0, 30);
        localStorage.setItem('canto_art_history', JSON.stringify(next));
        return next;
      });
    }
  }, [artData, topic]);

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

  const handleExportPNG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const lines = visibleContent.split('\n');
    canvas.width = 650;
    canvas.height = lines.length * 18 + 40;

    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00ff66';
    lines.forEach((line, i) => {
      ctx.fillText(line, 20, i * 18 + 30);
    });

    const link = document.createElement('a');
    link.download = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-art.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const currentPreStyle: React.CSSProperties = {
    whiteSpace: 'pre',
    overflowX: 'auto',
    maxWidth: '100%',
    textAlign: 'left',
    fontFamily: 'monospace',
    lineHeight: '1.2',
    fontSize: '0.85em',
    color: 'var(--text-color)',
    marginBottom: '1rem',
    background: artStylePicker === 'retro' ? '#001100' : artStylePicker === 'scientific' ? 'var(--input-bg)' : 'transparent',
    border: artStylePicker === 'scientific' ? '1px solid var(--border-color)' : 'none',
    padding: artStylePicker === 'minimalist' ? '0' : '1rem',
    boxShadow: artStylePicker === 'retro' ? 'inset 0 0 10px rgba(0,255,0,0.1)' : 'none'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* ── Art Gallery & Style Pickers ── */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.85em' }}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Style:</span>
          {(['minimalist', 'retro', 'scientific'] as const).map(style => (
            <button
              key={style}
              onClick={() => setArtStylePicker(style)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: artStylePicker === style ? 'var(--accent-color)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'monospace',
                textDecoration: artStylePicker === style ? 'underline' : 'none'
              }}
            >
              {style}
            </button>
          ))}
        </div>
        <button
          onClick={() => setGalleryOpen(!galleryOpen)}
          style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace' }}
        >
          {galleryOpen ? 'Close Gallery' : 'Art Gallery'}
        </button>
      </div>

      {galleryOpen && (
        <div style={{ width: '100%', border: '1px solid var(--border-color)', background: 'var(--input-bg)', padding: '1rem', marginBottom: '1.5rem', fontFamily: 'monospace', fontSize: '0.85em' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', letterSpacing: '0.1em' }}>BROWSE ART GALLERY</h4>
          {artHistory.length === 0 ? <p style={{ margin: 0, color: 'var(--text-muted)' }}>No art stored yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {artHistory.map((item, idx) => (
                <div key={idx} style={{ borderBottom: idx < artHistory.length - 1 ? '1px dotted var(--border-color)' : 'none', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong>{item.topic}</strong>
                    <button onClick={() => setMutatedArt(item.art)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace' }}>
                      Load Art
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre', overflowX: 'auto', fontSize: '0.7em', color: 'var(--text-muted)', background: '#0b0f19', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
                    {item.art}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8em', borderRadius: '4px', background: 'none' }}
            >
              Save & Download
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8em', borderRadius: '4px', background: 'none' }}
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
            style={currentPreStyle}
          >
            {renderInteractiveArt(visibleContent)}
            {isStreaming && <span className="blinking-cursor">|</span>}
          </pre>
          {!isStreaming && (
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
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
                Edit Art
              </button>
              <button 
                onClick={handleExportPNG}
                style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.82em', fontFamily: 'monospace' }}
              >
                Export PNG
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AsciiArtDisplay;
