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
  const [isUploaded, setIsUploaded] = useState(false)

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
  // Dummy File Upload handler
  const handleUpload = async () => {
    //TODO: implement to upload files to Cloud
    return new Promise((resolve) => setTimeout(() => {
      resolve(console.log("File uploaded"))
    }, 1000)
    )
  }

  const handleGenerate = async () => {
    if (!file) {
      alert("Please upload an audio file first.");
      return;
    }

    setLoading(true);

    
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
    <div className="w-full sm:max-w-4xl mx-auto sm:min-h-[25vh] overflow-y-auto">            
      <FileUploader title="Upload an audio file to get transcription and summary" handleUpload={handleUpload} handleFileChange={handleFileChange} file={file} error={error} isUploaded={isUploaded} setIsUploaded={setIsUploaded}/>
      <div className="flex flex-col mt-4">
        <label>
          <input
            type="checkbox"
            checked={generateTranscription}
            onChange={() => setGenerateTranscription((prev) => !prev)}
          />
          Transcription
        </label>
        <label className="mt-2">
          <input
            type="checkbox"
            checked={generateSummary}
            onChange={() => setGenerateSummary((prev) => !prev)}
          />
          Summary
        </label>
      </div>
      <Button variant={isUploaded ? "default" : "disabled"} className="mt-4" onClick={handleGenerate}>
        {loading ? "Generating..." : "Generate"}
      </Button>
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
    </div>
  );
};

export default AudioUploaderV2;
