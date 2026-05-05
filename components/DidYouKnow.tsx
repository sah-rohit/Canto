import React, { useState, useEffect } from 'react';
import { fetchDidYouKnow } from '../services/aiService';

interface DidYouKnowProps {
  topic: string;
}

const DidYouKnow: React.FC<DidYouKnowProps> = ({ topic }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [fact, setFact] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    if (topic && topic.trim() !== '') {
      setLoading(true);
      fetchDidYouKnow(topic).then(res => {
        if (active) {
          setFact(res);
          setLoading(false);
        }
      }).catch(() => {
        if (active) setLoading(false);
      });
    }
    return () => { active = false; };
  }, [topic]);

  if (!topic || (!loading && !fact)) return null;

  return (
    <div style={{ marginTop: '2rem', fontFamily: 'monospace' }}>
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'monospace', fontSize: '0.72em',
          color: 'var(--text-muted)', padding: '0.6rem 0',
          width: '100%', textAlign: 'left',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          transition: 'color 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-color)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <span style={{ color: isOpen ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '0.85em' }}>
          {isOpen ? '▼' : '▶'}
        </span>
        <span>◈</span>
        <span>Did You Know?</span>
        <span style={{ flex: 1, height: '1px', background: 'var(--border-color)', display: 'inline-block', marginLeft: '0.4rem' }} />
      </button>

      {isOpen && (
        <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', paddingBottom: '0.5rem', marginTop: '0.3rem' }}>
          {loading ? (
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85em', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              <span>├──</span>
              <div>Uncovering truth...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.9em', lineHeight: '1.6', color: 'var(--text-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>├──</span>
              <div style={{ flex: 1 }}>{fact}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DidYouKnow;
