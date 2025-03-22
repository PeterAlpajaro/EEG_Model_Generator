
import React from 'react';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';

const About = () => {
  return (
    <PageTransition>
      <div className="page-container">
        <div className="relative">
          <h1 className="page-title">
            <span className="font-extralight">About </span>
            <span className="text-maroon">EMG creator</span>
          </h1>
          
          {/* Subtle decoration element */}
          <div className="absolute -bottom-3 left-0 w-20 h-[1px] bg-gradient-to-r from-maroon to-transparent"></div>
        </div>

        <div className="max-w-2xl mx-auto grid gap-8 mt-8 mb-12">
          <div className="glass p-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-xl text-maroon mb-3 font-light">Our Mission</h2>
            <p className="font-light leading-relaxed">
              The EMG creator platform is designed to provide a seamless experience for professionals 
              working with electromyography data. Our minimalist approach focuses on functionality 
              and ease of use without unnecessary distractions.
            </p>
          </div>
          
          <div className="glass p-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h2 className="text-xl text-maroon mb-3 font-light">The Platform</h2>
            <p className="font-light leading-relaxed">
              Built with attention to detail and a focus on user experience, our platform embraces 
              the philosophy that good design is as little design as possible. Every element serves a purpose,
              creating an environment where your work takes center stage.
            </p>
          </div>
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

export default About;
