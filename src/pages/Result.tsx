import React, { Suspense, useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Download, FileCode } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import NavButton from '@/components/NavButton';
import { Card } from '@/components/ui/card';

// GLB model component using useGLTF hook from drei
const GLBModel = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    console.log("GLB loaded successfully");
    
    if (scene) {
      // Center the model
      scene.position.set(0, 0, 0);
      
      // Normalize scale if needed
      scene.scale.set(1, 1, 1);
      
      // Optional: Traverse all meshes to set materials
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // Optional: Set consistent material properties
          if (mesh.material) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        }
      });
    }
  }, [scene, url]);

  return (
    <primitive object={scene} dispose={null} />
  );
};

const ModelWithErrorHandling = ({ url }: { url: string }) => {
  if (!url) return null;
  
  return (
    <Suspense fallback={<p className="text-white">Loading model...</p>}>
      <GLBModel url={url} />
    </Suspense>
  );
};

const Result = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const glbFile = localStorage.getItem('glbFile');
      console.log("Retrieved GLB file from storage:", glbFile); // Debug log
      
      if (glbFile) {
        setModelUrl(glbFile);
      } else {
        setLoadError('No GLB file found. Please upload a model first.');
      }
    } catch (error) {
      console.error('Error loading GLB:', error);
      setLoadError('Failed to load GLB data');
    }
  }, []);

  // Add cleanup for blob URLs
  useEffect(() => {
    return () => {
      if (modelUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center">
        <PageTransition>
          <div className="page-container">
            <div className="relative flex justify-center w-full mt-auto">
              <h1 className="page-title">
                <span className="text-maroon">Results</span>
              </h1>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-maroon to-transparent"></div>
            </div>

            <div className="w-full max-w-3xl mx-auto glass p-8 mb-auto opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="w-full backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col items-center justify-center" 
                style={{ 
                  background: 'linear-gradient(145deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.8) 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}>
                <Card className="border border-white/10 bg-black/40 backdrop-blur-md w-full">
                  <div className="p-8 flex flex-col items-center justify-center">
                    {/* 3D title */}
                    <h2 className="text-center mb-6 flex flex-col items-center justify-center">
                      <span 
                        className="text-maroon text-2xl font-black" 
                        style={{ WebkitTextStroke: '0.7px rgba(139, 0, 0, 0.5)' }}
                      >
                        3D
                      </span>
                      <span className="text-gray-300 text-2xl font-light"> Model Preview</span>
                    </h2>

                    {/* Placeholder Container */}
                    <div className="w-full h-[500px] relative rounded-lg overflow-hidden flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a)',
                        border: '1px solid rgba(139, 0, 0, 0.2)',
                        boxShadow: 'inset 0 0 30px rgba(139, 0, 0, 0.1)'
                      }}>
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-24 h-24 rounded-full bg-maroon/20 mb-6 flex items-center justify-center">
                          <FileCode className="h-12 w-12 text-maroon/60" />
                        </div>
                        <h3 className="text-xl text-maroon mb-2">Model Placeholder</h3>
                        <p className="text-gray-400 max-w-md">
                          The 3D model viewer is currently under development. 
                          Your GLB model has been received and stored successfully.
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center mt-8 flex justify-center w-full">
                      <NavButton 
                        to="/enter" 
                        className="text-maroon hover:text-maroon-300 transition-colors duration-300"
                      >
                        Create New Model
                      </NavButton>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Back Button */}
              <div className="button-container mt-8">
                <NavButton to="/" className="text-maroon hover:text-maroon-300 transition-colors">
                  Back to Home
                </NavButton>
              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    </ErrorBoundary>
  );
};

export default Result;
