/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { streamDefinition, generateAsciiArt, AsciiArtData, getRandomWord } from './services/aiService';
import { initRateLimit, checkRateLimit, recordSearch, getRemainingSearches } from './services/rateLimitService';
import ContentDisplay from './components/ContentDisplay';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import AsciiArtDisplay from './components/AsciiArtDisplay';
import StaticPage from './components/StaticPage';
import LandingPage from './components/LandingPage';
import DidYouKnow from './components/DidYouKnow';
import RelatedTopics from './components/RelatedTopics';
import ErrorBoundary from './components/ErrorBoundary';
// Starfield removed — replaced by static ASCII space art in LandingPage
import { useToast } from './components/ToastContext';
import { StartupAnimation } from './components/StartupAnimation';

// A curated list of "banger" words and phrases for the random button.
const PREDEFINED_WORDS = [
  'Balance', 'Harmony', 'Discord', 'Unity', 'Fragmentation', 'Clarity', 'Ambiguity', 'Presence', 'Absence', 'Creation', 'Destruction', 'Light', 'Shadow', 'Beginning', 'Ending', 'Rising', 'Falling', 'Connection', 'Isolation', 'Hope', 'Despair',
  'Order and chaos', 'Light and shadow', 'Sound and silence', 'Form and formlessness', 'Being and nonbeing', 'Presence and absence', 'Motion and stillness', 'Unity and multiplicity', 'Finite and infinite', 'Sacred and profane', 'Memory and forgetting', 'Question and answer', 'Search and discovery', 'Journey and destination', 'Dream and reality', 'Time and eternity', 'Self and other', 'Known and unknown', 'Spoken and unspoken', 'Visible and invisible',
  'Zigzag', 'Waves', 'Spiral', 'Bounce', 'Slant', 'Drip', 'Stretch', 'Squeeze', 'Float', 'Fall', 'Spin', 'Melt', 'Rise', 'Twist', 'Explode', 'Stack', 'Mirror', 'Echo', 'Vibrate',
  'Gravity', 'Friction', 'Momentum', 'Inertia', 'Turbulence', 'Pressure', 'Tension', 'Oscillate', 'Fractal', 'Quantum', 'Entropy', 'Vortex', 'Resonance', 'Equilibrium', 'Centrifuge', 'Elastic', 'Viscous', 'Refract', 'Diffuse', 'Cascade', 'Levitate', 'Magnetize', 'Polarize', 'Accelerate', 'Compress', 'Undulate',
  'Liminal', 'Ephemeral', 'Paradox', 'Zeitgeist', 'Metamorphosis', 'Synesthesia', 'Recursion', 'Emergence', 'Dialectic', 'Apophenia', 'Limbo', 'Flux', 'Sublime', 'Uncanny', 'Palimpsest', 'Chimera', 'Void', 'Transcend', 'Ineffable', 'Qualia', 'Gestalt', 'Simulacra', 'Abyssal',
  'Existential', 'Nihilism', 'Solipsism', 'Phenomenology', 'Hermeneutics', 'Deconstruction', 'Postmodern', 'Absurdism', 'Catharsis', 'Epiphany', 'Melancholy', 'Nostalgia', 'Longing', 'Reverie', 'Pathos', 'Ethos', 'Logos', 'Mythos', 'Anamnesis', 'Intertextuality', 'Metafiction', 'Stream', 'Lacuna', 'Caesura', 'Enjambment'
];
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)];

const createFallbackArt = (topic: string): AsciiArtData => {
  const displayableTopic = topic.length > 20 ? topic.substring(0, 17) + '...' : topic;
  const paddedTopic = ` ${displayableTopic} `;
  const topBorder = `┌${'─'.repeat(paddedTopic.length)}┐`;
  const middle = `│${paddedTopic}│`;
  const bottomBorder = `└${'─'.repeat(paddedTopic.length)}┘`;
  return { art: `${topBorder}\n${middle}\n${bottomBorder}` };
};

