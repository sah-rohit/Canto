import React, { useState, useEffect } from 'react';
import { fetchRelatedTopics } from '../services/aiService';

interface RelatedTopicsProps {
  topic: string;
  onWordClick: (word: string) => void;
}

const RelatedTopics: React.FC<RelatedTopicsProps> = ({ topic, onWordClick }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    if (topic && topic.trim() !== '') {
      setLoading(true);
      fetchRelatedTopics(topic).then(res => {
        if (active) {
          setTopics(res);
          setLoading(false);
        }
      }).catch(() => {
        if (active) setLoading(false);
      });
    }
    return () => { active = false; };
  }, [topic]);

  if (!topic || (!loading && topics.length === 0)) return null;

  return (
    <div style={{ marginTop: '1.5rem', fontFamily: 'monospace' }}>
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
        <span>Related Topics</span>
        <span style={{ flex: 1, height: '1px', background: 'var(--border-color)', display: 'inline-block', marginLeft: '0.4rem' }} />
      </button>

      {isOpen && (
        <div style={{ borderLeft: '1px solid var(--border-color)', marginLeft: '0.5rem', paddingLeft: '1rem', paddingBottom: '0.5rem', marginTop: '0.3rem' }}>
          {loading ? (
            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85em', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              <span>├──</span>
              <div>Mapping connections...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-color)' }}>
              {topics.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline', fontSize: '0.88em' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{idx === topics.length - 1 ? '└──' : '├──'}</span>
                  <button
                    onClick={() => onWordClick(t)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontSize: '1em',
                      fontFamily: 'monospace',
                      textDecoration: 'underline',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-color)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-color)'; }}
                  >
                    {t}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatedTopics;
