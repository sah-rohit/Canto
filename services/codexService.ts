/**
 * Canto Codex — Gamification Service
 * Tracks XP, ranks, streaks, domain breadth, and achievements.
 * Deliberately lightweight — never interrupts the encyclopedia flow.
 */

import { dbGetCodex, dbSaveCodex, CantoCodexState, CantoAchievement } from './dbService';

// ─── Rank thresholds ──────────────────────────────────────────────────────────

const RANKS: { min: number; title: string }[] = [
  { min: 0,    title: 'Novice Scholar' },
  { min: 50,   title: 'Curious Mind' },
  { min: 150,  title: 'Wandering Sage' },
  { min: 350,  title: 'Nebula Explorer' },
  { min: 700,  title: 'Stellar Sage' },
  { min: 1200, title: 'Void Walker' },
  { min: 2000, title: 'Cosmic Archivist' },
  { min: 3500, title: 'Aetherial Scholar' },
  { min: 6000, title: 'Cosmic Sage' },
];

export function getRankForXP(xp: number): string {
  let rank = RANKS[0].title;
  for (const r of RANKS) {
    if (xp >= r.min) rank = r.title;
  }
  return rank;
}

export function getNextRankThreshold(xp: number): { next: string; threshold: number } | null {
  for (let i = 0; i < RANKS.length - 1; i++) {
    if (xp < RANKS[i + 1].min) {
      return { next: RANKS[i + 1].title, threshold: RANKS[i + 1].min };
    }
  }
  return null; // max rank
}

// ─── Domain classifier ────────────────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'Science':      ['physics', 'chemistry', 'biology', 'quantum', 'atom', 'molecule', 'evolution', 'genetics', 'astronomy', 'cosmology', 'relativity', 'thermodynamics', 'neuroscience', 'ecology', 'geology', 'climate', 'mathematics', 'calculus', 'algebra', 'geometry'],
  'Philosophy':   ['philosophy', 'ethics', 'metaphysics', 'epistemology', 'logic', 'consciousness', 'existentialism', 'nihilism', 'stoicism', 'phenomenology', 'ontology', 'dialectic', 'absurdism', 'solipsism', 'hermeneutics'],
  'History':      ['history', 'ancient', 'medieval', 'renaissance', 'revolution', 'war', 'empire', 'civilization', 'dynasty', 'colonial', 'industrial', 'century', 'historical', 'archaeology', 'mythology'],
  'Technology':   ['technology', 'computer', 'software', 'hardware', 'internet', 'algorithm', 'programming', 'artificial intelligence', 'machine learning', 'blockchain', 'cryptography', 'network', 'database', 'operating system', 'semiconductor'],
  'Arts':         ['art', 'music', 'literature', 'poetry', 'painting', 'sculpture', 'architecture', 'cinema', 'theatre', 'dance', 'novel', 'baroque', 'renaissance', 'modernism', 'surrealism', 'jazz', 'symphony'],
  'Linguistics':  ['language', 'linguistics', 'grammar', 'syntax', 'semantics', 'phonology', 'etymology', 'dialect', 'translation', 'writing system', 'alphabet', 'morphology', 'pragmatics'],
  'Psychology':   ['psychology', 'cognition', 'behavior', 'emotion', 'memory', 'perception', 'personality', 'therapy', 'freud', 'jung', 'behaviorism', 'cognitive', 'neuroscience', 'consciousness'],
  'Economics':    ['economics', 'market', 'capitalism', 'socialism', 'trade', 'currency', 'inflation', 'gdp', 'finance', 'investment', 'monetary', 'fiscal', 'supply', 'demand', 'microeconomics', 'macroeconomics'],
  'Nature':       ['nature', 'animal', 'plant', 'ecosystem', 'forest', 'ocean', 'mountain', 'river', 'species', 'habitat', 'biodiversity', 'climate', 'weather', 'geology', 'botany', 'zoology'],
  'Society':      ['society', 'culture', 'politics', 'government', 'democracy', 'law', 'justice', 'religion', 'sociology', 'anthropology', 'gender', 'race', 'identity', 'community', 'institution'],
};

