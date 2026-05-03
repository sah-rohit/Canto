/**
 * CantoStore — Sync Layer
 * WebRTC DataChannels for LAN P2P sync.
 * Yjs CRDTs for conflict-free merge.
 * Device identity via Ed25519-style keypairs.
 * No accounts, no servers — pure peer-to-peer.
 */

import * as Y from 'yjs';
import { getDB, exportAllStores, importAllStores } from './dexieDB';
import { getOrCreateDeviceIdentity, generatePairingCode } from './crypto';
import { forceFullFlush } from './writeQueue';
import type {
  CantoDeviceIdentity, CantoPeer, CantoSyncLog, CantoStoreKey,
} from './types';

// ─── Yjs document (CRDT state) ────────────────────────────────────────────────

let _ydoc: Y.Doc | null = null;

export function getYDoc(): Y.Doc {
  if (!_ydoc) {
    _ydoc = new Y.Doc();
  }
  return _ydoc;
}

// ─── Load all stores into Yjs ─────────────────────────────────────────────────

export async function loadStoresIntoYjs(): Promise<void> {
  const doc = getYDoc();
  const stores = await exportAllStores();

  for (const [storeName, records] of Object.entries(stores)) {
    const ymap = doc.getMap(storeName);
    doc.transact(() => {
      for (const record of records) {
        const key = record.topic ?? record.id ?? record.date ?? record.key ?? JSON.stringify(record).slice(0, 20);
        ymap.set(key, record);
      }
    });
  }
}

// ─── Merge Yjs state into Dexie ───────────────────────────────────────────────

export async function mergeYjsIntoDexie(): Promise<void> {
  const doc = getYDoc();
  const merged: Record<string, any[]> = {};

  for (const storeName of doc.share.keys()) {
    const ymap = doc.getMap(storeName);
    merged[storeName] = Array.from(ymap.values());
  }

  if (Object.keys(merged).length > 0) {
    await importAllStores(merged);
    await forceFullFlush();
  }
}

// ─── Peer registry ────────────────────────────────────────────────────────────

const _peers = new Map<string, CantoPeer>();
const _syncLogs: CantoSyncLog[] = [];

export function getKnownPeers(): CantoPeer[] {
  return Array.from(_peers.values());
}

export function getSyncLogs(): CantoSyncLog[] {
  return _syncLogs.slice(-50); // last 50 entries
}

function logSync(log: Omit<CantoSyncLog, 'id'>): void {
  _syncLogs.push({ id: `sync_${Date.now()}`, ...log });
  if (_syncLogs.length > 100) _syncLogs.shift();
}

// ─── WebRTC P2P ───────────────────────────────────────────────────────────────

interface RTCSession {
  peerId: string;
  conn: RTCPeerConnection;
  channel: RTCDataChannel | null;
  state: 'connecting' | 'connected' | 'disconnected';
}

const _sessions = new Map<string, RTCSession>();

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// ─── Initiate connection (offerer side) ───────────────────────────────────────

export async function initiateSync(peerId: string): Promise<string> {
  const identity = await getOrCreateDeviceIdentity();
  const conn = new RTCPeerConnection(RTC_CONFIG);
  const channel = conn.createDataChannel('cantostore-sync', { ordered: true });

  const session: RTCSession = { peerId, conn, channel, state: 'connecting' };
  _sessions.set(peerId, session);

  setupDataChannel(channel, peerId, identity);

  const offer = await conn.createOffer();
  await conn.setLocalDescription(offer);

  // Collect ICE candidates
  const candidates: RTCIceCandidate[] = [];
  await new Promise<void>(resolve => {
    conn.onicecandidate = e => {
      if (e.candidate) candidates.push(e.candidate);
      else resolve();
    };
    setTimeout(resolve, 3000); // timeout
  });

  // Return offer + candidates as a shareable string (QR code / numeric code)
  const offerBundle = JSON.stringify({
    type: 'offer',
    sdp: offer.sdp,
    candidates: candidates.map(c => c.toJSON()),
    deviceId: identity.deviceId,
    deviceName: identity.name,
  });

  return btoa(offerBundle);
}

// ─── Accept connection (answerer side) ───────────────────────────────────────

export async function acceptSync(offerBase64: string): Promise<string> {
  const identity = await getOrCreateDeviceIdentity();
  const offerBundle = JSON.parse(atob(offerBase64));

  const conn = new RTCPeerConnection(RTC_CONFIG);
  const peerId = offerBundle.deviceId;

  const session: RTCSession = { peerId, conn, channel: null, state: 'connecting' };
  _sessions.set(peerId, session);

  conn.ondatachannel = e => {
    session.channel = e.channel;
    setupDataChannel(e.channel, peerId, identity);
  };

  await conn.setRemoteDescription({ type: 'offer', sdp: offerBundle.sdp });

  for (const c of offerBundle.candidates) {
    await conn.addIceCandidate(c).catch(() => {});
  }

  const answer = await conn.createAnswer();
  await conn.setLocalDescription(answer);

  const answerCandidates: RTCIceCandidate[] = [];
  await new Promise<void>(resolve => {
    conn.onicecandidate = e => {
      if (e.candidate) answerCandidates.push(e.candidate);
      else resolve();
    };
    setTimeout(resolve, 3000);
  });

  // Register peer
  _peers.set(peerId, {
    deviceId: peerId,
    name: offerBundle.deviceName ?? peerId.slice(0, 8),
    lastSeen: Date.now(),
    syncStatus: 'pending',
    writeCount: 0,
  });

  const answerBundle = JSON.stringify({
    type: 'answer',
    sdp: answer.sdp,
    candidates: answerCandidates.map(c => c.toJSON()),
    deviceId: identity.deviceId,
    deviceName: identity.name,
  });

  return btoa(answerBundle);
}

