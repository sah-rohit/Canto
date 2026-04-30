import React, { useState, useEffect } from 'react';
import { fetchRelatedTopics } from '../services/aiService';

interface RelatedTopicsProps {
  topic: string;
  onWordClick: (word: string) => void;
}

const RelatedTopics: React.FC<RelatedTopicsProps> = ({ topic, onWordClick }) => {
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
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
      <h3 style={{ fontSize: '0.9em', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-muted)' }}>
        ✧ Diverging Paths
      </h3>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9em', margin: 0 }}>Mapping connections...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
           {topics.map((t, idx) => (
             <button
                key={idx}
                onClick={() => onWordClick(t)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '2px',
                  fontSize: '0.9em',
                  fontFamily: 'monospace',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-color)'; }}
             >
               {t}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default RelatedTopics;
