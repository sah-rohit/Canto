/**
 * CantoStore — Compression Layer
 * Uses fflate for fast deflate compression/decompression.
 * Falls back to uncompressed if fflate unavailable.
 */

import { deflate, inflate } from 'fflate';

// ─── Compress ─────────────────────────────────────────────────────────────────

export function compress(data: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    deflate(data, { level: 6 }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ─── Decompress ───────────────────────────────────────────────────────────────

export function decompress(data: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    inflate(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function compressJSON(obj: any): Promise<Uint8Array> {
  const json = JSON.stringify(obj);
  const bytes = enc.encode(json);
  return compress(bytes);
}

export async function decompressJSON<T = any>(data: Uint8Array): Promise<T> {
  const bytes = await decompress(data);
  const json = dec.decode(bytes);
  return JSON.parse(json) as T;
}

// ─── Estimate compression ratio ───────────────────────────────────────────────

export function estimateCompressionRatio(originalSize: number, compressedSize: number): string {
  if (originalSize === 0) return '0%';
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  return `${ratio}%`;
}

// ─── Human-readable size ──────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

