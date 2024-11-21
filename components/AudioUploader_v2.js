// components/AudioUploader.js
import * as React from "react";
import { useState } from "react";
import { saveAs } from "file-saver";
import { Button } from "./ui/button";
import {FileUploader} from './ui/FileUploader';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64 without prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AudioUploaderV2 = () => {
  const [fileRows, setFileRows] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateTranscription, setGenerateTranscription] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [file, setFile] = useState(new File([], ""));
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError("");
    if (file) {
    setFile(file);
    }
};

  // Handler for when files are dropped or selected
  const handleDrop = async (acceptedFiles) => {
    setFileRows((prevFiles) => [...prevFiles, ...acceptedFiles]);

    acceptedFiles.forEach((file) => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    });
  };

  const handleGenerate = async () => {
    if (!file) {
      alert("Please upload an audio file first.");
      return;
    }

    // setLoading(true);

    
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
      setLoading(false);

      if (data) {
        if (generateTranscription) setTranscription(data.transcription);
        if (generateSummary) setSummary(data.summary);
      } else {
        console.error("Failed to retrieve transcription or summary.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setLoading(false);
    }
    
  };

  const handleDownload = (content, fileName) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
  };

  return (
    <div className="max-w-screen-md">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <FileUploader title="Upload an audio file to get transcription and summary" handleUpload={handleGenerate} handleFileChange={handleFileChange} file={file} error={error}/>
          <div className="mt-4">
            <label>
              <input
                type="checkbox"
                checked={generateTranscription}
                onChange={() => setGenerateTranscription((prev) => !prev)}
              />
              Transcription
            </label>
            <label className="ml-4">
              <input
                type="checkbox"
                checked={generateSummary}
                onChange={() => setGenerateSummary((prev) => !prev)}
              />
              Summary
            </label>
          </div>
          {transcription && (
            <div className="mt-4">
              <h3>Transcription:</h3>
              <p>{transcription}</p>
              <Button
                onClick={() => handleDownload(transcription, "transcription.txt")}
              >
                Download Transcription
              </Button>
            </div>
          )}
          {summary && (
            <div className="mt-4">
              <h3>Summary:</h3>
              <p>{summary}</p>
              <Button
                onClick={() => handleDownload(summary, "summary.txt")}
              >
                Download Summary
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AudioUploaderV2;
