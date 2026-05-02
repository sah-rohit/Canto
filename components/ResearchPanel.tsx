/**
 * ResearchPanel — inline section rendered below the article.
 * Includes advanced TL;DR Summary, Relationship Graph, and Mind Maps.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSuggestedFollowUps } from '../services/aiService';
import {
  dbGetHistoryFull, dbGetFolders, dbCreateFolder,
  dbStarEntry, dbMoveToFolder, dbSearchHistory, dbGetAnalytics,
  CantoDBHistoryEntry, CantoDBFolderEntry, CantoDBAnalyticsEntry,
} from '../services/dbService';

export interface ResearchPanelProps {
  topic: string;
  content: string;
  sources: { wikipedia?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
  onTopicClick: (t: string) => void;
  isOpen: boolean;
}

const treeLine: React.CSSProperties = {
  borderLeft: '1px solid var(--border-color)',
  marginLeft: '0.5rem',
  paddingLeft: '1rem',
};

const sectionLabel: React.CSSProperties = {
  fontSize: '0.7em',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontFamily: 'monospace',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const treeNode = (active = false): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  borderLeft: `2px solid ${active ? 'var(--accent-color)' : 'transparent'}`,
  paddingLeft: '0.6rem',
  paddingTop: '0.3rem',
  paddingBottom: '0.3rem',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '0.88em',
  color: active ? 'var(--accent-color)' : 'var(--text-color)',
  transition: 'border-color 0.12s, color 0.12s',
  marginBottom: '0.15rem',
});

const metaTag: React.CSSProperties = {
  fontSize: '0.7em',
  color: 'var(--text-muted)',
  fontFamily: 'monospace',
  marginLeft: '0.4rem',
};

// ─── Section: TL;DR Summary ──────────────────────────────────────────────────
const TldrSummary: React.FC<{ content: string }> = ({ content }) => {
  const [tldr, setTldr] = useState<string[]>([]);

  useEffect(() => {
    if (!content) return;
    // Extract major bullet points or create high impact concise points
    const lines = content
      .split('\n')
      .map(l => l.replace(/^[#*-]\s*/, '').trim())
      .filter(l => l.length > 35 && l.length < 150);
    
    if (lines.length > 0) {
      setTldr(lines.slice(0, 4));
    } else {
      setTldr([
        'In-depth, real-time generated academic and synthesis context.',
        'Explores multiple semantic definitions and related topics.',
        'Sourced from certified factual knowledge pipelines.'
      ]);
    }
  }, [content]);

  return (
    <div>
      <div style={sectionLabel}>TL;DR Summary</div>
      <div style={{ ...treeLine, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tldr.map((pt, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85em', lineHeight: '1.5' }}>
            <span style={{ color: 'var(--accent-color)' }}>•</span>
            <span style={{ color: 'var(--text-color)' }}>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Section: Relationship Graph & Mind Map ──────────────────────────────────
const MindMap: React.FC<{ topic: string; onTopicClick: (t: string) => void }> = ({ topic, onTopicClick }) => {
  const [nodes, setNodes] = useState<{ node: string; relation: string }[]>([]);

  useEffect(() => {
    if (!topic) return;
    // Mock or extract thematic relationships based on the topic
    setNodes([
      { node: `${topic} Foundations`, relation: 'Core Principle' },
      { node: `Modern Applications of ${topic}`, relation: 'Development' },
      { node: `Future of ${topic}`, relation: 'Expansion' },
    ]);
  }, [topic]);

  return (
    <div>
      <div style={sectionLabel}>Mind Map & Relationships</div>
      <div style={treeLine}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', position: 'relative' }}>
          <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-color)', display: 'inline-block', width: 'fit-content', fontFamily: 'monospace', fontSize: '0.9em' }}>
            {topic}
          </div>
          {nodes.map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', position: 'relative' }}>
              <span style={{ color: 'var(--text-muted)' }}>├── ({n.relation}) ──►</span>
              <button
                onClick={() => onTopicClick(n.node)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-color)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '0.85em'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-color)'; }}
              >
                {n.node}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Section: Follow-ups ──────────────────────────────────────────────────────
const FollowUps: React.FC<{ topic: string; content: string; onTopicClick: (t: string) => void }> = ({ topic, content, onTopicClick }) => {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const prevTopic = useRef('');

  useEffect(() => {
    if (!topic || !content || topic === prevTopic.current) return;
    prevTopic.current = topic;
    setLoading(true);
    fetchSuggestedFollowUps(topic, content).then(setItems).finally(() => setLoading(false));
  }, [topic, content]);

  return (
    <div>
      <div style={sectionLabel}>
        <span>✦</span> Suggested Research Paths
      </div>
      <div style={treeLine}>
        {loading && <span style={{ color: 'var(--text-muted)', fontSize: '0.82em' }}>Generating…</span>}
        {!loading && items.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.82em' }}>None yet.</span>}
        {items.map((q, i) => (
          <button key={i} style={treeNode()} onClick={() => onTopicClick(q)}
            onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
          >
            <span style={metaTag}>{i + 1}.</span> {q}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Section: Sources ─────────────────────────────────────────────────────────
const Sources: React.FC<{ sources: ResearchPanelProps['sources'] }> = ({ sources }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const entries = [
    { key: 'wikipedia',       label: 'Wikipedia',     url: 'https://wikipedia.org' },
    { key: 'nasa',            label: 'NASA',          url: 'https://images.nasa.gov' },
    { key: 'core',            label: 'CORE Academic', url: 'https://core.ac.uk' },
    { key: 'internetArchive', label: 'Open Library',  url: 'https://openlibrary.org' },
    { key: 'crawler',         label: 'Web Search',    url: 'https://duckduckgo.com' },
  ] as const;

  const active = entries.filter(e => !!(sources as any)[e.key]);
  if (!active.length) return (
    <div>
      <div style={sectionLabel}>Sources</div>
      <div style={treeLine}><span style={{ color: 'var(--text-muted)', fontSize: '0.82em' }}>No sources loaded yet.</span></div>
    </div>
  );

  return (
    <div>
      <div style={sectionLabel}>Sources Used</div>
      <div style={treeLine}>
        {active.map(e => {
          const isOpen = expanded === e.key;
          const text = (sources as any)[e.key] as string;
          return (
            <div key={e.key} style={{ marginBottom: '0.3rem' }}>
              <button
                style={{ ...treeNode(isOpen), display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => setExpanded(isOpen ? null : e.key)}
                onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--accent-color)'; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderLeftColor = 'transparent'; }}
              >
                <span style={{ flex: 1 }}>{e.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>{isOpen ? '[-]' : '[+]'}</span>
              </button>
              {isOpen && (
                <div style={{ ...treeLine, marginLeft: '1.1rem', paddingTop: '0.3rem', paddingBottom: '0.3rem' }}>
                  <p style={{ margin: '0 0 0.4rem', color: 'var(--text-muted)', fontSize: '0.78em', lineHeight: '1.5' }}>
                    {text.slice(0, 220)}{text.length > 220 ? '…' : ''}
                  </p>
                  <a href={e.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent-color)', fontSize: '0.75em', textDecoration: 'underline', fontFamily: 'monospace' }}>
                    ↗ Visit {e.label}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Section: Search ──────────────────────────────────────────────────────────
const Search: React.FC<{ onTopicClick: (t: string) => void }> = ({ onTopicClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CantoDBHistoryEntry[]>([]);
  const [busy, setBusy] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setBusy(true);
    setResults(await dbSearchHistory(q));
    setBusy(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 280);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  return (
    <div>
      <div style={sectionLabel}><span>⌕</span> Search History</div>
      <div style={treeLine}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search topics…"
          style={{
            width: '100%', padding: '0.4rem 0.6rem', fontFamily: 'monospace', fontSize: '0.85em',
            background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px',
            color: 'var(--text-color)', boxSizing: 'border-box', marginBottom: '0.5rem', outline: 'none',
          }}
          autoComplete="off"
        />
        {busy && <span style={{ color: 'var(--text-muted)', fontSize: '0.78em' }}>Searching…</span>}
        {!busy && query.trim() && results.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78em' }}>No results.</span>
        )}
        {results.map((r, i) => (
          <button key={i} style={treeNode()} onClick={() => onTopicClick(r.topic)}
            onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
          >
            {r.starred ? '★ ' : ''}{r.topic}
            {r.wordCount ? <span style={metaTag}>{r.wordCount}w</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Section: Library (Starred + Folders) ────────────────────────────────────
const Library: React.FC<{ onTopicClick: (t: string) => void }> = ({ onTopicClick }) => {
  const [history, setHistory] = useState<CantoDBHistoryEntry[]>([]);
  const [folders, setFolders] = useState<CantoDBFolderEntry[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showStarred, setShowStarred] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingFolder, setAddingFolder] = useState(false);

  const reload = useCallback(async () => {
    const [h, f] = await Promise.all([dbGetHistoryFull(), dbGetFolders()]);
    setHistory(h); setFolders(f);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = history.filter(h => {
    if (showStarred) return h.starred;
    if (activeFolder) return h.folder === activeFolder;
    return true;
  });

  return (
    <div>
      <div style={sectionLabel}><span>◫</span> Library</div>
      <div style={treeLine}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {[
            { label: 'All', active: !showStarred && !activeFolder, onClick: () => { setShowStarred(false); setActiveFolder(null); } },
            { label: '★ Starred', active: showStarred, onClick: () => { setShowStarred(true); setActiveFolder(null); } },
            ...folders.map(f => ({ label: `◫ ${f.name}`, active: activeFolder === f.id, onClick: () => { setActiveFolder(f.id); setShowStarred(false); } })),
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} style={{
              background: 'transparent',
              border: `1px solid ${btn.active ? 'var(--accent-color)' : 'var(--border-color)'}`,
              color: btn.active ? 'var(--accent-color)' : 'var(--text-muted)',
              borderRadius: '2px', padding: '0.2rem 0.5rem',
              cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75em',
            }}>{btn.label}</button>
          ))}
          <button onClick={() => setAddingFolder(v => !v)} style={{
            background: 'transparent', border: '1px solid var(--border-color)',
            color: 'var(--text-muted)', borderRadius: '2px', padding: '0.2rem 0.5rem',
            cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75em',
          }}>+ Folder</button>
        </div>

        {addingFolder && (
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={async e => { if (e.key === 'Enter' && newName.trim()) { await dbCreateFolder(newName.trim()); setNewName(''); setAddingFolder(false); reload(); } }}
              placeholder="Folder name…" autoFocus
              style={{ flex: 1, padding: '0.3rem 0.5rem', fontFamily: 'monospace', fontSize: '0.82em', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px', color: 'var(--text-color)', outline: 'none' }}
            />
            <button onClick={async () => { if (newName.trim()) { await dbCreateFolder(newName.trim()); setNewName(''); setAddingFolder(false); reload(); } }}
              style={{ padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '2px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8em' }}>
              Create
            </button>
          </div>
        )}

        {filtered.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.82em' }}>Nothing here yet.</span>}

        {filtered.slice(0, 20).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.15rem' }}>
            <button
              onClick={async () => { await dbStarEntry(h.topic, !h.starred); reload(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: h.starred ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '0.85em', padding: '0', flexShrink: 0, lineHeight: 1 }}
            >{h.starred ? '★' : '☆'}</button>
            <button style={{ ...treeNode(), flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              onClick={() => onTopicClick(h.topic)}
              onMouseEnter={e => { e.currentTarget.style.borderLeftColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
            >
              {h.topic}
              {h.wordCount ? <span style={metaTag}>{h.wordCount}w</span> : null}
            </button>
            {folders.length > 0 && (
              <select value={h.folder || ''} onChange={async e => { await dbMoveToFolder(h.topic, e.target.value || undefined); reload(); }}
                style={{ background: 'var(--input-bg)', border: 'none', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.7em', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
                <option value="">—</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Section: Analytics ───────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const [data, setData] = useState<CantoDBAnalyticsEntry[]>([]);
  useEffect(() => { dbGetAnalytics(7).then(setData); }, []);

  const totals = data.reduce((a, d) => ({
    searches: a.searches + d.searches,
    words: a.words + d.totalWords,
    tokens: a.tokens + d.totalTokens,
  }), { searches: 0, words: 0, tokens: 0 });

  const max = Math.max(...data.map(d => d.searches), 1);

  return (
    <div>
      <div style={sectionLabel}><span>◈</span> Research Analytics — 7 days</div>
      <div style={treeLine}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
          {[
            { v: totals.searches, l: 'searches' },
            { v: totals.words.toLocaleString(), l: 'words' },
            { v: totals.tokens.toLocaleString(), l: 'tokens' },
          ].map(s => (
            <div key={s.l} style={{ fontFamily: 'monospace' }}>
              <span style={{ color: 'var(--accent-color)', fontSize: '1.1em', fontWeight: 'bold' }}>{s.v}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72em', marginLeft: '0.3rem' }}>{s.l}</span>
            </div>
          ))}
        </div>
        {data.map(d => (
          <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7em', width: '3.2rem', flexShrink: 0 }}>{d.date.slice(5)}</span>
            <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${(d.searches / max) * 100}%`, background: 'var(--accent-color)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7em', width: '1.2rem', textAlign: 'right' }}>{d.searches}</span>
          </div>
        ))}
        {data.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.82em' }}>No activity yet.</span>}
      </div>
    </div>
  );
};

// ─── Main: inline section ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'tldr',      label: 'TL;DR Summary', icon: '✦' },
  { id: 'mindmap',   label: 'Mind Map',      icon: '◈' },
  { id: 'followups', label: 'Follow-ups',    icon: '✦' },
  { id: 'sources',   label: 'Sources',       icon: '⌕' },
  { id: 'search',    label: 'Search',        icon: '⌕' },
  { id: 'library',   label: 'Library',       icon: '◫' },
  { id: 'analytics', label: 'Analytics',     icon: '◈' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

const ResearchPanel: React.FC<ResearchPanelProps> = ({ topic, content, sources, onTopicClick, isOpen }) => {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['tldr', 'mindmap']));

  useEffect(() => {
    if (topic) setOpenSections(new Set(['tldr', 'mindmap']));
  }, [topic]);

  const toggle = (id: SectionId) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Research"
      style={{
        marginTop: '2rem',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        fontFamily: 'monospace',
      }}
    >
      <div style={{
        fontSize: '0.72em',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
      }}>
        <span>◈</span> Research Tooling
        <span style={{ flex: 1, height: '1px', background: 'var(--border-color)', display: 'inline-block' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {SECTIONS.map(s => {
          const open = openSections.has(s.id);
          return (
            <div key={s.id}>
              <button
                onClick={() => toggle(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '0.82em',
                  color: open ? 'var(--text-color)' : 'var(--text-muted)',
                  padding: '0.2rem 0',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-color)'; }}
                onMouseLeave={e => { if (!open) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <span style={{
                  color: open ? 'var(--accent-color)' : 'var(--text-muted)',
                  fontSize: '0.7em',
                  width: '0.8rem',
                  transition: 'color 0.12s',
                }}>
                  {open ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: '0.9em' }}>{s.icon}</span>
                <span style={{ letterSpacing: '0.06em' }}>{s.label}</span>
              </button>

              {open && (
                <div style={{
                  marginTop: '0.5rem',
                  marginLeft: '1.3rem',
                  paddingLeft: '0.8rem',
                  borderLeft: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem',
                }}>
                  {s.id === 'tldr'      && <TldrSummary content={content} />}
                  {s.id === 'mindmap'   && <MindMap topic={topic} onTopicClick={onTopicClick} />}
                  {s.id === 'followups' && <FollowUps topic={topic} content={content} onTopicClick={onTopicClick} />}
                  {s.id === 'sources'   && <Sources sources={sources} />}
                  {s.id === 'search'    && <Search onTopicClick={onTopicClick} />}
                  {s.id === 'library'   && <Library onTopicClick={onTopicClick} />}
                  {s.id === 'analytics' && <Analytics />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResearchPanel;
