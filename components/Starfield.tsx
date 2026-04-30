import React, { useMemo } from 'react';

interface StarfieldProps {
  topic?: string;
}

const SpaceObjects = [
  // Rocket
  `   /\\
  |==|
  |  |
  |__|
 / /\\ \\
| |__| |
 \\/  \\/
   **`,
  // Galaxy/Blackhole
  `   .  *  .
 *  ( . )  *
  .  *  .`,
  // Comet
  `*~--...`,
  // Satellite
  ` |
-O-
 |`
];

const Starfield: React.FC<StarfieldProps> = ({ topic }) => {
  const stars = useMemo(() => {
    const arr = [];
    const baseDensity = topic ? Math.min(60, 20 + topic.length * 2) : 30; // React to topic length
    const chars = ['+', '*', '.', '·', '°', '✧', '⋆', '✦', '☼'];
    for (let i = 0; i < baseDensity; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const left = Math.random() * 100;
        const top = Math.random() * 80;
        const speedMultiplier = topic ? (Math.random() > 0.5 ? 0.5 : 1) : 1;
        const duration = (1 + Math.random() * 4) * speedMultiplier;
        const delay = Math.random() * 5;
        arr.push(
            <span
               key={i}
               className="star-twinkle interactive-char"
               style={{
                   position: 'absolute',
                   left: `${left}%`,
                   top: `${top}%`,
                   color: 'var(--text-muted)',
                   fontSize: Math.random() > 0.8 ? '1.2em' : '0.8em',
                   animationDuration: `${duration}s`,
                   animationDelay: `${delay}s`,
                   pointerEvents: 'auto', // so hover works
                   cursor: 'default'
               }}
            >
               {char}
            </span>
        );
    }
    return arr;
  }, [topic]);

  const meteors = useMemo(() => {
    const meteorCount = topic ? Math.max(1, Math.floor(topic.length / 5)) : 3;
    const arr = [];
    for (let i = 0; i < meteorCount; i++) {
       const delay = Math.random() * 15;
       const top = Math.random() * 50;
       const scale = 0.5 + Math.random() * 1.5;
       const speed = 2 + Math.random() * 4;
       let char = '—';
       if (topic && topic.toLowerCase().includes('star')) char = '★';
       arr.push(
         <div key={i} className="meteor" style={{ animationDelay: `${delay}s`, top: `${top}%`, fontSize: `${scale}em`, animationDuration: `${speed}s`, color: 'var(--text-muted)' }}>{char}</div>
       );
    }
    return <>{arr}</>;
  }, [topic]);

  const spaceAnomalies = useMemo(() => {
    const anomalyCount = Math.floor(Math.random() * 3); // 0 to 2 objects
    const arr = [];
    for (let i = 0; i < anomalyCount; i++) {
        const obj = SpaceObjects[Math.floor(Math.random() * SpaceObjects.length)];
        const top = 10 + Math.random() * 70;
        const speed = 60 + Math.random() * 120; // very slow
        const delay = Math.random() * 20;
        arr.push(
            <pre key={`anomaly-${i}`} style={{
                position: 'absolute',
                top: `${top}%`,
                left: '-20%',
                opacity: 0.3,
                color: 'var(--text-muted)',
                fontSize: '0.6em',
                animation: `driftRight ${speed}s linear infinite`,
                animationDelay: `${delay}s`,
                pointerEvents: 'none',
                fontFamily: 'monospace'
            }}>
                {obj}
            </pre>
        );
    }
    return arr;
  }, [topic]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {stars}
      {meteors}
      {spaceAnomalies}
      <style>{`
        @keyframes driftRight {
            0% { transform: translateX(-10vw) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateX(120vw) rotate(20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Starfield;
