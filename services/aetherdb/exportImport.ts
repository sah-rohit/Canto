/**
 * AetherDB — Layer 4: Export / Import
 * Encrypted cold storage exports (.aetherdb files).
 * Password-protected, compressed, portable.
 */

import { exportAllStores, importAllStores } from './dexieDB';
import { compressJSON, decompressJSON, formatBytes } from './compression';
import { encryptForExport, decryptFromExport } from './crypto';
import { forceFullFlush } from './writeQueue';
import { readManifest } from './safety';
import type { AetherExportBundle } from './types';

// "AetherDB v1" magic bytes: 0xAE 0x7E 0xDB 0x01
const MAGIC = new Uint8Array([0xAE, 0x7E, 0xDB, 0x01]);
const EXPORT_VERSION = 1;

// ─── Export to .aetherdb file ─────────────────────────────────────────────────

export async function exportToFile(
  deviceId: string,
  password?: string
): Promise<void> {
  const stores = await exportAllStores();
  const manifest = await readManifest();

  const bundle: AetherExportBundle = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    deviceId,
    encrypted: !!password,
    compressed: true,
    stores,
    manifest: manifest ?? {
      version: 1,
      deviceId,
      lastUpdated: Date.now(),
      writeCount: 0,
      entries: {},
    },
  };

  let data = await compressJSON(bundle);

  if (password) {
    data = await encryptForExport(data, password);
  }

  // Prepend magic bytes
  const final = new Uint8Array(MAGIC.length + data.length);
  final.set(MAGIC, 0);
  final.set(data, MAGIC.length);

  // Trigger download
  const blob = new Blob([final], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `canto-backup-${date}.aetherdb`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Import from .aetherdb file ───────────────────────────────────────────────

export async function importFromFile(
  file: File,
  password?: string
): Promise<{ success: boolean; error?: string; recordCount: number }> {
  try {
    const raw = new Uint8Array(await file.arrayBuffer());

    // Verify magic bytes
    const magic = raw.slice(0, MAGIC.length);
    if (!magic.every((b, i) => b === MAGIC[i])) {
      return { success: false, error: 'Invalid file format — not an AetherDB export.', recordCount: 0 };
    }

    let data = raw.slice(MAGIC.length);

    // Decrypt if password provided
    if (password) {
      try {
        data = await decryptFromExport(data, password);
      } catch {
        return { success: false, error: 'Incorrect password or corrupted file.', recordCount: 0 };
      }
    }

    // Decompress
    let bundle: AetherExportBundle;
    try {
      bundle = await decompressJSON<AetherExportBundle>(data);
    } catch {
      // Try without decompression (unencrypted uncompressed legacy)
      try {
        bundle = JSON.parse(new TextDecoder().decode(data));
      } catch {
        return { success: false, error: 'Could not parse export file.', recordCount: 0 };
      }
    }

    if (bundle.version !== EXPORT_VERSION) {
      return { success: false, error: `Unsupported export version: ${bundle.version}`, recordCount: 0 };
    }

    // Import into Dexie
    await importAllStores(bundle.stores as Record<string, any[]>);

    // Flush to disk
    await forceFullFlush();

    const recordCount = Object.values(bundle.stores).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
    );

    return { success: true, recordCount };
  } catch (e) {
    return { success: false, error: String(e), recordCount: 0 };
  }
}

// ─── Export size estimate ─────────────────────────────────────────────────────

export async function estimateExportSize(): Promise<string> {
  try {
    const stores = await exportAllStores();
    const compressed = await compressJSON(stores);
    return formatBytes(compressed.length);
  } catch {
    return '—';
  }
}

// ─── Legacy JSON import (from old StaticPage export) ─────────────────────────

export async function importLegacyJSON(
  data: any
): Promise<{ success: boolean; recordCount: number }> {
  try {
    const toImport: Record<string, any[]> = {};

    if (data.history && Array.isArray(data.history)) {
      toImport.history = data.history.map((t: string) => ({
        topic: t, timestamp: Date.now(), starred: false,
      }));
    }
    if (data.favorites && Array.isArray(data.favorites)) {
      toImport.favorites = data.favorites.map((t: string) => ({
        topic: t, timestamp: Date.now(),
      }));
    }
    if (data.notes && Array.isArray(data.notes)) {
      toImport.notes = data.notes;
    }
    if (data.collections && typeof data.collections === 'object') {
      toImport.collections = Object.entries(data.collections).map(([id, col]) => ({
        id, ...(col as any), createdAt: Date.now(),
      }));
    }
    if (data.artHistory && Array.isArray(data.artHistory)) {
      toImport.artHistory = data.artHistory.map((a: any) => ({ ...a, savedAt: Date.now() }));
    }

    await importAllStores(toImport);
    await forceFullFlush();

    const recordCount = Object.values(toImport).reduce((s, a) => s + a.length, 0);
    return { success: true, recordCount };
  } catch {
    return { success: false, recordCount: 0 };
  }
}
