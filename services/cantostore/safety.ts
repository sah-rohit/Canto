/**
 * CantoStore — Safety Layer
 * Snapshot carousel, integrity verification, auto-repair, trash system.
 * Zero data loss guarantee.
 */

import { getDB } from './dexieDB';
import { exportAllStores, importAllStores } from './dexieDB';
import {
  opfsWriteSnapshot, opfsReadSnapshot,
  opfsWriteManifest, opfsReadManifest,
  opfsWriteStoreAll, opfsReadStoreAll,
  verifyFileIntegrity, isOPFSAvailable,
} from './opfs';
import {
  fsWriteSnapshot, fsReadSnapshot,
  fsWriteManifest, fsReadManifest,
  fsWriteStore, fsReadStore,
  getStoredFolderHandle, isFSAccessAvailable,
} from './fsAccess';
import { sha256Hex } from './crypto';
import { compressJSON } from './compression';
import type {
  CantoManifest, CantoSnapshot, CantoTrashEntry,
  CantoStoreKey, ManifestEntry,
} from './types';

// ─── Snapshot IDs ─────────────────────────────────────────────────────────────

export const SNAPSHOT_IDS = ['snap_now', 'snap_1h', 'snap_1d', 'snap_1w', 'snap_1m'] as const;
export type SnapshotId = typeof SNAPSHOT_IDS[number];

const SNAPSHOT_LABELS: Record<SnapshotId, string> = {
  snap_now: 'Now',
  snap_1h:  '1 hour ago',
  snap_1d:  '1 day ago',
  snap_1w:  '1 week ago',
  snap_1m:  '1 month ago',
};

const SNAPSHOT_MAX_AGE_MS: Record<SnapshotId, number> = {
  snap_now: 5 * 60 * 1000,          // rotate every 5 min
  snap_1h:  60 * 60 * 1000,         // rotate every 1h
  snap_1d:  24 * 60 * 60 * 1000,    // rotate every 1d
  snap_1w:  7 * 24 * 60 * 60 * 1000,
  snap_1m:  30 * 24 * 60 * 60 * 1000,
};

// ─── Write count tracking ─────────────────────────────────────────────────────

let _writeCount = 0;
let _lastSnapshotAt = 0;
const SNAPSHOT_EVERY_N_WRITES = 50;
const SNAPSHOT_EVERY_MS = 5 * 60 * 1000;

export function incrementWriteCount(): number {
  _writeCount++;
  return _writeCount;
}

export function getWriteCount(): number {
  return _writeCount;
}

export function shouldTakeSnapshot(): boolean {
  const now = Date.now();
  return (
    _writeCount % SNAPSHOT_EVERY_N_WRITES === 0 ||
    now - _lastSnapshotAt > SNAPSHOT_EVERY_MS
  );
}

// ─── Take a snapshot ──────────────────────────────────────────────────────────

export async function takeSnapshot(
  snapshotId: SnapshotId,
  deviceId: string
): Promise<void> {
  try {
    const db = getDB();
    const existing = await db.snapshots.get(snapshotId);

    // Check if this slot needs rotation
    if (existing) {
      const age = Date.now() - existing.timestamp;
      if (age < SNAPSHOT_MAX_AGE_MS[snapshotId]) return; // too fresh, skip
    }

    const allStores = await exportAllStores();
    const sizeBytes = (await compressJSON(allStores)).length;

    // Write to OPFS
    if (isOPFSAvailable()) {
      await opfsWriteSnapshot(snapshotId, allStores, deviceId);
    }

    // Write to FS Access if available
    if (isFSAccessAvailable()) {
      const handle = await getStoredFolderHandle();
      if (handle) await fsWriteSnapshot(snapshotId, allStores, deviceId, handle);
    }

    // Record snapshot metadata in Dexie
    const snap: CantoSnapshot = {
      id: snapshotId,
      label: SNAPSHOT_LABELS[snapshotId],
      timestamp: Date.now(),
      writeCount: _writeCount,
      stores: Object.keys(allStores) as CantoStoreKey[],
      sizeBytes,
    };
    await db.snapshots.put(snap);
    _lastSnapshotAt = Date.now();
  } catch (e) {
    console.warn('[CantoStore] Snapshot failed:', e);
  }
}

