import React, { useState, useEffect, useRef } from 'react';
import { AsciiArtData } from '../services/aiService';

interface AsciiArtDisplayProps {
  artData: AsciiArtData | null;
  topic: string;
  onWordClick?: (word: string) => void;
}

const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({ artData, topic, onWordClick }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Art');
  const [mutatedArt, setMutatedArt] = useState<string>('');
  
  useEffect(() => {
    if (artData) {
      setMutatedArt(artData.art);
    }
  }, [artData]);

  // Occasional random mutation
  useEffect(() => {
    if (!artData || !mutatedArt) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance to mutate a character
         const chars = mutatedArt.split('');
         // Find indices of non-space, non-newline characters
         const validIndices = chars.map((c, i) => (c !== ' ' && c !== '\n' ? i : -1)).filter(i => i !== -1);
         if (validIndices.length > 0) {
            const indexToMutate = validIndices[Math.floor(Math.random() * validIndices.length)];
            const oldChar = chars[indexToMutate];
            // Mutate with a similar looking character
            const mutationMap: Record<string, string[]> = {
               '|': ['!', 'l', '1', '¦', 'I'],
               '-': ['_', '~', '=', '-'],
               '/': ['|', '\\', '('],
               '\\': ['|', '/', ')'],
               '_': ['-', '.', ' '],
               '.': [',', '`', '\''],
               'O': ['0', 'o', 'C'],
               'o': ['c', 'e', '*', '°'],
               '*': ['+', 'x', '·', '∗'],
               '┌': ['+', '╔'],
               '┐': ['+', '╗'],
               '└': ['+', '╚'],
               '┘': ['+', '╝'],
               '│': ['|', '║'],
               '─': ['-', '═']
            };
            if (mutationMap[oldChar]) {
                const options = mutationMap[oldChar];
                chars[indexToMutate] = options[Math.floor(Math.random() * options.length)];
                setMutatedArt(chars.join(''));
                
                // Revert back after a short time
                setTimeout(() => {
                   setMutatedArt(artData.art);
                }, 300);
            }
         }
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [artData, mutatedArt]);

  if (!artData) return null;

  const isStreaming = artData.art.endsWith('▌') || artData.art.endsWith('|');
  const visibleContent = isStreaming ? artData.art.slice(0, -1) : mutatedArt;
  const accessibilityLabel = `ASCII art for ${topic}`;

  const renderInteractiveArt = (text: string) => {
    if (isStreaming) return text;
    // Match words OR any non-whitespace character
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
            aria-label={`Search for ${wordMatch}`}
          >
            {wordMatch}
          </span>
        );
      } else if (charMatch) {
         parts.push(
            <span 
              key={keyCount++} 
              className="interactive-char"
              onClick={(e) => {
                 const el = e.currentTarget;
                 el.classList.add('char-clicked');
                 setTimeout(() => el.classList.remove('char-clicked'), 300);
              }}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <pre className="ascii-art ascii-breathing" aria-label={accessibilityLabel}>
        {renderInteractiveArt(visibleContent)}
        {isStreaming && <span className="blinking-cursor">|</span>}
      </pre>
      {!isStreaming && (
        <button 
          onClick={handleCopy}
          style={{ textDecoration: 'underline', color: '#666', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8em', marginTop: '0.5rem' }}
        >
          {copyStatus}
        </button>
      )}
    </div>
  );
};

export default AsciiArtDisplay;
