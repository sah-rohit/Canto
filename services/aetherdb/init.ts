/**
 * AetherDB — Initialization
 * Boot sequence: identity → migration → integrity check → snapshot → ready.
 * Called once on app startup. Target: <100ms.
 */

import { getOrCreateDeviceIdentity } from './crypto';
import { initWriteQueue } from './writeQueue';
import { migrateFromLocalStorage } from './core';
import {
  detectFirstRunState, autoRestoreFromDisk,
  runIntegrityCheck, purgeExpiredTrash,
} from './safety';
import { checkDBHealth } from './dexieDB';
import { isOPFSAvailable } from './opfs';
import { isFSAccessAvailable, getStoredFolderHandle } from './fsAccess';
import type { AetherFirstRunState, AetherHealthReport, AetherLayerStatus } from './types';

// ─── Global state ─────────────────────────────────────────────────────────────

let _initialized = false;
let _deviceId = '';
let _firstRunState: AetherFirstRunState = 'checking';
let _healthReport: AetherHealthReport | null = null;

export function getDeviceId(): string { return _deviceId; }
export function getFirstRunState(): AetherFirstRunState { return _firstRunState; }
export function getHealthReport(): AetherHealthReport | null { return _healthReport; }

// ─── Boot ─────────────────────────────────────────────────────────────────────

export async function initAetherDB(): Promise<AetherFirstRunState> {
  if (_initialized) return _firstRunState;
  _initialized = true;

  const t0 = performance.now();

  try {
    // 1. Device identity
    const identity = await getOrCreateDeviceIdentity();
    _deviceId = identity.deviceId;

    // 2. Init write queue (registers background sync, page-hide flush)
    initWriteQueue(_deviceId);

    // 3. Check DB health
    const dbHealthy = await checkDBHealth();

    // 4. Detect first-run state
    _firstRunState = 'checking';
    const state = await detectFirstRunState(_deviceId);

    if (state === 'restore') {
      // Auto-restore from disk without user intervention
      await autoRestoreFromDisk(_deviceId);
      _firstRunState = 'restore';
    } else if (state === 'fresh') {
      // Migrate from localStorage if any data exists there
      await migrateFromLocalStorage();
      _firstRunState = 'fresh';
    } else {
      _firstRunState = 'ready';
    }

    // 5. Integrity check (async, non-blocking)
    runIntegrityCheck(_deviceId).then(result => {
      if (_healthReport) {
        _healthReport.corruptionDetected = result.corrupted.length > 0;
        _healthReport.autoRepaired = result.repaired.length > 0;
        _healthReport.healthy = result.healthy;
      }
    }).catch(() => {});

    // 6. Purge expired trash (async, non-blocking)
    purgeExpiredTrash().catch(() => {});

    // 7. Build health report
    _healthReport = await buildHealthReport(dbHealthy);

    const elapsed = performance.now() - t0;
    console.log(`[AetherDB] Initialized in ${elapsed.toFixed(1)}ms — state: ${_firstRunState}`);

  } catch (e) {
    console.error('[AetherDB] Init failed:', e);
    _firstRunState = 'fresh';
  }

  return _firstRunState;
}

// ─── Health report ────────────────────────────────────────────────────────────

export async function buildHealthReport(dbHealthy = true): Promise<AetherHealthReport> {
  const layers: AetherLayerStatus[] = [
    {
      layer: 1,
      name: 'IndexedDB Cache',
      available: true,
      healthy: dbHealthy,
      lastSync: Date.now(),
      sizeBytes: 0,
      description: 'Dexie.js fast working cache',
    },
    {
      layer: 2,
      name: 'Device Storage (OPFS)',
      available: isOPFSAvailable(),
      healthy: isOPFSAvailable(),
      lastSync: 0,
      sizeBytes: 0,
      description: 'Origin Private File System — survives cache clears',
    },
    {
      layer: 3,
      name: 'External Folder',
      available: isFSAccessAvailable(),
      healthy: false,
      lastSync: 0,
      sizeBytes: 0,
      description: 'User-picked folder — Dropbox / Drive / USB',
    },
    {
      layer: 4,
      name: 'Cold Storage Export',
      available: true,
      healthy: true,
      lastSync: 0,
      sizeBytes: 0,
      description: 'Encrypted export bundle for offline backup',
    },
  ];

  // Check if external folder is connected
  if (isFSAccessAvailable()) {
    const handle = await getStoredFolderHandle();
    layers[2].healthy = !!handle;
    layers[2].lastSync = handle ? Date.now() : 0;
  }

  return {
    healthy: dbHealthy,
    layers,
    lastIntegrityCheck: Date.now(),
    corruptionDetected: false,
    autoRepaired: false,
    writeCount: 0,
    pendingFlush: 0,
  };
}

// ─── Re-check health ──────────────────────────────────────────────────────────

export async function refreshHealthReport(): Promise<AetherHealthReport> {
  const dbHealthy = await checkDBHealth();
  _healthReport = await buildHealthReport(dbHealthy);
  return _healthReport;
}
