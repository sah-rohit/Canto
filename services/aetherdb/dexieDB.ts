/**
 * AetherDB — Layer 1: Dexie.js IndexedDB Cache
 * Fast working cache. All reads/writes go here first.
 * This is the hot path — target <2ms reads, <5ms writes.
 */

import Dexie, { type Table } from 'dexie';
import type {
  CantoDBCacheEntry,
  CantoDBHistoryEntry,
  CantoDBFavoriteEntry,
  CantoDBFolderEntry,
  CantoDBAnalyticsEntry,
  CantoCodexState,
  AetherTrashEntry,
  AetherWriteOp,
  AetherSnapshot,
} from './types';

// ─── Settings / misc store entries ───────────────────────────────────────────

export interface SettingsEntry {
  key: string;
  value: any;
  updatedAt: number;
}

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface GraphEntry {
  topic: string;
  nodes: any[];
  savedAt: number;
}

export interface ArtHistoryEntry {
  topic: string;
  art: string;
  savedAt: number;
}

export interface CollectionEntry {
  id: string;
  name: string;
  topics: string[];
  createdAt: number;
}

// ─── Dexie Database ───────────────────────────────────────────────────────────

class AetherDexie extends Dexie {
  cache!: Table<CantoDBCacheEntry, string>;
  history!: Table<CantoDBHistoryEntry, string>;
  favorites!: Table<CantoDBFavoriteEntry, string>;
  folders!: Table<CantoDBFolderEntry, string>;
  analytics!: Table<CantoDBAnalyticsEntry, string>;
  codex!: Table<CantoCodexState, string>;
  notes!: Table<NoteEntry, string>;
  graphs!: Table<GraphEntry, string>;
  artHistory!: Table<ArtHistoryEntry, string>;
  collections!: Table<CollectionEntry, string>;
  settings!: Table<SettingsEntry, string>;
  trash!: Table<AetherTrashEntry, string>;
  writeQueue!: Table<AetherWriteOp, string>;
  snapshots!: Table<AetherSnapshot, string>;

  constructor() {
    super('aetherdb_v1');

    this.version(1).stores({
      cache:       'topic, timestamp, folder',
      history:     'topic, timestamp, folder, starred',
      favorites:   'topic, timestamp',
      folders:     'id, createdAt',
      analytics:   'date',
      codex:       'id',
      notes:       'id, timestamp',
      graphs:      'topic, savedAt',
      artHistory:  'topic, savedAt',
      collections: 'id, createdAt',
      settings:    'key, updatedAt',
      trash:       'id, store, deletedAt, expiresAt',
      writeQueue:  'id, timestamp, store',
      snapshots:   'id, timestamp',
    });
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _db: AetherDexie | null = null;

export function getDB(): AetherDexie {
  if (!_db) _db = new AetherDexie();
  return _db;
}

// ─── Health check ─────────────────────────────────────────────────────────────

export async function checkDBHealth(): Promise<boolean> {
  try {
    const db = getDB();
    await db.settings.get('__health_check__');
    return true;
  } catch {
    return false;
  }
}

// ─── Estimate IndexedDB usage ─────────────────────────────────────────────────

export async function estimateIndexedDBSize(): Promise<number> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const est = await navigator.storage.estimate();
      return est.usage ?? 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// ─── Count all records ────────────────────────────────────────────────────────

export async function countAllRecords(): Promise<Record<string, number>> {
  const db = getDB();
  const [cache, history, favorites, folders, analytics, codex, notes, graphs, artHistory, collections, trash] =
    await Promise.all([
      db.cache.count(),
      db.history.count(),
      db.favorites.count(),
      db.folders.count(),
      db.analytics.count(),
      db.codex.count(),
      db.notes.count(),
      db.graphs.count(),
      db.artHistory.count(),
      db.collections.count(),
      db.trash.count(),
    ]);
  return { cache, history, favorites, folders, analytics, codex, notes, graphs, artHistory, collections, trash };
}

// ─── Bulk export all stores ───────────────────────────────────────────────────

export async function exportAllStores(): Promise<Record<string, any[]>> {
  const db = getDB();
  const [cache, history, favorites, folders, analytics, codex, notes, graphs, artHistory, collections, settings] =
    await Promise.all([
      db.cache.toArray(),
      db.history.toArray(),
      db.favorites.toArray(),
      db.folders.toArray(),
      db.analytics.toArray(),
      db.codex.toArray(),
      db.notes.toArray(),
      db.graphs.toArray(),
      db.artHistory.toArray(),
      db.collections.toArray(),
      db.settings.toArray(),
    ]);
  return { cache, history, favorites, folders, analytics, codex, notes, graphs, artHistory, collections, settings };
}

// ─── Bulk import all stores ───────────────────────────────────────────────────

export async function importAllStores(data: Record<string, any[]>): Promise<void> {
  const db = getDB();
  await db.transaction('rw',
    db.cache, db.history, db.favorites, db.folders,
    db.analytics, db.codex, db.notes, db.graphs,
    db.artHistory, db.collections, db.settings,
    async () => {
      if (data.cache?.length)       await db.cache.bulkPut(data.cache);
      if (data.history?.length)     await db.history.bulkPut(data.history);
      if (data.favorites?.length)   await db.favorites.bulkPut(data.favorites);
      if (data.folders?.length)     await db.folders.bulkPut(data.folders);
      if (data.analytics?.length)   await db.analytics.bulkPut(data.analytics);
      if (data.codex?.length)       await db.codex.bulkPut(data.codex);
      if (data.notes?.length)       await db.notes.bulkPut(data.notes);
      if (data.graphs?.length)      await db.graphs.bulkPut(data.graphs);
      if (data.artHistory?.length)  await db.artHistory.bulkPut(data.artHistory);
      if (data.collections?.length) await db.collections.bulkPut(data.collections);
      if (data.settings?.length)    await db.settings.bulkPut(data.settings);
    }
  );
}

// ─── Clear all stores (for fresh start) ──────────────────────────────────────

export async function clearAllStores(): Promise<void> {
  const db = getDB();
  await db.transaction('rw',
    db.cache, db.history, db.favorites, db.folders,
    db.analytics, db.codex, db.notes, db.graphs,
    db.artHistory, db.collections, db.settings,
    db.trash, db.writeQueue, db.snapshots,
    async () => {
      await Promise.all([
        db.cache.clear(), db.history.clear(), db.favorites.clear(),
        db.folders.clear(), db.analytics.clear(), db.codex.clear(),
        db.notes.clear(), db.graphs.clear(), db.artHistory.clear(),
        db.collections.clear(), db.settings.clear(),
        db.trash.clear(), db.writeQueue.clear(), db.snapshots.clear(),
      ]);
    }
  );
}
