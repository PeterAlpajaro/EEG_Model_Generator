import React, { useEffect, useState } from 'react';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';
import Aurora from '@/components/Aurora';

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      {/* Aurora with 50% reduced height */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '11vh', // 50% reduction from previous 22vh
        width: '100%',
        zIndex: 0, 
        overflow: 'visible',
        opacity: 0.6, 
        margin: 0,
        padding: 0
      }}>
        <Aurora 
          colorStops={["#FF8080", "#FFFFFF", "#8B0000"]} 
          amplitude={0.9}  // Reduced amplitude for smaller waves
          blend={1.8}      
          speed={0.5}
        />
      </div>
      
      <PageTransition>
        <div className="page-container">
          <div className="relative flex justify-center w-full mt-auto">
            <h1 
              className={`page-title ${loaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                animationDelay: '300ms',
                fontFamily: '"F37 Zagma", sans-serif'
              }}
            >
              <span className="text-maroon font-bold">Ez-G</span>
              <span className="font-extralight"> creator</span>
            </h1>
            
            {/* Centered decoration element */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-maroon to-transparent"></div>
          </div>

          <div 
            className={`button-container mb-auto ${loaded ? 'opacity-100' : 'opacity-0'}`} 
            style={{ animationDelay: '600ms' }}
          >
            <NavButton to="/instructions">Enter</NavButton>
            <NavButton to="/about">About</NavButton>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Index;
