
import React, { useEffect, useState } from 'react';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <PageTransition>
      <div className="page-container">
        <div className="relative">
          <h1 
            className={`page-title ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ animationDelay: '300ms' }}
          >
            <span className="text-maroon">Ez-G</span>
            <span className="font-extralight"> creator</span>
          </h1>
          
          {/* Subtle decoration element */}
          <div className="absolute -bottom-3 left-0 w-20 h-[1px] bg-gradient-to-r from-maroon to-transparent"></div>
        </div>

        <div 
          className={`button-container ${loaded ? 'opacity-100' : 'opacity-0'}`} 
          style={{ animationDelay: '600ms' }}
        >
          <NavButton to="/enter">Enter</NavButton>
          <NavButton to="/about">About</NavButton>
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
