/**
 * Canto Codex — inline encyclopedia-style knowledge journal.
 * Rendered as a collapsible section within the wiki page flow,
 * following the same raw monospace format as the rest of the site.
 * No fixed sidebar, no external panel — fully integrated.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { dbGetCodex, dbMarkAchievementsSeen, CantoCodexState } from '../services/dbService';
import { ACHIEVEMENTS, getRankForXP, getNextRankThreshold, getAchievement } from '../services/codexService';

const ALL_DOMAINS = [
  'Science', 'Philosophy', 'History', 'Technology', 'Arts',
  'Linguistics', 'Psychology', 'Economics', 'Nature', 'Society',
];

// ─── Rank thresholds for progress display ────────────────────────────────────
const RANK_MINS = [0, 50, 150, 350, 700, 1200, 2000, 3500, 6000];

function xpProgressPercent(xp: number): number {
  const next = getNextRankThreshold(xp);
  if (!next) return 100;
  let currentMin = 0;
  for (const m of RANK_MINS) { if (xp >= m) currentMin = m; }
  return Math.min(100, Math.round(((xp - currentMin) / (next.threshold - currentMin)) * 100));
}

// ─── Inline ASCII progress bar ────────────────────────────────────────────────
function AsciiProgress({ percent, width = 20 }: { percent: number; width?: number }) {
  const filled = Math.round((percent / 100) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--accent-color)', letterSpacing: '0' }}>
      [{bar}] {percent}%
    </span>
  );
}

// ─── Constellation dots for streak ───────────────────────────────────────────
function StreakDots({ streak }: { streak: number }) {
  const show = Math.min(streak, 14);
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.78em', letterSpacing: '0.1em' }}>
      {Array.from({ length: show }, (_, i) => (
        <span key={i} style={{ color: 'var(--accent-color)' }}>◆</span>
      ))}
      {streak > 14 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}> +{streak - 14}</span>}
      {streak === 0 && <span style={{ color: 'var(--text-muted)' }}>◇◇◇◇◇◇◇</span>}
    </span>
  );
}

// ─── Domain breadth row ───────────────────────────────────────────────────────
function DomainRow({ explored }: { explored: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', fontFamily: 'monospace', fontSize: '0.8em' }}>
      {ALL_DOMAINS.map(d => {
        const active = explored.includes(d);
        return (
          <span key={d} style={{ color: active ? 'var(--accent-color)' : 'var(--text-muted)' }}>
            {active ? '◆' : '◇'} {d}
          </span>
        );
      })}
    </div>
  );
}

// ─── Single achievement line ──────────────────────────────────────────────────
function AchievementLine({ id, unlocked, isNew }: { id: string; unlocked: boolean; isNew: boolean }) {
  const ach = getAchievement(id);
  if (!ach) return null;
  if (ach.secret && !unlocked) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text-muted)', paddingLeft: '1rem', marginBottom: '0.2rem' }}>
        ◇ [hidden] — keep exploring to discover this
      </div>
    );
  }
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.8em', marginBottom: '0.25rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ color: unlocked ? 'var(--accent-color)' : 'var(--text-muted)', flexShrink: 0 }}>{unlocked ? '◆' : '◇'}</span>
      <span style={{ color: unlocked ? 'var(--text-color)' : 'var(--text-muted)' }}>
        {ach.title}
        {isNew && <span style={{ color: 'var(--accent-color)', marginLeft: '0.4rem', fontSize: '0.85em' }}>[new]</span>}
        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.85em' }}>— {ach.description}</span>
      </span>
      {unlocked && ach.xpReward > 0 && (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75em', flexShrink: 0 }}>+{ach.xpReward}xp</span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface CantoCodexProps {
  isOpen: boolean;
  onToggle: () => void;
  hideHeader?: boolean;
}

const CantoCodex: React.FC<CantoCodexProps> = ({ isOpen, onToggle, hideHeader }) => {
  const [state, setState] = useState<CantoCodexState | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'achievements' | 'domains'>('overview');

  const load = useCallback(async () => {
    const s = await dbGetCodex();
    setState(s);
    if (s.newAchievements.length > 0) await dbMarkAchievementsSeen();
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const next = state ? getNextRankThreshold(state.xp) : null;
  const progress = state ? xpProgressPercent(state.xp) : 0;
  const unlockedSet = new Set(state?.unlockedAchievements ?? []);
  const newSet = new Set(state?.newAchievements ?? []);

  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aU = unlockedSet.has(a.id) ? 0 : a.secret ? 2 : 1;
    const bU = unlockedSet.has(b.id) ? 0 : b.secret ? 2 : 1;
    return aU - bU;
  });

  return (
    <div style={{ borderTop: hideHeader ? 'none' : '1px solid var(--border-color)', marginTop: hideHeader ? '0' : '2rem', fontFamily: 'monospace' }}>

      {/* ── Section header / toggle ── */}
      {!hideHeader && (
        <button
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '0.72em',
            color: 'var(--text-muted)', padding: '0.8rem 0',
            width: '100%', textAlign: 'left',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-color)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <span style={{ color: isOpen ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '0.85em' }}>
            {isOpen ? '▼' : '▶'}
          </span>
          <span>◈</span>
          <span>Canto Codex</span>
          {state && (
            <span style={{ color: 'var(--accent-color)', letterSpacing: '0.05em', textTransform: 'none', fontSize: '0.95em' }}>
              — {state.rank}
            </span>
          )}
          {state && state.newAchievements.length > 0 && (
            <span style={{ color: 'var(--accent-color)', fontSize: '0.85em' }}>
              [{state.newAchievements.length} new]
            </span>
          )}
          <span style={{ flex: 1, height: '1px', background: 'var(--border-color)', display: 'inline-block', marginLeft: '0.4rem' }} />
        </button>
      )}

      {/* ── Body ── */}
      {isOpen && state && (
        <div style={{ paddingBottom: '2rem' }}>

          {/* XP line */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              {state.xp} Insight Points
              {next && <span> · {next.threshold - state.xp} until {next.next}</span>}
              {!next && <span> · Maximum rank reached</span>}
            </div>
            <AsciiProgress percent={progress} width={24} />
          </div>

          {/* Sub-section tabs — plain text links */}
          <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1rem', fontSize: '0.78em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {(['overview', 'achievements', 'domains'] as const).map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontFamily: 'monospace', fontSize: '1em',
                  color: activeSection === s ? 'var(--accent-color)' : 'var(--text-muted)',
                  textDecoration: activeSection === s ? 'underline' : 'none',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Stats as a plain key-value table */}
              <div>
                <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>At a Glance</div>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.82em', width: '100%', maxWidth: '420px' }}>
                  <tbody>
                    {[
                      ['Articles Explored',  state.totalArticles],
                      ['Reading Minutes',    state.totalReadingMinutes],
                      ['Domains Touched',    `${state.domainsExplored.length} / ${ALL_DOMAINS.length}`],
                      ['Deep Reads',         state.deepReadCount],
                      ['Achievements',       `${state.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`],
                      ['Longest Streak',     `${state.longestStreak} day${state.longestStreak !== 1 ? 's' : ''}`],
                    ].map(([label, value]) => (
                      <tr key={String(label)}>
                        <td style={{ color: 'var(--text-muted)', paddingRight: '1.5rem', paddingBottom: '0.2rem', whiteSpace: 'nowrap' }}>{label}</td>
                        <td style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Streak */}
              <div>
                <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Reading Streak</div>
                <div style={{ fontSize: '0.82em', color: 'var(--text-color)', marginBottom: '0.3rem' }}>
                  {state.streak > 0
                    ? `${state.streak} day${state.streak !== 1 ? 's' : ''} of curiosity`
                    : 'No active streak — come back tomorrow to start one'}
                </div>
                <StreakDots streak={state.streak} />
              </div>

              {/* Recent unlocks */}
              {state.unlockedAchievements.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Recent Unlocks</div>
                  {state.unlockedAchievements.slice(-3).reverse().map(id => (
                    <AchievementLine key={id} id={id} unlocked={true} isNew={newSet.has(id)} />
                  ))}
                  <button
                    onClick={() => setActiveSection('achievements')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75em', textDecoration: 'underline', padding: '0.2rem 0 0', fontFamily: 'monospace' }}
                  >
                    View all achievements
                  </button>
                </div>
              )}

              {/* Domain preview */}
              <div>
                <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Knowledge Breadth
                </div>
                <DomainRow explored={state.domainsExplored} />
              </div>
            </div>
          )}

          {/* ── Achievements ── */}
          {activeSection === 'achievements' && (
            <div>
              <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                {state.unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
              </div>
              {sortedAchievements.map(a => (
                <AchievementLine key={a.id} id={a.id} unlocked={unlockedSet.has(a.id)} isNew={newSet.has(a.id)} />
              ))}
            </div>
          )}

          {/* ── Domains ── */}
          {activeSection === 'domains' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {state.domainsExplored.length} of {ALL_DOMAINS.length} domains explored
              </div>
              <DomainRow explored={state.domainsExplored} />
              {state.domainsExplored.length === 0 && (
                <p style={{ fontSize: '0.82em', color: 'var(--text-muted)', margin: 0 }}>
                  Generate articles on different topics to map your knowledge breadth.
                </p>
              )}
              {state.domainsExplored.length > 0 && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.68em', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Explored</div>
                  {state.domainsExplored.map(d => (
                    <div key={d} style={{ fontSize: '0.82em', color: 'var(--text-color)', paddingBottom: '0.2rem' }}>◆ {d}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CantoCodex;
