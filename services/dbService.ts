/**
 * Canto Long-Term Persistence Layer (IndexedDB)
 * Avoids data loss compared to localStorage.
 */

const DB_NAME = 'canto_db_v2';
const DB_VERSION = 1;

export interface CantoDBCacheEntry {
  topic: string;
  content: string;
  asciiArt: any;
  timestamp: number;
}

export interface CantoDBHistoryEntry {
  topic: string;
  timestamp: number;
}

export interface CantoDBFavoriteEntry {
  topic: string;
  timestamp: number;
}

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'topic' });
      }
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'topic' });
      }
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'topic' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

// ─── Cache Operations ────────────────────────────────────────────────────────
export async function dbSaveCache(topic: string, content: string, asciiArt: any): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    await store.put({
      topic: topic.toLowerCase().trim(),
      content,
      asciiArt,
      timestamp: Date.now()
    });
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
    const store = tx.objectStore('cache');
    await store.delete(topic.toLowerCase().trim());
  } catch {}
}

// ─── History Operations ──────────────────────────────────────────────────────
export async function dbSaveHistory(topic: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    await store.put({
      topic: topic.trim(),
      timestamp: Date.now()
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

export async function dbClearHistory(): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    await store.clear();
  } catch {}
}

// ─── Favorites Operations ───────────────────────────────────────────────────
export async function dbSaveFavorite(topic: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('favorites', 'readwrite');
    const store = tx.objectStore('favorites');
    await store.put({
      topic: topic.trim(),
      timestamp: Date.now()
    });
  } catch {}
}

export async function dbRemoveFavorite(topic: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('favorites', 'readwrite');
    const store = tx.objectStore('favorites');
    await store.delete(topic.trim());
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
