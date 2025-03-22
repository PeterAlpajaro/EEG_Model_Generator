
import React from 'react';
import PageTransition from '@/components/PageTransition';
import NavButton from '@/components/NavButton';
import { Card } from '@/components/ui/card';

const Result = () => {
  return (
    <PageTransition>
      <div className="page-container">
        <div className="relative">
          <h1 className="page-title">
            <span className="text-maroon">Ez-G</span>
            <span className="font-extralight"> result</span>
          </h1>
          
          {/* Subtle decoration element */}
          <div className="absolute -bottom-3 left-0 w-20 h-[1px] bg-gradient-to-r from-maroon to-transparent"></div>
        </div>

        <div className="w-full max-w-3xl mx-auto glass p-8 mb-12 opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Card className="p-8 border border-maroon/20 bg-black/60">
            <div className="text-center">
              <h2 className="text-2xl font-light mb-6">Your 3D Model</h2>
              
              <div className="h-[300px] flex items-center justify-center border border-white/10 rounded-lg mb-6">
                <p className="text-muted-foreground">3D model preview would be displayed here</p>
              </div>
              
              <p className="text-base text-muted-foreground mb-8">
                Your model has been created successfully. In a real application, you would be able 
                to view, download, or further modify your 3D model.
              </p>
              
              <div className="flex justify-center gap-4">
                <NavButton to="/enter" className="text-maroon hover:text-maroon-300">
                  Create Another
                </NavButton>
              </div>
            </div>
          </Card>
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

export default Result;
