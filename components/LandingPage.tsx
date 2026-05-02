import React from 'react';

const LARGE_MOON = `
                    ░░░░░░░░░░░                 
                ░░░░░░░░░░░░░░░░░               
             ░░░░░░░░░░░░░░░░░░░░░░             
           ░░░░░░░░░░░░░░░░░░░░░░░░░░           
          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        
        ░░░░░░░░░░░░▒▒░░░░░░░░░░░░░░░░░░░░       
       ░░░░░░░░░░░▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░      
      ░░░░░░░░░░░░▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░     
      ░░░░░░░░░░░░░░░░░░░░░░░░▒▒░░░░░░░░░░░░     
     ░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒░░░░░░░░░░░░    
     ░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒░░░░░░░░░░░░░    
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     
       ░░░░░░░░░▒▒░░░░░░░░░░░░░░░░░░░░░░░░░      
        ░░░░░░░▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░       
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        
          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         
            ░░░░░░░░░░░░░░░░░░░░░░░░░░           
              ░░░░░░░░░░░░░░░░░░░░░░             
                 ░░░░░░░░░░░░░░░░░               
                     ░░░░░░░░░░░                 `;

const ROCKET = `
              /\\
             /  \\
            | == |
            | == |
            | == |
            |    |
           /| /\\ |\\
          / | || | \\
         /  | || |  \\
        /   |    |   \\
            |    |
            | || |
            | || |
             \\||/
              \\/
             ╔══╗
             ║▓▓║
             ╚══╝
            ░░░░░░
           ░░░░░░░░
          ░░░░░░░░░░`;

const GALAXY = `
                                ·  ✦  ·
                        ·    ·    ·    ·    ·
                   ·    · ·  ·  ·  ·  · ·    ·
                ·    ·  ·  ·  ✦  ·  ·  ·  ·    ·
              ·  · ·  ·  ·  · ✹ ·  ·  ·  · ·  ·
                ·    ·  ·  ·  ✦  ·  ·  ·  ·    ·
                   ·    · ·  ·  ·  ·  · ·    ·
                        ·    ·    ·    ·    ·
                                ·  ✦  ·`;

const PLANET = `
            ╭────────╮
          ╭─┤ ▒▒▒░░▒ ├─╮
         │  │ ░▒▒▒░░ │  │
     ────┼──┤ ▒░░▒▒▒ ├──┼────
         │  │ ░▒▒░▒░ │  │
          ╰─┤ ▒░░▒▒▒ ├─╯
            ╰────────╯`;

const LandingPage: React.FC<{ onWordClick?: (word: string) => void }> = ({ onWordClick }) => {
  const exampleTopics = [
    "Quantum Entanglement", "Cyberpunk", "Stoicism",
    "Tesseract", "Bioluminescence", "Neural Network",
    "Dark Matter", "Philosophy", "Renaissance"
  ];

  const artStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.25,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    lineHeight: '1.2'
  };

  return (
    <div className="fade-in" style={{ position: 'relative', textAlign: 'center', padding: '1.5rem 0 2rem', overflow: 'hidden', minHeight: '70vh' }}>

      {/* ── Large Moon ── */}
      <div style={{ ...artStyle, top: '-40px', right: '-5%', fontSize: '0.55em' }} className="hide-on-mobile">
        <pre>{LARGE_MOON}</pre>
      </div>

      {/* ── Galaxy ── */}
      <div style={{ ...artStyle, top: '60px', left: '2%', fontSize: '0.7em' }} className="hide-on-mobile">
        <pre className="ascii-breathing">{GALAXY}</pre>
      </div>

      {/* ── Planet ── */}
      <div style={{ ...artStyle, bottom: '60px', left: '5%', fontSize: '0.65em' }} className="hide-on-mobile">
        <pre>{PLANET}</pre>
      </div>

      {/* ── Rocket ── */}
      <div style={{ ...artStyle, bottom: '30px', right: '8%', fontSize: '0.5em' }} className="hide-on-mobile">
        <pre>{ROCKET}</pre>
      </div>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        <svg width="100%" height="auto" viewBox="0 0 700 130" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))', maxWidth: '600px' }}>
          <defs>
            <linearGradient id="cantoHolo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--text-color)" />
              <stop offset="100%" stopColor="var(--text-muted)" />
            </linearGradient>
            <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--border-color)" />
            </pattern>
          </defs>
          
          <g transform="translate(160, 15) scale(0.9)">
            <path d="M 30 0 A 30 30 0 1 0 60 30 A 20 20 0 1 1 30 0 Z" fill="none" stroke="url(#cantoHolo)" strokeWidth="3" />
            <circle cx="20" cy="15" r="2" fill="var(--accent-color)" />
            <circle cx="35" cy="45" r="2" fill="var(--accent-color)" />
            <circle cx="15" cy="35" r="1.5" fill="var(--accent-color)" />
          </g>

          <text x="420" y="65" dominantBaseline="middle" textAnchor="middle" fill="url(#cantoHolo)" fontSize="72" fontFamily="Inter, sans-serif" fontWeight="900" letterSpacing="0.2em">
            CANTO
          </text>
          <text x="420" y="65" dominantBaseline="middle" textAnchor="middle" fill="url(#dotPattern)" fontSize="72" fontFamily="Inter, sans-serif" fontWeight="900" letterSpacing="0.2em" style={{ mixBlendMode: 'overlay' }}>
            CANTO
          </text>
          <text x="420" y="105" dominantBaseline="middle" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily="monospace" letterSpacing="0.6em">
            [ INFINITE ENCYCLOPEDIA ]
          </text>
        </svg>
      </div>

      <h2 style={{ letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: 300, position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        Welcome to Canto
      </h2>
      <p style={{ maxWidth: '540px', margin: '0 auto 1.75rem auto', color: 'var(--text-color)', lineHeight: '1.8', position: 'relative', zIndex: 5, padding: '0 1.25rem', fontFamily: 'monospace', textAlign: 'justify' }}>
        An infinite AI encyclopedia powered by real knowledge sources from Wikipedia, NASA, Academic CORE, and Internet Archive. Use the raw text entries to understand modern and historical concepts in exceptional depth.
      </p>

      {/* ── Feature badges — Encyclopedic text inline ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        {[
          'Wikipedia', 'NASA Technical Reports', 'CORE Academic Studies', 'Internet Archive Research', 'Encyclopedia Galactica'
        ].map((label, index, arr) => (
          <span key={label} style={{ fontSize: '0.8em', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {label}{index < arr.length - 1 && ' •'}
          </span>
        ))}
      </div>
      
      {onWordClick && (
        <div style={{ marginTop: '2rem', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
          <p style={{ fontSize: '0.8em', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'monospace' }}>Explore these portals</p>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', maxWidth: '650px', margin: '0 auto' }}>
            {exampleTopics.map((topic, i) => (
              <React.Fragment key={topic}>
                <button
                  onClick={() => onWordClick(topic)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    lineHeight: '1.5'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-color)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-color)'; }}
                >
                  {topic}
                </button>
                {i < exampleTopics.length - 1 && <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
