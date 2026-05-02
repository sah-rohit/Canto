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
    <div style={{ marginTop: '1.5rem', fontFamily: 'monospace' }}>
      <h3 style={{ fontSize: '0.9em', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem' }}>
        Related Topics
      </h3>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9em', margin: 0 }}>Mapping connections...</p>
      ) : (
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.8rem' }}>
           {topics.map((t, idx) => (
             <React.Fragment key={idx}>
               <button
                  onClick={() => onWordClick(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-color)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-color)'; }}
               >
                 {t}
               </button>
               {idx < topics.length - 1 && <span style={{ color: 'var(--text-muted)' }}>•</span>}
             </React.Fragment>
           ))}
        </div>
      )}
    </div>
  );
};

export default RelatedTopics;
