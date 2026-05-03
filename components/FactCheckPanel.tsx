/**
 * FactCheckPanel — real multi-source fact-check of the generated article.
 * Triggered by user click, not shown automatically.
 */
import React, { useState, useCallback } from 'react';
import { factCheckContent, FactCheckResult, FactCheckSource } from '../services/aiService';

interface FactCheckPanelProps {
  topic: string;
  content: string;
  sources: { wikipedia?: string; wikipediaTitle?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
  onFactCheckComplete?: (verifiedCount: number) => void;
}

const VERDICT_LABELS: Record<string, { label: string; color: string }> = {
  verified:        { label: 'Verified',        color: '#2a9d5c' },
  mostly_verified: { label: 'Mostly Verified', color: '#5a9d2a' },
  mixed:           { label: 'Mixed',           color: '#cc8800' },
  unverified:      { label: 'Unverified',      color: '#cc3300' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  verified:  { label: 'Verified',   color: '#2a9d5c' },
  partial:   { label: 'Partial',    color: '#cc8800' },
  not_found: { label: 'Not Found',  color: 'var(--text-muted)' },
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 75 ? '#2a9d5c' : value >= 50 ? '#cc8800' : '#cc3300';
  return (
    <div style={{ marginTop: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7em', color: 'var(--text-muted)', marginBottom: '0.2rem', fontFamily: 'monospace' }}>
        <span>Confidence</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function SourceRow({ source }: { source: FactCheckSource }) {
  const st = STATUS_LABELS[source.status] || STATUS_LABELS.not_found;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-color)', alignItems: 'flex-start' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '0.7em', color: st.color, flexShrink: 0, marginTop: '0.15rem', minWidth: '5.5rem' }}>
        [{st.label}]
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text-color)', fontWeight: 'bold' }}>{source.name}</span>
          {source.url && (
            <a href={source.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.7em', color: 'var(--accent-color)', textDecoration: 'underline', fontFamily: 'monospace' }}>
              ↗
            </a>
          )}
        </div>
        <div style={{ fontSize: '0.72em', color: 'var(--text-muted)', marginTop: '0.1rem', lineHeight: '1.4' }}>{source.note}</div>
      </div>
    </div>
  );
}

const FactCheckPanel: React.FC<FactCheckPanelProps> = ({ topic, content, sources, onFactCheckComplete }) => {
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const runCheck = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setOpen(true);
    try {
      const r = await factCheckContent(topic, content, sources);
      setResult(r);
      const verified = r.sources.filter(s => s.status !== 'not_found').length;
      onFactCheckComplete?.(verified);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [topic, content, sources, loading, onFactCheckComplete]);

  const sourceCount = [sources.wikipedia, sources.nasa, sources.core, sources.internetArchive, sources.crawler].filter(Boolean).length;

  const verdict = result ? VERDICT_LABELS[result.verdict] : null;

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {/* Trigger button */}
      <button
        onClick={result ? () => setOpen(v => !v) : runCheck}
        disabled={loading || !content}
        title={result ? (open ? 'Hide fact-check results' : 'Show fact-check results') : `Cross-reference article against ${sourceCount} knowledge source${sourceCount !== 1 ? 's' : ''}`}
        style={{
          background: 'transparent',
          border: `1px solid ${result ? (verdict?.color || 'var(--border-color)') : 'var(--border-color)'}`,
          color: result ? (verdict?.color || 'var(--text-muted)') : 'var(--text-muted)',
          borderRadius: '2px',
          padding: '0.15rem 0.5rem',
          cursor: loading || !content ? 'default' : 'pointer',
          fontFamily: 'monospace',
          fontSize: '0.72em',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'color 0.15s, border-color 0.15s',
          opacity: !content ? 0.4 : 1,
        }}
      >
        {loading
          ? 'Checking…'
          : result
            ? `${verdict?.label} via ${result.sources.filter(s => s.status !== 'not_found').length} Sources ${open ? '▲' : '▼'}`
            : `Fact-Check via ${sourceCount} Source${sourceCount !== 1 ? 's' : ''}`
        }
      </button>

      {/* Results panel */}
      {open && result && (
        <div style={{
          marginTop: '0.6rem',
          border: '1px solid var(--border-color)',
          padding: '0.8rem 1rem',
          background: 'var(--input-bg)',
          borderRadius: '2px',
          maxWidth: '520px',
        }}>
          {/* Verdict header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82em', fontWeight: 'bold', color: verdict?.color || 'var(--text-color)' }}>
              {verdict?.label}
            </span>
            <span style={{ fontSize: '0.68em', color: 'var(--text-muted)' }}>
              {new Date(result.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <ConfidenceBar value={result.confidence} />

          {/* Summary */}
          <p style={{ fontSize: '0.78em', color: 'var(--text-color)', lineHeight: '1.5', margin: '0.6rem 0 0.5rem' }}>
            {result.summary}
          </p>

          {/* Source breakdown */}
          <div style={{ marginTop: '0.4rem' }}>
            <div style={{ fontSize: '0.65em', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Source Breakdown
            </div>
            {result.sources.map((s, i) => <SourceRow key={i} source={s} />)}
          </div>

          <button
            onClick={() => { setResult(null); setOpen(false); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7em', textDecoration: 'underline', padding: '0.4rem 0 0', fontFamily: 'monospace' }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default FactCheckPanel;