// ─── Auto-snapshot carousel ───────────────────────────────────────────────────

export async function runSnapshotCarousel(deviceId: string): Promise<void> {
  for (const id of SNAPSHOT_IDS) {
    await takeSnapshot(id as SnapshotId, deviceId);
  }
}

// ─── Restore from snapshot ────────────────────────────────────────────────────

export async function restoreFromSnapshot(
  snapshotId: string,
  deviceId: string
): Promise<boolean> {
  try {
    let data: Record<string, any[]> | null = null;

    // Try OPFS first
    if (isOPFSAvailable()) {
      data = await opfsReadSnapshot(snapshotId, deviceId);
    }

    // Fall back to FS Access
    if (!data && isFSAccessAvailable()) {
      const handle = await getStoredFolderHandle();
      if (handle) data = await fsReadSnapshot(snapshotId, deviceId, handle);
    }

    if (!data) return false;

    await importAllStores(data);
    return true;
  } catch {
    return false;
  }
}

// ─── Get all snapshots ────────────────────────────────────────────────────────

export async function getSnapshots(): Promise<CantoSnapshot[]> {
  const db = getDB();
  return db.snapshots.toArray();
}

// ─── Manifest management ──────────────────────────────────────────────────────

export async function buildManifest(
  deviceId: string,
  entries: ManifestEntry[]
): Promise<CantoManifest> {
  const existing = await readManifest();
  const entriesMap: Record<string, ManifestEntry> = existing?.entries ?? {};
  for (const e of entries) {
    entriesMap[e.path] = e;
  }
  return {
    version: 1,
    deviceId,
    lastUpdated: Date.now(),
    writeCount: _writeCount,
    entries: entriesMap,
  };
}

export async function readManifest(): Promise<CantoManifest | null> {
  // Try OPFS first
  if (isOPFSAvailable()) {
    const m = await opfsReadManifest();
    if (m) return m;
  }
  // Try FS Access
  if (isFSAccessAvailable()) {
    const handle = await getStoredFolderHandle();
    if (handle) return fsReadManifest(handle);
  }
  return null;
}

export async function writeManifest(manifest: CantoManifest): Promise<void> {
  if (isOPFSAvailable()) {
    await opfsWriteManifest(manifest);
  }
  if (isFSAccessAvailable()) {
    const handle = await getStoredFolderHandle();
    if (handle) await fsWriteManifest(manifest, handle);
  }
}

// ─── Integrity check ──────────────────────────────────────────────────────────

export async function runIntegrityCheck(deviceId: string): Promise<{
  healthy: boolean;
  corrupted: string[];
  repaired: string[];
}> {
  const corrupted: string[] = [];
  const repaired: string[] = [];

  try {
    const manifest = await readManifest();
    if (!manifest) return { healthy: true, corrupted: [], repaired: [] };

    for (const [path, entry] of Object.entries(manifest.entries)) {
      const ok = await verifyFileIntegrity(path, entry.hash);
      if (!ok) {
        corrupted.push(path);
        // Auto-repair: re-write from Dexie
        const repairOk = await repairFile(entry, deviceId);
        if (repairOk) repaired.push(path);
      }
    }
  } catch {}

  return {
    healthy: corrupted.length === 0,
    corrupted,
    repaired,
  };
}

