import React, { Suspense, useEffect, useState, useRef } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Button } from '@/components/ui/button';
import { Download, FileCode, Loader } from 'lucide-react';
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

// STL model component with customizable color and opacity
const STLModel = ({ 
  url, 
  rotation = [0, -Math.PI/2, 0],
  color = "#FFFFFF",
  opacity = 0.7 
}: { 
  url: string;
  rotation?: [number, number, number];
  color?: string;
  opacity?: number;
}) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loader = new STLLoader();
    
    loader.load(
      url,
      (geometry) => {
        console.log("STL loaded successfully");
        // Center the geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        setGeometry(geometry);
        setLoading(false);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading STL:', error);
        setError('Failed to load STL model');
        setLoading(false);
      }
    );
  }, [url]);

  // Don't render anything inside the Canvas if there's an error or if it's loading
  if (error || loading) return null;
  if (!geometry) return null;

  return (
    <mesh geometry={geometry} rotation={rotation}>
      <meshStandardMaterial 
        color={color} 
        roughness={0.5} 
        metalness={0.2} 
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  );
};

const ModelWithErrorHandling = ({ url }: { url: string }) => {
  if (!url) return null;
  
  // Determine if we're loading an STL or GLB based on the URL or localStorage key
  const isSTL = url.includes('stlFile') || url.endsWith('.stl');
  
  return (
    <Suspense fallback={<p className="text-white">Loading model...</p>}>
      {isSTL ? (
        <STLModel url={url} rotation={[0, -Math.PI/2, 0]} color="#FFFFFF" opacity={0.5} />
      ) : (
        <GLBModel url={url} />
      )}
    </Suspense>
  );
};

const Result = () => {
  const [personModelUrl, setPersonModelUrl] = useState<string | null>(null);
  const [electrodeModelUrl, setElectrodeModelUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showElectrodeModel, setShowElectrodeModel] = useState<boolean>(true);
  const [showPersonModel, setShowPersonModel] = useState<boolean>(true);

  useEffect(() => {
    try {
      // Get both STL files from localStorage
      const personUrl = localStorage.getItem('personModelUrl');
      const electrodeUrl = localStorage.getItem('electrodeModelUrl');
      console.log("Retrieved STL files from storage:", personUrl, electrodeUrl);
      
      if (personUrl || electrodeUrl) {
        setPersonModelUrl(personUrl);
        setElectrodeModelUrl(electrodeUrl);
        setIsLoading(false);
      } else {
        setLoadError('No model files found. Please upload files first.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setLoadError('Failed to load model data');
      setIsLoading(false);
    }
  }, []);

  // Add cleanup for blob URLs
  useEffect(() => {
    return () => {
      [personModelUrl, electrodeModelUrl].forEach(url => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [personModelUrl, electrodeModelUrl]);

  const handleDownloadPerson = () => {
    if (personModelUrl) {
      const link = document.createElement('a');
      link.href = personModelUrl;
      link.download = 'person_model.stl';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadElectrode = () => {
    if (electrodeModelUrl) {
      const link = document.createElement('a');
      link.href = electrodeModelUrl;
      link.download = 'electrodes.stl';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Add a combined STL model component that displays both models
  const CombinedSTLModel = () => {
    return (
      <>
        {personModelUrl && showPersonModel && (
          <STLModel 
            url={personModelUrl} 
            rotation={[0, -Math.PI/2, 0]} 
            color="#FFFFFF" 
            opacity={0.7}
          />
        )}
        {electrodeModelUrl && showElectrodeModel && (
          <STLModel 
            url={electrodeModelUrl} 
            rotation={[0, -Math.PI/2, 0]} 
            color="#FF0000" 
            opacity={0.9}
          />
        )}
      </>
    );
  };

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

                    {/* 3D Viewer Container */}
                    <div className="w-full h-[500px] relative rounded-lg overflow-hidden"
                      style={{
                        background: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a)',
                        border: '1px solid rgba(139, 0, 0, 0.2)',
                        boxShadow: 'inset 0 0 30px rgba(139, 0, 0, 0.1)'
                      }}>
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <Loader className="h-12 w-12 text-maroon/60 animate-spin" />
                            <p className="mt-4 text-white">Loading models...</p>
                          </div>
                        </div>
                      ) : loadError ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center text-center">
                            <FileCode className="h-12 w-12 text-maroon/60 mb-4" />
                            <p className="text-red-500">{loadError}</p>
                          </div>
                        </div>
                      ) : (personModelUrl || electrodeModelUrl) ? (
                        <div className="w-full h-full">
                          <Canvas camera={{ position: [0, 0, 1.5], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                            <pointLight position={[-10, -10, -10]} />
                            <CombinedSTLModel />
                            <OrbitControls />
                            <gridHelper args={[1.5, 4, 0x444444, 0x222222]} />
                          </Canvas>
                          
                          {/* Model visibility controls */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 bg-black/50 p-2 rounded">
                            <label className="flex items-center text-white text-sm">
                              <input
                                type="checkbox"
                                checked={showPersonModel}
                                onChange={() => setShowPersonModel(!showPersonModel)}
                                className="mr-2"
                              />
                              Show Head Model
                            </label>
                            <label className="flex items-center text-white text-sm">
                              <input
                                type="checkbox"
                                checked={showElectrodeModel}
                                onChange={() => setShowElectrodeModel(!showElectrodeModel)}
                                className="mr-2"
                              />
                              Show Electrodes
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center text-center">
                            <FileCode className="h-12 w-12 text-maroon/60 mb-4" />
                            <p className="text-white">No models available</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center mt-8 flex justify-center gap-4 w-full">
                      {personModelUrl && (
                        <Button 
                          onClick={handleDownloadPerson}
                          className="bg-maroon hover:bg-maroon/80 text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Head Model
                        </Button>
                      )}
                      {electrodeModelUrl && (
                        <Button 
                          onClick={handleDownloadElectrode}
                          className="bg-maroon hover:bg-maroon/80 text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Electrodes
                        </Button>
                      )}
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
