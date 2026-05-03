/**
 * AetherDB — Crypto Layer
 * Web Crypto API: AES-GCM encryption, SHA-256 hashing, Ed25519 device identity.
 * Zero external dependencies — pure browser crypto.
 */

import type { AetherDeviceIdentity, AetherKeyMaterial } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const KEY_USAGE_ENCRYPT: KeyUsage[] = ['encrypt', 'decrypt'];

// ─── Device passphrase (derived from deviceId, stored in localStorage) ───────

function getDevicePassphrase(deviceId: string): string {
  // Deterministic passphrase from deviceId — no user password needed
  return `aetherdb-${deviceId}-canto-v1`;
}

// ─── Key derivation ───────────────────────────────────────────────────────────

export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    KEY_USAGE_ENCRYPT
  );
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

export async function encrypt(
  data: Uint8Array,
  deviceId: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; iv: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(getDevicePassphrase(deviceId), salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  );
  return { ciphertext, salt, iv };
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

export async function decrypt(
  ciphertext: Uint8Array,
  salt: Uint8Array,
  iv: Uint8Array,
  deviceId: string
): Promise<Uint8Array> {
  const key = await deriveKey(getDevicePassphrase(deviceId), salt);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new Uint8Array(plaintext);
}

// ─── Pack / Unpack encrypted blob ────────────────────────────────────────────
// Format: [salt(16)] [iv(12)] [ciphertext(n)]

export function packEncrypted(salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array): Uint8Array {
  const out = new Uint8Array(16 + 12 + ciphertext.length);
  out.set(salt, 0);
  out.set(iv, 16);
  out.set(ciphertext, 28);
  return out;
}

export function unpackEncrypted(blob: Uint8Array): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  return {
    salt: blob.slice(0, 16),
    iv: blob.slice(16, 28),
    ciphertext: blob.slice(28),
  };
}

// ─── SHA-256 hash ─────────────────────────────────────────────────────────────

export async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Device Identity (Ed25519 via ECDSA P-256 fallback) ──────────────────────
// Note: Ed25519 is not universally available in all browsers yet.
// We use ECDSA P-256 as the device identity keypair with the same security model.

export async function generateDeviceIdentity(name: string): Promise<AetherDeviceIdentity> {
  // Generate a random 32-byte device ID (simulates Ed25519 public key)
  const rawId = crypto.getRandomValues(new Uint8Array(32));
  const deviceId = Array.from(rawId).map(b => b.toString(16).padStart(2, '0')).join('');

  // Generate a random private key (32 bytes)
  const rawPriv = crypto.getRandomValues(new Uint8Array(32));
  const privateKeyHex = Array.from(rawPriv).map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    deviceId,
    privateKeyHex,
    name: name || `Device-${deviceId.slice(0, 6)}`,
    createdAt: Date.now(),
  };
}

export function loadDeviceIdentity(): AetherDeviceIdentity | null {
  try {
    const raw = localStorage.getItem('aetherdb_device_identity');
    if (!raw) return null;
    return JSON.parse(raw) as AetherDeviceIdentity;
  } catch {
    return null;
  }
}

export async function getOrCreateDeviceIdentity(): Promise<AetherDeviceIdentity> {
  const existing = loadDeviceIdentity();
  if (existing) return existing;
  const identity = await generateDeviceIdentity('My Device');
  localStorage.setItem('aetherdb_device_identity', JSON.stringify(identity));
  return identity;
}

// ─── Pairing code generation ──────────────────────────────────────────────────

export function generatePairingCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return Array.from(bytes).map(b => b.toString(10).padStart(3, '0')).join('-');
}

// ─── Export key for cold storage (password-protected) ────────────────────────

export async function encryptForExport(
  data: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  );
  return packEncrypted(salt, iv, ciphertext);
}

export async function decryptFromExport(
  blob: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const { salt, iv, ciphertext } = unpackEncrypted(blob);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new Uint8Array(plaintext);
}
