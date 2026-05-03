/**
 * Canto Codex — Gamification UI
 * Minimal, non-intrusive panel showing XP, rank, streaks, domains, achievements.
 * Designed to feel like a discovery log, not a game dashboard.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { dbGetCodex, dbMarkAchievementsSeen, CantoCodexState } from '../services/dbService';
import { ACHIEVEMENTS, getRankForXP, getNextRankThreshold, getAchievement } from '../services/codexService';

// ─── ASCII constellation map (static, decorative) ────────────────────────────
function ConstellationBar({ filled, total }: { filled: number; total: number }) {
  const nodes = Array.from({ length: total }, (_, i) => i < filled ? '◆' : '◇');
  return (
    <span style={{ fontFamily: 'monospace', letterSpacing: '0.15em', color: 'var(--accent-color)', fontSize: '0.8em' }}>
      {nodes.join(' ')}
    </span>
  );
}

// ─── XP progress bar ─────────────────────────────────────────────────────────
function XPBar({ xp }: { xp: number }) {
  const next = getNextRankThreshold(xp);
  if (!next) return <span style={{ fontSize: '0.75em', color: 'var(--accent-color)', fontFamily: 'monospace' }}>Max Rank</span>;

  // Find current rank min
  const RANK_MINS = [0, 50, 150, 350, 700, 1200, 2000, 3500, 6000];
  let currentMin = 0;
  for (const m of RANK_MINS) { if (xp >= m) currentMin = m; }

  const progress = Math.min(100, Math.round(((xp - currentMin) / (next.threshold - currentMin)) * 100));
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.75em' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
        <span>{xp} XP</span>
        <span>{next.threshold} XP → {next.next}</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-color)', borderRadius: '2px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ─── Domain breadth visualization ────────────────────────────────────────────
const ALL_DOMAINS = ['Science', 'Philosophy', 'History', 'Technology', 'Arts', 'Linguistics', 'Psychology', 'Economics', 'Nature', 'Society'];

function DomainMap({ explored }: { explored: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
      {ALL_DOMAINS.map(d => {
        const active = explored.includes(d);
        return (
          <span key={d} style={{
            fontFamily: 'monospace', fontSize: '0.72em',
            padding: '0.15rem 0.4rem',
            border: `1px solid ${active ? 'var(--accent-color)' : 'var(--border-color)'}`,
            color: active ? 'var(--accent-color)' : 'var(--text-muted)',
            borderRadius: '2px',
            transition: 'all 0.2s',
          }}>
            {active ? '◆' : '◇'} {d}
          </span>
        );
      })}
    </div>
  );
}

// ─── Achievement entry ────────────────────────────────────────────────────────
function AchievementRow({ id, unlocked, isNew }: { id: string; unlocked: boolean; isNew: boolean }) {
  const ach = getAchievement(id);
  if (!ach) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      padding: '0.3rem 0',
      borderBottom: '1px solid var(--border-color)',
      opacity: unlocked ? 1 : 0.4,
    }}>
      <span style={{ color: unlocked ? 'var(--accent-color)' : 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8em', flexShrink: 0, marginTop: '0.1rem' }}>
        {unlocked ? '◆' : '◇'}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'monospace', fontSize: '0.82em', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {ach.title}
          {isNew && <span style={{ fontSize: '0.7em', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '0 0.3rem', borderRadius: '2px' }}>new</span>}
          {ach.secret && !unlocked && <span style={{ fontSize: '0.7em', color: 'var(--text-muted)' }}>[hidden]</span>}
        </div>
        {(unlocked || !ach.secret) && (
          <div style={{ fontSize: '0.72em', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{ach.description}</div>
        )}
      </div>
      {unlocked && (
        <span style={{ fontFamily: 'monospace', fontSize: '0.7em', color: 'var(--text-muted)', flexShrink: 0 }}>+{ach.xpReward}xp</span>
      )}
    </div>
  );
}

// ─── Main Codex panel ─────────────────────────────────────────────────────────
interface CantoCodexProps {
  isOpen: boolean;
  onClose: () => void;
}

const CantoCodex: React.FC<CantoCodexProps> = ({ isOpen, onClose }) => {
  const [state, setState] = useState<CantoCodexState | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'domains'>('overview');

  const load = useCallback(async () => {
    const s = await dbGetCodex();
    setState(s);
    if (s.newAchievements.length > 0) {
      await dbMarkAchievementsSeen();
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen || !state) return null;

  const unlockedSet = new Set(state.unlockedAchievements);
  const newSet = new Set(state.newAchievements);

  // Split achievements: unlocked first, then locked non-secret, then locked secret
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aU = unlockedSet.has(a.id) ? 0 : a.secret ? 2 : 1;
    const bU = unlockedSet.has(b.id) ? 0 : b.secret ? 2 : 1;
    return aU - bU;
  });

  const streakDisplay = state.streak > 0
    ? `${state.streak} day${state.streak !== 1 ? 's' : ''} of curiosity`
    : 'No active streak';

  return (
    <div
      role="dialog"
      aria-label="Canto Codex"
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(360px, 100vw)',
        background: 'var(--bg-color)',
        borderLeft: '1px solid var(--border-color)',
        zIndex: 10000,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'monospace',
        overflowY: 'auto',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '1rem 1.2rem 0.8rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.65em', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Canto Codex</div>
          <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: 'var(--text-color)' }}>{state.rank}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2em', padding: '0', lineHeight: 1 }}>×</button>
      </div>

      {/* XP bar */}
      <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid var(--border-color)' }}>
        <XPBar xp={state.xp} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        {(['overview', 'achievements', 'domains'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '0.5rem', background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-color)' : 'transparent'}`,
            color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.72em',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            transition: 'color 0.15s, border-color 0.15s',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '1rem 1.2rem', flex: 1 }}>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* Stats grid */}
            <div>
              <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>At a Glance</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {[
                  { label: 'Articles Explored', value: state.totalArticles },
                  { label: 'Reading Minutes',   value: state.totalReadingMinutes },
                  { label: 'Domains Touched',   value: state.domainsExplored.length },
                  { label: 'Deep Reads',        value: state.deepReadCount },
                  { label: 'Achievements',      value: `${state.unlockedAchievements.length}/${ACHIEVEMENTS.length}` },
                  { label: 'Longest Streak',    value: `${state.longestStreak}d` },
                ].map(s => (
                  <div key={s.label} style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
                    <div style={{ fontSize: '1.1em', color: 'var(--accent-color)', fontWeight: 'bold' }}>{s.value}</div>
                    <div style={{ fontSize: '0.68em', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div>
              <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Reading Streak</div>
              <div style={{ fontSize: '0.88em', color: 'var(--text-color)', marginBottom: '0.4rem' }}>{streakDisplay}</div>
              <ConstellationBar filled={Math.min(state.streak, 7)} total={7} />
              {state.streak > 7 && <span style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>+{state.streak - 7} more</span>}
            </div>

            {/* Recent achievements */}
            {state.unlockedAchievements.length > 0 && (
              <div>
                <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Recent Unlocks</div>
                {state.unlockedAchievements.slice(-3).reverse().map(id => (
                  <AchievementRow key={id} id={id} unlocked={true} isNew={newSet.has(id)} />
                ))}
                <button onClick={() => setActiveTab('achievements')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72em', textDecoration: 'underline', padding: '0.3rem 0 0', fontFamily: 'monospace' }}>
                  View all achievements
                </button>
              </div>
            )}

            {/* Domain preview */}
            <div>
              <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Knowledge Breadth — {state.domainsExplored.length}/{ALL_DOMAINS.length} domains
              </div>
              <DomainMap explored={state.domainsExplored} />
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
              {state.unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
            </div>
            {sortedAchievements.map(a => (
              <AchievementRow key={a.id} id={a.id} unlocked={unlockedSet.has(a.id)} isNew={newSet.has(a.id)} />
            ))}
          </div>
        )}

        {activeTab === 'domains' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                You've explored {state.domainsExplored.length} of {ALL_DOMAINS.length} domains
              </div>
              <DomainMap explored={state.domainsExplored} />
            </div>
            {state.domainsExplored.length > 0 && (
              <div>
                <div style={{ fontSize: '0.65em', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Touched domains</div>
                {state.domainsExplored.map(d => (
                  <div key={d} style={{ fontSize: '0.82em', color: 'var(--text-color)', padding: '0.2rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    ◆ {d}
                  </div>
                ))}
              </div>
            )}
            {state.domainsExplored.length === 0 && (
              <p style={{ fontSize: '0.82em', color: 'var(--text-muted)' }}>
                Generate articles on different topics to map your knowledge breadth.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CantoCodex;
