/**
 * Hybrid server + client rate limiter.
 *
 * Server-side: Tracks by IP address only — switching browsers does NOT reset credits.
 * Client-side: localStorage fallback if server is unreachable.
 * Limit: 20 searches per day per IP, resets at midnight.
 */

const STORAGE_KEY = 'canto_rl';
const DAILY_LIMIT = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Client-side fallback state ──────────────────────────────────────────────

interface RLState {
  date: string;
  count: number;
  limit: number;
}

function loadState(): RLState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RLState;
  } catch {
    return null;
  }
}

function saveState(state: RLState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Singleton init ───────────────────────────────────────────────────────────

let _initDone = false;

export function initRateLimit(): Promise<void> {
  if (_initDone) return Promise.resolve();
  _initDone = true;
  return Promise.resolve();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetsAt: string;
  timeUntilReset?: string; // e.g. "12h 30m"
}

/** Check whether the current user may perform another search (server-side IP check). */
export async function checkRateLimit(): Promise<RateLimitStatus> {
  const today = todayStr();

  // Calculate time until midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeUntilReset = `${hours}h ${minutes}m`;

  // Try server-side IP-based check
  try {
    const serverRes = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      
      // Sync local state ONLY if server provides a real count
      if (data.remaining !== null && data.remaining !== undefined) {
        const count = (data.limit ?? DAILY_LIMIT) - (data.remaining ?? DAILY_LIMIT);
        saveState({ date: today, count, limit: data.limit ?? DAILY_LIMIT });
        return {
          allowed: data.allowed,
          remaining: data.remaining,
          limit: data.limit ?? DAILY_LIMIT,
          resetsAt: 'midnight tonight',
          timeUntilReset
        };
      }
      
      // If server returns null count (stateless mode), use local state but respect server's 'allowed' flag
      const localState = loadState();
      const localCount = (localState && localState.date === today) ? localState.count : 0;
      const remaining = Math.max(0, DAILY_LIMIT - localCount);
      
      return {
        allowed: data.allowed && remaining > 0,
        remaining,
        limit: DAILY_LIMIT,
        resetsAt: 'midnight tonight',
        timeUntilReset
      };
    }
  } catch {
    // Server unreachable — use client fallback
  }

  const state = loadState();

  if (!state || state.date !== today) {
    saveState({ date: today, count: 0, limit: DAILY_LIMIT });
    return { allowed: true, remaining: DAILY_LIMIT, limit: DAILY_LIMIT, resetsAt: 'midnight tonight', timeUntilReset };
  }

  const remaining = Math.max(0, DAILY_LIMIT - state.count);
  return { allowed: remaining > 0, remaining, limit: DAILY_LIMIT, resetsAt: 'midnight tonight', timeUntilReset };
}

/** Record one search. */
export async function recordSearch(): Promise<void> {
  // Record on server (IP-keyed)
  try {
    await fetch('/api/rate-limit-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch {}

  // Also record client-side
  const today = todayStr();
  const state = loadState();
  if (!state || state.date !== today) {
    saveState({ date: today, count: 1, limit: DAILY_LIMIT });
  } else {
    saveState({ ...state, count: state.count + 1 });
  }
}

/** Returns remaining searches for today. */
export async function getRemainingSearches(): Promise<{ remaining: number; limit: number }> {
  const status = await checkRateLimit();
  return { remaining: status.remaining, limit: status.limit };
}
