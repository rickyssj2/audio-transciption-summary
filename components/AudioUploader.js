// components/AudioUploader.js
import * as React from 'react';
import { FileUploader } from 'baseui/file-uploader';
import { useState } from 'react';
import {FileUploader as FU} from './ui/FileUploader';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64 without prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AudioUploader = () => {
  const [fileRows, setFileRows] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false)

  // Handler for when files are dropped or selected
  const handleDrop = (acceptedFiles) => {
      // Update the file rows with the new files
      setFileRows((prevFiles) => [...prevFiles, ...acceptedFiles]);
      setLoading(true)

      // Print the size of each file to the console
      acceptedFiles.forEach((file) => {
          console.log(`File: ${file.name}, Size: ${file.size} bytes`);
          console.log(file)
      });

      acceptedFiles.forEach(async (file) => {
        console.log(`File: ${file.name}, Size: ${file.size} bytes`);

      // Convert file to Base64
      try {
        const base64Audio = await blobToBase64(file);

        // Send to API
        const response = await fetch("/api/speechToText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        const data = await response.json();
        setLoading(false)
        if (data) {
          setTranscription(data.transcription);
          setSummary(data.summary);
        } else {
          console.error("Failed to retrieve transcription");
        }
      } catch (error) {
        console.error("Error processing file:", error);
      }
    });
  };

  return (
    <div className='max-w-screen-md'>
      {loading ? 
        <p>Loading...</p>
        :
        <FileUploader
          fileRows={fileRows}
          setFileRows={newFileRows =>
              setFileRows(newFileRows)
          }
          onDrop={handleDrop}
        />
        }
      <p>Transcription: {transcription}</p>
      <p>Summary: {summary}</p>
      <FU />
      
    </div>
  );
};

export default AudioUploader;
