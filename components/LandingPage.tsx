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

const LandingPage: React.FC<{ onWordClick?: (word: string) => void; onConfigureClick?: () => void }> = ({ onWordClick, onConfigureClick }) => {
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

      {/* ── Logo in Plain Text ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        <h1 style={{ fontSize: '3.5em', fontWeight: 'bold', letterSpacing: '0.25em', color: 'var(--text-color)', fontFamily: 'monospace', margin: 0 }}>
          CANTO
        </h1>
        <p style={{ fontSize: '1em', letterSpacing: '0.4em', color: 'var(--text-muted)', fontFamily: 'monospace', margin: '0.5rem 0 0 0', textTransform: 'uppercase' }}>
          [ AI Galactica Encyclopedia ]
        </p>
      </div>

      <div style={{ maxWidth: '540px', margin: '0 auto 1.75rem auto', position: 'relative', zIndex: 5, padding: '0 1.25rem', fontFamily: 'monospace' }}>
        {!localStorage.getItem('canto_welcome_decision') ? (
          <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "4px", textAlign: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "var(--text-color)", marginTop: 0, fontSize: "1em", letterSpacing: "0.15em", textTransform: "uppercase" }}>Welcome Explorer</h3>
            <p style={{ fontSize: "0.85em", color: "var(--text-color)", lineHeight: 1.5, marginBottom: "1.5rem", textAlign: "justify" }}>
              Configure your permanent persistence tier before you start exploring. Zero local operations credit burn.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  localStorage.setItem('canto_welcome_decision', 'browser');
                  window.location.reload();
                }}
                style={{ background: "var(--accent-color)", color: "var(--bg-color)", border: "none", padding: "0.6rem 1.2rem", cursor: "pointer", fontFamily: "monospace", fontSize: "0.85em", fontWeight: "bold" }}
              >
                ⚡ Start Now (Browser Tier)
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('canto_welcome_decision', 'vault');
                  if (onConfigureClick) onConfigureClick();
                }}
                style={{ background: "transparent", border: "1px solid var(--accent-color)", color: "var(--accent-color)", padding: "0.6rem 1.2rem", cursor: "pointer", fontFamily: "monospace", fontSize: "0.85em" }}
              >
                💾 Connect My Vault
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85em", margin: "0 auto 1.5rem auto" }}>
            Vault mode: {localStorage.getItem('canto_welcome_decision') === 'vault' ? 'Connected to Local Drive' : 'Vault-Lite Mode (Up to 5GB)'}.
            {' '}<button
              onClick={() => { if (onConfigureClick) onConfigureClick(); }}
              style={{ background: "none", border: "none", padding: 0, textDecoration: "underline", color: "var(--accent-color)", fontFamily: "monospace", cursor: "pointer", fontSize: "1em" }}
            >
              Configure
            </button>
          </p>
        )}

        <h2 style={{ letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: 300, fontFamily: 'monospace' }}>
          Welcome to Canto
        </h2>
        <p style={{ color: 'var(--text-color)', lineHeight: '1.8', textAlign: 'justify' }}>
          Canto AI Galactica Encyclopedia powered by real knowledge sources from Wikipedia, NASA, Academic CORE, and Internet Archive. Use the raw text entries to understand modern and historical concepts in exceptional depth.
        </p>
      </div>

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
