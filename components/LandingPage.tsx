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

  return (
    <div className="fade-in" style={{ position: 'relative', textAlign: 'center', padding: '2rem 0', overflow: 'hidden' }}>

      {/* ── Large Moon ── */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-5%', opacity: 0.12,
        pointerEvents: 'none', zIndex: 0, fontSize: '0.5em'
      }} className="hide-on-mobile">
        <pre style={{ fontFamily: 'monospace', lineHeight: '1', color: 'var(--text-muted)', margin: 0 }}>
          {LARGE_MOON}
        </pre>
      </div>

      {/* ── Galaxy ── */}
      <div style={{
        position: 'absolute', top: '60px', left: '2%', opacity: 0.08,
        pointerEvents: 'none', zIndex: 0
      }} className="hide-on-mobile">
        <pre className="ascii-breathing" style={{ fontFamily: 'monospace', lineHeight: '1.3', color: 'var(--text-muted)', margin: 0, fontSize: '0.65em' }}>
          {GALAXY}
        </pre>
      </div>

      {/* ── Planet ── */}
      <div style={{
        position: 'absolute', bottom: '60px', left: '5%', opacity: 0.1,
        pointerEvents: 'none', zIndex: 0
      }} className="hide-on-mobile">
        <pre style={{ fontFamily: 'monospace', lineHeight: '1.2', color: 'var(--text-muted)', margin: 0, fontSize: '0.6em' }}>
          {PLANET}
        </pre>
      </div>

      {/* ── Rocket ── */}
      <div style={{
        position: 'absolute', bottom: '30px', right: '8%', opacity: 0.1,
        pointerEvents: 'none', zIndex: 0
      }} className="hide-on-mobile">
        <pre style={{ fontFamily: 'monospace', lineHeight: '1.1', color: 'var(--text-muted)', margin: 0, fontSize: '0.45em' }}>
          {ROCKET}
        </pre>
      </div>

      {/* ── Logo with proper spacing ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 5 }}>
        <svg width="100%" height="130" viewBox="0 0 700 130" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))', maxWidth: '700px' }}>
          <defs>
            <linearGradient id="cantoHolo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--text-color)" />
              <stop offset="100%" stopColor="var(--text-muted)" />
            </linearGradient>
            <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--border-color)" />
            </pattern>
          </defs>
          
          {/* Moon icon — positioned with gap */}
          <g transform="translate(160, 15) scale(0.9)">
            <path d="M 30 0 A 30 30 0 1 0 60 30 A 20 20 0 1 1 30 0 Z" fill="none" stroke="url(#cantoHolo)" strokeWidth="3" />
            <circle cx="20" cy="15" r="2" fill="var(--accent-color)" />
            <circle cx="35" cy="45" r="2" fill="var(--accent-color)" />
            <circle cx="15" cy="35" r="1.5" fill="var(--accent-color)" />
          </g>

          {/* CANTO text — shifted right for spacing */}
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

      <h2 style={{ letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 300, position: 'relative', zIndex: 5 }}>
        Welcome to Canto
      </h2>
      <p style={{ maxWidth: '500px', margin: '0 auto 2rem auto', color: 'var(--text-muted)', lineHeight: '1.8', position: 'relative', zIndex: 5 }}>
        The infinite AI encyclopedia powered by real knowledge sources.
        Search any topic and watch a comprehensive, fact-checked article materialize in real time.
      </p>

      {/* ── Feature badges ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 5 }}>
        {[
          { icon: '📚', label: 'Wikipedia' },
          { icon: '🔬', label: 'NASA' },
          { icon: '🎓', label: 'Academic' },
          { icon: '🤖', label: 'AI Synthesis' },
        ].map(({ icon, label }) => (
          <span key={label} style={{ fontSize: '0.75em', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {icon} {label}
          </span>
        ))}
      </div>
      
      {onWordClick && (
        <div style={{ marginTop: '2rem', position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: '0.85em', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Explore these portals</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '650px', margin: '0 auto' }}>
            {exampleTopics.map(topic => (
              <button
                key={topic}
                onClick={() => onWordClick(topic)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '2px',
                  color: 'var(--text-color)', cursor: 'pointer', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent',
                  fontFamily: 'monospace', fontSize: '0.85em'
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