export function classifyDomain(topic: string): string | null {
  const t = topic.toLowerCase();
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(k => t.includes(k))) return domain;
  }
  return null;
}

// ─── Achievements registry ────────────────────────────────────────────────────

export const ACHIEVEMENTS: CantoAchievement[] = [
  // Discovery
  { id: 'first_light',       title: 'First Light',          description: 'Generated your first article.',                                xpReward: 10 },
  { id: 'rabbit_hole',       title: 'Rabbit Hole Diver',    description: 'Generated 10 articles in a single session.',                   xpReward: 30 },
  { id: 'polymath',          title: 'Polymath',             description: 'Explored 5 different knowledge domains.',                      xpReward: 50 },
  { id: 'deep_diver',        title: 'Deep Diver',           description: 'Read 3 articles in Deep depth mode.',                          xpReward: 25 },
  // Library
  { id: 'archivist_10',      title: 'Archivist',            description: 'Saved 10 articles to your library.',                           xpReward: 20 },
  { id: 'archivist_50',      title: 'Grand Archivist',      description: 'Saved 50 articles to your library.',                           xpReward: 60 },
  // Streaks
  { id: 'streak_3',          title: '3 Days of Curiosity',  description: 'Maintained a 3-day reading streak.',                           xpReward: 15 },
  { id: 'streak_7',          title: '7 Days of Curiosity',  description: 'Maintained a 7-day reading streak.',                           xpReward: 40 },
  { id: 'streak_30',         title: 'Month of Wonder',      description: 'Maintained a 30-day reading streak.',                          xpReward: 150 },
  // Breadth
  { id: 'domain_3',          title: 'Renaissance Mind',     description: 'Explored 3 different knowledge domains.',                      xpReward: 20 },
  { id: 'domain_7',          title: 'Universal Scholar',    description: 'Explored 7 different knowledge domains.',                      xpReward: 75 },
  // Depth
  { id: 'deep_reader',       title: 'Deep Reader',          description: 'Read 5 articles with 800+ words.',                             xpReward: 30 },
  // Labs
  { id: 'labs_found',        title: 'Lab Discovered',       description: 'You found Canto Labs.',                                        xpReward: 15 },
  { id: 'labs_comparison',   title: 'Comparison Unlocked',  description: 'You found the Comparison tool in Canto Labs.',                 xpReward: 10 },
  // Secret / hidden
  { id: 'void_walker',       title: 'Void Walker',          description: 'Reached 1200 XP.',                                             xpReward: 0,  secret: true },
  { id: 'cosmic_sage',       title: 'Cosmic Sage',          description: 'Reached 6000 XP.',                                             xpReward: 0,  secret: true },
  { id: 'time_traveler',     title: 'Time Traveler',        description: 'Searched a topic with a year in the query.',                   xpReward: 20, secret: true },
  { id: 'obscure_seeker',    title: 'Obscure Seeker',       description: 'Searched a topic longer than 40 characters.',                  xpReward: 15, secret: true },
  { id: 'source_explorer',   title: 'Source Explorer',      description: 'Ran a fact-check that verified 3+ sources.',                   xpReward: 20 },
];

export function getAchievement(id: string): CantoAchievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// ─── XP events ────────────────────────────────────────────────────────────────

export type CodexEvent =
  | { type: 'article_generated'; topic: string; wordCount: number; depth: string }
  | { type: 'article_saved'; totalSaved: number }
  | { type: 'lab_discovered'; feature: string }
  | { type: 'fact_check_run'; verifiedSources: number }
  | { type: 'session_start' };