const App: React.FC = () => {
  const getTopicFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('topic') || '';
  };

  const getPageFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    if (!p && !params.get('topic')) return 'landing';
    return p && ['about', 'privacy', 'terms', 'landing', 'faq', 'pricing', 'opensource'].includes(p) ? p : 'wiki';
  };

  const [currentTopic, setCurrentTopic] = useState<string>(getTopicFromURL());
  const [currentPage, setCurrentPage] = useState<string>(getPageFromURL());
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState<AsciiArtData | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, setTheme] = useState<'classic' | 'dark' | 'vintage' | 'obsidian'>('classic');
  const [showIntro, setShowIntro] = useState(true);
  // Rate limit state
  const [searchesRemaining, setSearchesRemaining] = useState<number | null>(null);
  const [searchesLimit, setSearchesLimit] = useState<number>(15);
  const historyRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Initialise rate limiter and load persisted prefs on mount
  useEffect(() => {
    initRateLimit().then(() => {
      getRemainingSearches().then(({ remaining, limit }) => {
        setSearchesRemaining(remaining);
        setSearchesLimit(limit);
      });
    });

    try {
      const savedHistory = localStorage.getItem('canto_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      const savedTheme = localStorage.getItem('canto_theme');
      if (savedTheme) {
        setTheme(savedTheme as 'classic' | 'dark' | 'vintage' | 'obsidian');
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch(e) {}

    const handlePopState = () => {
      setCurrentTopic(getTopicFromURL());
      setCurrentPage(getPageFromURL());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToTopic = useCallback((newTopic: string) => {
    const trimmed = newTopic.trim();
    if (trimmed && (trimmed.toLowerCase() !== currentTopic.toLowerCase() || currentPage !== 'wiki')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('topic', trimmed);
      newUrl.searchParams.delete('page');
      window.history.pushState({}, '', newUrl);

      setHistory(prev => {
        const newHistory = [trimmed, ...prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 50);
        try { localStorage.setItem('canto_history', JSON.stringify(newHistory)); } catch(e) {}
        return newHistory;
      });

      setCurrentTopic(trimmed);
      setCurrentPage('wiki');
      setIsHistoryOpen(false);
    }
  }, [currentTopic, currentPage]);

  const navigateToPage = useCallback((page: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', page);
    newUrl.searchParams.delete('topic');
    window.history.pushState({}, '', newUrl);
    setCurrentPage(page);
  }, []);

  const fallbackCopyUrl = (text: string) => {
    const input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(input);
  };

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
      }).catch(() => {
        fallbackCopyUrl(url);
        showToast('Link copied to clipboard!', 'success');
      });
    } else {
      fallbackCopyUrl(url);
      showToast('Link copied to clipboard!', 'success');
    }
  }, [showToast]);

  useEffect(() => {
    if (currentPage !== 'wiki' || !currentTopic) return;

    let isCancelled = false;

    const fetchContentAndArt = async () => {
      // ── Rate limit check ──────────────────────────────────────────────────
      const rlStatus = await checkRateLimit();
      if (!rlStatus.allowed) {
        setError(`You've reached your daily search limit of ${rlStatus.limit} searches. Your limit resets at midnight tonight. Come back tomorrow to keep exploring!`);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setContent('');
      setAsciiArt(null);
      setGenerationTime(null);
      const startTime = performance.now();

      // Record the search and update UI counter
      await recordSearch();
      const { remaining, limit } = await getRemainingSearches();
      setSearchesRemaining(remaining);
      setSearchesLimit(limit);

      if (remaining <= 3 && remaining > 0) {
        showToast(`Only ${remaining} search${remaining === 1 ? '' : 'es'} left today.`, 'warning');
      }

      // ASCII art — fire and forget
      generateAsciiArt(currentTopic)
        .then(art => { if (!isCancelled) setAsciiArt(art); })
        .catch(err => {
          if (!isCancelled) setAsciiArt(createFallbackArt(currentTopic));
        });

      // Stream definition
      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic)) {
          if (isCancelled) break;
          if (chunk.startsWith('Error:')) throw new Error(chunk.replace('Error:', '').trim());
          accumulatedContent += chunk;
          if (!isCancelled) setContent(accumulatedContent);
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const msg = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(msg);
          setContent('');
        }
      } finally {
        if (!isCancelled) {
          setGenerationTime(performance.now() - startTime);
          setIsLoading(false);
        }
      }
    };

    fetchContentAndArt();
    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic, currentPage, retryTrigger]);

  const handleWordClick = useCallback((word: string) => navigateToTopic(word), [navigateToTopic]);
  const handleSearch = useCallback((topic: string) => navigateToTopic(topic), [navigateToTopic]);

  const handleRandom = useCallback(async () => {
    // Rate limit check before random too
    const rlStatus = await checkRateLimit();
    if (!rlStatus.allowed) {
      showToast(`Daily limit of ${rlStatus.limit} searches reached. Resets at midnight.`, 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);
    setContent('');
    setAsciiArt(null);

    try {
      const randomWord = await getRandomWord();
      if (randomWord) {
        navigateToTopic(randomWord);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'ALL_PROVIDERS_FAILED') {
        setError('All AI providers are currently unavailable. Please try again later.');
        showToast('All providers unavailable.', 'error');
      } else {
        setError('Failed to fetch random word.');
        showToast('Network error: Could not fetch random topic.', 'error');
      }
      setIsLoading(false);
    }
  }, [navigateToTopic, showToast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('canto_history'); } catch(e) {}
    setIsHistoryOpen(false);
  }, []);

  const changeTheme = useCallback((newTheme: 'classic' | 'dark' | 'vintage' | 'obsidian') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('canto_theme', newTheme); } catch(e) {}
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const searchLimitBadge = searchesRemaining !== null && (
    <span
      title={`${searchesRemaining} of ${searchesLimit} daily searches remaining. Resets at midnight.`}
      style={{
        fontSize: '0.75em',
        fontFamily: 'monospace',
        color: searchesRemaining <= 3 ? '#cc6600' : 'var(--text-muted)',
        border: '1px solid',
        borderColor: searchesRemaining <= 3 ? '#cc6600' : 'var(--border-color)',
        borderRadius: '2px',
        padding: '0.1rem 0.4rem',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {searchesRemaining}/{searchesLimit} ✦
    </span>
  );

  return (
    <>
      {showIntro && <StartupAnimation onComplete={() => setShowIntro(false)} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>


        {/* ── Top nav ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {currentPage !== 'landing' && (
              <>
                <button onClick={() => navigateToPage('landing')} style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}>
                  Home
                </button>
                <button onClick={() => window.history.back()} style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}>
                  &larr; Back
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {searchLimitBadge}

            {currentPage === 'wiki' && (
              <button onClick={() => { setCurrentTopic(''); navigateToPage('landing'); }} style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}>
                + New Topic
              </button>
            )}

            <div style={{ position: 'relative' }} ref={historyRef}>
              <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', fontFamily: 'monospace' }}>
                History
              </button>
              {isHistoryOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem', minWidth: '200px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9em', fontWeight: 'bold', fontFamily: 'monospace' }}>History</span>
                    <button onClick={clearHistory} style={{ fontSize: '0.8em', color: '#cc0000', fontFamily: 'monospace' }}>Clear</button>
                  </div>
                  {history.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-muted)', padding: '0.5rem', fontFamily: 'monospace' }}>No history yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' }}>
                      {history.map((t, i) => (
                        <li key={i}>
                          <button onClick={() => navigateToTopic(t)} style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', color: 'var(--text-color)', fontFamily: 'monospace' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {t}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleShare} style={{ textDecoration: 'underline', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', position: 'relative', fontFamily: 'monospace' }}>
              Share
            </button>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} onRandom={handleRandom} isLoading={isLoading && currentPage === 'wiki'} predefinedWords={UNIQUE_WORDS} />

        {currentPage !== 'landing' && (
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="100%" height="60" viewBox="0 0 600 60" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))', maxWidth: '420px' }}>
                <defs>
                  <linearGradient id="cantoHolo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--text-color)" />
                    <stop offset="100%" stopColor="var(--text-muted)" />
                  </linearGradient>
                </defs>
                <g transform="translate(50, 5) scale(0.7)">
                  <path d="M 30 0 A 30 30 0 1 0 60 30 A 20 20 0 1 1 30 0 Z" fill="none" stroke="url(#cantoHolo)" strokeWidth="3" />
                  <circle cx="20" cy="15" r="2" fill="var(--accent-color)" />
                  <circle cx="35" cy="45" r="2" fill="var(--accent-color)" />
                </g>
                <text x="58%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="url(#cantoHolo)" fontSize="48" fontFamily="Inter, sans-serif" fontWeight="900" letterSpacing="0.25em" style={{ textShadow: 'none' }}>
                  CANTO
                </text>
                <text x="58%" y="85%" dominantBaseline="middle" textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily="monospace" letterSpacing="0.4em">
                  [ INFINITE ENCYCLOPEDIA ]
                </text>
              </svg>
            </div>
          </header>
        )}

        <main className="fade-in" style={{ flex: 1, width: '100%' }} key={currentPage + currentTopic}>
          <ErrorBoundary>
            {currentPage === 'wiki' ? (
              <div className="main-layout" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div className="main-content" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <AsciiArtDisplay artData={asciiArt} topic={currentTopic} onWordClick={handleWordClick} />
                  </div>
                  <h2 style={{ marginBottom: '2rem', textTransform: 'capitalize', fontSize: '2em', fontWeight: 'bold', textAlign: 'center' }}>
                    {currentTopic}
                  </h2>

                  {error && (
                    <div style={{ border: '1px solid #cc0000', padding: '1rem', color: '#cc0000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>An Error Occurred</p>
                        <p style={{ marginTop: '0.5rem', margin: 0 }}>{error}</p>
                      </div>
                      {!error.includes('daily search limit') && (
                        <button onClick={() => setRetryTrigger(prev => prev + 1)} style={{ background: '#cc0000', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
                          Retry
                        </button>
                      )}
                    </div>
                  )}

                  {isLoading && content.length === 0 && !error && <LoadingSkeleton />}

                  {content.length > 0 && !error && (
                    <>
                      <ContentDisplay content={content} isLoading={isLoading} onWordClick={handleWordClick} topic={currentTopic} />
                      {!isLoading && (
                        <>
                          <DidYouKnow topic={currentTopic} />
                          <RelatedTopics topic={currentTopic} onWordClick={handleWordClick} />
                        </>
                      )}
                    </>
                  )}

                  {!isLoading && !error && content.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>
                      <p>Content could not be generated.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : currentPage === 'landing' ? (
              <LandingPage onWordClick={handleWordClick} />
            ) : (
              <StaticPage pageId={currentPage} />
            )}
          </ErrorBoundary>
        </main>

        <footer className="sticky-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => changeTheme('classic')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: '1px solid', borderColor: theme === 'classic' ? 'var(--accent-color)' : 'var(--border-color)', borderRadius: '2px', color: theme === 'classic' ? 'var(--accent-color)' : 'var(--text-muted)' }}>Classic</button>
            <button onClick={() => changeTheme('obsidian')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: '1px solid', borderColor: theme === 'obsidian' ? 'var(--accent-color)' : 'var(--border-color)', borderRadius: '2px', color: theme === 'obsidian' ? 'var(--accent-color)' : 'var(--text-muted)' }}>Obsidian</button>
            <button onClick={() => changeTheme('dark')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: '1px solid', borderColor: theme === 'dark' ? 'var(--accent-color)' : 'var(--border-color)', borderRadius: '2px', color: theme === 'dark' ? 'var(--accent-color)' : 'var(--text-muted)' }}>Dark Neon</button>
            <button onClick={() => changeTheme('vintage')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: '1px solid', borderColor: theme === 'vintage' ? 'var(--accent-color)' : 'var(--border-color)', borderRadius: '2px', color: theme === 'vintage' ? 'var(--accent-color)' : 'var(--text-muted)' }}>Vintage</button>
          </div>
          <p className="footer-text" style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigateToPage('about')} style={{ textDecoration: 'underline' }}>About</button>
            <button onClick={() => navigateToPage('pricing')} style={{ textDecoration: 'underline' }}>Pricing</button>
            <button onClick={() => navigateToPage('privacy')} style={{ textDecoration: 'underline' }}>Privacy Policy</button>
            <button onClick={() => navigateToPage('terms')} style={{ textDecoration: 'underline' }}>Terms & Conditions</button>
            <button onClick={() => navigateToPage('faq')} style={{ textDecoration: 'underline' }}>FAQ</button>
            <button onClick={() => navigateToPage('opensource')} style={{ textDecoration: 'underline' }}>Open Source</button>
          </p>
          <p className="footer-text" style={{ margin: 0 }}>
            Canto by Sonata Interactive
            {generationTime && currentPage === 'wiki' && ` · generated in ${Math.round(generationTime)}ms`}
          </p>
        </footer>
      </div>
    </>
  );
};

export default App;
