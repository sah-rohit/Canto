import React from 'react';
import SearchBar from './SearchBar';

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

interface LandingPageProps {
  onWordClick?: (word: string) => void;
  onConfigureClick?: () => void;
  onSearch: (query: string) => void;
  onRandom: () => void;
  isLoading: boolean;
  predefinedWords: string[];
}

const TOPIC_DESCRIPTIONS: Record<string, string> = {
  "Quantum Entanglement": "Einsteinian paradox of subatomic connection.",
  "Cyberpunk": "High tech, low life and futuristic dystopias.",
  "Stoicism": "Hellenistic philosophy of virtue, logic, and resilience.",
  "Tesseract": "A four-dimensional hypercube in geometry.",
  "Bioluminescence": "The production and emission of light by a living organism.",
  "Neural Network": "Computing systems inspired by biological brains.",
  "Dark Matter": "Hypothetical cosmic matter that does not interact with light.",
  "Philosophy": "The study of the fundamental nature of knowledge and existence.",
  "Renaissance": "The great cultural rebirth in Europe from the 14th to 17th century."
};

const LandingPage: React.FC<LandingPageProps> = ({
  onWordClick,
  onConfigureClick,
  onSearch,
  onRandom,
  isLoading,
  predefinedWords
}) => {
  const exampleTopics = [
    "Quantum Entanglement", "Cyberpunk", "Stoicism",
    "Tesseract", "Bioluminescence", "Neural Network",
    "Dark Matter", "Philosophy", "Renaissance"
  ];

  const artStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.15,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    lineHeight: '1.2'
  };

  return (
    <div className="fade-in" style={{ position: 'relative', textAlign: 'center', padding: '2rem 0 3rem', overflow: 'hidden', minHeight: '80vh' }}>

      {/* ── Background ASCII Art elements ── */}
      <div style={{ ...artStyle, top: '-20px', right: '-2%', fontSize: '0.55em' }} className="hide-on-mobile">
        <pre>{LARGE_MOON}</pre>
      </div>

      <div style={{ ...artStyle, top: '40px', left: '1%', fontSize: '0.7em' }} className="hide-on-mobile">
        <pre className="ascii-breathing">{GALAXY}</pre>
      </div>

      <div style={{ ...artStyle, bottom: '80px', left: '3%', fontSize: '0.65em' }} className="hide-on-mobile">
        <pre>{PLANET}</pre>
      </div>

      <div style={{ ...artStyle, bottom: '40px', right: '5%', fontSize: '0.5em' }} className="hide-on-mobile">
        <pre>{ROCKET}</pre>
      </div>

      {/* ── Hero Headline (DeepWiki Style) ── */}
      <div style={{ maxWidth: '800px', margin: '1.5rem auto 2.5rem auto', position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', letterSpacing: '0.05em', color: 'var(--text-color)', fontFamily: 'monospace', marginBottom: '0.5rem', lineHeight: '1.2' }}>
          What would you like to understand?
        </h1>
        <p style={{ fontSize: '0.95em', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'monospace', margin: '0', textTransform: 'uppercase' }}>
          [ AI Galactica Encyclopedia ]
        </p>
      </div>

      {/* ── Prominent Centered Search Bar (DeepWiki Style) ── */}
      <div style={{ maxWidth: '640px', margin: '0 auto 2rem auto', position: 'relative', zIndex: 10, padding: '0 1.25rem' }}>
        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.25rem 1rem',
          background: 'var(--input-bg)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'border-color 0.2s',
        }}
        onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
        onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <SearchBar
            onSearch={onSearch}
            onRandom={onRandom}
            isLoading={isLoading}
            predefinedWords={predefinedWords}
          />
        </div>

        {/* ── Vault Connection Status / Configuration ── */}
        <div style={{ marginTop: '1.2rem', fontFamily: 'monospace' }}>
          {!localStorage.getItem('canto_welcome_decision') ? (
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", padding: "1.2rem", borderRadius: "8px", textAlign: "center", marginTop: "1rem" }}>
              <p style={{ fontSize: "0.82em", color: "var(--text-color)", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
                Configure your permanent persistence tier before you start exploring. Zero local operations credit burn.
              </p>
              <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    localStorage.setItem('canto_welcome_decision', 'browser');
                    window.location.reload();
                  }}
                  style={{ background: "var(--accent-color)", color: "var(--bg-color)", border: "none", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "monospace", fontSize: "0.8em", fontWeight: "bold", borderRadius: '4px' }}
                >
                  ⚡ Start Now (Browser Tier)
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('canto_welcome_decision', 'vault');
                    if (onConfigureClick) onConfigureClick();
                  }}
                  style={{ background: "transparent", border: "1px solid var(--accent-color)", color: "var(--accent-color)", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "monospace", fontSize: "0.8em", borderRadius: '4px' }}
                >
                  💾 Connect My Vault
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.8em", margin: "0" }}>
              Vault mode: {localStorage.getItem('canto_welcome_decision') === 'vault' ? 'Connected to Local Drive' : 'Vault-Lite Mode (Up to 5GB)'}.
              {' '}<button
                onClick={() => { if (onConfigureClick) onConfigureClick(); }}
                style={{ background: "none", border: "none", padding: 0, textDecoration: "underline", color: "var(--accent-color)", fontFamily: "monospace", cursor: "pointer", fontSize: "1em" }}
              >
                Configure
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Discovery Portals Section (DeepWiki Grid Cards Style) ── */}
      <div style={{ maxWidth: '900px', margin: '3rem auto 2.5rem auto', position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        <h2 style={{ fontSize: '0.82em', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'monospace', textAlign: 'center' }}>
          Explore featured portals
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
          textAlign: 'left'
        }}>
          {exampleTopics.map(topic => (
            <div
              key={topic}
              onClick={() => onWordClick?.(topic)}
              style={{
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '120px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.boxShadow = 'var(--ascii-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05em', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-color)', marginBottom: '0.4rem', marginTop: 0 }}>
                  {topic}
                </h3>
                <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', fontFamily: 'monospace', margin: 0, lineHeight: 1.4 }}>
                  {TOPIC_DESCRIPTIONS[topic] || 'Explore this conceptual portal.'}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.78em', color: 'var(--accent-color)', fontFamily: 'monospace', textDecoration: 'underline' }}>
                  Explore ↗
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature Badges — Inline Monospace ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '3.5rem', marginBottom: '1rem', flexWrap: 'wrap', position: 'relative', zIndex: 5, padding: '0 1rem' }}>
        {[
          'Wikipedia', 'NASA Technical Reports', 'CORE Academic Studies', 'Internet Archive Research', 'Encyclopedia Galactica'
        ].map((label, index, arr) => (
          <span key={label} style={{ fontSize: '0.78em', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {label}{index < arr.length - 1 && ' •'}
          </span>
        ))}
      </div>
      
    </div>
  );
};

export default LandingPage;
