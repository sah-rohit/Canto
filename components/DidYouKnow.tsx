import React, { useState, useEffect } from 'react';
import { fetchDidYouKnow } from '../services/aiService';

interface DidYouKnowProps {
  topic: string;
}

const DidYouKnow: React.FC<DidYouKnowProps> = ({ topic }) => {
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
    <div style={{ marginTop: '2.5rem', fontFamily: 'monospace' }}>
      <h3 style={{ fontSize: '1em', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem' }}>
        Did you know?
      </h3>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Uncovering truth...</p>
      ) : (
        <p style={{ margin: 0, fontSize: '1.05em', lineHeight: '1.6', color: 'var(--text-color)' }}>{fact}</p>
      )}
    </div>
  );
};

export default DidYouKnow;
