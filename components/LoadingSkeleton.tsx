/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const LoadingSkeleton: React.FC = () => {
   const [text, setText] = useState('');
   
   useEffect(() => {
      const chars = '01#%*+X=-/.\\';
      const t = setInterval(() => {
         let s = '';
         for (let i = 0; i < 6; i++) {
           for (let j = 0; j < 40; j++) {
              if (Math.random() > 0.6) s += chars[Math.floor(Math.random() * chars.length)];
              else s += ' ';
           }
           s += '\n';
         }
         setText(s);
      }, 100);
      return () => clearInterval(t);
   }, []);

   return (
     <div style={{ margin: '2rem 0', color: 'var(--text-muted)', textAlign: 'center' }} aria-label="Loading content..." role="progressbar">
        <p style={{ letterSpacing: '0.1em', fontSize: '0.9em', textTransform: 'uppercase' }}>Materializing concept...</p>
        <pre className="ascii-art" style={{ opacity: 0.5, marginTop: '1rem', display: 'inline-block', textAlign: 'left' }}>{text}</pre>
     </div>
   );
};

export default LoadingSkeleton;
