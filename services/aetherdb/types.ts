/**
 * AetherDB — Type Definitions
 * All shared types for the 4-layer persistence system.
 */

// ─── Re-export existing Canto types (unchanged API) ──────────────────────────

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

export interface CantoCodexState {
  id: 'singleton';
  xp: number;
  rank: string;
  streak: number;
  lastActiveDate: string;
  longestStreak: number;
  totalArticles: number;
  totalReadingMinutes: number;
  domainsExplored: string[];
  topicsExplored: string[];
  deepReadCount: number;
  sessionArticles: number;
  sessionStartDate: string;
  unlockedAchievements: string[];
  newAchievements: string[];
  labsDiscovered: string[];
}

// ─── AetherDB-specific types ──────────────────────────────────────────────────

/** A single file entry in the manifest */
export interface ManifestEntry {
  path: string;           // e.g. "cache/quantum_physics.json"
  hash: string;           // SHA-256 hex of compressed+encrypted content
  size: number;           // bytes
  timestamp: number;      // last modified
  store: AetherStore;     // which logical store
  compressed: boolean;
  encrypted: boolean;
}

/** The manifest.json tracking all persisted files */
export interface AetherManifest {
  version: number;
  deviceId: string;
  lastUpdated: number;
  writeCount: number;
  entries: Record<string, ManifestEntry>; // keyed by path
}

/** A snapshot entry in the carousel */
export interface AetherSnapshot {
  id: string;             // e.g. "snap_now", "snap_1h", "snap_1d", "snap_1w", "snap_1m"
  label: string;          // human-readable: "Now", "1 hour ago", etc.
  timestamp: number;
  writeCount: number;
  stores: AetherStore[];  // which stores are included
  sizeBytes: number;
}

/** Soft-delete trash entry */
export interface AetherTrashEntry {
  id: string;
  store: AetherStore;
  key: string;
  data: any;
  deletedAt: number;
  expiresAt: number;      // deletedAt + 30 days
}

/** Device identity for P2P sync */
export interface AetherDeviceIdentity {
  deviceId: string;       // Ed25519 public key hex
  privateKeyHex: string;  // Ed25519 private key hex (stored locally only)
  name: string;           // user-friendly device name
  createdAt: number;
}

/** Peer device info for sync */
export interface AetherPeer {
  deviceId: string;
  name: string;
  lastSeen: number;
  syncStatus: 'synced' | 'pending' | 'error' | 'unknown';
  writeCount: number;
}

/** Sync log entry */
export interface AetherSyncLog {
  id: string;
  timestamp: number;
  peerId: string;
  direction: 'push' | 'pull' | 'merge';
  storesAffected: AetherStore[];
  recordCount: number;
  success: boolean;
  error?: string;
}

/** Storage usage stats */
export interface AetherStorageStats {
  indexedDBBytes: number;
  opfsBytes: number;
  externalBytes: number;
  totalBytes: number;
  recordCounts: Record<AetherStore, number>;
  lastFlush: number;
  pendingWrites: number;
  snapshotCount: number;
  trashCount: number;
}

/** Write operation for the write queue */
export interface AetherWriteOp {
  id: string;
  store: AetherStore;
  key: string;
  data: any;
  timestamp: number;
  operation: 'put' | 'delete';
}

/** Encryption key material */
export interface AetherKeyMaterial {
  salt: Uint8Array;
  iv: Uint8Array;
}

/** Logical store names */
export type AetherStore =
  | 'cache'
  | 'history'
  | 'favorites'
  | 'folders'
  | 'analytics'
  | 'codex'
  | 'notes'
  | 'graphs'
  | 'artHistory'
  | 'collections'
  | 'settings';

/** Layer status for the dashboard */
export interface AetherLayerStatus {
  layer: 1 | 2 | 3 | 4;
  name: string;
  available: boolean;
  healthy: boolean;
  lastSync: number;
  sizeBytes: number;
  description: string;
}

/** Full system health report */
export interface AetherHealthReport {
  healthy: boolean;
  layers: AetherLayerStatus[];
  lastIntegrityCheck: number;
  corruptionDetected: boolean;
  autoRepaired: boolean;
  writeCount: number;
  pendingFlush: number;
}

/** Export bundle for cold storage */
export interface AetherExportBundle {
  version: number;
  exportedAt: number;
  deviceId: string;
  encrypted: boolean;
  compressed: boolean;
  stores: Partial<Record<AetherStore, any[]>>;
  manifest: AetherManifest;
}

/** First-run state */
export type AetherFirstRunState =
  | 'checking'
  | 'fresh'           // no data anywhere
  | 'restore'         // data found on disk, IndexedDB empty
  | 'ready';          // data in IndexedDB, all good
