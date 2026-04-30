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
    <div className="search-container" style={{ position: 'relative' }} ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search..."
          className="search-input"
          aria-label="Search for a topic"
          disabled={isLoading}
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(''); setShowSuggestions(false); }}
            style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}
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
            background: '#fff',
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: 0,
            margin: '4px 0 0 0',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 10,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
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