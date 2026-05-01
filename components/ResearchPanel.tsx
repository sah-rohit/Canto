/**
 * ResearchPanel — collapsible side panel with:
 * - Suggested follow-up questions
 * - Citations / sources used
 * - Full-text search across history
 * - Research folders
 * - Starred entries
 * - Analytics (word count, token usage, daily stats)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSuggestedFollowUps } from '../services/aiService';
import {
  dbGetHistoryFull, dbGetFolders, dbCreateFolder,
  dbStarEntry, dbMoveToFolder, dbSearchHistory, dbGetAnalytics,
  CantoDBHistoryEntry, CantoDBFolderEntry, CantoDBAnalyticsEntry,
} from '../services/dbService';

interface ResearchPanelProps {
  topic: string;
  content: string;
  sources: { wikipedia?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
  onTopicClick: (t: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

type PanelTab = 'followups' | 'sources' | 'search' | 'library' | 'analytics';

const TAB_LABELS: { id: PanelTab; label: string; icon: string }[] = [
  { id: 'followups', label: 'Follow-ups', icon: '✦' },
  { id: 'sources',   label: 'Sources',    icon: '📡' },
  { id: 'search',    label: 'Search',     icon: '⌕' },
  { id: 'library',   label: 'Library',    icon: '◫' },
  { id: 'analytics', label: 'Analytics',  icon: '◈' },
];

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100vh',
  width: 'min(360px, 92vw)',
  background: 'var(--bg-color)',
  borderLeft: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 200,
  fontFamily: 'monospace',
  fontSize: '0.88em',
  overflowY: 'hidden',
  boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
  transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '0.75em',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '0.6rem',
  paddingBottom: '0.4rem',
  borderBottom: '1px solid var(--border-color)',
};

const chipBtn = (active = false): React.CSSProperties => ({
  background: 'transparent',
  border: `1px solid ${active ? 'var(--accent-color)' : 'var(--border-color)'}`,
  color: active ? 'var(--accent-color)' : 'var(--text-color)',
  borderRadius: '2px',
  padding: '0.35rem 0.7rem',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '0.85em',
  textAlign: 'left' as const,
  transition: 'border-color 0.15s, color 0.15s',
  width: '100%',
  marginBottom: '0.4rem',
});

// ─── Follow-ups Tab ───────────────────────────────────────────────────────────
const FollowUpsTab: React.FC<{ topic: string; content: string; onTopicClick: (t: string) => void }> = ({ topic, content, onTopicClick }) => {
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const prevTopic = useRef('');

  useEffect(() => {
    if (!topic || !content || topic === prevTopic.current) return;
    prevTopic.current = topic;
    setLoading(true);
    fetchSuggestedFollowUps(topic, content)
      .then(setFollowUps)
      .finally(() => setLoading(false));
  }, [topic, content]);

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Generating follow-ups...</p>;
  if (!followUps.length) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Search a topic to see suggested follow-ups.</p>;

  return (
    <div>
      <p style={sectionTitle}>Suggested Research Paths</p>
      {followUps.map((q, i) => (
        <button key={i} style={chipBtn()} onClick={() => onTopicClick(q)}>
          <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>{i + 1}.</span>
          {q}
        </button>
      ))}
    </div>
  );
};

// ─── Sources Tab ─────────────────────────────────────────────────────────────
const SourcesTab: React.FC<{ sources: ResearchPanelProps['sources'] }> = ({ sources }) => {
  const entries = [
    { key: 'wikipedia',      label: 'Wikipedia',       icon: '📖', url: 'https://wikipedia.org' },
    { key: 'nasa',           label: 'NASA',            icon: '🚀', url: 'https://images.nasa.gov' },
    { key: 'core',           label: 'CORE Academic',   icon: '🎓', url: 'https://core.ac.uk' },
    { key: 'internetArchive',label: 'Open Library',    icon: '📚', url: 'https://openlibrary.org' },
    { key: 'crawler',        label: 'Web Search',      icon: '🌐', url: 'https://duckduckgo.com' },
  ] as const;

  const active = entries.filter(e => !!(sources as any)[e.key]);

  if (!active.length) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>No sources loaded yet. Search a topic first.</p>;

  return (
    <div>
      <p style={sectionTitle}>Knowledge Sources Used</p>
      {active.map(e => (
        <div key={e.key} style={{ marginBottom: '1rem', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>{e.icon} {e.label}</span>
            <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '0.75em', textDecoration: 'underline' }}>↗ Visit</a>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8em', lineHeight: '1.5', maxHeight: '4.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {((sources as any)[e.key] as string).slice(0, 180)}{((sources as any)[e.key] as string).length > 180 ? '…' : ''}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─── Search Tab ───────────────────────────────────────────────────────────────
const SearchTab: React.FC<{ onTopicClick: (t: string) => void }> = ({ onTopicClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CantoDBHistoryEntry[]>([]);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const r = await dbSearchHistory(q);
    setResults(r);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  return (
    <div>
      <p style={sectionTitle}>Full-Text Search</p>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search topics & summaries..."
        style={{
          width: '100%', padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontSize: '0.9em',
          background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px',
          color: 'var(--text-color)', boxSizing: 'border-box', marginBottom: '0.8rem', outline: 'none',
        }}
        autoComplete="off"
      />
      {searching && <p style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>Searching...</p>}
      {!searching && results.length === 0 && query.trim() && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>No results for "{query}"</p>
      )}
      {results.map((r, i) => (
        <button key={i} style={chipBtn()} onClick={() => onTopicClick(r.topic)}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{r.starred ? '★ ' : ''}{r.topic}</span>
            {r.wordCount && <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>{r.wordCount}w</span>}
          </div>
          {r.summary && <div style={{ color: 'var(--text-muted)', fontSize: '0.78em', marginTop: '0.2rem', lineHeight: '1.4' }}>{r.summary.slice(0, 80)}…</div>}
        </button>
      ))}
    </div>
  );
};

// ─── Library Tab (Folders + Starred) ─────────────────────────────────────────
const LibraryTab: React.FC<{ onTopicClick: (t: string) => void }> = ({ onTopicClick }) => {
  const [history, setHistory] = useState<CantoDBHistoryEntry[]>([]);
  const [folders, setFolders] = useState<CantoDBFolderEntry[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showStarred, setShowStarred] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const reload = useCallback(async () => {
    const [h, f] = await Promise.all([dbGetHistoryFull(), dbGetFolders()]);
    setHistory(h);
    setFolders(f);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await dbCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
    reload();
  };

  const toggleStar = async (topic: string, current: boolean) => {
    await dbStarEntry(topic, !current);
    reload();
  };

  const moveToFolder = async (topic: string, folderId: string | undefined) => {
    await dbMoveToFolder(topic, folderId);
    reload();
  };

  const filtered = history.filter(h => {
    if (showStarred) return h.starred;
    if (activeFolder) return h.folder === activeFolder;
    return !h.folder;
  });

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        <button style={chipBtn(!showStarred && !activeFolder)} onClick={() => { setShowStarred(false); setActiveFolder(null); }}>All</button>
        <button style={chipBtn(showStarred)} onClick={() => { setShowStarred(true); setActiveFolder(null); }}>★ Starred</button>
        {folders.map(f => (
          <button key={f.id} style={chipBtn(activeFolder === f.id)} onClick={() => { setActiveFolder(f.id); setShowStarred(false); }}>
            ◫ {f.name}
          </button>
        ))}
        <button style={{ ...chipBtn(), color: 'var(--text-muted)', fontSize: '0.8em' }} onClick={() => setShowNewFolder(v => !v)}>+ Folder</button>
      </div>

      {showNewFolder && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
          <input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createFolder()}
            placeholder="Folder name..."
            style={{ flex: 1, padding: '0.4rem 0.6rem', fontFamily: 'monospace', fontSize: '0.85em', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px', color: 'var(--text-color)', outline: 'none' }}
            autoFocus
          />
          <button onClick={createFolder} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '2px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85em' }}>Create</button>
        </div>
      )}

      <p style={sectionTitle}>{showStarred ? 'Starred' : activeFolder ? folders.find(f => f.id === activeFolder)?.name : 'All Entries'} ({filtered.length})</p>

      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>Nothing here yet.</p>}

      {filtered.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
          <button onClick={() => toggleStar(h.topic, !!h.starred)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: h.starred ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '1em', padding: '0', flexShrink: 0 }} title={h.starred ? 'Unstar' : 'Star'}>
            {h.starred ? '★' : '☆'}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <button onClick={() => onTopicClick(h.topic)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)', fontFamily: 'monospace', fontSize: '0.9em', textAlign: 'left', padding: 0, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {h.topic}
            </button>
            {h.summary && <div style={{ color: 'var(--text-muted)', fontSize: '0.75em', lineHeight: '1.4', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.summary}</div>}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
              {h.wordCount && <span style={{ color: 'var(--text-muted)', fontSize: '0.7em' }}>{h.wordCount}w</span>}
              {folders.length > 0 && (
                <select
                  value={h.folder || ''}
                  onChange={e => moveToFolder(h.topic, e.target.value || undefined)}
                  style={{ background: 'var(--input-bg)', border: 'none', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.7em', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">No folder</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Analytics Tab ────────────────────────────────────────────────────────────
const AnalyticsTab: React.FC = () => {
  const [data, setData] = useState<CantoDBAnalyticsEntry[]>([]);

  useEffect(() => {
    dbGetAnalytics(7).then(setData);
  }, []);

  const totals = data.reduce((acc, d) => ({
    searches: acc.searches + d.searches,
    words: acc.words + d.totalWords,
    tokens: acc.tokens + d.totalTokens,
  }), { searches: 0, words: 0, tokens: 0 });

  const maxSearches = Math.max(...data.map(d => d.searches), 1);

  return (
    <div>
      <p style={sectionTitle}>Research Analytics — Last 7 Days</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.2rem' }}>
        {[
          { label: 'Searches', value: totals.searches },
          { label: 'Words Read', value: totals.words.toLocaleString() },
          { label: 'Est. Tokens', value: totals.tokens.toLocaleString() },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid var(--border-color)', borderRadius: '2px', padding: '0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2em', color: 'var(--accent-color)', fontWeight: 'bold' }}>{s.value}</div>
            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      {data.length > 0 && (
        <div>
          <p style={{ ...sectionTitle, marginBottom: '0.8rem' }}>Daily Activity</p>
          {data.map(d => (
            <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72em', width: '4.5rem', flexShrink: 0 }}>{d.date.slice(5)}</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.searches / maxSearches) * 100}%`, background: 'var(--accent-color)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72em', width: '1.5rem', textAlign: 'right' }}>{d.searches}</span>
            </div>
          ))}
        </div>
      )}

      {data.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>No activity recorded yet. Start researching!</p>}
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
const ResearchPanel: React.FC<ResearchPanelProps> = ({ topic, content, sources, onTopicClick, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('followups');

  // Switch to follow-ups when a new topic loads
  useEffect(() => {
    if (topic) setActiveTab('followups');
  }, [topic]);

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199, backdropFilter: 'blur(2px)' }}
          aria-hidden="true"
        />
      )}

      <aside
        role="complementary"
        aria-label="Research panel"
        style={{ ...panelStyle, transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.8em', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            ◈ Research
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1em', padding: '0.2rem', fontFamily: 'monospace' }} aria-label="Close panel">×</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', flexShrink: 0, overflowX: 'auto' }}>
          {TAB_LABELS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: '0 0 auto',
                padding: '0.55rem 0.7rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--accent-color)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '0.75em',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'followups' && <FollowUpsTab topic={topic} content={content} onTopicClick={onTopicClick} />}
          {activeTab === 'sources'   && <SourcesTab sources={sources} />}
          {activeTab === 'search'    && <SearchTab onTopicClick={onTopicClick} />}
          {activeTab === 'library'   && <LibraryTab onTopicClick={onTopicClick} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </aside>
    </>
  );
};

export default ResearchPanel;
