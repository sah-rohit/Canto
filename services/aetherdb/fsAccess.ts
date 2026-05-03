/**
 * AetherDB — Layer 2b + Layer 3: File System Access API
 * User-picked folder on device (survives browser uninstall).
 * Also serves as Layer 3 external backup (Dropbox/Drive/USB folder).
 */

import { compressJSON, decompressJSON } from './compression';
import { encrypt, decrypt, packEncrypted, unpackEncrypted, sha256Hex } from './crypto';
import type { AetherManifest, ManifestEntry, AetherStore } from './types';

const FS_HANDLE_KEY = 'aetherdb_fs_handle';

// ─── Availability check ───────────────────────────────────────────────────────

export function isFSAccessAvailable(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// ─── Persist and retrieve directory handle ────────────────────────────────────

let _dirHandle: FileSystemDirectoryHandle | null = null;

export async function requestFolderAccess(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFSAccessAvailable()) return null;
  try {
    const handle = await (window as any).showDirectoryPicker({
      id: 'aetherdb-storage',
      mode: 'readwrite',
      startIn: 'documents',
    });
    _dirHandle = handle;
    // Persist handle via IndexedDB (localStorage can't store handles)
    await persistHandle(handle);
    return handle;
  } catch {
    return null;
  }
}

export async function getStoredFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (_dirHandle) {
    try {
      // Verify permission is still granted
      const perm = await (_dirHandle as any).queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') return _dirHandle;
    } catch {}
  }
  // Try to restore from IndexedDB
  const handle = await loadPersistedHandle();
  if (!handle) return null;
  try {
    const perm = await (handle as any).queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      _dirHandle = handle;
      return handle;
    }
    // Request permission again
    const newPerm = await (handle as any).requestPermission({ mode: 'readwrite' });
    if (newPerm === 'granted') {
      _dirHandle = handle;
      return handle;
    }
  } catch {}
  return null;
}

export function clearFolderHandle(): void {
  _dirHandle = null;
  clearPersistedHandle();
}

// ─── Persist handle in IndexedDB (handles can't go in localStorage) ───────────

async function persistHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.open('aetherdb_handles', 1);
    req.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore('handles', { keyPath: 'key' });
    };
    req.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put({ key: FS_HANDLE_KEY, handle });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
    req.onerror = () => resolve();
  });
}

async function loadPersistedHandle(): Promise<FileSystemDirectoryHandle | null> {
  return new Promise((resolve) => {
    const req = indexedDB.open('aetherdb_handles', 1);
    req.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore('handles', { keyPath: 'key' });
    };
    req.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction('handles', 'readonly');
      const r = tx.objectStore('handles').get(FS_HANDLE_KEY);
      r.onsuccess = () => resolve(r.result?.handle ?? null);
      r.onerror = () => resolve(null);
    };
    req.onerror = () => resolve(null);
  });
}

function clearPersistedHandle(): void {
  const req = indexedDB.open('aetherdb_handles', 1);
  req.onsuccess = (e: any) => {
    const db = e.target.result;
    try {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete(FS_HANDLE_KEY);
    } catch {}
  };
}

// ─── File operations ──────────────────────────────────────────────────────────

async function getOrCreateSubDir(
  root: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle> {
  return root.getDirectoryHandle(name, { create: true });
}

export async function fsWrite(
  path: string,
  data: Uint8Array,
  handle?: FileSystemDirectoryHandle | null
): Promise<boolean> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return false;
  try {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    let current = dir;
    for (const part of parts) {
      current = await getOrCreateSubDir(current, part);
    }
    const fh = await current.getFileHandle(fileName, { create: true });
    const writable = await (fh as any).createWritable();
    await writable.write(data);
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

export async function fsRead(
  path: string,
  handle?: FileSystemDirectoryHandle | null
): Promise<Uint8Array | null> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return null;
  try {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    let current = dir;
    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: false });
    }
    const fh = await current.getFileHandle(fileName, { create: false });
    const file = await fh.getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}

