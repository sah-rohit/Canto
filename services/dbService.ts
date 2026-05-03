/**
 * services/dbService.ts — Compatibility shim
 * All exports now come from AetherDB (services/aetherdb/index.ts).
 * Every existing import in App.tsx, ResearchPanel, CantoCodex, etc. continues to work unchanged.
 */
export {
  dbSaveCache, dbGetCache, dbDeleteCache, dbSearchCache,
  dbSaveHistory, dbGetHistory, dbGetHistoryFull, dbClearHistory,
  dbStarEntry, dbMoveToFolder, dbSearchHistory,
  dbSaveFavorite, dbRemoveFavorite, dbGetFavorites,
  dbCreateFolder, dbGetFolders, dbDeleteFolder,
  dbRecordAnalytics, dbGetAnalytics,
  dbGetCodex, dbSaveCodex, dbMarkAchievementsSeen,
} from "./aetherdb/index";

export type {
  CantoDBCacheEntry, CantoDBHistoryEntry, CantoDBFavoriteEntry,
  CantoDBFolderEntry, CantoDBAnalyticsEntry, CantoCodexState,
} from "./aetherdb/index";
