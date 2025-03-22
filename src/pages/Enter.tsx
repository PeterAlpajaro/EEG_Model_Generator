
import React from 'react';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';

const Enter = () => {
  return (
    <PageTransition>
      <div className="page-container">
        <div className="relative">
          <h1 className="page-title">
            <span className="text-maroon">Enter</span>
            <span className="font-extralight"> the experience</span>
          </h1>
          
          {/* Subtle decoration element */}
          <div className="absolute -bottom-3 left-0 w-20 h-[1px] bg-gradient-to-r from-maroon to-transparent"></div>
        </div>

        <div className="max-w-xl mx-auto glass p-8 mb-12 opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <p className="text-lg font-light leading-relaxed mb-6">
            This is the entry point to the EMG creator platform. Future content and functionality will be placed here.
          </p>
          
          <p className="text-base text-muted-foreground italic">
            This page design maintains the minimalist aesthetic while providing space for future content.
          </p>
        </div>

        <div className="button-container">
          <NavButton to="/" className="text-maroon hover:text-maroon-300">
            Back to Home
          </NavButton>
        </div>
      </div>
    </PageTransition>
  );
};

export default Enter;