export async function fsDelete(
  path: string,
  handle?: FileSystemDirectoryHandle | null
): Promise<void> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return;
  try {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    let current = dir;
    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: false });
    }
    await current.removeEntry(fileName);
  } catch {}
}

// ─── Write store (compressed + encrypted) ────────────────────────────────────

export async function fsWriteStore(
  store: AetherStore,
  records: any[],
  deviceId: string,
  handle?: FileSystemDirectoryHandle | null
): Promise<ManifestEntry | null> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return null;

  const compressed = await compressJSON(records);
  const { ciphertext, salt, iv } = await encrypt(compressed, deviceId);
  const blob = packEncrypted(salt, iv, ciphertext);
  const hash = await sha256Hex(blob);
  const path = `aetherdb/_stores/${store}.adb`;

  const ok = await fsWrite(path, blob, dir);
  if (!ok) return null;

  return {
    path,
    hash,
    size: blob.length,
    timestamp: Date.now(),
    store,
    compressed: true,
    encrypted: true,
  };
}

// ─── Read store ───────────────────────────────────────────────────────────────

export async function fsReadStore<T = any>(
  store: AetherStore,
  deviceId: string,
  handle?: FileSystemDirectoryHandle | null
): Promise<T[] | null> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return null;

  const blob = await fsRead(`aetherdb/_stores/${store}.adb`, dir);
  if (!blob) return null;
  try {
    const { salt, iv, ciphertext } = unpackEncrypted(blob);
    const compressed = await decrypt(ciphertext, salt, iv, deviceId);
    return await decompressJSON<T[]>(compressed);
  } catch {
    return null;
  }
}

// ─── Manifest ─────────────────────────────────────────────────────────────────

export async function fsReadManifest(
  handle?: FileSystemDirectoryHandle | null
): Promise<AetherManifest | null> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return null;
  const blob = await fsRead('aetherdb/manifest.json', dir);
  if (!blob) return null;
  try {
    return JSON.parse(new TextDecoder().decode(blob)) as AetherManifest;
  } catch {
    return null;
  }
}

export async function fsWriteManifest(
  manifest: AetherManifest,
  handle?: FileSystemDirectoryHandle | null
): Promise<void> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return;
  const enc = new TextEncoder();
  await fsWrite('aetherdb/manifest.json', enc.encode(JSON.stringify(manifest, null, 2)), dir);
}

// ─── Snapshot ─────────────────────────────────────────────────────────────────

export async function fsWriteSnapshot(
  snapshotId: string,
  stores: Record<string, any[]>,
  deviceId: string,
  handle?: FileSystemDirectoryHandle | null
): Promise<boolean> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return false;
  const compressed = await compressJSON(stores);
  const { ciphertext, salt, iv } = await encrypt(compressed, deviceId);
  const blob = packEncrypted(salt, iv, ciphertext);
  return fsWrite(`aetherdb/_snapshots/${snapshotId}.snap`, blob, dir);
}

export async function fsReadSnapshot(
  snapshotId: string,
  deviceId: string,
  handle?: FileSystemDirectoryHandle | null
): Promise<Record<string, any[]> | null> {
  const dir = handle ?? await getStoredFolderHandle();
  if (!dir) return null;
  const blob = await fsRead(`aetherdb/_snapshots/${snapshotId}.snap`, dir);
  if (!blob) return null;
  try {
    const { salt, iv, ciphertext } = unpackEncrypted(blob);
    const compressed = await decrypt(ciphertext, salt, iv, deviceId);
    return await decompressJSON(compressed);
  } catch {
    return null;
  }
}

// ─── Get folder name for display ──────────────────────────────────────────────

export function getFolderName(handle?: FileSystemDirectoryHandle | null): string {
  return handle?.name ?? _dirHandle?.name ?? '—';
}
