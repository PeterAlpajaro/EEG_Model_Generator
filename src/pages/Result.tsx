import React, { Suspense, useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Mesh, MeshStandardMaterial, BufferGeometry, Vector3 } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import NavButton from '@/components/NavButton';
import { Card } from '@/components/ui/card';
import Aurora from '@/components/Aurora';

const STLModel = ({ url }: { url: string }) => {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  
  useEffect(() => {
    console.log("Loading STL from URL:", url);
    const loader = new STLLoader();
    loader.load(
      url,
      (loadedGeometry) => {
        console.log("STL loaded successfully");
        loadedGeometry.center();
        loadedGeometry.computeBoundingBox();
        const boundingBox = loadedGeometry.boundingBox;
        if (boundingBox) {
          console.log("Bounding box:", boundingBox);
          const size = new Vector3();
          boundingBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 5 / maxDim; // Back to smaller scale
          loadedGeometry.scale(scale, scale, scale);
        }
        setGeometry(loadedGeometry);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading STL:', error);
      }
    );
  }, [url]);

  if (!geometry) return null;

  return (
    <mesh position={[0, 0, 0]}>
      <bufferGeometry attach="geometry" {...geometry} />
      <meshPhongMaterial 
        color="#cccccc"
        specular="#ffffff"
        shininess={100}
      />
    </mesh>
  );
};

const ModelWithErrorHandling = ({ url }: { url: string }) => {
  if (!url) return null;
  
  return (
    <Suspense fallback={<p className="text-white">Loading model...</p>}>
      <STLModel url={url} />
    </Suspense>
  );
};

const Result = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stlFile = localStorage.getItem('stlFile');
      console.log("Retrieved STL file from storage:", stlFile); // Debug log
      
      if (stlFile) {
        setModelUrl(stlFile);
      } else {
        setLoadError('No STL file found. Please upload a model first.');
      }
    } catch (error) {
      console.error('Error loading STL:', error);
      setLoadError('Failed to load STL data');
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
        <Aurora />
        
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
          <PageTransition>
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center w-full">
              {/* Header - adjust spacing and make sure it's centered */}
              <div className="flex flex-col items-center justify-center w-full mb-8 relative">
                <h1 className="flex flex-col items-center justify-center gap-2 text-center">
                  <span 
                    className="text-maroon font-black text-4xl tracking-wider transform hover:scale-105 transition-transform" 
                    style={{ 
                      textShadow: '2px 2px 4px rgba(139, 0, 0, 0.3)',
                      WebkitTextStroke: '1px rgba(139, 0, 0, 0.5)'
                    }}
                  >
                    Ez-G
                  </span>
                  <span className="font-thin text-2xl text-gray-400"> / viewer</span>
                </h1>
                <div className="absolute -bottom-3 w-32 h-[2px] bg-gradient-to-r from-transparent via-maroon to-transparent"></div>
              </div>

              {/* Main content card - ensure vertical centering of contents */}
              <div className="w-full backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col items-center justify-center" 
                style={{ 
                  background: 'linear-gradient(145deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.8) 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}>
                <Card className="border border-white/10 bg-black/40 backdrop-blur-md w-full">
                  <div className="p-8 flex flex-col items-center justify-center">
                    {/* 3D title - ensure vertical centering */}
                    <h2 className="text-center mb-6 flex flex-col items-center justify-center">
                      <span 
                        className="text-maroon text-2xl font-black" 
                        style={{ WebkitTextStroke: '0.7px rgba(139, 0, 0, 0.5)' }}
                      >
                        3D
                      </span>
                      <span className="text-gray-300 text-2xl font-light"> Model Preview</span>
                    </h2>

                    {/* 3D Viewer Container - ensure proper vertical centering */}
                    <div className="w-full h-[500px] relative rounded-lg overflow-hidden flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a)',
                        border: '1px solid rgba(139, 0, 0, 0.2)',
                        boxShadow: 'inset 0 0 30px rgba(139, 0, 0, 0.1)'
                      }}>
                      {loadError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-red-500 mb-4 text-center">{loadError}</p>
                          <NavButton to="/enter" className="text-maroon hover:text-maroon-300 transition-colors">
                            Generate New Model
                          </NavButton>
                        </div>
                      ) : modelUrl ? (
                        <Canvas
                          className="w-full h-full"
                          camera={{ 
                            position: [5, 3, 5],
                            fov: 45,
                            near: 0.1,
                            far: 100
                          }}
                          style={{ background: '#000' }}
                        >
                          <ambientLight intensity={0.4} />
                          <directionalLight 
                            position={[2, 2, 1]} 
                            intensity={1}
                            castShadow
                          />
                          <directionalLight 
                            position={[-2, -2, -1]} 
                            intensity={0.5}
                          />
                          <pointLight 
                            position={[0, 2, 0]} 
                            intensity={0.5}
                          />
                          
                          <ModelWithErrorHandling url={modelUrl} />
                          
                          <OrbitControls 
                            enableZoom={true} 
                            enablePan={true}
                            autoRotate={false}
                            enableDamping={true}
                            dampingFactor={0.05}
                            minDistance={2}
                            maxDistance={20}
                          />
                          <gridHelper 
                            args={[10, 20]}
                            position={[0, 0, 0]}
                          />
                          <axesHelper args={[5]} />
                        </Canvas>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-maroon"></div>
                          <p className="text-gray-400 text-center">Loading model...</p>
                        </div>
                      )}
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-black/70 text-white border-maroon/30 hover:bg-maroon/20 transition-all duration-300"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export STL
                        </Button>
                      </div>
                    </div>

                    {/* Controls Info - ensure vertical centering */}
                    <div className="text-center mt-8 flex flex-col items-center justify-center w-full">
                      <p className="text-gray-400 font-light mb-4">Model loaded successfully.</p>
                      <div className="flex justify-center gap-6 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-maroon/60 rounded-full"></span>
                          Rotate: Drag
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-maroon/60 rounded-full"></span>
                          Zoom: Scroll
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-maroon/60 rounded-full"></span>
                          Pan: Shift + Drag
                        </span>
                      </div>
                    </div>

                    {/* Action Button - ensure vertical centering */}
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

              {/* Back Button - ensure vertical centering */}
              <div className="text-center mt-8 flex justify-center w-full">
                <div className="inline-block backdrop-blur-sm bg-black/20 px-6 py-3 rounded-full">
                  <NavButton 
                    to="/" 
                    className="text-maroon hover:text-maroon-300 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>←</span> Back to Home
                  </NavButton>
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Result;
