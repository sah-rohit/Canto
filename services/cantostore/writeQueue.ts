/**
 * CantoStore — Write Queue & Flush Engine
 * Every write goes to Dexie immediately (<5ms).
 * Debounced 2-second flush to OPFS + FS Access.
 * Background Sync API integration for tab-close safety.
 */

import { getDB } from './dexieDB';
import { exportAllStores } from './dexieDB';
import {
  opfsWriteStoreAll, isOPFSAvailable,
} from './opfs';
import {
  fsWriteStore, getStoredFolderHandle, isFSAccessAvailable,
} from './fsAccess';
import {
  incrementWriteCount, shouldTakeSnapshot,
  runSnapshotCarousel, writeManifest, buildManifest,
} from './safety';
import type { CantoStoreKey, CantoWriteOp } from './types';

// ─── Flush state ──────────────────────────────────────────────────────────────

let _flushTimer: ReturnType<typeof setTimeout> | null = null;
let _pendingStores = new Set<CantoStoreKey>();
let _deviceId = '';
let _isFlushing = false;
const FLUSH_DEBOUNCE_MS = 2000;

export function initWriteQueue(deviceId: string): void {
  _deviceId = deviceId;
  // Register background sync if available
  registerBackgroundSync();
}

// ─── Queue a write ────────────────────────────────────────────────────────────

export function queueFlush(store: CantoStoreKey): void {
  _pendingStores.add(store);
  scheduleFlush();
}

function scheduleFlush(): void {
  if (_flushTimer) clearTimeout(_flushTimer);
  _flushTimer = setTimeout(() => {
    flushToDisk().catch(e => console.warn('[CantoStore] Flush error:', e));
  }, FLUSH_DEBOUNCE_MS);
}

// ─── Flush to disk ────────────────────────────────────────────────────────────

export async function flushToDisk(force = false): Promise<void> {
  if (_isFlushing && !force) return;
  if (_pendingStores.size === 0 && !force) return;

  _isFlushing = true;
  const storesToFlush = force
    ? (['cache', 'history', 'favorites', 'folders', 'analytics', 'codex',
        'notes', 'graphs', 'artHistory', 'collections', 'settings'] as CantoStoreKey[])
    : Array.from(_pendingStores);

  _pendingStores.clear();
  if (_flushTimer) { clearTimeout(_flushTimer); _flushTimer = null; }

  try {
    const db = getDB();
    const manifestEntries = [];

    for (const store of storesToFlush) {
      let records: any[] = [];
      switch (store) {
        case 'cache':       records = await db.cache.toArray(); break;
        case 'history':     records = await db.history.toArray(); break;
        case 'favorites':   records = await db.favorites.toArray(); break;
        case 'folders':     records = await db.folders.toArray(); break;
        case 'analytics':   records = await db.analytics.toArray(); break;
        case 'codex':       records = await db.codex.toArray(); break;
        case 'notes':       records = await db.notes.toArray(); break;
        case 'graphs':      records = await db.graphs.toArray(); break;
        case 'artHistory':  records = await db.artHistory.toArray(); break;
        case 'collections': records = await db.collections.toArray(); break;
        case 'settings':    records = await db.settings.toArray(); break;
      }

      // Layer 2a: OPFS
      if (isOPFSAvailable()) {
        const entry = await opfsWriteStoreAll(store, records, _deviceId);
        manifestEntries.push(entry);
      }

      // Layer 2b / Layer 3: FS Access
      if (isFSAccessAvailable()) {
        const handle = await getStoredFolderHandle();
        if (handle) {
          const entry = await fsWriteStore(store, records, _deviceId, handle);
          if (entry) manifestEntries.push(entry);
        }
      }
    }

    // Update manifest
    if (manifestEntries.length > 0) {
      const manifest = await buildManifest(_deviceId, manifestEntries);
      await writeManifest(manifest);
    }

    // Snapshot carousel
    const wc = incrementWriteCount();
    if (shouldTakeSnapshot()) {
      runSnapshotCarousel(_deviceId).catch(() => {});
    }

    // Clear write queue in Dexie
    await db.writeQueue.clear();

  } catch (e) {
    console.warn('[CantoStore] Flush failed:', e);
    // Re-queue failed stores
    for (const s of storesToFlush) _pendingStores.add(s);
  } finally {
    _isFlushing = false;
  }
}

// ─── Force full flush (all stores) ───────────────────────────────────────────

export async function forceFullFlush(): Promise<void> {
  return flushToDisk(true);
}

// ─── Pending count ────────────────────────────────────────────────────────────

export function getPendingFlushCount(): number {
  return _pendingStores.size;
}

// ─── Background Sync API ──────────────────────────────────────────────────────

function registerBackgroundSync(): void {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(reg => {
      // Register a sync tag so SW can flush if tab closes
      (reg as any).sync?.register('cantostore-flush').catch(() => {});
    }).catch(() => {});
  }

  // Also flush on page hide (tab close / navigation)
  window.addEventListener('pagehide', () => {
    if (_pendingStores.size > 0) {
      // Use sendBeacon as a last resort signal to SW
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/noop', JSON.stringify({ CantoStore: 'flush' }));
      }
      // Attempt synchronous-ish flush
      flushToDisk(true).catch(() => {});
    }
  });

  // Flush on visibility change (tab backgrounded)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && _pendingStores.size > 0) {
      flushToDisk(true).catch(() => {});
    }
  });
}

// ─── Write op logging (for audit trail) ──────────────────────────────────────

export async function logWriteOp(
  store: CantoStoreKey,
  key: string,
  data: any,
  operation: 'put' | 'delete'
): Promise<void> {
  try {
    const db = getDB();
    const op: CantoWriteOp = {
      id: `wop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      store,
      key,
      data,
      timestamp: Date.now(),
      operation,
    };
    await db.writeQueue.put(op);
  } catch {}
}