// ─── Complete connection (offerer receives answer) ────────────────────────────

export async function completeSync(peerId: string, answerBase64: string): Promise<void> {
  const session = _sessions.get(peerId);
  if (!session) return;

  const answerBundle = JSON.parse(atob(answerBase64));
  await session.conn.setRemoteDescription({ type: 'answer', sdp: answerBundle.sdp });

  for (const c of answerBundle.candidates) {
    await session.conn.addIceCandidate(c).catch(() => {});
  }

  _peers.set(peerId, {
    deviceId: peerId,
    name: answerBundle.deviceName ?? peerId.slice(0, 8),
    lastSeen: Date.now(),
    syncStatus: 'pending',
    writeCount: 0,
  });
}

// ─── Data channel setup ───────────────────────────────────────────────────────

function setupDataChannel(
  channel: RTCDataChannel,
  peerId: string,
  identity: CantoDeviceIdentity
): void {
  channel.binaryType = 'arraybuffer';

  channel.onopen = async () => {
    const session = _sessions.get(peerId);
    if (session) session.state = 'connected';

    const peer = _peers.get(peerId);
    if (peer) peer.syncStatus = 'pending';

    // Send our Yjs state vector
    await loadStoresIntoYjs();
    const doc = getYDoc();
    const stateVector = Y.encodeStateVector(doc);
    channel.send(JSON.stringify({
      type: 'state_vector',
      deviceId: identity.deviceId,
      data: Array.from(stateVector),
    }));
  };

  channel.onmessage = async (e) => {
    try {
      const msg = JSON.parse(e.data);
      await handleSyncMessage(msg, channel, peerId, identity);
    } catch {}
  };

  channel.onclose = () => {
    const session = _sessions.get(peerId);
    if (session) session.state = 'disconnected';
    const peer = _peers.get(peerId);
    if (peer) peer.syncStatus = 'unknown';
  };

  channel.onerror = () => {
    const peer = _peers.get(peerId);
    if (peer) peer.syncStatus = 'error';
  };
}

// ─── Handle incoming sync messages ───────────────────────────────────────────

async function handleSyncMessage(
  msg: any,
  channel: RTCDataChannel,
  peerId: string,
  identity: CantoDeviceIdentity
): Promise<void> {
  const doc = getYDoc();

  if (msg.type === 'state_vector') {
    // Respond with our diff
    const remoteVector = new Uint8Array(msg.data);
    const diff = Y.encodeStateAsUpdate(doc, remoteVector);
    channel.send(JSON.stringify({
      type: 'update',
      deviceId: identity.deviceId,
      data: Array.from(diff),
    }));
  }

  if (msg.type === 'update') {
    const update = new Uint8Array(msg.data);
    Y.applyUpdate(doc, update);
    await mergeYjsIntoDexie();

    const peer = _peers.get(peerId);
    if (peer) {
      peer.lastSeen = Date.now();
      peer.syncStatus = 'synced';
    }

    logSync({
      timestamp: Date.now(),
      peerId,
      direction: 'pull',
      storesAffected: ['history', 'cache', 'favorites', 'codex'],
      recordCount: 0,
      success: true,
    });
  }

  if (msg.type === 'ping') {
    channel.send(JSON.stringify({ type: 'pong', deviceId: identity.deviceId }));
    const peer = _peers.get(peerId);
    if (peer) peer.lastSeen = Date.now();
  }
}

// ─── Push sync to all connected peers ────────────────────────────────────────

export async function pushSyncToAll(): Promise<void> {
  await loadStoresIntoYjs();
  const doc = getYDoc();
  const update = Y.encodeStateAsUpdate(doc);

  for (const [peerId, session] of _sessions) {
    if (session.state === 'connected' && session.channel?.readyState === 'open') {
      try {
        session.channel.send(JSON.stringify({
          type: 'update',
          data: Array.from(update),
        }));
        logSync({
          timestamp: Date.now(),
          peerId,
          direction: 'push',
          storesAffected: ['history', 'cache', 'favorites', 'codex'],
          recordCount: 0,
          success: true,
        });
      } catch {
        logSync({
          timestamp: Date.now(),
          peerId,
          direction: 'push',
          storesAffected: [],
          recordCount: 0,
          success: false,
          error: 'Channel send failed',
        });
      }
    }
  }
}

// ─── Disconnect all ───────────────────────────────────────────────────────────

export function disconnectAll(): void {
  for (const session of _sessions.values()) {
    try { session.conn.close(); } catch {}
  }
  _sessions.clear();
}

// ─── Pairing helpers ──────────────────────────────────────────────────────────

export async function generateQRPayload(): Promise<{ code: string; payload: string }> {
  const code = generatePairingCode();
  const identity = await getOrCreateDeviceIdentity();
  const payload = JSON.stringify({
    deviceId: identity.deviceId,
    name: identity.name,
    code,
    ts: Date.now(),
  });
  return { code, payload: btoa(payload) };
}

export function getConnectedPeerCount(): number {
  return Array.from(_sessions.values()).filter(s => s.state === 'connected').length;
}