const XP_TABLE: Record<string, number> = {
  article_new_topic:   15,
  article_repeat:       5,
  article_deep:        10,
  article_long:         8, // wordCount > 800
  article_saved:        5,
  streak_day:          10,
  fact_check:           5,
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Process a Codex event, update XP/achievements, and persist.
 * Returns the updated state and any newly unlocked achievement ids.
 */
export async function processCodexEvent(event: CodexEvent): Promise<{ state: CantoCodexState; newlyUnlocked: string[] }> {
  const state = await dbGetCodex();
  const today = todayStr();
  const newlyUnlocked: string[] = [];

  let xpGain = 0;

  // ── Streak update ─────────────────────────────────────────────────────────
  if (event.type === 'article_generated' || event.type === 'session_start') {
    if (state.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (state.lastActiveDate === yStr) {
        state.streak += 1;
        xpGain += XP_TABLE.streak_day;
      } else if (state.lastActiveDate !== today) {
        state.streak = 1;
      }
      state.lastActiveDate = today;
      state.longestStreak = Math.max(state.longestStreak, state.streak);
    }
  }

  // ── Session reset ─────────────────────────────────────────────────────────
  if (state.sessionStartDate !== today) {
    state.sessionArticles = 0;
    state.sessionStartDate = today;
  }

  // ── Event-specific XP ─────────────────────────────────────────────────────
  if (event.type === 'article_generated') {
    const isNew = !state.topicsExplored.includes(event.topic.toLowerCase());
    xpGain += isNew ? XP_TABLE.article_new_topic : XP_TABLE.article_repeat;
    if (event.depth === 'Deep') xpGain += XP_TABLE.article_deep;
    if (event.wordCount > 800) xpGain += XP_TABLE.article_long;

    state.totalArticles += 1;
    state.sessionArticles += 1;
    state.totalReadingMinutes += Math.max(1, Math.round(event.wordCount / 200));
    if (event.wordCount > 800) state.deepReadCount += 1;
    if (isNew) state.topicsExplored = [...state.topicsExplored, event.topic.toLowerCase()];

    // Domain tracking
    const domain = classifyDomain(event.topic);
    if (domain && !state.domainsExplored.includes(domain)) {
      state.domainsExplored = [...state.domainsExplored, domain];
    }

    // Secret achievements
    if (/\b(18|19|20)\d{2}\b/.test(event.topic)) unlock('time_traveler');
    if (event.topic.length > 40) unlock('obscure_seeker');
  }

  if (event.type === 'article_saved') {
    xpGain += XP_TABLE.article_saved;
  }

  if (event.type === 'lab_discovered') {
    if (!state.labsDiscovered.includes(event.feature)) {
      state.labsDiscovered = [...state.labsDiscovered, event.feature];
      xpGain += 5;
      if (event.feature === 'labs') unlock('labs_found');
      if (event.feature === 'comparison') unlock('labs_comparison');
    }
  }

  if (event.type === 'fact_check_run') {
    xpGain += XP_TABLE.fact_check;
    if (event.verifiedSources >= 3) unlock('source_explorer');
  }

  // ── Apply XP ──────────────────────────────────────────────────────────────
  state.xp += xpGain;
  state.rank = getRankForXP(state.xp);

  // ── Achievement checks ────────────────────────────────────────────────────
  if (state.totalArticles === 1)                          unlock('first_light');
  if (state.sessionArticles >= 10)                        unlock('rabbit_hole');
  if (state.domainsExplored.length >= 3)                  unlock('domain_3');
  if (state.domainsExplored.length >= 5)                  unlock('polymath');
  if (state.domainsExplored.length >= 7)                  unlock('domain_7');
  if (state.deepReadCount >= 3)                           unlock('deep_diver');
  if (state.deepReadCount >= 5)                           unlock('deep_reader');
  if (state.streak >= 3)                                  unlock('streak_3');
  if (state.streak >= 7)                                  unlock('streak_7');
  if (state.streak >= 30)                                 unlock('streak_30');
  if (state.xp >= 1200)                                   unlock('void_walker');
  if (state.xp >= 6000)                                   unlock('cosmic_sage');

  // article_saved achievements use totalSaved from event
  if (event.type === 'article_saved') {
    if (event.totalSaved >= 10) unlock('archivist_10');
    if (event.totalSaved >= 50) unlock('archivist_50');
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  await dbSaveCodex(state);
  return { state, newlyUnlocked };

  function unlock(id: string) {
    if (!state.unlockedAchievements.includes(id)) {
      const ach = getAchievement(id);
      if (ach) {
        state.xp += ach.xpReward;
        state.rank = getRankForXP(state.xp);
      }
      state.unlockedAchievements = [...state.unlockedAchievements, id];
      state.newAchievements = [...state.newAchievements, id];
      newlyUnlocked.push(id);
    }
  }
}
