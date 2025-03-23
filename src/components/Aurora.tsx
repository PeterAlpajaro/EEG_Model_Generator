import React from 'react';

const Aurora = () => {

    
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />
      
      {/* Aurora layers */}
      <div className="absolute inset-0">
        {/* First aurora beam */}
        <div 
          className="absolute w-full h-[200%] top-[-50%] left-0 animate-aurora1"
          style={{
            background: 'linear-gradient(90deg, rgba(45,31,170,0.5) 0%, rgba(170,31,138,0.5) 50%, rgba(31,42,170,0.5) 100%)',
            filter: 'blur(60px)',
            transform: 'rotate(-15deg)',
            opacity: 0.3,
          }}
        />
        
        {/* Second aurora beam */}
        <div 
          className="absolute w-full h-[200%] top-[-30%] left-0 animate-aurora2"
          style={{
            background: 'linear-gradient(90deg, rgba(170,31,138,0.5) 0%, rgba(31,42,170,0.5) 50%, rgba(45,31,170,0.5) 100%)',
            filter: 'blur(80px)',
            transform: 'rotate(15deg)',
            opacity: 0.2,
          }}
        />
        
        {/* Third aurora beam */}
        <div 
          className="absolute w-full h-[200%] top-[-70%] left-0 animate-aurora3"
          style={{
            background: 'linear-gradient(90deg, rgba(31,42,170,0.5) 0%, rgba(45,31,170,0.5) 50%, rgba(170,31,138,0.5) 100%)',
            filter: 'blur(40px)',
            transform: 'rotate(-5deg)',
            opacity: 0.25,
          }}
        />
      </div>
    </div>
  );
};

export default Aurora; 