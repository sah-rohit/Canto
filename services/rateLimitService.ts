/**
 * Client-side daily rate limiter.
 *
 * Strategy:
 *  - Build a stable browser fingerprint from non-PII signals (no external requests).
 *  - Hash it with SHA-256 before storing — raw fingerprint never persisted.
 *  - Store { fpHash, date, count, limit } in localStorage.
 *  - Allow 10–20 searches per fingerprint per calendar day (resets at 00:00 local).
 *  - Randomised daily limit makes automated circumvention harder.
 *
 * Why no IP lookup:
 *  - IP lookup services are blocked by tracking-prevention in Edge/Safari/Firefox.
 *  - They add latency and can fail due to CORS or rate limits.
 *  - A browser fingerprint is sufficient for casual abuse prevention.
 */

const STORAGE_KEY = 'canto_rl';
const DAILY_LIMIT_MIN = 10;
const DAILY_LIMIT_MAX = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns today's date string in YYYY-MM-DD (local time). */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** SHA-256 hash → hex. Falls back to djb2 if SubtleCrypto unavailable. */
async function hashString(s: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // SubtleCrypto may throw in non-secure contexts — fall through
    }
  }
  // djb2 fallback
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

/**
 * Build a stable, non-PII browser fingerprint from passive signals.
 * No network requests — works offline and behind tracking prevention.
 */
function buildFingerprint(): string {
  const parts: string[] = [
    navigator.language ?? '',
    navigator.platform ?? '',
    String(navigator.hardwareConcurrency ?? 0),
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth ?? 0),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    String(new Date().getTimezoneOffset()),
  ];

  // Canvas fingerprint (silent fail if blocked)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Canto🌙', 2, 2);
      parts.push(canvas.toDataURL().slice(-32));
    }
  } catch {
    parts.push('no-canvas');
  }

  return parts.join('|');
}

// ─── Stored state ─────────────────────────────────────────────────────────────

interface RLState {
  fpHash: string;
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
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ─── Singleton init ───────────────────────────────────────────────────────────

let _fpHashCache: string | null = null;
let _initPromise: Promise<void> | null = null;

/** Initialise once — safe to call multiple times (returns same promise). */
export function initRateLimit(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    try {
      const fp = buildFingerprint();
      _fpHashCache = await hashString(fp);
    } catch {
      _fpHashCache = 'fallback-' + Math.random().toString(36).slice(2);
    }
  })();
  return _initPromise;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetsAt: string;
}

/** Check whether the current user may perform another search. */
export async function checkRateLimit(): Promise<RateLimitStatus> {
  await initRateLimit();
  const fpHash = _fpHashCache!;
  const today = todayStr();
  const state = loadState();

  // Determine the daily limit — reuse existing if same day+fingerprint
  const dailyLimit =
    state && state.date === today && state.fpHash === fpHash
      ? state.limit
      : Math.floor(Math.random() * (DAILY_LIMIT_MAX - DAILY_LIMIT_MIN + 1)) + DAILY_LIMIT_MIN;

  if (!state || state.date !== today || state.fpHash !== fpHash) {
    const fresh: RLState = { fpHash, date: today, count: 0, limit: dailyLimit };
    saveState(fresh);
    return { allowed: true, remaining: dailyLimit, limit: dailyLimit, resetsAt: 'midnight tonight' };
  }

  const remaining = Math.max(0, state.limit - state.count);
  return { allowed: remaining > 0, remaining, limit: state.limit, resetsAt: 'midnight tonight' };
}

/** Record one search. Call after a search is confirmed to start. */
export async function recordSearch(): Promise<void> {
  await initRateLimit();
  const fpHash = _fpHashCache!;
  const today = todayStr();
  const state = loadState();

  if (!state || state.date !== today || state.fpHash !== fpHash) {
    const limit = Math.floor(Math.random() * (DAILY_LIMIT_MAX - DAILY_LIMIT_MIN + 1)) + DAILY_LIMIT_MIN;
    saveState({ fpHash, date: today, count: 1, limit });
  } else {
    saveState({ ...state, count: state.count + 1 });
  }
}

/** Returns remaining searches for today (for UI display). */
export async function getRemainingSearches(): Promise<{ remaining: number; limit: number }> {
  const status = await checkRateLimit();
  return { remaining: status.remaining, limit: status.limit };
}
