/**
 * AetherDB — Core API
 * Drop-in replacement for services/dbService.ts.
 * Exact same function signatures — zero changes needed in App.tsx or any component.
 *
 * Write path: Dexie (immediate) → queue flush to OPFS + FS Access (2s debounce)
 * Read path:  Dexie only (<2ms) — disk is backup, not hot path
 */

import { getDB } from './dexieDB';
import { queueFlush, logWriteOp } from './writeQueue';
import { moveToTrash } from './safety';
import type {
  CantoDBCacheEntry,
  CantoDBHistoryEntry,
  CantoDBFavoriteEntry,
  CantoDBFolderEntry,
  CantoDBAnalyticsEntry,
  CantoCodexState,
  AetherStore,
} from './types';

// ─── Re-export types (backward compat) ───────────────────────────────────────

export type {
  CantoDBCacheEntry,
  CantoDBHistoryEntry,
  CantoDBFavoriteEntry,
  CantoDBFolderEntry,
  CantoDBAnalyticsEntry,
  CantoCodexState,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function write(store: AetherStore, key: string, data: any, op: 'put' | 'delete' = 'put'): Promise<void> {
  await logWriteOp(store, key, data, op);
  queueFlush(store);
}

// ─── Cache Operations ─────────────────────────────────────────────────────────

export async function dbSaveCache(
  topic: string,
  content: string,
  asciiArt: any,
  summary?: string
): Promise<void> {
  try {
    const db = getDB();
    const key = topic.toLowerCase().trim();
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const entry: CantoDBCacheEntry = {
      topic: key,
      content,
      asciiArt,
      timestamp: Date.now(),
      summary,
      wordCount,
    };
    await db.cache.put(entry);
    await write('cache', key, entry);
  } catch (e) {
    console.error('[AetherDB] Cache save failed:', e);
  }
}

export async function dbGetCache(topic: string): Promise<CantoDBCacheEntry | null> {
  try {
    const db = getDB();
    return (await db.cache.get(topic.toLowerCase().trim())) ?? null;
  } catch {
    return null;
  }
}

export async function dbDeleteCache(topic: string): Promise<void> {
  try {
    const db = getDB();
    const key = topic.toLowerCase().trim();
    const existing = await db.cache.get(key);
    if (existing) await moveToTrash('cache', key, existing);
    await db.cache.delete(key);
    await write('cache', key, null, 'delete');
  } catch {}
}

export async function dbSearchCache(query: string): Promise<CantoDBCacheEntry[]> {
  try {
    const db = getDB();
    const q = query.toLowerCase();
    return db.cache.filter(e =>
      e.topic.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
    ).toArray();
  } catch {
    return [];
  }
}

// ─── History Operations ───────────────────────────────────────────────────────

export async function dbSaveHistory(
  topic: string,
  meta?: { summary?: string; wordCount?: number; tokenEstimate?: number; folder?: string }
): Promise<void> {
  try {
    const db = getDB();
    const key = topic.trim();
    const existing = await db.history.get(key);
    const entry: CantoDBHistoryEntry = {
      topic: key,
      timestamp: Date.now(),
      starred: existing?.starred ?? false,
      folder: meta?.folder ?? existing?.folder,
      summary: meta?.summary ?? existing?.summary,
      wordCount: meta?.wordCount ?? existing?.wordCount,
      tokenEstimate: meta?.tokenEstimate ?? existing?.tokenEstimate,
    };
    await db.history.put(entry);
    await write('history', key, entry);
  } catch {}
}

export async function dbGetHistory(): Promise<string[]> {
  try {
    const db = getDB();
    const all = await db.history.orderBy('timestamp').reverse().toArray();
    return all.map(e => e.topic);
  } catch {
    return [];
  }
}

export async function dbGetHistoryFull(): Promise<CantoDBHistoryEntry[]> {
  try {
    const db = getDB();
    return db.history.orderBy('timestamp').reverse().toArray();
  } catch {
    return [];
  }
}

export async function dbClearHistory(): Promise<void> {
  try {
    const db = getDB();
    const all = await db.history.toArray();
    // Move all to trash before clearing
    for (const entry of all) {
      await moveToTrash('history', entry.topic, entry);
    }
    await db.history.clear();
    queueFlush('history');
  } catch {}
}

export async function dbStarEntry(topic: string, starred: boolean): Promise<void> {
  try {
    const db = getDB();
    const key = topic.trim();
    const existing = await db.history.get(key);
    if (existing) {
      const updated = { ...existing, starred };
      await db.history.put(updated);
      await write('history', key, updated);
    }
  } catch {}
}

export async function dbMoveToFolder(topic: string, folderId: string | undefined): Promise<void> {
  try {
    const db = getDB();
    const key = topic.trim();
    const existing = await db.history.get(key);
    if (existing) {
      const updated = { ...existing, folder: folderId };
      await db.history.put(updated);
      await write('history', key, updated);
    }
  } catch {}
}

export async function dbSearchHistory(query: string): Promise<CantoDBHistoryEntry[]> {
  try {
    const db = getDB();
    const [historyEntries, cacheEntries] = await Promise.all([
      db.history.toArray(),
      db.cache.toArray(),
    ]);

    const q = query.toLowerCase().trim();
    if (!q) return historyEntries.sort((a, b) => b.timestamp - a.timestamp);

    const contentMap = new Map<string, string>();
    for (const c of cacheEntries) {
      contentMap.set(c.topic.toLowerCase().trim(), c.content || '');
    }

    const STOP = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','is','it','as','be','was','are','were','has','have','had','not','this','that','from','into','about','which','who','what','when','where','how']);
    const queryTokens = q.split(/\s+/).filter(w => w.length >= 2 && !STOP.has(w));

    const scored = historyEntries.map(entry => {
      const topicLow = entry.topic.toLowerCase();
      const summaryLow = (entry.summary || '').toLowerCase();
      const contentLow = (contentMap.get(topicLow) || '').toLowerCase();
      let score = 0;

      if (topicLow === q) score += 500;
      if (topicLow.startsWith(q)) score += 200;
      if (topicLow.includes(q)) score += 100;
      if (summaryLow.includes(q)) score += 60;
      if (contentLow.includes(q)) score += 30;

      for (const token of queryTokens) {
        if (topicLow.includes(token)) score += 40;
        if (summaryLow.includes(token)) score += 15;
        if (contentLow) {
          let pos = 0, count = 0;
          while ((pos = contentLow.indexOf(token, pos)) !== -1 && count < 10) { count++; pos += token.length; }
          score += Math.min(count * 3, 30);
        }
      }

      const topicWords = topicLow.split(/\s+/);
      for (const tw of topicWords) {
        for (const qt of queryTokens) {
          if (tw.length >= 4 && qt.length >= 4 && (tw.includes(qt) || qt.includes(tw))) score += 25;
        }
      }

      const ageDays = (Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24);
      if (score > 0) score += Math.max(0, 10 - ageDays / 3);
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

// ─── Favorites Operations ─────────────────────────────────────────────────────

export async function dbSaveFavorite(topic: string): Promise<void> {
  try {
    const db = getDB();
    const key = topic.trim();
    const entry: CantoDBFavoriteEntry = { topic: key, timestamp: Date.now() };
    await db.favorites.put(entry);
    await write('favorites', key, entry);
  } catch {}
}

export async function dbRemoveFavorite(topic: string): Promise<void> {
  try {
    const db = getDB();
    const key = topic.trim();
    const existing = await db.favorites.get(key);
    if (existing) await moveToTrash('favorites', key, existing);
    await db.favorites.delete(key);
    await write('favorites', key, null, 'delete');
  } catch {}
}

export async function dbGetFavorites(): Promise<string[]> {
  try {
    const db = getDB();
    const all = await db.favorites.toArray();
    return all.map(e => e.topic);
  } catch {
    return [];
  }
}

// ─── Folder Operations ────────────────────────────────────────────────────────

export async function dbCreateFolder(name: string, color?: string): Promise<CantoDBFolderEntry> {
  const folder: CantoDBFolderEntry = {
    id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    createdAt: Date.now(),
    color,
  };
  try {
    const db = getDB();
    await db.folders.put(folder);
    await write('folders', folder.id, folder);
  } catch {}
  return folder;
}

export async function dbGetFolders(): Promise<CantoDBFolderEntry[]> {
  try {
    const db = getDB();
    return db.folders.toArray();
  } catch {
    return [];
  }
}

export async function dbDeleteFolder(id: string): Promise<void> {
  try {
    const db = getDB();
    const existing = await db.folders.get(id);
    if (existing) await moveToTrash('folders', id, existing);
    await db.folders.delete(id);
    await write('folders', id, null, 'delete');
  } catch {}
}

// ─── Analytics Operations ─────────────────────────────────────────────────────

export async function dbRecordAnalytics(
  topic: string,
  wordCount: number,
  tokenEstimate: number
): Promise<void> {
  try {
    const db = getDB();
    const date = todayKey();
    const existing = await db.analytics.get(date);
    const entry: CantoDBAnalyticsEntry = existing
      ? {
          ...existing,
          searches: existing.searches + 1,
          totalWords: existing.totalWords + wordCount,
          totalTokens: existing.totalTokens + tokenEstimate,
          topics: [...new Set([...existing.topics, topic])],
        }
      : { date, searches: 1, totalWords: wordCount, totalTokens: tokenEstimate, topics: [topic] };
    await db.analytics.put(entry);
    await write('analytics', date, entry);
  } catch {}
}

export async function dbGetAnalytics(days = 7): Promise<CantoDBAnalyticsEntry[]> {
  try {
    const db = getDB();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const all = await db.analytics.toArray();
    return all
      .filter(e => new Date(e.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

// ─── Codex Operations ─────────────────────────────────────────────────────────

const CODEX_DEFAULT: CantoCodexState = {
  id: 'singleton',
  xp: 0,
  rank: 'Novice Scholar',
  streak: 0,
  lastActiveDate: '',
  longestStreak: 0,
  totalArticles: 0,
  totalReadingMinutes: 0,
  domainsExplored: [],
  topicsExplored: [],
  deepReadCount: 0,
  sessionArticles: 0,
  sessionStartDate: '',
  unlockedAchievements: [],
  newAchievements: [],
  labsDiscovered: [],
};

export async function dbGetCodex(): Promise<CantoCodexState> {
  try {
    const db = getDB();
    return (await db.codex.get('singleton')) ?? { ...CODEX_DEFAULT };
  } catch {
    return { ...CODEX_DEFAULT };
  }
}

export async function dbSaveCodex(state: CantoCodexState): Promise<void> {
  try {
    const db = getDB();
    await db.codex.put(state);
    await write('codex', 'singleton', state);
  } catch {}
}

export async function dbMarkAchievementsSeen(): Promise<void> {
  try {
    const state = await dbGetCodex();
    await dbSaveCodex({ ...state, newAchievements: [] });
  } catch {}
}

// ─── Notes Operations (localStorage → AetherDB) ───────────────────────────────

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export async function dbGetNotes(): Promise<NoteEntry[]> {
  try {
    const db = getDB();
    return db.notes.orderBy('timestamp').reverse().toArray();
  } catch {
    return [];
  }
}

export async function dbSaveNote(note: NoteEntry): Promise<void> {
  try {
    const db = getDB();
    await db.notes.put(note);
    await write('notes', note.id, note);
  } catch {}
}

export async function dbDeleteNote(id: string): Promise<void> {
  try {
    const db = getDB();
    const existing = await db.notes.get(id);
    if (existing) await moveToTrash('notes', id, existing);
    await db.notes.delete(id);
    await write('notes', id, null, 'delete');
  } catch {}
}

// ─── Graphs (CantoLabs) ───────────────────────────────────────────────────────

export async function dbGetGraphs(): Promise<{ topic: string; nodes: any[]; savedAt: number }[]> {
  try {
    const db = getDB();
    return db.graphs.toArray();
  } catch {
    return [];
  }
}

export async function dbSaveGraph(topic: string, nodes: any[]): Promise<void> {
  try {
    const db = getDB();
    const entry = { topic, nodes, savedAt: Date.now() };
    await db.graphs.put(entry);
    await write('graphs', topic, entry);
  } catch {}
}

// ─── Art History ──────────────────────────────────────────────────────────────

export async function dbGetArtHistory(): Promise<{ topic: string; art: string; savedAt: number }[]> {
  try {
    const db = getDB();
    return db.artHistory.orderBy('savedAt').reverse().toArray();
  } catch {
    return [];
  }
}

export async function dbSaveArtHistory(topic: string, art: string): Promise<void> {
  try {
    const db = getDB();
    const entry = { topic, art, savedAt: Date.now() };
    await db.artHistory.put(entry);
    await write('artHistory', topic, entry);
  } catch {}
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function dbGetCollections(): Promise<{ id: string; name: string; topics: string[]; createdAt: number }[]> {
  try {
    const db = getDB();
    return db.collections.toArray();
  } catch {
    return [];
  }
}

export async function dbSaveCollection(col: { id: string; name: string; topics: string[]; createdAt: number }): Promise<void> {
  try {
    const db = getDB();
    await db.collections.put(col);
    await write('collections', col.id, col);
  } catch {}
}

// ─── Settings (replaces localStorage for theme, dyslexic, sound, etc.) ────────

export async function dbGetSetting<T = any>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = getDB();
    const entry = await db.settings.get(key);
    return entry !== undefined ? (entry.value as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function dbSetSetting(key: string, value: any): Promise<void> {
  try {
    const db = getDB();
    const entry = { key, value, updatedAt: Date.now() };
    await db.settings.put(entry);
    await write('settings', key, entry);
    // Mirror to localStorage for instant sync (theme, dyslexic, etc.)
    try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch {}
  } catch {}
}

// ─── Migrate from localStorage ────────────────────────────────────────────────

export async function migrateFromLocalStorage(): Promise<void> {
  const db = getDB();

  // Only migrate if Dexie is empty
  const historyCount = await db.history.count();
  if (historyCount > 0) return;

  try {
    // History
    const savedHistory = localStorage.getItem('canto_history');
    if (savedHistory) {
      const topics: string[] = JSON.parse(savedHistory);
      for (const topic of topics) {
        await db.history.put({ topic: topic.trim(), timestamp: Date.now(), starred: false });
      }
    }

    // Favorites
    const savedFavs = localStorage.getItem('canto_favs');
    if (savedFavs) {
      const favs: string[] = JSON.parse(savedFavs);
      for (const topic of favs) {
        await db.favorites.put({ topic: topic.trim(), timestamp: Date.now() });
      }
    }

    // Notes
    const savedNotes = localStorage.getItem('canto_notes');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      for (const note of notes) {
        await db.notes.put(note);
      }
    }

    // Graphs
    const savedGraphs = localStorage.getItem('canto_saved_graphs');
    if (savedGraphs) {
      const graphs = JSON.parse(savedGraphs);
      for (const g of graphs) {
        await db.graphs.put({ ...g, savedAt: Date.now() });
      }
    }

    // Art history
    const savedArt = localStorage.getItem('canto_art_history');
    if (savedArt) {
      const arts = JSON.parse(savedArt);
      for (const a of arts) {
        await db.artHistory.put({ ...a, savedAt: Date.now() });
      }
    }

    // Collections
    const savedCols = localStorage.getItem('canto_collections');
    if (savedCols) {
      const cols = JSON.parse(savedCols);
      if (typeof cols === 'object' && !Array.isArray(cols)) {
        for (const [id, col] of Object.entries(cols)) {
          await db.collections.put({ id, ...(col as any), createdAt: Date.now() });
        }
      }
    }

    // Settings
    const theme = localStorage.getItem('canto_theme');
    if (theme) await db.settings.put({ key: 'canto_theme', value: theme, updatedAt: Date.now() });

    const dyslexic = localStorage.getItem('canto_dyslexic');
    if (dyslexic) await db.settings.put({ key: 'canto_dyslexic', value: dyslexic === 'true', updatedAt: Date.now() });

    const sound = localStorage.getItem('canto_sound');
    if (sound) await db.settings.put({ key: 'canto_sound', value: sound, updatedAt: Date.now() });

    console.log('[AetherDB] Migrated from localStorage');
  } catch (e) {
    console.warn('[AetherDB] Migration error:', e);
  }
}
