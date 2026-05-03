/**
 * DataCenter — My Data Center Dashboard
 * AetherDB management UI styled exactly like CantoCodex / ResearchPanel.
 * Raw encyclopedic monospace format. Collapsible tree sections.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  refreshHealthReport, getDeviceId,
  requestFolderAccess, clearFolderHandle, isFSAccessAvailable, isOPFSAvailable,
  getFolderName, getStoredFolderHandle,
  forceFullFlush, getPendingFlushCount,
  exportToFile, importFromFile, estimateExportSize,
  getSnapshots, restoreFromSnapshot,
  getTrashItems, restoreFromTrash, emptyTrash,
  runIntegrityCheck,
  getKnownPeers, getSyncLogs, pushSyncToAll, disconnectAll,
  generateQRPayload, getConnectedPeerCount, acceptSync,
  estimateIndexedDBSize, countAllRecords, clearAllStores,
  formatBytes,
} from "../services/aetherdb";
import type {
  AetherHealthReport, AetherSnapshot, AetherTrashEntry,
  AetherPeer, AetherSyncLog, AetherLayerStatus,
} from "../services/aetherdb";

// ── Style tokens (identical to ResearchPanel / CantoCodex) ───────────────────

const sectionLabel: React.CSSProperties = {
  fontSize: "0.7em", letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--text-muted)", fontFamily: "monospace",
  marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem",
};

const treeLine: React.CSSProperties = {
  borderLeft: "1px solid var(--border-color)",
  marginLeft: "0.5rem", paddingLeft: "1rem",
};

const treeNodeStyle = (active = false): React.CSSProperties => ({
  display: "block", width: "100%", textAlign: "left",
  background: "transparent", border: "none",
  borderLeft: `2px solid ${active ? "var(--accent-color)" : "transparent"}`,
  paddingLeft: "0.6rem", paddingTop: "0.3rem", paddingBottom: "0.3rem",
  cursor: "pointer", fontFamily: "monospace", fontSize: "0.88em",
  color: active ? "var(--accent-color)" : "var(--text-color)",
  transition: "border-color 0.12s, color 0.12s", marginBottom: "0.15rem",
});

const metaTag: React.CSSProperties = {
  fontSize: "0.7em", color: "var(--text-muted)", fontFamily: "monospace", marginLeft: "0.4rem",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function AsciiBar({ percent, width = 18 }: { percent: number; width?: number }) {
  const filled = Math.round((percent / 100) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  return (
    <span style={{ fontFamily: "monospace", fontSize: "0.8em", color: "var(--accent-color)", letterSpacing: 0 }}>
      [{bar}] {percent}%
    </span>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{ color: ok ? "var(--accent-color)" : "var(--text-muted)", fontSize: "0.8em", marginRight: "0.4rem" }}>
      {ok ? "◆" : "◇"}
    </span>
  );
}

function SectionToggle({
  label, icon = "◈", open, onToggle, badge,
}: {
  label: string; icon?: string; open: boolean; onToggle: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: "monospace", fontSize: "0.72em",
        color: "var(--text-muted)", padding: "0.6rem 0",
        width: "100%", textAlign: "left",
        letterSpacing: "0.18em", textTransform: "uppercase",
        transition: "color 0.12s",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = "var(--text-color)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      <span style={{ color: open ? "var(--accent-color)" : "var(--text-muted)", fontSize: "0.85em" }}>
        {open ? "▼" : "▶"}
      </span>
      <span>{icon}</span>
      <span>{label}</span>
      {badge && (
        <span style={{ color: "var(--accent-color)", fontSize: "0.85em", textTransform: "none", letterSpacing: 0, marginLeft: "0.2rem" }}>
          {badge}
        </span>
      )}
      <span style={{ flex: 1, height: "1px", background: "var(--border-color)", display: "inline-block", marginLeft: "0.4rem" }} />
    </button>
  );
}

function ActionBtn({
  label, onClick, active = false, danger = false, disabled = false,
}: {
  label: string; onClick: () => void; active?: boolean; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none", border: "none",
        borderLeft: `2px solid ${active ? "var(--accent-color)" : "transparent"}`,
        paddingLeft: "0.5rem", paddingTop: "0.2rem", paddingBottom: "0.2rem",
        color: danger ? "#ff4444" : active ? "var(--accent-color)" : "var(--text-muted)",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "monospace", fontSize: "0.85em",
        transition: "border-color 0.12s, color 0.12s",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderLeftColor = "var(--accent-color)"; e.currentTarget.style.color = danger ? "#ff6666" : "var(--accent-color)"; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderLeftColor = active ? "var(--accent-color)" : "transparent"; e.currentTarget.style.color = danger ? "#ff4444" : active ? "var(--accent-color)" : "var(--text-muted)"; } }}
    >
      {label}
    </button>
  );
}

// ── Section: Storage Overview ────────────────────────────────────────────────

function StorageOverview({ report, counts, idbBytes }: {
  report: AetherHealthReport | null;
  counts: Record<string, number>;
  idbBytes: number;
}) {
  const totalRecords = Object.values(counts).reduce((s, n) => s + n, 0);
  const stores = [
    ["cache", "Article Cache"],
    ["history", "Search History"],
    ["favorites", "Starred Articles"],
    ["folders", "Folders"],
    ["analytics", "Analytics"],
    ["codex", "Codex State"],
    ["notes", "Personal Notes"],
    ["graphs", "Canto Labs Graphs"],
    ["artHistory", "ASCII Art History"],
    ["collections", "Collections"],
    ["trash", "Trash"],
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <div>
        <div style={sectionLabel}>Storage Usage</div>
        <div style={treeLine}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.82em", width: "100%", maxWidth: "420px", fontFamily: "monospace" }}>
            <tbody>
              {[
                ["IndexedDB (Dexie)", formatBytes(idbBytes)],
                ["Total Records", String(totalRecords)],
                ["OPFS Available", isOPFSAvailable() ? "yes" : "no"],
                ["External Folder", isFSAccessAvailable() ? "supported" : "not supported"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "var(--text-muted)", paddingRight: "1.5rem", paddingBottom: "0.2rem", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{ color: "var(--text-color)" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Record Counts</div>
        <div style={treeLine}>
          {stores.map(([key, label]) => (
            <div key={key} style={{ display: "flex", gap: "0.5rem", fontSize: "0.82em", fontFamily: "monospace", marginBottom: "0.15rem" }}>
              <span style={{ color: "var(--text-muted)", minWidth: "1rem" }}>├──</span>
              <span style={{ flex: 1, color: "var(--text-color)" }}>{label}</span>
              <span style={{ color: (counts[key] ?? 0) > 0 ? "var(--accent-color)" : "var(--text-muted)" }}>
                {counts[key] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Persistence Layers</div>
        <div style={treeLine}>
          {(report?.layers ?? []).map(layer => (
            <div key={layer.layer} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.3rem", fontFamily: "monospace", fontSize: "0.82em" }}>
              <StatusDot ok={layer.available && layer.healthy} />
              <span style={{ color: "var(--text-muted)", minWidth: "1.2rem" }}>L{layer.layer}</span>
              <span style={{ flex: 1, color: layer.healthy ? "var(--text-color)" : "var(--text-muted)" }}>{layer.name}</span>
              <span style={{ fontSize: "0.75em", color: layer.healthy ? "var(--accent-color)" : "var(--text-muted)" }}>
                {!layer.available ? "unavailable" : layer.healthy ? "healthy" : "offline"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: Sync ────────────────────────────────────────────────────────────

function SyncSection({ deviceId }: { deviceId: string }) {
  const [peers, setPeers] = useState<AetherPeer[]>([]);
  const [logs, setLogs] = useState<AetherSyncLog[]>([]);
  const [qrPayload, setQrPayload] = useState<{ code: string; payload: string } | null>(null);
  const [offerInput, setOfferInput] = useState("");
  const [answerOutput, setAnswerOutput] = useState("");
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(() => {
    setPeers(getKnownPeers());
    setLogs(getSyncLogs().slice(-8).reverse());
  }, []);

  useEffect(() => { refresh(); const t = setInterval(refresh, 3000); return () => clearInterval(t); }, [refresh]);

  const handleGenerateQR = async () => {
    const p = await generateQRPayload();
    setQrPayload(p);
  };

  const handleAccept = async () => {
    if (!offerInput.trim()) return;
    try {
      const answer = await acceptSync(offerInput.trim());
      setAnswerOutput(answer);
      setStatus("Answer generated — share it with the initiating device.");
      refresh();
    } catch (e) {
      setStatus("Error: " + String(e));
    }
  };

  const handlePush = async () => {
    setSyncing(true);
    setStatus("Pushing…");
    try {
      await pushSyncToAll();
      setStatus("Sync pushed to all connected peers.");
    } catch {
      setStatus("Push failed.");
    } finally {
      setSyncing(false);
      refresh();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <div style={sectionLabel}>Device Identity</div>
        <div style={treeLine}>
          <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", wordBreak: "break-all" }}>
            ID: <span style={{ color: "var(--text-color)" }}>{deviceId.slice(0, 16)}…{deviceId.slice(-8)}</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Connected peers: <span style={{ color: "var(--accent-color)" }}>{getConnectedPeerCount()}</span>
          </div>
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Pair a New Device</div>
        <div style={treeLine}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <ActionBtn label="Generate Pairing Code" onClick={handleGenerateQR} />
          </div>
          {qrPayload && (
            <div style={{ fontFamily: "monospace", fontSize: "0.78em", marginBottom: "0.5rem" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "0.2rem" }}>Code: <span style={{ color: "var(--accent-color)", letterSpacing: "0.2em" }}>{qrPayload.code}</span></div>
              <div style={{ color: "var(--text-muted)", marginBottom: "0.3rem" }}>Payload (share with peer):</div>
              <div style={{ color: "var(--text-color)", wordBreak: "break-all", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem", fontSize: "0.85em" }}>
                {qrPayload.payload.slice(0, 80)}…
              </div>
            </div>
          )}
          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ ...sectionLabel, marginBottom: "0.3rem" }}>Accept Offer from Peer</div>
            <input
              value={offerInput}
              onChange={e => setOfferInput(e.target.value)}
              placeholder="Paste offer payload here…"
              style={{
                width: "100%", background: "transparent", border: "none",
                borderBottom: "1px solid var(--border-color)", color: "var(--text-color)",
                fontFamily: "monospace", fontSize: "0.82em", outline: "none",
                padding: "0.3rem 0.4rem", boxSizing: "border-box", marginBottom: "0.4rem",
              }}
            />
            <ActionBtn label="Accept & Generate Answer" onClick={handleAccept} />
            {answerOutput && (
              <div style={{ fontFamily: "monospace", fontSize: "0.75em", color: "var(--text-muted)", marginTop: "0.4rem", wordBreak: "break-all", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem" }}>
                Answer: {answerOutput.slice(0, 80)}…
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Connected Peers</div>
        <div style={treeLine}>
          {peers.length === 0 && <span style={{ fontSize: "0.82em", color: "var(--text-muted)" }}>No peers connected yet.</span>}
          {peers.map(p => (
            <div key={p.deviceId} style={{ display: "flex", gap: "0.5rem", fontSize: "0.82em", fontFamily: "monospace", marginBottom: "0.2rem", alignItems: "center" }}>
              <StatusDot ok={p.syncStatus === "synced"} />
              <span style={{ flex: 1, color: "var(--text-color)" }}>{p.name}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75em" }}>{p.syncStatus}</span>
            </div>
          ))}
          {peers.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              <ActionBtn label="Force Sync" onClick={handlePush} disabled={syncing} />
              <ActionBtn label="Disconnect All" onClick={() => { disconnectAll(); refresh(); }} danger />
            </div>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div>
          <div style={sectionLabel}>Sync Log</div>
          <div style={treeLine}>
            {logs.map(l => (
              <div key={l.id} style={{ fontFamily: "monospace", fontSize: "0.75em", color: l.success ? "var(--text-muted)" : "#ff4444", marginBottom: "0.15rem" }}>
                <span style={{ color: "var(--accent-color)" }}>{l.direction}</span>
                {" "}→ {l.peerId.slice(0, 8)}
                <span style={metaTag}>{new Date(l.timestamp).toLocaleTimeString()}</span>
                {!l.success && <span style={{ color: "#ff4444" }}> [{l.error}]</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {status && (
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Section: Snapshots ───────────────────────────────────────────────────────

function SnapshotsSection({ deviceId }: { deviceId: string }) {
  const [snaps, setSnaps] = useState<AetherSnapshot[]>([]);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setSnaps(await getSnapshots());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRestore = async (id: string, label: string) => {
    if (!window.confirm(`Restore from snapshot "${label}"? Current data will be overwritten.`)) return;
    setRestoring(id);
    setStatus("Restoring…");
    const ok = await restoreFromSnapshot(id, deviceId);
    setStatus(ok ? `Restored from "${label}" successfully.` : "Restore failed — snapshot not found on disk.");
    setRestoring(null);
    load();
  };

  const SNAP_ORDER = ["snap_now", "snap_1h", "snap_1d", "snap_1w", "snap_1m"];
  const snapMap = new Map(snaps.map(s => [s.id, s]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={sectionLabel}>Snapshot Carousel — 5 Rolling Points</div>
      <div style={treeLine}>
        {SNAP_ORDER.map(id => {
          const snap = snapMap.get(id);
          const labels: Record<string, string> = {
            snap_now: "Now", snap_1h: "1 hour ago",
            snap_1d: "1 day ago", snap_1w: "1 week ago", snap_1m: "1 month ago",
          };
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", fontFamily: "monospace", fontSize: "0.82em", flexWrap: "wrap" }}>
              <StatusDot ok={!!snap} />
              <span style={{ color: "var(--text-color)", minWidth: "7rem" }}>{labels[id]}</span>
              {snap ? (
                <>
                  <span style={metaTag}>{new Date(snap.timestamp).toLocaleString()}</span>
                  <span style={metaTag}>{formatBytes(snap.sizeBytes)}</span>
                  <ActionBtn
                    label={restoring === id ? "Restoring…" : "Restore"}
                    onClick={() => handleRestore(id, labels[id])}
                    disabled={restoring !== null}
                  />
                </>
              ) : (
                <span style={{ color: "var(--text-muted)", fontSize: "0.78em" }}>— no snapshot yet</span>
              )}
            </div>
          );
        })}
      </div>
      {status && (
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem", marginTop: "0.3rem" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Section: Trash ───────────────────────────────────────────────────────────

function TrashSection() {
  const [items, setItems] = useState<AetherTrashEntry[]>([]);
  const [undoQueue, setUndoQueue] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setItems(await getTrashItems());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRestore = async (id: string) => {
    const ok = await restoreFromTrash(id);
    setStatus(ok ? "Item restored." : "Restore failed.");
    load();
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Permanently delete all trash items?")) return;
    const n = await emptyTrash();
    setStatus(`Emptied ${n} item${n !== 1 ? "s" : ""} from trash.`);
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={sectionLabel}>Soft-Delete Trash</div>
        {items.length > 0 && <ActionBtn label="Empty Trash" onClick={handleEmptyTrash} danger />}
      </div>
      <div style={treeLine}>
        {items.length === 0 && <span style={{ fontSize: "0.82em", color: "var(--text-muted)" }}>Trash is empty.</span>}
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", fontFamily: "monospace", fontSize: "0.82em", flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-muted)", minWidth: "5rem" }}>{item.store}</span>
            <span style={{ flex: 1, color: "var(--text-color)" }}>{item.key.slice(0, 30)}</span>
            <span style={metaTag}>{new Date(item.deletedAt).toLocaleDateString()}</span>
            <ActionBtn label="Restore" onClick={() => handleRestore(item.id)} />
          </div>
        ))}
      </div>
      {status && (
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Section: Export / Import ─────────────────────────────────────────────────

function ExportImportSection({ deviceId }: { deviceId: string }) {
  const [exportSize, setExportSize] = useState("…");
  const [exportPassword, setExportPassword] = useState("");
  const [importPassword, setImportPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    estimateExportSize().then(setExportSize);
  }, []);

  const handleExport = async () => {
    setBusy(true);
    setStatus("Preparing export…");
    try {
      await exportToFile(deviceId, exportPassword || undefined);
      setStatus("Export downloaded successfully.");
    } catch (e) {
      setStatus("Export failed: " + String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Importing…");
    try {
      const result = await importFromFile(file, importPassword || undefined);
      if (result.success) {
        setStatus(`Imported ${result.recordCount} records successfully. Reload to see changes.`);
      } else {
        setStatus("Import failed: " + result.error);
      }
    } catch (err) {
      setStatus("Import error: " + String(err));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <div style={sectionLabel}>Export — Cold Storage Backup</div>
        <div style={treeLine}>
          <div style={{ fontFamily: "monospace", fontSize: "0.82em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Estimated size: <span style={{ color: "var(--text-color)" }}>{exportSize}</span>
            <span style={metaTag}>compressed + encrypted</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7em", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "monospace" }}>Password (optional):</span>
            <input
              type="password"
              value={exportPassword}
              onChange={e => setExportPassword(e.target.value)}
              placeholder="Leave blank for device-key encryption"
              style={{
                background: "transparent", border: "none",
                borderBottom: "1px solid var(--border-color)",
                color: "var(--text-color)", fontFamily: "monospace",
                fontSize: "0.82em", outline: "none", padding: "0.2rem 0.4rem", flex: 1, minWidth: "160px",
              }}
            />
          </div>
          <ActionBtn label={busy ? "Exporting…" : "Download .aetherdb"} onClick={handleExport} disabled={busy} active />
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Import — Restore from File</div>
        <div style={treeLine}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7em", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "monospace" }}>Password (if encrypted):</span>
            <input
              type="password"
              value={importPassword}
              onChange={e => setImportPassword(e.target.value)}
              placeholder="Leave blank if not password-protected"
              style={{
                background: "transparent", border: "none",
                borderBottom: "1px solid var(--border-color)",
                color: "var(--text-color)", fontFamily: "monospace",
                fontSize: "0.82em", outline: "none", padding: "0.2rem 0.4rem", flex: 1, minWidth: "160px",
              }}
            />
          </div>
          <input ref={fileRef} type="file" accept=".aetherdb,.json" onChange={handleImport} style={{ display: "none" }} />
          <ActionBtn label={busy ? "Importing…" : "Choose .aetherdb File"} onClick={() => fileRef.current?.click()} disabled={busy} />
        </div>
      </div>

      {status && (
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Section: External Folder ─────────────────────────────────────────────────

function ExternalFolderSection({ deviceId }: { deviceId: string }) {
  const [folderName, setFolderName] = useState<string>("—");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("");
  const [flushing, setFlushing] = useState(false);

  const checkFolder = useCallback(async () => {
    const handle = await getStoredFolderHandle();
    setConnected(!!handle);
    setFolderName(getFolderName(handle));
  }, []);

  useEffect(() => { checkFolder(); }, [checkFolder]);

  const handleConnect = async () => {
    setStatus("Opening folder picker…");
    const handle = await requestFolderAccess();
    if (handle) {
      setConnected(true);
      setFolderName(handle.name);
      setStatus(`Connected to "${handle.name}". Data will sync here automatically.`);
    } else {
      setStatus("Folder access cancelled or denied.");
    }
  };

  const handleDisconnect = () => {
    clearFolderHandle();
    setConnected(false);
    setFolderName("—");
    setStatus("External folder disconnected.");
  };

  const handleFlush = async () => {
    setFlushing(true);
    setStatus("Flushing all data to disk…");
    try {
      await forceFullFlush();
      setStatus("All data flushed to external folder successfully.");
    } catch {
      setStatus("Flush failed.");
    } finally {
      setFlushing(false);
    }
  };

  if (!isFSAccessAvailable()) {
    return (
      <div style={{ fontFamily: "monospace", fontSize: "0.82em", color: "var(--text-muted)" }}>
        File System Access API not supported in this browser.
        <span style={metaTag}>Use Chrome or Edge for external folder support.</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <div>
        <div style={sectionLabel}>External Folder (Layer 3)</div>
        <div style={treeLine}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.82em", fontFamily: "monospace", marginBottom: "0.5rem" }}>
            <tbody>
              <tr>
                <td style={{ color: "var(--text-muted)", paddingRight: "1.5rem", paddingBottom: "0.2rem" }}>Status</td>
                <td style={{ color: connected ? "var(--accent-color)" : "var(--text-muted)" }}>{connected ? "connected" : "not connected"}</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text-muted)", paddingRight: "1.5rem", paddingBottom: "0.2rem" }}>Folder</td>
                <td style={{ color: "var(--text-color)" }}>{folderName}</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text-muted)", paddingRight: "1.5rem" }}>Use for</td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.9em" }}>Dropbox / Google Drive / USB / NAS</td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {!connected
              ? <ActionBtn label="Connect Folder" onClick={handleConnect} active />
              : <>
                  <ActionBtn label={flushing ? "Flushing…" : "Force Flush to Folder"} onClick={handleFlush} disabled={flushing} active />
                  <ActionBtn label="Disconnect" onClick={handleDisconnect} danger />
                </>
            }
          </div>
        </div>
      </div>
      {status && (
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Section: Danger Zone ─────────────────────────────────────────────────────

function DangerZone({ onClearAll }: { onClearAll: () => void }) {
  const [status, setStatus] = useState("");
  const [checking, setChecking] = useState(false);
  const deviceId = getDeviceId();

  const handleIntegrityCheck = async () => {
    setChecking(true);
    setStatus("Running integrity check…");
    const result = await runIntegrityCheck(deviceId);
    if (result.healthy) {
      setStatus("All files verified — no corruption detected.");
    } else {
      setStatus(`Corruption detected in ${result.corrupted.length} file(s). Auto-repaired: ${result.repaired.length}.`);
    }
    setChecking(false);
  };

  const handleClearAll = async () => {
    if (!window.confirm("This will permanently delete ALL local data. Are you absolutely sure?")) return;
    if (!window.confirm("Last chance — this cannot be undone. Delete everything?")) return;
    await clearAllStores();
    setStatus("All data cleared.");
    onClearAll();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <div style={sectionLabel}>Integrity & Maintenance</div>
      <div style={treeLine}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <ActionBtn label={checking ? "Checking…" : "Run Integrity Check"} onClick={handleIntegrityCheck} disabled={checking} />
          <ActionBtn label="Force Full Flush" onClick={() => forceFullFlush().then(() => setStatus("Flush complete."))} />
        </div>
      </div>

      <div style={sectionLabel}>Danger Zone</div>
      <div style={{ ...treeLine, borderLeftColor: "#ff444433" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Clears all IndexedDB data. Disk backups (OPFS / external folder) are preserved.
        </div>
        <ActionBtn label="Clear All Local Data" onClick={handleClearAll} danger />
      </div>

      {status && (
        <div style={{ fontFamily: "monospace", fontSize: "0.78em", color: "var(--text-muted)", borderLeft: "2px solid var(--border-color)", paddingLeft: "0.6rem" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Main DataCenter Component ────────────────────────────────────────────────

export interface DataCenterProps {
  isOpen: boolean;
  onToggle: () => void;
  hideHeader?: boolean;
}

const DataCenter: React.FC<DataCenterProps> = ({ isOpen, onToggle, hideHeader }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "sync" | "snapshots" | "trash" | "export" | "folder" | "danger">("overview");
  const [report, setReport] = useState<AetherHealthReport | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [idbBytes, setIdbBytes] = useState(0);
  const [deviceId, setDeviceId] = useState("");
  const [pendingFlush, setPendingFlush] = useState(0);

  const loadStats = useCallback(async () => {
    const [r, c, b] = await Promise.all([
      refreshHealthReport(),
      countAllRecords(),
      estimateIndexedDBSize(),
    ]);
    setReport(r);
    setCounts(c);
    setIdbBytes(b);
    setDeviceId(getDeviceId());
    setPendingFlush(getPendingFlushCount());
  }, []);

  useEffect(() => {
    if (isOpen) loadStats();
  }, [isOpen, loadStats]);

  // Refresh pending flush count every 2s
  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setPendingFlush(getPendingFlushCount()), 2000);
    return () => clearInterval(t);
  }, [isOpen]);

  const tabs = [
    { id: "overview",  label: "Overview"  },
    { id: "sync",      label: "Sync"      },
    { id: "snapshots", label: "Snapshots" },
    { id: "trash",     label: "Trash"     },
    { id: "export",    label: "Export"    },
    { id: "folder",    label: "Folder"    },
    { id: "danger",    label: "Danger"    },
  ] as const;

  const healthy = report?.healthy ?? true;

  return (
    <div style={{ borderTop: hideHeader ? "none" : "1px solid var(--border-color)", marginTop: hideHeader ? 0 : "2rem", fontFamily: "monospace" }}>

      {/* ── Header toggle ── */}
      {!hideHeader && (
        <button
          onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: "0.72em",
            color: "var(--text-muted)", padding: "0.8rem 0",
            width: "100%", textAlign: "left",
            letterSpacing: "0.18em", textTransform: "uppercase",
            transition: "color 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-color)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <span style={{ color: isOpen ? "var(--accent-color)" : "var(--text-muted)", fontSize: "0.85em" }}>
            {isOpen ? "▼" : "▶"}
          </span>
          <span>◈</span>
          <span>My Data Center</span>
          {!healthy && (
            <span style={{ color: "#ff4444", fontSize: "0.85em", textTransform: "none", letterSpacing: 0 }}>
              [!] integrity issue
            </span>
          )}
          {pendingFlush > 0 && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.85em", textTransform: "none", letterSpacing: 0 }}>
              — {pendingFlush} pending flush
            </span>
          )}
          <span style={{ flex: 1, height: "1px", background: "var(--border-color)", display: "inline-block", marginLeft: "0.4rem" }} />
        </button>
      )}

      {/* ── Body ── */}
      {isOpen && (
        <div style={{ paddingBottom: "2rem" }}>

          {/* Tab bar */}
          <div style={{
            display: "flex", gap: "0.8rem", flexWrap: "wrap",
            marginBottom: "1rem", fontSize: "0.78em",
            borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem",
          }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: "none", border: "none", padding: 0,
                  fontFamily: "monospace", fontSize: "1em",
                  color: activeTab === t.id ? "var(--accent-color)" : "var(--text-muted)",
                  textDecoration: activeTab === t.id ? "underline" : "none",
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ minHeight: "8rem" }}>
            {activeTab === "overview"  && <StorageOverview report={report} counts={counts} idbBytes={idbBytes} />}
            {activeTab === "sync"      && <SyncSection deviceId={deviceId} />}
            {activeTab === "snapshots" && <SnapshotsSection deviceId={deviceId} />}
            {activeTab === "trash"     && <TrashSection />}
            {activeTab === "export"    && <ExportImportSection deviceId={deviceId} />}
            {activeTab === "folder"    && <ExternalFolderSection deviceId={deviceId} />}
            {activeTab === "danger"    && <DangerZone onClearAll={loadStats} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCenter;



