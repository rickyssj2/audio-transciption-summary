import React from "react";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Typewriter } from 'react-simple-typewriter'

interface FileUploaderProps {
  title: string;
  handleUpload: () => void; // Function with no parameters and no return value
  handleFileChange: (file: File | null) => void; // Function that handles a File or null
  file: File | null; // File object or null
  error: string | null; // Error message or null
}

const FileUploader: React.FC<FileUploaderProps> = ({title, handleUpload, handleFileChange, file, error}) => {

    ////////////////////////////////////////////////////////////////////////
    
    const [loading2, setLoading2] = useState(false);
    ////////////////////////////////////////////////////////////////////////////////////////////
    const handleUploadWrapper = async () => {
      setLoading2(true)
      await handleUpload()
      setLoading2(false)
    }

    return (
        <Card className="w-full sm:max-w-4xl mx-auto sm:min-h-[25vh] overflow-y-auto">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 font-serif font-medium text-xl justify-center">
             {title}
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4 text-center">
             <div>
               <Button variant="outline" className="w-80 text-center relative mb-2">
                 <input
                   type="file"
                   className="absolute inset-0  h-full opacity-0 cursor-pointer "
                   onChange={handleFileChange}
                   accept=".wav"
                   aria-label="Choose a file"
                   onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpload.call();
                    }
                  }}
                 />
                 Choose File
               </Button>
               {file.name && (
    <p className='text-center mt-4'>Selected file: {file.name}</p>
  )}
             </div>          
             
             {error && (
               <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>
             )}
             
             <Button onClick={handleUploadWrapper} className="mt-20">
             {loading2 ? 'Uploading....' : 'Upload'}
             </Button>
             {loading2 && <div className="">
           <p className="text-neutral-500 font-serif font-playfair text-2xl sm:text-md mb-8 mt-10">

              <Typewriter
             words={[
               'Your document is being transcribed',
               'Please wait, transcription in progress',
               'Almost there! Transcription is underway'
             ]}
             loop={5}
             cursor
             cursorStyle="_"
             typeSpeed={90}
             deleteSpeed={50}
             delaySpeed={50000}
           />
           </p>
              </div>}             
           </div>
         </CardContent>
       </Card>
    );
}

export  { FileUploader };