import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from '@/components/NavButton';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Upload, FileCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import JSZip from 'jszip';

const Enter = () => {
  const navigate = useNavigate();
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [headModel, setHeadModel] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
      if (!file.name.endsWith('.glb')) {
        toast.error('Please upload a GLB file for 3D Head');
        return;
      }
      
      // Clean up any existing blob URL
      const existingUrl = localStorage.getItem('glbFile');
      if (existingUrl && existingUrl.startsWith('blob:')) {
        URL.revokeObjectURL(existingUrl);
      }
      
      // Create a new blob URL
      const blobUrl = URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }));
      console.log("Created blob URL:", blobUrl);
      localStorage.setItem('glbFile', blobUrl);
      setHeadModel(file);
      
      // Verify the blob URL is stored
      const storedUrl = localStorage.getItem('glbFile');
      console.log("Stored blob URL:", storedUrl);
      
      toast.success('3D head model uploaded successfully');
    }
  };
  
  const handleSubmit = async () => {
    if (!faceImage || !headModel) {
      toast.error('Please upload both a face image and a 3D head model');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file_glb', headModel);
      formData.append('file_png', faceImage);
      
      toast.info('Uploading files to server for facial landmark detection...');
      
      // Send the files to the Flask API endpoint
      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast.info('Processing facial landmarks...');
        
        // The Flask backend now returns a zip file with both STL files
        const zipBlob = await response.blob();
        
        // Clean up any existing blob URLs
        const existingUrls = ['personModelUrl', 'electrodeModelUrl'].map(key => localStorage.getItem(key));
        existingUrls.forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        
        // Process the zip file to extract both STL files
        const zipFile = new JSZip();
        const zipContents = await zipFile.loadAsync(zipBlob);
        
        console.log("Files in zip archive:", Object.keys(zipContents.files));
        
        // Look for the simple filenames that Flask is now using
        const personFileName = "person.stl";
        const electrodeFileName = "electrode.stl";
        
        // Check if both our expected files exist in the zip
        const hasPersonFile = zipContents.files[personFileName];
        const hasElectrodeFile = zipContents.files[electrodeFileName];
        
        if (hasPersonFile && hasElectrodeFile) {
          // Extract and create blob URLs for both files
          const personBlob = await zipContents.files[personFileName].async("blob");
          const electrodeBlob = await zipContents.files[electrodeFileName].async("blob");
          
          const personUrl = URL.createObjectURL(personBlob);
          const electrodeUrl = URL.createObjectURL(electrodeBlob);
          
          // Store the URLs in localStorage
          localStorage.setItem('personModelUrl', personUrl);
          localStorage.setItem('electrodeModelUrl', electrodeUrl);
          
          console.log("Created STL blob URLs:", personUrl, electrodeUrl);
          
          toast.success('Facial landmarks processed successfully!');
          
          // Navigate to the result page to show the processed models
          navigate('/result');
        } else {
          // Fallback: Try to find any STL files in the zip
          const stlFiles = Object.keys(zipContents.files).filter(name => 
            name.toLowerCase().endsWith('.stl')
          );
          
          console.log("STL files found in zip:", stlFiles);
          
          if (stlFiles.length >= 2) {
            // Use the first two STL files we find
            const personBlob = await zipContents.files[stlFiles[0]].async("blob");
            const electrodeBlob = await zipContents.files[stlFiles[1]].async("blob");
            
            const personUrl = URL.createObjectURL(personBlob);
            const electrodeUrl = URL.createObjectURL(electrodeBlob);
            
            // Store the URLs in localStorage
            localStorage.setItem('personModelUrl', personUrl);
            localStorage.setItem('electrodeModelUrl', electrodeUrl);
            
            console.log("Created STL blob URLs using the first two STL files:", personUrl, electrodeUrl);
            console.log("File names used:", stlFiles[0], stlFiles[1]);
            
            toast.success('Facial landmarks processed successfully!');
            
            // Navigate to the result page to show the processed models
            navigate('/result');
          } else {
            throw new Error(`Could not find expected STL files in the zip archive. Files found: ${Object.keys(zipContents.files).join(', ')}`);
          }
        }
      } else {
        // Handle error response
        let errorMessage = `Processing failed: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          // Ignore error when parsing response text
        }
        
        console.error('Processing error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
    }
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
                    <p className="mb-2 text-center">Upload a GLB file for 3D head</p>
                    <Button asChild variant="outline" className="relative">
                      <label>
                        <span>Select GLB</span>
                        <input 
                          type="file" 
                          accept=".glb" 
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
              disabled={!faceImage || !headModel || isUploading}
              className="bg-maroon hover:bg-maroon/80 text-white px-8 py-2 rounded-md relative"
            >
              {isUploading ? (
                <>
                  <span className="opacity-0">Create Model</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    Uploading...
                  </span>
                </>
              ) : (
                'Create Model'
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {isUploading 
                ? 'Uploading files to server, please wait...' 
                : 'Upload both files to create your custom 3D model'}
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
