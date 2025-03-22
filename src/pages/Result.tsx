
import React, { Suspense, useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import NavButton from '@/components/NavButton';
import { Card } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Model component that loads and displays the STL file
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

const Result = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would come from the server
    // For demo purposes, we're using the uploaded head model from localStorage
    const headModel = localStorage.getItem('headModel');
    if (headModel) {
      setModelUrl(headModel);
    }
  }, []);

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
              
              <div className="h-[400px] flex items-center justify-center border border-white/10 rounded-lg mb-6 overflow-hidden relative">
                {modelUrl ? (
                  <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Suspense fallback={null}>
                      <Model url={modelUrl} />
                    </Suspense>
                    <OrbitControls enableZoom={true} enablePan={true} />
                  </Canvas>
                ) : (
                  <p className="text-muted-foreground">Loading 3D model...</p>
                )}
                
                <div className="absolute bottom-4 right-4 z-10">
                  <Button variant="outline" size="sm" className="bg-black/50 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Download STL
                  </Button>
                </div>
              </div>
              
              <p className="text-base text-muted-foreground mb-8">
                Your model has been created successfully. You can rotate, zoom, and pan to inspect your 3D model.
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
