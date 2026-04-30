import React from 'react';
import MoonAscii from './MoonAscii';
import Starfield from './Starfield';

const LandingPage: React.FC<{ onWordClick?: (word: string) => void }> = ({ onWordClick }) => {
  const exampleTopics = ["Quantum Entanglement", "Cyberpunk", "Stoicism", "Tesseract", "Bioluminescence", "Neural Network"];

  return (
    <div className="fade-in" style={{ position: 'relative', textAlign: 'center', padding: '2rem 0' }}>
      <div style={{ position: 'absolute', top: '-10px', right: '10%', opacity: 0.8 }} className="hide-on-mobile">
         <MoonAscii />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <svg width="100%" height="120" viewBox="0 0 600 120" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))', maxWidth: '600px' }}>
          <defs>
            <linearGradient id="cantoHolo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--text-color)" />
              <stop offset="100%" stopColor="var(--text-muted)" />
            </linearGradient>
            <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--border-color)" />
            </pattern>
          </defs>
          
          <g transform="translate(130, 20)">
            {/* Moon ASCII / SVG graphics */}
            <path d="M 30 0 A 30 30 0 1 0 60 30 A 20 20 0 1 1 30 0 Z" fill="none" stroke="url(#cantoHolo)" strokeWidth="3" />
            <circle cx="20" cy="15" r="2" fill="var(--accent-color)" />
            <circle cx="35" cy="45" r="2" fill="var(--accent-color)" />
            <circle cx="15" cy="35" r="1.5" fill="var(--accent-color)" />
            
            {/* Stars popping out */}
            <path d="M 50 -10 L 52 0 L 62 2 L 52 4 L 50 14 L 48 4 L 38 2 L 48 0 Z" fill="var(--border-color)" transform="scale(0.5) translate(80, -20)" />
          </g>

          <text x="320" y="65" dominantBaseline="middle" textAnchor="middle" fill="url(#cantoHolo)" fontSize="72" fontFamily="Inter, sans-serif" fontWeight="900" letterSpacing="0.2em">
            CANTO
          </text>
          <text x="320" y="65" dominantBaseline="middle" textAnchor="middle" fill="url(#dotPattern)" fontSize="72" fontFamily="Inter, sans-serif" fontWeight="900" letterSpacing="0.2em" style={{ mixBlendMode: 'overlay' }}>
            CANTO
          </text>
          <text x="320" y="100" dominantBaseline="middle" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily="monospace" letterSpacing="0.6em">
            [ INFINITE ARCHIVE ]
          </text>
        </svg>
      </div>
      <h2 style={{ letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 300 }}>Welcome to Canto</h2>
      <p style={{ maxWidth: '450px', margin: '0 auto 2rem auto', color: 'var(--text-muted)', lineHeight: '1.8' }}>
        An infinite playground of exploration. Every concept is a portal. 
        Search any idea, phrase, or topic, and watch its definition and essence materialize in real time.
      </p>
      
      {onWordClick && (
        <div style={{ marginTop: '3rem', position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: '0.85em', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Or explore these portals</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
            {exampleTopics.map(topic => (
              <button
                key={topic}
                onClick={() => onWordClick(topic)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '2px',
                  color: 'var(--text-color)', cursor: 'pointer', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent',
                  fontFamily: 'monospace'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; e.currentTarget.style.textShadow = 'var(--ascii-glow)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-color)'; e.currentTarget.style.textShadow = 'none'; }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
