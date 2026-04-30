/**
 * Client + Server hybrid rate limiter.
 *
 * Strategy:
 *  - Build a stable browser fingerprint from non-PII signals (no external requests).
 *  - Hash it with SHA-256 before sending — raw fingerprint never leaves the client.
 *  - Send fingerprint hash to server along with each rate-limit check.
 *  - Server tracks limits by IP + fingerprint hash combo.
 *  - This prevents abuse across browsers on the same device (same IP, different fp)
 *    AND across devices on same network (same IP, same fp won't exist).
 *  - Falls back to client-only localStorage if server is unreachable.
 */

const STORAGE_KEY = 'canto_rl';
const DAILY_LIMIT = 30;

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
 * Includes extra entropy to differentiate browsers on same device.
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
    navigator.userAgent ?? '',
    String((navigator as any).deviceMemory ?? 0),
    String(navigator.maxTouchPoints ?? 0),
  ];

  // WebGL renderer fingerprint (differs across GPU drivers)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const ext = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        parts.push((gl as any).getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '');
      }
    }
  } catch {
    parts.push('no-webgl');
  }

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

// ─── Stored state (client-side fallback) ──────────────────────────────────────

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

/** Check whether the current user may perform another search (server-side). */
export async function checkRateLimit(): Promise<RateLimitStatus> {
  await initRateLimit();
  const fpHash = _fpHashCache!;

  // Try server-side check first
  try {
    const serverRes = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fpHash }),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      // Sync client-side state with server
      const today = todayStr();
      const clientCount = DAILY_LIMIT - (data.remaining ?? DAILY_LIMIT);
      saveState({ fpHash, date: today, count: clientCount, limit: data.limit ?? DAILY_LIMIT });
      return {
        allowed: data.allowed,
        remaining: data.remaining,
        limit: data.limit ?? DAILY_LIMIT,
        resetsAt: 'midnight tonight',
      };
    }
  } catch {
    // Server unreachable — fall back to client-only
  }

  // Client-only fallback
  const today = todayStr();
  const state = loadState();
  const dailyLimit = DAILY_LIMIT;

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

  // Record on server
  try {
    await fetch('/api/rate-limit-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fpHash }),
    });
  } catch {
    // Silent — fallback to client
  }

  // Also record client-side
  const today = todayStr();
  const state = loadState();

  if (!state || state.date !== today || state.fpHash !== fpHash) {
    saveState({ fpHash, date: today, count: 1, limit: DAILY_LIMIT });
  } else {
    saveState({ ...state, count: state.count + 1 });
  }
}

/** Returns remaining searches for today (for UI display). */
export async function getRemainingSearches(): Promise<{ remaining: number; limit: number }> {
  const status = await checkRateLimit();
  return { remaining: status.remaining, limit: status.limit };
}
