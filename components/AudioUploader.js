// components/AudioUploader.js
import * as React from 'react';
import { FileUploader } from 'baseui/file-uploader';
import { useState } from 'react';

const AudioUploader = () => {
  const [fileRows, setFileRows] = useState([]);

    // Handler for when files are dropped or selected
    const handleDrop = (acceptedFiles) => {
        // Update the file rows with the new files
        setFileRows((prevFiles) => [...prevFiles, ...acceptedFiles]);

        // Print the size of each file to the console
        acceptedFiles.forEach((file) => {
            console.log(`File: ${file.name}, Size: ${file.size} bytes`);
        });
    };

  return (
      <FileUploader
        fileRows={fileRows}
        setFileRows={newFileRows =>
            setFileRows(newFileRows)
        }
        onDrop={handleDrop}
      />
  );
};

export default AudioUploader;
