/**
 * Canto Long-Term Persistence Layer (IndexedDB)
 * v3 — adds folders, starred entries, analytics, full-text search index
 */

const DB_NAME = 'canto_db_v3';
const DB_VERSION = 2;

export interface CantoDBCacheEntry {
  topic: string;
  content: string;
  asciiArt: any;
  timestamp: number;
  summary?: string;
  wordCount?: number;
  folder?: string;
}

export interface CantoDBHistoryEntry {
  topic: string;
  timestamp: number;
  folder?: string;
  starred?: boolean;
  summary?: string;
  wordCount?: number;
  tokenEstimate?: number;
}

export interface CantoDBFavoriteEntry {
  topic: string;
  timestamp: number;
}

export interface CantoDBFolderEntry {
  id: string;
  name: string;
  createdAt: number;
  color?: string;
}

export interface CantoDBAnalyticsEntry {
  date: string; // YYYY-MM-DD
  searches: number;
  totalWords: number;
  totalTokens: number;
  topics: string[];
}

// ─── DB Init ─────────────────────────────────────────────────────────────────

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'topic' });
      }
      if (!db.objectStoreNames.contains('history')) {
        const hs = db.createObjectStore('history', { keyPath: 'topic' });
        hs.createIndex('folder', 'folder', { unique: false });
        hs.createIndex('starred', 'starred', { unique: false });
      }
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'topic' });
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('analytics')) {
        db.createObjectStore('analytics', { keyPath: 'date' });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

// ─── Cache Operations ────────────────────────────────────────────────────────

export async function dbSaveCache(topic: string, content: string, asciiArt: any, summary?: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    store.put({ topic: topic.toLowerCase().trim(), content, asciiArt, timestamp: Date.now(), summary, wordCount });
  } catch (e) {
    console.error('[DB Cache Save Failed]', e);
  }
}

export async function dbGetCache(topic: string): Promise<CantoDBCacheEntry | null> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    return new Promise((resolve) => {
      const req = store.get(topic.toLowerCase().trim());
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function dbDeleteCache(topic: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('cache', 'readwrite');
    tx.objectStore('cache').delete(topic.toLowerCase().trim());
  } catch {}
}

export async function dbSearchCache(query: string): Promise<CantoDBCacheEntry[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const q = query.toLowerCase();
        const results = (req.result || []).filter((e: CantoDBCacheEntry) =>
          e.topic.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
        );
        resolve(results);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ─── History Operations ──────────────────────────────────────────────────────

export async function dbSaveHistory(topic: string, meta?: { summary?: string; wordCount?: number; tokenEstimate?: number; folder?: string }): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    // Preserve existing starred status
    const existing: CantoDBHistoryEntry | undefined = await new Promise((res) => {
      const r = store.get(topic.trim());
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(undefined);
    });
    store.put({
      topic: topic.trim(),
      timestamp: Date.now(),
      starred: existing?.starred ?? false,
      folder: meta?.folder ?? existing?.folder,
      summary: meta?.summary ?? existing?.summary,
      wordCount: meta?.wordCount ?? existing?.wordCount,
      tokenEstimate: meta?.tokenEstimate ?? existing?.tokenEstimate,
    });
  } catch {}
}

export async function dbGetHistory(): Promise<string[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a: any, b: any) => b.timestamp - a.timestamp);
        resolve(sorted.map((item: any) => item.topic));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function dbGetHistoryFull(): Promise<CantoDBHistoryEntry[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a: any, b: any) => b.timestamp - a.timestamp);
        resolve(sorted);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function dbClearHistory(): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readwrite');
    tx.objectStore('history').clear();
  } catch {}
}

export async function dbStarEntry(topic: string, starred: boolean): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const existing: CantoDBHistoryEntry | undefined = await new Promise((res) => {
      const r = store.get(topic.trim());
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(undefined);
    });
    if (existing) {
      store.put({ ...existing, starred });
    }
  } catch {}
}

export async function dbMoveToFolder(topic: string, folderId: string | undefined): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const existing: CantoDBHistoryEntry | undefined = await new Promise((res) => {
      const r = store.get(topic.trim());
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(undefined);
    });
    if (existing) {
      store.put({ ...existing, folder: folderId });
    }
  } catch {}
}

