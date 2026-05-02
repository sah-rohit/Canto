import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRandom: () => void;
  isLoading: boolean;
  predefinedWords?: string[];
}

// Map each predefined word to a brief icon/category snippet for enhanced UX
const SUGGESTION_METADATA: Record<string, { icon: string; snippet: string }> = {
  'Balance': { icon: '⚖️', snippet: 'Equilibrium & symmetry' },
  'Harmony': { icon: '🎵', snippet: 'Unified aesthetic flow' },
  'Discord': { icon: '⚡', snippet: 'Chaos & divergence' },
  'Creation': { icon: '🌱', snippet: 'Origins & construction' },
  'Destruction': { icon: '💥', snippet: 'Deconstruction & decay' },
  'Creation and decay': { icon: '⏳', snippet: 'Lifecycle dynamics' },
  'Quantum': { icon: '⚛️', snippet: 'Subatomic mechanics' },
  'Entropy': { icon: '🌌', snippet: 'Thermodynamic decay' },
  'Fractal': { icon: '🌀', snippet: 'Infinite recursion' },
  'Liminal': { icon: '🚪', snippet: 'Transitional spaces' },
  'Ephemeral': { icon: '🍂', snippet: 'Short-lived phenomena' },
  'Gestalt': { icon: '🧩', snippet: 'Holistic perception' },
  'Zeitgeist': { icon: '🕰️', snippet: 'Spirit of the era' },
  'Cyberpunk': { icon: '💾', snippet: 'High tech, low life' },
  'Dark Matter': { icon: '🌑', snippet: 'Cosmic missing mass' },
  'Stoicism': { icon: '🏛️', snippet: 'Hellenistic philosophy' },
  'Quantum Entanglement': { icon: '🔬', snippet: 'Einsteinian paradox' }
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onRandom, isLoading, predefinedWords = [] }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = predefinedWords.filter(word => 
    word.toLowerCase().includes(query.toLowerCase()) && word.toLowerCase() !== query.toLowerCase()
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setQuery('');
    setShowSuggestions(false);
    if (!isLoading) {
      onSearch(word);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto 2rem auto',
        position: 'relative'
      }}
    >
      <form onSubmit={handleSubmit} style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search any topic..."
          style={{
            width: '100%',
            padding: '0.75rem 2.5rem 0.75rem 0',
            font: 'inherit',
            color: 'var(--text-color)',
            border: 'none',
            borderBottom: '1px solid var(--border-color)',
            background: 'transparent',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontSize: '1.1em',
            fontFamily: 'monospace'
          }}
          aria-label="Search for a topic"
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = 'var(--accent-color)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = query ? 'var(--accent-color)' : 'var(--border-color)')}
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(''); setShowSuggestions(false); }}
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {showSuggestions && query.trim() !== '' && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            maxHeight: '260px',
            overflowY: 'auto',
          }}>
            {suggestions.map((suggestion, index) => {
              const meta = SUGGESTION_METADATA[suggestion] || { icon: '🔍', snippet: 'General concept' };
              return (
                <li 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    color: 'var(--text-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '1.2em' }}>{meta.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold' }}>{suggestion}</span>
                    <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{meta.snippet}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </form>
      <button 
        type="button" 
        onClick={onRandom} 
        disabled={isLoading}
        style={{
          background: 'transparent',
          border: '1px solid var(--border-color)',
          padding: '0.65rem 1rem',
          font: 'inherit',
          color: 'var(--text-color)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          borderRadius: '4px',
          fontSize: '0.9em',
          fontFamily: 'monospace',
          minHeight: '2.5rem',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-color)'; }}
      >
        🎲 Random
      </button>
    </div>
  );
};

export default SearchBar;