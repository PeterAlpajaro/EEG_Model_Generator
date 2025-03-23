import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Upload, FileCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Enter = () => {
  const navigate = useNavigate();
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [headModel, setHeadModel] = useState<File | null>(null);
  
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'image/png') {
        toast.error('Please upload a PNG image for Face');
        return;
      }
      setFaceImage(file);
      toast.success('Face image uploaded successfully');
    }
  };
  
  const handleHeadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.stl')) {
        toast.error('Please upload an STL file for 3D Head');
        return;
      }
      
      // Clean up any existing blob URL
      const existingUrl = localStorage.getItem('stlFile');
      if (existingUrl && existingUrl.startsWith('blob:')) {
        URL.revokeObjectURL(existingUrl);
      }
      
      // Create a new blob URL
      const blobUrl = URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }));
      console.log("Created blob URL:", blobUrl);
      localStorage.setItem('stlFile', blobUrl);
      setHeadModel(file);
      
      // Verify the blob URL is stored
      const storedUrl = localStorage.getItem('stlFile');
      console.log("Stored blob URL:", storedUrl);
      
      toast.success('3D head model uploaded successfully');
    }
  };
  
  const handleSubmit = () => {
    if (!faceImage || !headModel) {
      toast.error('Please upload both a face image and a 3D head model');
      return;
    }
    
    // In a real app, you would upload these files to a server
    // For now, we'll just navigate to the result page
    navigate('/result');
  };

  return (
    <PageTransition>
      <div className="page-container">
        <div className="relative flex justify-center w-full mt-auto">
          <h1 className="page-title">
            <span className="text-maroon">Ez-G</span>
            <span className="font-extralight"> creator</span>
          </h1>
          
          {/* Centered decoration element */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-maroon to-transparent"></div>
        </div>

        <div className="w-full max-w-3xl mx-auto glass p-8 mb-auto opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Face Image Upload */}
            <Card className="p-6 border border-maroon/20 bg-black/40">
              <h2 className="text-xl font-light mb-4">Face</h2>
              <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] transition-all ${faceImage ? 'border-maroon/50' : 'border-gray-700'}`}>
                {faceImage ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={URL.createObjectURL(faceImage)} 
                      alt="Face preview" 
                      className="max-h-[150px] mb-4 rounded" 
                    />
                    <p className="text-sm text-muted-foreground mb-2">{faceImage.name}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setFaceImage(null)}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-4 h-10 w-10 text-maroon/60" />
                    <p className="mb-2 text-center">Upload a PNG image of a face</p>
                    <Button asChild variant="outline" className="relative">
                      <label>
                        <span>Select PNG</span>
                        <input 
                          type="file" 
                          accept=".png" 
                          className="absolute inset-0 w-full opacity-0 cursor-pointer" 
                          onChange={handleFaceUpload}
                        />
                      </label>
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* 3D Head Upload */}
            <Card className="p-6 border border-maroon/20 bg-black/40">
              <h2 className="text-xl font-light mb-4">3D Head</h2>
              <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] transition-all ${headModel ? 'border-maroon/50' : 'border-gray-700'}`}>
                {headModel ? (
                  <div className="flex flex-col items-center">
                    <FileCode className="h-16 w-16 text-maroon mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">{headModel.name}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setHeadModel(null)}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileCode className="mb-4 h-10 w-10 text-maroon/60" />
                    <p className="mb-2 text-center">Upload an STL file for 3D head</p>
                    <Button asChild variant="outline" className="relative">
                      <label>
                        <span>Select STL</span>
                        <input 
                          type="file" 
                          accept=".stl" 
                          className="absolute inset-0 w-full opacity-0 cursor-pointer" 
                          onChange={handleHeadUpload}
                        />
                      </label>
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <Button 
              onClick={handleSubmit}
              disabled={!faceImage || !headModel}
              className="bg-maroon hover:bg-maroon/80 text-white px-8 py-2 rounded-md"
            >
              Create Model
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Upload both files to create your custom 3D model
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

export default Enter;
