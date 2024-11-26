import * as React from "react";
import { useState } from "react";
import { saveAs } from "file-saver";
import { Button } from "./ui/button";
import { FileUploader } from "./ui/FileUploader";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result.split(",")[1]); // Extract Base64 without prefix
      } else {
        reject("Failed to convert blob to Base64");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AudioUploaderV2: React.FC = () => {
  const [fileRows, setFileRows] = useState<File[]>([]);
  const [transcription, setTranscription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [facts, setFacts] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generateTranscription, setGenerateTranscription] = useState<boolean>(true);
  const [generateSummary, setGenerateSummary] = useState<boolean>(false);
  const [generateFacts, setGenerateFacts] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploaded, setIsUploaded] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setError("");
    setFile(selectedFile);
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    setFileRows((prevFiles) => [...prevFiles, ...acceptedFiles]);

    acceptedFiles.forEach((file) => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    });
  };

  const handleUpload = async (): Promise<void> => {
    // Dummy File Upload handler
    return new Promise((resolve) =>
      setTimeout(() => {
        console.log("File uploaded");
        resolve();
      }, 1000)
    );
  };

  const handleGenerate = async () => {
    if (!file) {
      alert("Please upload an audio file first.");
      return;
    }

    setLoading(true);

    try {
      const base64Audio = await blobToBase64(file);

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      const data: { transcript: string; summary: string; facts: string; } | null = await response.json();
      setLoading(false);

      if (data) {
        if (generateTranscription) setTranscription(data.transcript);
        if (generateSummary) setSummary(data.summary);
        if (generateFacts) setFacts(data.facts);
      } else {
        console.error("Failed to retrieve transcription or summary.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setLoading(false);
    }
  };

  const handleDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
  };

  return (
    <div className="w-full sm:max-w-4xl mx-auto sm:min-h-[25vh] overflow-y-auto">
      <FileUploader
        title="Upload an audio file to get transcription and summary"
        handleUpload={handleUpload}
        handleFileChange={handleFileChange}
        file={file}
        error={error}
        isUploaded={isUploaded}
        setIsUploaded={setIsUploaded}
      />
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
        <label className="mt-2">
          <input
            type="checkbox"
            checked={generateFacts}
            onChange={() => setGenerateFacts((prev) => !prev)}
          />
          Facts
        </label>
      </div>
      <Button
        variant={isUploaded ? "default" : "disabled"}
        className="mt-4"
        onClick={handleGenerate}
        disabled={!isUploaded}
      >
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
          <Button onClick={() => handleDownload(summary, "summary.txt")}>
            Download Summary
          </Button>
        </div>
      )}
      {facts && (
        <div className="mt-4">
          <h3>Facts:</h3>
          <p>{facts}</p>
          <Button onClick={() => handleDownload(facts, "facts.txt")}>
            Download Facts
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioUploaderV2;
