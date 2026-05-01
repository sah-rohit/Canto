/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRandom: () => void;
  isLoading: boolean;
  predefinedWords?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onRandom, isLoading, predefinedWords = [] }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = predefinedWords.filter(word => 
    word.toLowerCase().includes(query.toLowerCase()) && word.toLowerCase() !== query.toLowerCase()
  ).slice(0, 5); // show top 5

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
      setQuery(''); // Clear the input field after search
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
    <div className="search-container" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search any topic..."
          className="search-input"
          aria-label="Search for a topic"
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(''); setShowSuggestions(false); }}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem',
              lineHeight: 1,
              minWidth: '2rem',
              minHeight: '2rem',
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
            borderRadius: '0 0 8px 8px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            zIndex: 100,
            maxHeight: '220px',
            overflowY: 'auto',
          }}>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  color: 'var(--text-color)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
      <button type="button" onClick={onRandom} className="random-button" disabled={isLoading}>
        Random
      </button>
    </div>
  );
};

export default SearchBar;