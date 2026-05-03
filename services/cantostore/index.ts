/**
 * CantoStore — Public API
 * Single import point. Drop-in replacement for services/dbService.ts.
 *
 * Usage:
 *   import { dbSaveCache, dbGetHistory, ... } from './services/cantostore';
 */

// ─── Core DB operations (drop-in for dbService.ts) ────────────────────────────
export {
  dbSaveCache,
  dbGetCache,
  dbDeleteCache,
  dbSearchCache,
  dbSaveHistory,
  dbGetHistory,
  dbGetHistoryFull,
  dbClearHistory,
  dbStarEntry,
  dbMoveToFolder,
  dbSearchHistory,
  dbSaveFavorite,
  dbRemoveFavorite,
  dbGetFavorites,
  dbCreateFolder,
  dbGetFolders,
  dbDeleteFolder,
  dbRecordAnalytics,
  dbGetAnalytics,
  dbGetCodex,
  dbSaveCodex,
  dbMarkAchievementsSeen,
  dbGetNotes,
  dbSaveNote,
  dbDeleteNote,
  dbGetGraphs,
  dbSaveGraph,
  dbGetArtHistory,
  dbSaveArtHistory,
  dbGetCollections,
  dbSaveCollection,
  dbGetSetting,
  dbSetSetting,
  migrateFromLocalStorage,
} from './core';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  CantoDBCacheEntry,
  CantoDBHistoryEntry,
  CantoDBFavoriteEntry,
  CantoDBFolderEntry,
  CantoDBAnalyticsEntry,
  CantoCodexState,
  NoteEntry,
} from './core';

export type {
  CantoManifest,
  CantoSnapshot,
  CantoTrashEntry,
  CantoDeviceIdentity,
  CantoPeer,
  CantoSyncLog,
  CantoStorageStats,
  CantoLayerStatus,
  CantoHealthReport,
  CantoFirstRunState,
  CantoExportBundle,
  CantoStoreKey,
} from './types';

// ─── Initialization ───────────────────────────────────────────────────────────
export {
  initCantoStore,
  getDeviceId,
  getFirstRunState,
  getHealthReport,
  refreshHealthReport,
} from './init';

// ─── Safety / Snapshots / Trash ───────────────────────────────────────────────
export {
  takeSnapshot,
  runSnapshotCarousel,
  restoreFromSnapshot,
  getSnapshots,
  runIntegrityCheck,
  moveToTrash,
  restoreFromTrash,
  emptyTrash,
  getTrashItems,
  autoRestoreFromDisk,
  SNAPSHOT_IDS,
} from './safety';

// ─── Write queue / flush ──────────────────────────────────────────────────────
export {
  forceFullFlush,
  getPendingFlushCount,
} from './writeQueue';

// ─── File System Access ───────────────────────────────────────────────────────
export {
  requestFolderAccess,
  getStoredFolderHandle,
  clearFolderHandle,
  isFSAccessAvailable,
  getFolderName,
} from './fsAccess';

// ─── OPFS ─────────────────────────────────────────────────────────────────────
export {
  isOPFSAvailable,
} from './opfs';

// ─── Export / Import ──────────────────────────────────────────────────────────
export {
  exportToFile,
  importFromFile,
  importLegacyJSON,
  estimateExportSize,
} from './exportImport';

// ─── Sync ─────────────────────────────────────────────────────────────────────
export {
  initiateSync,
  acceptSync,
  completeSync,
  pushSyncToAll,
  disconnectAll,
  getKnownPeers,
  getSyncLogs,
  generateQRPayload,
  getConnectedPeerCount,
} from './sync';

// ─── Dexie internals (for dashboard) ─────────────────────────────────────────
export {
  estimateIndexedDBSize,
  countAllRecords,
  clearAllStores,
} from './dexieDB';

// ─── Compression utils ────────────────────────────────────────────────────────
export { formatBytes } from './compression';