export async function dbSearchHistory(query: string): Promise<CantoDBHistoryEntry[]> {
  try {
    const db = await initIndexedDB();

    // Load history and cache in parallel for cross-store semantic matching
    const [historyEntries, cacheEntries] = await Promise.all([
      new Promise<CantoDBHistoryEntry[]>((resolve) => {
        const tx = db.transaction('history', 'readonly');
        const req = tx.objectStore('history').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      }),
      new Promise<CantoDBCacheEntry[]>((resolve) => {
        try {
          const tx = db.transaction('cache', 'readonly');
          const req = tx.objectStore('cache').getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch { resolve([]); }
      }),
    ]);

    const q = query.toLowerCase().trim();
    if (!q) {
      return historyEntries.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Build a map of topic → cached content for full-text scoring
    const contentMap = new Map<string, string>();
    for (const c of cacheEntries) {
      contentMap.set(c.topic.toLowerCase().trim(), c.content || '');
    }

    // Tokenise query into meaningful words (≥2 chars, no stop words)
    const STOP = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','is','it','as','be','was','are','were','has','have','had','not','this','that','from','into','about','which','who','what','when','where','how']);
    const queryTokens = q.split(/\s+/).filter(w => w.length >= 2 && !STOP.has(w));

    const scored = historyEntries.map((entry) => {
      const topicLow = entry.topic.toLowerCase();
      const summaryLow = (entry.summary || '').toLowerCase();
      const cachedContent = contentMap.get(topicLow) || '';
      const contentLow = cachedContent.toLowerCase();

      let score = 0;

      // ── Exact matches (highest weight) ──────────────────────────────────
      if (topicLow === q) score += 500;
      if (topicLow.startsWith(q)) score += 200;
      if (topicLow.includes(q)) score += 100;
      if (summaryLow.includes(q)) score += 60;
      if (contentLow.includes(q)) score += 30;

      // ── Token-level scoring (TF-inspired) ───────────────────────────────
      for (const token of queryTokens) {
        if (topicLow.includes(token)) score += 40;
        if (summaryLow.includes(token)) score += 15;

        // Count occurrences in content (TF component, capped)
        if (contentLow) {
          let pos = 0, count = 0;
          while ((pos = contentLow.indexOf(token, pos)) !== -1 && count < 10) {
            count++;
            pos += token.length;
          }
          score += Math.min(count * 3, 30);
        }
      }

      // ── Semantic proximity: shared sub-words between query and topic ─────
      const topicWords = topicLow.split(/\s+/);
      for (const tw of topicWords) {
        for (const qt of queryTokens) {
          if (tw.length >= 4 && qt.length >= 4) {
            if (tw.includes(qt) || qt.includes(tw)) score += 25;
          }
        }
      }

      // ── Recency boost (decays over 30 days) ─────────────────────────────
      const ageDays = (Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24);
      if (score > 0) score += Math.max(0, 10 - ageDays / 3);

      // ── Starred boost ────────────────────────────────────────────────────
      if (entry.starred && score > 0) score += 20;

      return { entry, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || b.entry.timestamp - a.entry.timestamp)
      .map(s => s.entry);
  } catch {
    return [];
  }
}

// ─── Favorites Operations ────────────────────────────────────────────────────

export async function dbSaveFavorite(topic: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('favorites', 'readwrite');
    tx.objectStore('favorites').put({ topic: topic.trim(), timestamp: Date.now() });
  } catch {}
}

export async function dbRemoveFavorite(topic: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('favorites', 'readwrite');
    tx.objectStore('favorites').delete(topic.trim());
  } catch {}
}

export async function dbGetFavorites(): Promise<string[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []).map((item: any) => item.topic));
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ─── Folder Operations ───────────────────────────────────────────────────────

export async function dbCreateFolder(name: string, color?: string): Promise<CantoDBFolderEntry> {
  const folder: CantoDBFolderEntry = {
    id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    createdAt: Date.now(),
    color,
  };
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('folders', 'readwrite');
    tx.objectStore('folders').put(folder);
  } catch {}
  return folder;
}

export async function dbGetFolders(): Promise<CantoDBFolderEntry[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function dbDeleteFolder(id: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('folders', 'readwrite');
    tx.objectStore('folders').delete(id);
  } catch {}
}

// ─── Analytics Operations ────────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function dbRecordAnalytics(topic: string, wordCount: number, tokenEstimate: number): Promise<void> {
  try {
    const db = await initIndexedDB();
    const date = todayKey();
    const tx = db.transaction('analytics', 'readwrite');
    const store = tx.objectStore('analytics');
    const existing: CantoDBAnalyticsEntry | undefined = await new Promise((res) => {
      const r = store.get(date);
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(undefined);
    });
    const entry: CantoDBAnalyticsEntry = existing
      ? {
          ...existing,
          searches: existing.searches + 1,
          totalWords: existing.totalWords + wordCount,
          totalTokens: existing.totalTokens + tokenEstimate,
          topics: [...new Set([...existing.topics, topic])],
        }
      : { date, searches: 1, totalWords: wordCount, totalTokens: tokenEstimate, topics: [topic] };
    store.put(entry);
  } catch {}
}

export async function dbGetAnalytics(days = 7): Promise<CantoDBAnalyticsEntry[]> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('analytics', 'readonly');
    const store = tx.objectStore('analytics');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const all: CantoDBAnalyticsEntry[] = req.result || [];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const filtered = all
          .filter(e => new Date(e.date) >= cutoff)
          .sort((a, b) => a.date.localeCompare(b.date));
        resolve(filtered);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
