/**
 * FactCheckPanel — real multi-source fact-check of the generated article.
 * Triggered by user click. Resets when topic changes.
 * Uses ASCII progress bar for confidence — no CSS gradients.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { factCheckContent, FactCheckResult, FactCheckSource } from '../services/aiService';

interface FactCheckPanelProps {
  topic: string;
  content: string;
  sources: { wikipedia?: string; wikipediaTitle?: string; nasa?: string; core?: string; internetArchive?: string; crawler?: string };
  onFactCheckComplete?: (verifiedCount: number) => void;
}

const VERDICT_LABELS: Record<string, { label: string }> = {
  verified:        { label: 'Verified' },
  mostly_verified: { label: 'Mostly Verified' },
  mixed:           { label: 'Mixed' },
  unverified:      { label: 'Unverified' },
};

const STATUS_CHAR: Record<string, string> = {
  verified:  '◆',
  partial:   '◈',
  not_found: '◇',
};

// Pure ASCII block bar — no AI, no API, computed locally
function AsciiBar({ value, width = 18 }: { value: number; width?: number }) {
  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--accent-color)' }}>
      [{bar}] {value}%
    </span>
  );
}

function SourceLine({ source }: { source: FactCheckSource }) {
  const ch = STATUS_CHAR[source.status] || '◇';
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.78em', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
      <span style={{ color: 'var(--accent-color)', flexShrink: 0 }}>{ch}</span>
      <span>
        <strong>{source.name}</strong>
        {source.url && (
          <a href={source.url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent-color)', textDecoration: 'underline', marginLeft: '0.3rem', fontSize: '0.85em' }}>↗</a>
        )}
        <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>— {source.note}</span>
      </span>
    </div>
  );
}

const FactCheckPanel: React.FC<FactCheckPanelProps> = ({ topic, content, sources, onFactCheckComplete }) => {
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevTopicRef = useRef(topic);

  // Reset when topic changes
  useEffect(() => {
    if (prevTopicRef.current !== topic) {
      prevTopicRef.current = topic;
      setResult(null);
      setOpen(false);
      setError(null);
      setLoading(false);
    }
  }, [topic]);

  const runCheck = useCallback(async () => {
    if (loading || !content) return;
    setLoading(true);
    setOpen(true);
    setError(null);
    setResult(null);
    try {
      const r = await factCheckContent(topic, content, sources);
      setResult(r);
      const verified = r.sources.filter(s => s.status !== 'not_found').length;
      onFactCheckComplete?.(verified);
    } catch (e) {
      setError('Fact-check could not be completed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [topic, content, sources, loading, onFactCheckComplete]);

  const sourceCount = [sources.wikipedia, sources.nasa, sources.core, sources.internetArchive, sources.crawler].filter(Boolean).length;
  const verdict = result ? VERDICT_LABELS[result.verdict] : null;

  // Loading animation — pure JS, no AI
  const [loadDots, setLoadDots] = useState('');
  useEffect(() => {
    if (!loading) { setLoadDots(''); return; }
    const t = setInterval(() => setLoadDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, [loading]);

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {/* Trigger / toggle button — plain text style matching the site */}
      <button
        onClick={result ? () => setOpen(v => !v) : runCheck}
        disabled={loading || !content}
        style={{
          background: 'transparent', border: 'none', padding: 0,
          cursor: loading || !content ? 'default' : 'pointer',
          fontFamily: 'monospace', fontSize: '0.72em',
          color: result ? 'var(--accent-color)' : 'var(--text-muted)',
          textDecoration: 'underline',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          opacity: !content ? 0.4 : 1,
        }}
      >
        {loading
          ? `Checking${loadDots}`
          : result
            ? `${verdict?.label} via ${result.sources.filter(s => s.status !== 'not_found').length} Sources ${open ? '▲' : '▼'}`
            : `Fact-Check via ${sourceCount} Source${sourceCount !== 1 ? 's' : ''}`
        }
      </button>

      {/* Results — inline, no box */}
      {open && (result || error) && (
        <div style={{ marginTop: '0.6rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
          {error && (
            <div style={{ fontSize: '0.78em', color: 'var(--text-muted)' }}>
              {error}
              <button onClick={runCheck} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'monospace', fontSize: '1em', textDecoration: 'underline', marginLeft: '0.5rem' }}>
                Retry
              </button>
            </div>
          )}
          {result && (
            <>
              {/* Confidence bar */}
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68em', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Confidence</span>
                <AsciiBar value={result.confidence} />
              </div>

              {/* Summary */}
              <p style={{ fontSize: '0.78em', color: 'var(--text-color)', lineHeight: '1.5', margin: '0 0 0.5rem' }}>
                {result.summary}
              </p>

              {/* Sources */}
              <div style={{ fontSize: '0.68em', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Source Breakdown
              </div>
              {result.sources.map((s, i) => <SourceLine key={i} source={s} />)}

              <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.68em', color: 'var(--text-muted)' }}>
                  {new Date(result.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => { setResult(null); setOpen(false); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.68em', textDecoration: 'underline', padding: 0, fontFamily: 'monospace' }}
                >
                  Clear
                </button>
                <button
                  onClick={runCheck}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.68em', textDecoration: 'underline', padding: 0, fontFamily: 'monospace' }}
                >
                  Re-check
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FactCheckPanel;