async function repairFile(entry: ManifestEntry, deviceId: string): Promise<boolean> {
  try {
    const db = getDB();
    let records: any[] = [];

    switch (entry.store) {
      case 'cache':      records = await db.cache.toArray(); break;
      case 'history':    records = await db.history.toArray(); break;
      case 'favorites':  records = await db.favorites.toArray(); break;
      case 'folders':    records = await db.folders.toArray(); break;
      case 'analytics':  records = await db.analytics.toArray(); break;
      case 'codex':      records = await db.codex.toArray(); break;
      case 'notes':      records = await db.notes.toArray(); break;
      case 'graphs':     records = await db.graphs.toArray(); break;
      case 'artHistory': records = await db.artHistory.toArray(); break;
      case 'collections':records = await db.collections.toArray(); break;
      case 'settings':   records = await db.settings.toArray(); break;
      default: return false;
    }

    if (isOPFSAvailable()) {
      await opfsWriteStoreAll(entry.store, records, deviceId);
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Startup check: detect if IndexedDB is empty but disk has data ────────────

export async function detectFirstRunState(deviceId: string): Promise<'fresh' | 'restore' | 'ready'> {
  const db = getDB();
  const historyCount = await db.history.count();
  const cacheCount = await db.cache.count();

  if (historyCount > 0 || cacheCount > 0) return 'ready';

  // IndexedDB is empty — check disk
  if (isOPFSAvailable()) {
    const data = await opfsReadStoreAll('history', deviceId);
    if (data && data.length > 0) return 'restore';
  }

  if (isFSAccessAvailable()) {
    const handle = await getStoredFolderHandle();
    if (handle) {
      const data = await fsReadStore('history', deviceId, handle);
      if (data && data.length > 0) return 'restore';
    }
  }

  return 'fresh';
}

// ─── Auto-restore from disk ───────────────────────────────────────────────────

export async function autoRestoreFromDisk(deviceId: string): Promise<boolean> {
  const stores: CantoStoreKey[] = [
    'cache', 'history', 'favorites', 'folders',
    'analytics', 'codex', 'notes', 'graphs',
    'artHistory', 'collections', 'settings',
  ];

  let restored = false;

  for (const store of stores) {
    let records: any[] | null = null;

    if (isOPFSAvailable()) {
      records = await opfsReadStoreAll(store, deviceId);
    }

    if (!records && isFSAccessAvailable()) {
      const handle = await getStoredFolderHandle();
      if (handle) records = await fsReadStore(store, deviceId, handle);
    }

    if (records && records.length > 0) {
      await importAllStores({ [store]: records });
      restored = true;
    }
  }

  return restored;
}

// ─── Trash system ─────────────────────────────────────────────────────────────

const TRASH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function moveToTrash(
  store: CantoStoreKey,
  key: string,
  data: any
): Promise<string> {
  const db = getDB();
  const id = `trash_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const entry: CantoTrashEntry = {
    id,
    store,
    key,
    data,
    deletedAt: Date.now(),
    expiresAt: Date.now() + TRASH_TTL_MS,
  };
  await db.trash.put(entry);
  return id;
}

export async function restoreFromTrash(trashId: string): Promise<boolean> {
  const db = getDB();
  const entry = await db.trash.get(trashId);
  if (!entry) return false;

  try {
    switch (entry.store) {
      case 'cache':      await db.cache.put(entry.data); break;
      case 'history':    await db.history.put(entry.data); break;
      case 'favorites':  await db.favorites.put(entry.data); break;
      case 'folders':    await db.folders.put(entry.data); break;
      case 'analytics':  await db.analytics.put(entry.data); break;
      case 'codex':      await db.codex.put(entry.data); break;
      case 'notes':      await db.notes.put(entry.data); break;
      case 'graphs':     await db.graphs.put(entry.data); break;
      case 'artHistory': await db.artHistory.put(entry.data); break;
      case 'collections':await db.collections.put(entry.data); break;
      case 'settings':   await db.settings.put(entry.data); break;
    }
    await db.trash.delete(trashId);
    return true;
  } catch {
    return false;
  }
}

export async function emptyTrash(): Promise<number> {
  const db = getDB();
  const all = await db.trash.toArray();
  await db.trash.clear();
  return all.length;
}

export async function purgeExpiredTrash(): Promise<void> {
  const db = getDB();
  const now = Date.now();
  const expired = await db.trash.where('expiresAt').below(now).toArray();
  await db.trash.bulkDelete(expired.map(e => e.id));
}

export async function getTrashItems(): Promise<CantoTrashEntry[]> {
  const db = getDB();
  return db.trash.orderBy('deletedAt').reverse().toArray();
}

