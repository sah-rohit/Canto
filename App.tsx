/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { streamDefinition, generateAsciiArt, AsciiArtData, getRandomWord } from './services/aiService';
import { fetchKnowledgeContext } from './services/knowledgeService';
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
import ResearchPanel from './components/ResearchPanel';
// Starfield removed — replaced by static ASCII space art in LandingPage
import { useToast } from './components/ToastContext';
import { StartupAnimation } from './components/StartupAnimation';
import { CantoDialog, CantoSlider } from './components/UIComponents';
import {
  dbSaveCache, dbGetCache, dbDeleteCache, dbSaveHistory, dbGetHistory,
  dbClearHistory, dbSaveFavorite, dbRemoveFavorite, dbGetFavorites, dbRecordAnalytics
} from './services/dbService';

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
    return p && ['about', 'privacy', 'terms', 'landing', 'faq', 'pricing', 'opensource', 'library'].includes(p) ? p : 'wiki';
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
  const [searchesLimit, setSearchesLimit] = useState<number>(20);
  const [resetTimer, setResetTimer] = useState<string>('');
  const [readingTime, setReadingTime] = useState<number | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(100); // percentage
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);
  const [cache, setCache] = useState<Record<string, { content: string, asciiArt: AsciiArtData | null, timestamp: number }>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [isResearchPanelOpen, setIsResearchPanelOpen] = useState(false);
  const [lastSources, setLastSources] = useState<{ wikipedia?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string }>({});

  // Advanced features state
  const [depth, setDepth] = useState<'Mini' | 'Standard' | 'Deep'>('Standard');
  const [activeLens, setActiveLens] = useState<'Standard' | 'Academic' | 'Beginner' | 'Historical' | 'Controversial' | 'Future Implications'>('Standard');
  const [enabledSources, setEnabledSources] = useState<string[]>(['Wikipedia', 'NASA', 'CORE', 'Web Search']);
  const [displayedContent, setDisplayedContent] = useState('');
  const [previousContent, setPreviousContent] = useState('');
  const [isDiffView, setIsDiffView] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('sharedData');
    if (shared) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(shared))));
        if (decoded && decoded.topic && decoded.content) {
          setCurrentTopic(decoded.topic);
          setCurrentPage('wiki');
          setContent(decoded.content);
          setAsciiArt(decoded.asciiArt || null);
          setIsLoading(false);
          setError(null);
        }
      } catch (e) {
        console.error('Failed to parse shared data:', e);
      }
    }
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    initRateLimit().then(() => {
      checkRateLimit().then((status) => {
        setSearchesRemaining(status.remaining);
        setSearchesLimit(status.limit);
        setResetTimer(status.timeUntilReset || '');
      });
    });

    try {
      dbGetHistory().then(h => {
        if (h && h.length > 0) {
          setHistory(h);
        } else {
          const savedHistory = localStorage.getItem('canto_history');
          if (savedHistory) setHistory(JSON.parse(savedHistory));
        }
      });

      dbGetFavorites().then(f => {
        if (f && f.length > 0) {
          setFavorites(f);
        } else {
          const savedFavs = localStorage.getItem('canto_favs');
          if (savedFavs) setFavorites(JSON.parse(savedFavs));
        }
      });

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

    // Update reset timer every minute
    const timerInterval = setInterval(() => {
      checkRateLimit().then((status) => {
        setResetTimer(status.timeUntilReset || '');
      });
    }, 60000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, currentTopic]);

  useEffect(() => {
    if (content.length > displayedContent.length) {
      const interval = setInterval(() => {
        setDisplayedContent(prev => {
          const nextLen = prev.length + 25; // 25 characters at a time for fast smooth streaming
          if (nextLen >= content.length) {
            clearInterval(interval);
            return content;
          }
          return content.slice(0, nextLen);
        });
      }, 10);
      return () => clearInterval(interval);
    } else if (content.length < displayedContent.length) {
      setDisplayedContent(content);
    }
  }, [content, displayedContent.length]);

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
        dbSaveHistory(trimmed);
        return newHistory;
      });

      setCurrentTopic(trimmed);
      setCurrentPage('wiki');
      setIsHistoryOpen(false);
    }
  }, [currentTopic, currentPage]);

  const toggleFavorite = useCallback((topic: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(topic);
      const newFavs = isFav ? prev.filter(t => t !== topic) : [...prev, topic];
      try { localStorage.setItem('canto_favs', JSON.stringify(newFavs)); } catch(e) {}
      if (isFav) {
        dbRemoveFavorite(topic);
      } else {
        dbSaveFavorite(topic);
      }
      showToast(isFav ? 'Removed from favorites' : 'Added to favorites', 'success');
      return newFavs;
    });
  }, [showToast]);

  const handleRegenerate = useCallback(() => {
    const normalized = currentTopic.toLowerCase().trim();
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[normalized];
      try { localStorage.setItem('canto_cache', JSON.stringify(newCache)); } catch(e) {}
      return newCache;
    });
    dbDeleteCache(normalized);
    setRetryTrigger(prev => prev + 1);
    showToast('Regenerating content...', 'info');
  }, [currentTopic, showToast]);

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
    if (!currentTopic || !content) return;
    try {
      const payload = JSON.stringify({ topic: currentTopic, content, asciiArt });
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      const sharedUrl = `${window.location.origin}${window.location.pathname}?sharedData=${encodeURIComponent(encoded)}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sharedUrl).then(() => {
          showToast('Share link copied! Can be viewed for free.', 'success');
        }).catch(() => {
          fallbackCopyUrl(sharedUrl);
          showToast('Share link copied! Can be viewed for free.', 'success');
        });
      } else {
        fallbackCopyUrl(sharedUrl);
        showToast('Share link copied! Can be viewed for free.', 'success');
      }
    } catch (e) {
      console.error('Failed to create shared link', e);
      showToast('Error creating shared link', 'error');
    }
  }, [currentTopic, content, asciiArt, showToast]);

  useEffect(() => {
    if (currentPage !== 'wiki' || !currentTopic) return;

    let isCancelled = false;

    const fetchContentAndArt = async () => {
      // ── Check Shared Data Parameter ──────────────────────────────────────
      const params = new URLSearchParams(window.location.search);
      if (params.has('sharedData')) {
        try {
          const shared = params.get('sharedData');
          if (shared) {
            const decoded = JSON.parse(decodeURIComponent(escape(atob(shared))));
            if (decoded && decoded.topic && decoded.content) {
              setIsLoading(false);
              setError(null);
              setContent(decoded.content);
              setAsciiArt(decoded.asciiArt || null);
              setGenerationTime(null);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing shared data', e);
        }
      }

      const normalizedTopic = currentTopic.toLowerCase().trim();
      
      // ── Check Cache First (only for Standard) ──────────────────────────────────────────────────
      const isAdvanced = depth !== 'Standard' || activeLens !== 'Standard' || enabledSources.length < 4;
      if (!isAdvanced) {
        if (cache[normalizedTopic]) {
          setIsLoading(false);
          setError(null);
          setContent(cache[normalizedTopic].content);
          setAsciiArt(cache[normalizedTopic].asciiArt);
          setGenerationTime(null);
          return;
        }

        const dbCached = await dbGetCache(normalizedTopic);
        if (dbCached) {
          setIsLoading(false);
          setError(null);
          setContent(dbCached.content);
          setAsciiArt(dbCached.asciiArt);
          setGenerationTime(null);
          setCache(prev => ({ ...prev, [normalizedTopic]: dbCached }));
          return;
        }
      }

      // ── Rate limit check ──────────────────────────────────────────────────
      const rlStatus = await checkRateLimit();
      if (!rlStatus.allowed) {
        setActiveAlert({
          title: 'Limit Reached',
          message: `Daily search limit reached (${rlStatus.limit} searches). API quotas reset at midnight. Come back tomorrow or reload previous queries to keep exploring!`
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setPreviousContent(content);
      setContent('');
      setAsciiArt(null);
      setGenerationTime(null);
      const startTime = performance.now();

      // Record the search with variable cost and update UI counter
      const cost = depth === 'Mini' ? 0.5 : depth === 'Deep' ? 2 : 1;
      await recordSearch(cost);
      const { remaining, limit } = await getRemainingSearches();
      setSearchesRemaining(remaining);
      setSearchesLimit(limit);

      if (remaining <= 3 && remaining > 0) {
        showToast(`Only ${remaining} search${remaining === 1 ? '' : 'es'} left today.`, 'warning');
      }

      // ASCII art — fire and forget
      let finalArt: AsciiArtData | null = null;
      generateAsciiArt(currentTopic)
        .then(art => { 
          finalArt = art;
          if (!isCancelled) setAsciiArt(art); 
        })
        .catch(err => {
          finalArt = createFallbackArt(currentTopic);
          if (!isCancelled) setAsciiArt(finalArt);
        });

      // Fetch knowledge sources for Research Panel — fire and forget
      fetchKnowledgeContext(currentTopic).then(ctx => {
        if (!isCancelled) setLastSources(ctx);
      }).catch(() => {});

      // Stream definition
      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic, enabledSources, activeLens, depth)) {
          if (isCancelled) break;
          if (chunk.startsWith('Error:')) throw new Error(chunk.replace('Error:', '').trim());
          accumulatedContent += chunk;
          if (!isCancelled) setContent(accumulatedContent);
        }

        // Save to cache on success
        if (!isCancelled && accumulatedContent.length > 50) {
          const wordCount = accumulatedContent.split(/\s+/).filter(Boolean).length;
          const tokenEstimate = Math.ceil(accumulatedContent.length / 4);
          setCache(prev => {
            const newCache = { 
              ...prev, 
              [normalizedTopic]: { 
                content: accumulatedContent, 
                asciiArt: finalArt, 
                timestamp: Date.now() 
              } 
            };
            // Keep cache size reasonable (~30 entries)
            const keys = Object.keys(newCache);
            if (keys.length > 30) {
              delete newCache[keys[0]];
            }
            try { localStorage.setItem('canto_cache', JSON.stringify(newCache)); } catch(e) {}
            try {
              const fullHistoryEntry = {
                topic: currentTopic,
                content: accumulatedContent,
                asciiArt: finalArt,
                timestamp: Date.now(),
                wordCount,
                tokenEstimate
              };
              let existingFull: any[] = [];
              const savedFull = localStorage.getItem('canto_history_full');
              if (savedFull) existingFull = JSON.parse(savedFull);
              existingFull = [fullHistoryEntry, ...existingFull.filter(h => h.topic.toLowerCase() !== currentTopic.toLowerCase())];
              localStorage.setItem('canto_history_full', JSON.stringify(existingFull));
            } catch (e) {}
            dbSaveCache(currentTopic, accumulatedContent, finalArt);
            dbSaveHistory(currentTopic, { wordCount, tokenEstimate });
            dbRecordAnalytics(currentTopic, wordCount, tokenEstimate);
            return newCache;
          });
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
  const handleExplainClick = useCallback((action: string, text: string) => {
    navigateToTopic(`${action}: ${text}`);
  }, [navigateToTopic]);

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
    setIsConfirmingClear(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('canto_history'); } catch(e) {}
    dbClearHistory();
    setIsHistoryOpen(false);
    setIsConfirmingClear(false);
    showToast('Browsing history cleared', 'info');
  }, [showToast]);

  const changeTheme = useCallback((newTheme: 'classic' | 'dark' | 'vintage' | 'obsidian') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('canto_theme', newTheme); } catch(e) {}
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        window.history.back();
      } else if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRandom();
      } else if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        navigateToPage('library');
      } else if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigateToPage('landing');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRandom, navigateToPage]);

  // ── Render ────────────────────────────────────────────────────────────────

  const searchLimitBadge = searchesRemaining !== null && (
    <span
      title={`${searchesRemaining} of ${searchesLimit} daily searches remaining. Resets in ${resetTimer}.`}
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
        whiteSpace: 'nowrap',
      }}
    >
      {searchesRemaining}/{searchesLimit}{resetTimer && <span className="search-limit-badge-timer"> (Resets in {resetTimer})</span>}
    </span>
  );

  return (
    <>
      {showIntro && <StartupAnimation onComplete={() => setShowIntro(false)} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>


        {/* ── Top nav ── */}
        {!isReadingMode && (
          <nav className="top-nav">
            <div className="top-nav-left">
              {currentPage !== 'landing' && (
                <>
                  <button onClick={() => navigateToPage('landing')} className="nav-btn">
                    Home
                  </button>
                  <button onClick={() => window.history.back()} className="nav-btn">
                    &larr; Back
                  </button>
                </>
              )}
            </div>

            <div className="top-nav-right">
              {searchLimitBadge}

              {currentPage === 'wiki' && (
                <button onClick={() => { setCurrentTopic(''); navigateToPage('landing'); }} className="nav-btn">
                  + New
                </button>
              )}

              <div style={{ position: 'relative' }} ref={historyRef}>
                <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="nav-btn">
                  History
                </button>
                {isHistoryOpen && (
                  <div className="history-dropdown">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9em', fontWeight: 'bold', fontFamily: 'monospace' }}>History</span>
                      <button onClick={clearHistory} style={{ fontSize: '0.8em', color: '#cc0000', fontFamily: 'monospace', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                    </div>
                    {history.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-muted)', padding: '0.5rem', fontFamily: 'monospace' }}>No history yet.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '220px', overflowY: 'auto' }}>
                        {history.map((t, i) => {
                          const topicStr = typeof t === 'object' ? (t as any).topic || JSON.stringify(t) : String(t);
                          return (
                            <li key={i}>
                              <button onClick={() => navigateToTopic(topicStr)} style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9em', color: 'var(--text-color)', fontFamily: 'monospace' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {topicStr}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {favorites.length > 0 && (
                      <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Favorites</span>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0.4rem 0 0 0' }}>
                          {favorites.slice(0, 5).map((t, i) => (
                            <li key={i}>
                              <button onClick={() => navigateToTopic(t)} style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.6rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85em', color: 'var(--text-color)', fontFamily: 'monospace' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {t}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button 
                      onClick={() => { setIsHistoryOpen(false); navigateToPage('library'); }} 
                      style={{ width: '100%', marginTop: '0.8rem', padding: '0.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'monospace', color: 'var(--text-color)' }}
                    >
                      View Local Library
                    </button>
                  </div>
                )}
              </div>

              <button onClick={handleShare} className="nav-btn">
                Share
              </button>
            </div>
          </nav>
        )}

        <SearchBar onSearch={handleSearch} onRandom={handleRandom} isLoading={isLoading && currentPage === 'wiki'} predefinedWords={PREDEFINED_WORDS} />

        {/* ── Advanced Search Modifiers & Filters ── */}
        <div style={{ maxWidth: '800px', margin: '0.75rem auto 2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontFamily: 'monospace', fontSize: '0.82em', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <span>Lens:</span>
            {(['Standard', 'Academic', 'Beginner', 'Historical', 'Controversial', 'Future Implications'] as const).map(lens => (
              <button
                key={lens}
                onClick={() => setActiveLens(lens)}
                style={{ background: 'none', border: 'none', padding: 0, textDecoration: activeLens === lens ? 'underline' : 'none', color: activeLens === lens ? 'var(--accent-color)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                {lens}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <span>Search Depth:</span>
            {(['Mini', 'Standard', 'Deep'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                style={{ background: 'none', border: 'none', padding: 0, textDecoration: depth === d ? 'underline' : 'none', color: depth === d ? 'var(--accent-color)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                {d} {d === 'Mini' ? '(0.5 cr)' : d === 'Deep' ? '(2 cr)' : '(1 cr)'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <span>Sources:</span>
            {(['Wikipedia', 'NASA', 'CORE', 'Web Search'] as const).map(src => {
              const checked = enabledSources.includes(src);
              return (
                <label key={src} style={{ cursor: 'pointer', userSelect: 'none', textDecoration: checked ? 'none' : 'line-through' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setEnabledSources(prev => checked ? prev.filter(s => s !== src) : [...prev, src])}
                    style={{ marginRight: '0.3rem' }}
                  />
                  {src}
                </label>
              );
            })}
          </div>

          {previousContent && content && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: '0.4rem' }}>
              <button
                onClick={() => setIsDiffView(!isDiffView)}
                style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                {isDiffView ? 'Hide Diff' : 'Compare with Previous Generation'}
              </button>
            </div>
          )}
        </div>

        {!isReadingMode && currentPage !== 'landing' && (
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
              <h1 style={{ fontSize: '2.8em', fontWeight: 'bold', letterSpacing: '0.2em', color: 'var(--text-color)', fontFamily: 'monospace', margin: 0 }}>
                CANTO
              </h1>
              <p style={{ fontSize: '0.85em', letterSpacing: '0.35em', color: 'var(--text-muted)', fontFamily: 'monospace', margin: '0.4rem 0 0 0', textTransform: 'uppercase' }}>
                [ AI Galactica Encyclopedia ]
              </p>
            </div>
          </header>
        )}

        <main className="fade-in" style={{ flex: 1, width: '100%', paddingTop: isReadingMode ? '4rem' : '0' }} key={currentPage + currentTopic}>
          <ErrorBoundary>
            {currentPage === 'wiki' ? (
              <div className="main-layout" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div className="main-content" style={{ width: '100%' }}>
                  {!isReadingMode && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <AsciiArtDisplay artData={asciiArt} topic={currentTopic} onWordClick={handleWordClick} />
                    </div>
                  )}
                  <h2 className="wiki-topic-title" style={{ marginBottom: '0.5rem', textTransform: 'capitalize', fontSize: '2em', fontWeight: 'bold', textAlign: 'center' }}>
                    {currentTopic}
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', padding: '0 0.5rem' }}>
                    {readingTime && <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{readingTime} min read</span>}
                    <button 
                      onClick={() => setIsReadingMode(!isReadingMode)}
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', color: isReadingMode ? 'var(--accent-color)' : 'var(--text-muted)', padding: '0.3rem 0.7rem', fontSize: '0.75em', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', minHeight: '2rem' }}
                    >
                      {isReadingMode ? 'Reading Mode: On' : 'Reading Mode: Off'}
                    </button>
                    <div style={{ width: '110px' }}>
                      <CantoSlider value={fontSize} min={80} max={150} onChange={setFontSize} label="Font Size" />
                    </div>
                    {/* Research toggle — in the controls row so it's always visible at top */}
                    {content && (
                      <button
                        onClick={() => setIsResearchPanelOpen(v => !v)}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${isResearchPanelOpen ? 'var(--accent-color)' : 'var(--border-color)'}`,
                          color: isResearchPanelOpen ? 'var(--accent-color)' : 'var(--text-muted)',
                          borderRadius: '2px',
                          padding: '0.3rem 0.7rem',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          fontSize: '0.75em',
                          minHeight: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'color 0.15s, border-color 0.15s',
                        }}
                      >
                        Research
                      </button>
                    )}
                  </div>

                  {/* Research panel — directly below controls, above article content */}
                  {content && (
                    <ResearchPanel
                      topic={currentTopic}
                      content={content}
                      sources={lastSources}
                      onTopicClick={handleWordClick}
                      isOpen={isResearchPanelOpen}
                    />
                  )}
                  {!isLoading && !error && content.length > 0 && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <button 
                        onClick={handleRegenerate}
                        style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.3rem 0.8rem', borderRadius: '4px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'monospace' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        ⟳ Regenerate (Uses 1 Credit)
                      </button>
                    </div>
                  )}

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
                      <ContentDisplay 
                        content={isDiffView ? (function() {
                          const prevLines = previousContent.split('\n');
                          const currLines = content.split('\n');
                          const out = [];
                          const max = Math.max(prevLines.length, currLines.length);
                          for (let i = 0; i < max; i++) {
                            const pLine = prevLines[i] || '';
                            const cLine = currLines[i] || '';
                            if (pLine === cLine) {
                              out.push(cLine);
                            } else {
                              if (pLine) out.push(`~~-${pLine}~~`);
                              if (cLine) out.push(`**+${cLine}**`);
                            }
                          }
                          return out.join('\n');
                        })() : displayedContent} 
                        isLoading={isLoading} 
                        onWordClick={handleWordClick} 
                        topic={currentTopic}
                        isFavorite={favorites.includes(currentTopic)}
                        onToggleFavorite={() => toggleFavorite(currentTopic)}
                        fontSize={fontSize}
                        isReadingMode={isReadingMode}
                        onExplainClick={handleExplainClick}
                      />
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
              <StaticPage 
                pageId={currentPage} 
                history={history} 
                favorites={favorites} 
                onTopicClick={handleWordClick} 
              />
            )}
          </ErrorBoundary>
        </main>

        <footer style={{ marginTop: '4rem', padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85em', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => changeTheme('classic')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: 'none', background: 'transparent', cursor: 'pointer', color: theme === 'classic' ? 'var(--accent-color)' : 'var(--text-muted)', textDecoration: theme === 'classic' ? 'underline' : 'none' }}>Classic</button>
            <button onClick={() => changeTheme('obsidian')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: 'none', background: 'transparent', cursor: 'pointer', color: theme === 'obsidian' ? 'var(--accent-color)' : 'var(--text-muted)', textDecoration: theme === 'obsidian' ? 'underline' : 'none' }}>Obsidian</button>
            <button onClick={() => changeTheme('dark')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: 'none', background: 'transparent', cursor: 'pointer', color: theme === 'dark' ? 'var(--accent-color)' : 'var(--text-muted)', textDecoration: theme === 'dark' ? 'underline' : 'none' }}>Dark Neon</button>
            <button onClick={() => changeTheme('vintage')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8em', fontFamily: 'monospace', border: 'none', background: 'transparent', cursor: 'pointer', color: theme === 'vintage' ? 'var(--accent-color)' : 'var(--text-muted)', textDecoration: theme === 'vintage' ? 'underline' : 'none' }}>Vintage</button>
          </div>
          <p>© {new Date().getFullYear()} Canto · Crafted by Sonata Interactive as a solo project</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigateToPage('about')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>About</button>
            <button onClick={() => navigateToPage('library')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>Library</button>
            <button onClick={() => navigateToPage('pricing')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>Pricing</button>
            <button onClick={() => navigateToPage('opensource')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>Open Source</button>
            <button onClick={() => navigateToPage('faq')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>FAQ</button>
            <button onClick={() => navigateToPage('privacy')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>Privacy</button>
            <button onClick={() => navigateToPage('terms')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', textDecoration: 'underline' }}>Terms</button>
          </div>
          {generationTime && currentPage === 'wiki' && (
            <p style={{ marginTop: '1.5rem', opacity: 0.6 }}>
              Generated in {Math.round(generationTime)}ms
            </p>
          )}
        </footer>
        
        {isConfirmingClear && (
          <CantoDialog 
            title="Clear History"
            message="Are you sure you want to delete all browsing history? This action cannot be undone."
            type="confirm"
            confirmLabel="Clear All"
            onConfirm={handleConfirmClear}
            onCancel={() => setIsConfirmingClear(false)}
          />
        )}

        {activeAlert && (
          <CantoDialog 
            title={activeAlert.title}
            message={activeAlert.message}
            type="alert"
            confirmLabel="OK"
            onConfirm={() => {
              if (activeAlert.onConfirm) activeAlert.onConfirm();
              setActiveAlert(null);
            }}
          />
        )}

      </div>
    </>
  );
};

export default App;
