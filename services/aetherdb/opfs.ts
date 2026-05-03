/**
 * AetherDB — Layer 2a: Origin Private File System (OPFS)
 * Hidden backup that survives browser cache clears.
 * Files are compressed + encrypted before writing.
 */

import { compress, decompress, compressJSON, decompressJSON } from './compression';
import { encrypt, decrypt, packEncrypted, unpackEncrypted, sha256Hex } from './crypto';
import type { AetherManifest, ManifestEntry, AetherStore } from './types';

const OPFS_ROOT = 'aetherdb';
const MANIFEST_PATH = 'manifest.json';

// ─── OPFS availability check ──────────────────────────────────────────────────

export function isOPFSAvailable(): boolean {
  return typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    typeof (navigator.storage as any).getDirectory === 'function';
}

// ─── Get OPFS root directory ──────────────────────────────────────────────────

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  const root = await (navigator.storage as any).getDirectory() as FileSystemDirectoryHandle;
  return root.getDirectoryHandle(OPFS_ROOT, { create: true });
}

async function getSubDir(name: string): Promise<FileSystemDirectoryHandle> {
  const root = await getRoot();
  return root.getDirectoryHandle(name, { create: true });
}

// ─── Write a file to OPFS ─────────────────────────────────────────────────────

export async function opfsWrite(
  path: string,
  data: Uint8Array
): Promise<void> {
  const parts = path.split('/');
  const fileName = parts.pop()!;
  let dir = await getRoot();
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }
  const fh = await dir.getFileHandle(fileName, { create: true });
  // Use createSyncAccessHandle if available (worker context), else writable stream
  const writable = await (fh as any).createWritable();
  await writable.write(data);
  await writable.close();
}

// ─── Read a file from OPFS ────────────────────────────────────────────────────

export async function opfsRead(path: string): Promise<Uint8Array | null> {
  try {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    let dir = await getRoot();
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: false });
    }
    const fh = await dir.getFileHandle(fileName, { create: false });
    const file = await fh.getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}

// ─── Delete a file from OPFS ──────────────────────────────────────────────────

export async function opfsDelete(path: string): Promise<void> {
  try {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    let dir = await getRoot();
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: false });
    }
    await dir.removeEntry(fileName);
  } catch {}
}

// ─── List files in a directory ────────────────────────────────────────────────

export async function opfsList(subDir?: string): Promise<string[]> {
  try {
    const dir = subDir ? await getSubDir(subDir) : await getRoot();
    const names: string[] = [];
    for await (const [name] of (dir as any).entries()) {
      names.push(name);
    }
    return names;
  } catch {
    return [];
  }
}

// ─── Estimate OPFS usage ──────────────────────────────────────────────────────

export async function estimateOPFSSize(): Promise<number> {
  try {
    const est = await navigator.storage.estimate();
    // OPFS is included in the overall storage estimate
    return est.usage ?? 0;
  } catch {
    return 0;
  }
}

// ─── Write store data (compressed + encrypted) ───────────────────────────────

export async function opfsWriteStore(
  store: AetherStore,
  key: string,
  data: any,
  deviceId: string
): Promise<ManifestEntry> {
  const compressed = await compressJSON(data);
  const { ciphertext, salt, iv } = await encrypt(compressed, deviceId);
  const blob = packEncrypted(salt, iv, ciphertext);
  const hash = await sha256Hex(blob);
  const path = `${store}/${sanitizeKey(key)}.adb`;

  await opfsWrite(path, blob);

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

// ─── Read store data (decrypt + decompress) ───────────────────────────────────

export async function opfsReadStore<T = any>(
  store: AetherStore,
  key: string,
  deviceId: string
): Promise<T | null> {
  const path = `${store}/${sanitizeKey(key)}.adb`;
  const blob = await opfsRead(path);
  if (!blob) return null;
  try {
    const { salt, iv, ciphertext } = unpackEncrypted(blob);
    const compressed = await decrypt(ciphertext, salt, iv, deviceId);
    return await decompressJSON<T>(compressed);
  } catch {
    return null;
  }
}

// ─── Write entire store as a single file ─────────────────────────────────────

export async function opfsWriteStoreAll(
  store: AetherStore,
  records: any[],
  deviceId: string
): Promise<ManifestEntry> {
  const compressed = await compressJSON(records);
  const { ciphertext, salt, iv } = await encrypt(compressed, deviceId);
  const blob = packEncrypted(salt, iv, ciphertext);
  const hash = await sha256Hex(blob);
  const path = `_stores/${store}.adb`;

  await opfsWrite(path, blob);

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

// ─── Read entire store ────────────────────────────────────────────────────────

export async function opfsReadStoreAll<T = any>(
  store: AetherStore,
  deviceId: string
): Promise<T[] | null> {
  const path = `_stores/${store}.adb`;
  const blob = await opfsRead(path);
  if (!blob) return null;
  try {
    const { salt, iv, ciphertext } = unpackEncrypted(blob);
    const compressed = await decrypt(ciphertext, salt, iv, deviceId);
    return await decompressJSON<T[]>(compressed);
  } catch {
    return null;
  }
}

// ─── Manifest operations ──────────────────────────────────────────────────────

export async function opfsReadManifest(): Promise<AetherManifest | null> {
  const blob = await opfsRead(MANIFEST_PATH);
  if (!blob) return null;
  try {
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(blob)) as AetherManifest;
  } catch {
    return null;
  }
}

export async function opfsWriteManifest(manifest: AetherManifest): Promise<void> {
  const enc = new TextEncoder();
  await opfsWrite(MANIFEST_PATH, enc.encode(JSON.stringify(manifest, null, 2)));
}

// ─── Snapshot operations ──────────────────────────────────────────────────────

export async function opfsWriteSnapshot(
  snapshotId: string,
  stores: Record<string, any[]>,
  deviceId: string
): Promise<number> {
  const compressed = await compressJSON(stores);
  const { ciphertext, salt, iv } = await encrypt(compressed, deviceId);
  const blob = packEncrypted(salt, iv, ciphertext);
  await opfsWrite(`_snapshots/${snapshotId}.snap`, blob);
  return blob.length;
}

export async function opfsReadSnapshot(
  snapshotId: string,
  deviceId: string
): Promise<Record<string, any[]> | null> {
  const blob = await opfsRead(`_snapshots/${snapshotId}.snap`);
  if (!blob) return null;
  try {
    const { salt, iv, ciphertext } = unpackEncrypted(blob);
    const compressed = await decrypt(ciphertext, salt, iv, deviceId);
    return await decompressJSON(compressed);
  } catch {
    return null;
  }
}

// ─── Integrity verification ───────────────────────────────────────────────────

export async function verifyFileIntegrity(
  path: string,
  expectedHash: string
): Promise<boolean> {
  const blob = await opfsRead(path);
  if (!blob) return false;
  const actualHash = await sha256Hex(blob);
  return actualHash === expectedHash;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 100);
}
