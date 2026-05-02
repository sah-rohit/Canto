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
    <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '0' }}>
      <h3 style={{ fontSize: '1em', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.8rem', color: 'var(--text-color)', fontFamily: 'monospace' }}>
        Did you know?
      </h3>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.05em', margin: 0, fontFamily: 'monospace' }}>Uncovering truth...</p>
      ) : (
        <p style={{ margin: 0, fontSize: '1.1em', lineHeight: '1.6', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fact}</p>
      )}
    </div>
  );
};

export default DidYouKnow;
