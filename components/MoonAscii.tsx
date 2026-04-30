import React, { useState, useEffect } from 'react';

const MOON_PHASES = [
  // New
  `
    .  *      .  
  *     .  *     
      .      .   
  .       *      
       .         
  `,
  // Waxing Crescent
  `
       _..._     
     .::'   '.   
    :::       :  
    :::       :  
    '::.     .'  
      '-...-'    
  `,
  // First Quarter
  `
       _..._     
     .::::. '.   
    :::::::   :  
    :::::::   :  
    ':::::: .'   
      '-...-'    
  `,
  // Waxing Gibbous
  `
       _..._     
     .:::::::_   
    ::::::::::\\  
    ::::::::::/  
    '::::::::'   
      '-...-'    
  `,
  // Full
  `
       _..._     
     .:::::::_   
    :::::::::::  
    :::::::::::  
    ':::::::::'  
      '-...-'    
  `,
  // Waning Gibbous
  `
       _..._     
     _:::::::.   
    /::::::::::  
    \\::::::::::  
     ':::::::'   
      '-...-'    
  `,
  // Last Quarter
  `
       _..._     
     .' .::::.   
    :   :::::::  
    :   :::::::  
     '. ::::::'  
      '-...-'    
  `,
  // Waning Crescent
  `
       _..._     
     .'   '::.   
    :       :::  
    :       :::  
     '.     .::' 
      '-...-'    
  `
];

const MoonAscii: React.FC = () => {
   const [phaseIndex, setPhaseIndex] = useState(0);
   
   useEffect(() => {
      const interval = setInterval(() => {
         setPhaseIndex(prev => (prev + 1) % MOON_PHASES.length);
      }, 1500); // Change phase every 1.5 second
      return () => clearInterval(interval);
   }, []);
   
   return (
      <pre className="ascii-art moon-animated" style={{ color: '#aaa', margin: 0, fontSize: '0.7em' }}>
{MOON_PHASES[phaseIndex]}
      </pre>
   );
};

export default MoonAscii;
