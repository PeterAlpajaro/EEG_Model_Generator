import React, { useState, useEffect } from 'react';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Instructions = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;
  
  // Auto-cycle through steps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % totalSteps);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <PageTransition>
      <div className="page-container">
        <div className="relative flex justify-center w-full mt-auto">
          <h1 className="page-title">
            <span className="text-maroon">Ez-G</span>
            <span className="font-extralight"> instructions</span>
          </h1>
          
          {/* Centered decoration element */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-maroon to-transparent"></div>
        </div>

        <div className="w-full max-w-4xl mx-auto glass p-8 mt-8 mb-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {/* Visual guide section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1">
              <h2 className="text-xl text-maroon mb-4 font-light">How to Use Ez-G Creator</h2>
              
              <div className="glass p-6 mb-6">
                <h3 className="text-lg mb-2 font-light">Face Image Guidelines</h3>
                <ul className="list-disc pl-5 space-y-2 font-light">
                  <li>Take a clear, front-facing photo in good lighting</li>
                  <li>Remove glasses, hats, or anything that covers facial features</li>
                  <li>Maintain a neutral expression</li>
                  <li>Ensure your face fills most of the frame</li>
                  <li>Use a plain background if possible</li>
                </ul>
              </div>
              
              <div className="glass p-6">
                <h3 className="text-lg mb-2 font-light">3D Head Model Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 font-light">
                  <li>Upload an STL file format</li>
                  <li>Model should be a complete 3D head scan</li>
                  <li>Ensure the model is properly scaled</li>
                  <li>The 3D model should be clean without artifacts</li>
                </ul>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center glass p-6">
              <h3 className="text-lg mb-4 font-light text-center">
                {currentStep === 0 && "Step 1: Facial Landmark Detection"}
                {currentStep === 1 && "Step 2: 3D Model Generation"}
                {currentStep === 2 && "Step 3: EEG Sensor Placement"}
              </h3>
              
              <div className="relative w-full max-w-[300px] aspect-square">
                <div className="w-full h-full rounded-full border-2 border-white/50 relative overflow-hidden">
                  
                  {/* Use appropriate 3D model based on the current step */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-center"
                    style={{ 
                      backgroundImage: currentStep === 2 
                        ? "url('/models/head-isometric.png')" 
                        : "url('/models/head-front.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center center",
                      opacity: 1,
                      filter: "brightness(1.05) contrast(1.1)",
                      transition: "all 1s ease-in-out"
                    }}
                  />
                  
                  {/* Custom overlay to create a circular crop effect */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: "inset 0 0 20px 5px rgba(0,0,0,0.3)",
                      background: "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.7) 100%)"
                    }}
                  />
                  
                  {/* STEP 1: Facial Landmark Detection (Front View) */}
                  {currentStep === 0 && (
                    <>
                      {/* Face background image */}
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{ 
                          backgroundImage: "url('/models/face-photo.png')", 
                          opacity: 0.9
                        }}
                      />
                      
                      {/* Add landmark dots sequentially appearing on the face */}
                      {[
                        [38, 40, 'Eyes'], [62, 40, 'Eyes'], // eyes
                        [50, 45, 'Nose'], // nose
                        [40, 58, 'Mouth'], [60, 58, 'Mouth'], // mouth corners
                        [50, 60, 'Mouth'], // bottom lip
                        [28, 35, 'Temple'], [72, 35, 'Temple'], // temples
                        [30, 65, 'Jaw'], [70, 65, 'Jaw'], // jaw
                        [50, 25, 'Forehead'], // forehead
                        [50, 75, 'Chin'], // chin
                      ].map((pos, i) => (
                        <motion.div 
                          key={`landmark-${i}`}
                          className="absolute w-2.5 h-2.5 bg-maroon rounded-full"
                          style={{ 
                            left: `${pos[0]}%`, 
                            top: `${pos[1]}%`,
                            transform: 'translate(-50%, -50%)',
                            border: '1px solid rgba(255,255,255,0.8)',
                            boxShadow: "0 0 5px 2px rgba(255,100,100,0.4)"
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
                        >
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/50 text-white text-xs px-2 py-0.5 rounded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 + (i * 0.1) + 0.2 }}
                          >
                            {pos[2]}
                          </motion.div>
                        </motion.div>
                      ))}
                      
                      {/* Connect landmarks with animated lines */}
                      <motion.div
                        className="absolute w-full h-full pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 1.7, duration: 0.8 }}
                      >
                        <svg width="100%" height="100%" className="absolute inset-0">
                          <motion.path 
                            d="M38,40 L50,45 L62,40 M50,45 L50,60 M28,35 C40,55 60,55 72,35 M30,65 C40,75 60,75 70,65" 
                            stroke="rgba(136, 19, 55, 0.7)"
                            strokeWidth="1.5"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 1.7 }}
                          />
                        </svg>
                      </motion.div>
                    </>
                  )}
                  
                  {/* STEP 2: 3D Model Generation (Front view with mesh) */}
                  {currentStep === 1 && (
                    <>
                      <motion.div 
                        className="absolute inset-0 bg-black/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      {/* 3D conversion effect */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ 
                          duration: 3, 
                          delay: 1,
                          times: [0, 0.1, 0.9, 1] 
                        }}
                      >
                        <div className="text-white font-light text-sm px-3 py-1 bg-black/40 rounded-lg">
                          Mapping to 3D...
                        </div>
                      </motion.div>
                    </>
                  )}
                  
                  {/* STEP 3: EEG Sensor Placement (3D Model View) */}
                  {currentStep === 2 && (
                    <>
                      <motion.div 
                        className="absolute inset-0 bg-black/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      {/* Replace with a more detailed 3D head model background */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-center"
                        style={{ 
                          backgroundImage: "url('/models/3d-head-model.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center center",
                          opacity: 1,
                          filter: "brightness(1.05) contrast(1.1)",
                          transition: "all 1s ease-in-out"
                        }}
                      />
                      
                      {/* EEG sensors placement with labels on the 3D head */}
                      {[
                        // Frontal sensors
                        [38, 20, 'Fp1'], [48, 18, 'Fpz'], [58, 19, 'Fp2'],
                        // Middle row sensors
                        [33, 30, 'F7'], [42, 27, 'F3'], [48, 25, 'Fz'], [55, 27, 'F4'], [63, 30, 'F8'],
                        // Central row sensors
                        [30, 43, 'T3'], [40, 40, 'C3'], [48, 38, 'Cz'], [57, 40, 'C4'], [67, 43, 'T4'],
                        // Posterior row sensors
                        [35, 55, 'P3'], [48, 52, 'Pz'], [62, 55, 'P4'],
                        // Back sensor
                        [48, 65, 'Oz']
                      ].map((sensor, i) => (
                        <React.Fragment key={`eeg-sensor-${i}`}>
                          <motion.div 
                            className="absolute w-4 h-4 bg-white/90 border-2 border-maroon/70 rounded-full flex items-center justify-center"
                            style={{ 
                              left: `${sensor[0]}%`, 
                              top: `${Number(sensor[1])}%`,
                              transform: 'translate(-50%, -50%)',
                              boxShadow: "0 0 8px 3px rgba(255,255,255,0.3)"
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 + (i * 0.07) }}
                          >
                            <motion.div 
                              className="w-2 h-2 bg-maroon rounded-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + (i * 0.07) + 0.1 }}
                            />
                          </motion.div>
                          
                          {/* Add sensor label */}
                          <motion.div
                            className="absolute text-xs font-semibold px-1.5 py-0.5 bg-black/60 text-white rounded"
                            style={{ 
                              left: `${sensor[0]}%`, 
                              top: `${Number(sensor[1]) - 6}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 + (i * 0.07) + 0.3 }}
                          >
                            {sensor[2]}
                          </motion.div>
                        </React.Fragment>
                      ))}
                      
                      {/* Add connecting lines between EEG sensors to show the 10-20 system */}
                      <motion.div
                        className="absolute w-full h-full pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 2.5, duration: 0.8 }}
                      >
                        <svg width="100%" height="100%" className="absolute inset-0">
                          <motion.path 
                            d="M38,20 L48,18 L58,19 M33,30 L42,27 L48,25 L55,27 L63,30 M30,43 L40,40 L48,38 L57,40 L67,43 M35,55 L48,52 L62,55 M48,18 L48,25 L48,38 L48,52 L48,65" 
                            stroke="rgba(136, 19, 55, 0.6)"
                            strokeWidth="1"
                            strokeDasharray="5,3"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 2.5 }}
                          />
                        </svg>
                      </motion.div>
                      
                      {/* Information callout */}
                      <motion.div
                        className="absolute bottom-5 right-5 bg-black/70 text-white p-3 rounded-lg max-w-[150px] text-xs"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 3, duration: 0.5 }}
                      >
                        <div className="font-semibold mb-1">10-20 System</div>
                        <div className="text-xs opacity-80">International standard for EEG electrode placement</div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Step indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {[...Array(totalSteps)].map((_, i) => (
                  <div 
                    key={`step-${i}`}
                    className={`w-2 h-2 rounded-full ${currentStep === i ? 'bg-maroon' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Process steps explanation */}
          <div className="glass p-6">
            <h3 className="text-lg mb-4 font-light">3-Step Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 glass">
                <div className="text-maroon font-light mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-maroon/20 flex items-center justify-center text-sm mr-2">1</span>
                  Facial Landmark Detection
                </div>
                <p className="text-sm font-light">
                  We analyze your photo to identify key facial features and map them in 3D space, ensuring accurate sensor positioning.
                </p>
              </div>
              
              <div className="p-4 glass">
                <div className="text-maroon font-light mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-maroon/20 flex items-center justify-center text-sm mr-2">2</span>
                  3D Model Generation
                </div>
                <p className="text-sm font-light">
                  Your face image is transformed into a precise 3D head model, creating a personalized template for your EEG cap.
                </p>
              </div>
              
              <div className="p-4 glass">
                <div className="text-maroon font-light mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-maroon/20 flex items-center justify-center text-sm mr-2">3</span>
                  EEG Sensor Placement
                </div>
                <p className="text-sm font-light">
                  The system calculates optimal electrode positions based on the international 10-20 system, tailored to your unique head shape.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between w-full max-w-4xl mx-auto mt-8 mb-8">
          <NavButton to="/">Previous</NavButton>
          <NavButton to="/enter">Continue</NavButton>
        </div>
      </div>
    </PageTransition>
  );
};

export default Instructions; 