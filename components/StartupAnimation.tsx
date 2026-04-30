import React, { useState, useEffect } from 'react';

export const StartupAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const s1 = setTimeout(() => setStep(1), 500);
    const s2 = setTimeout(() => setStep(2), 1200);
    const s3 = setTimeout(() => setStep(3), 2000);
    const s4 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); clearTimeout(s4); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'var(--bg-color)', color: 'var(--text-color)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      zIndex: 10000, fontFamily: 'monospace',
      transition: 'opacity 0.8s ease',
      opacity: step === 3 ? 0 : 1,
      pointerEvents: 'none'
    }}>
      <div style={{ textAlign: 'left', width: '300px' }}>
        <p style={{ margin: '0.2rem', opacity: step >= 0 ? 1 : 0 }}>{'>'} Initializing CANTO protocol...</p>
        <p style={{ margin: '0.2rem', opacity: step >= 1 ? 1 : 0 }}>{'>'} Connecting to universal archive...</p>
        <p style={{ margin: '0.2rem', opacity: step >= 2 ? 1 : 0 }}>{'>'} Boot sequence complete.</p>
      </div>
    </div>
  );
};
