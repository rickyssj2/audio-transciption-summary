"use client";
import { useEffect, useState, useRef } from "react";
import { blobToBase64 } from "@/utils/blobToBase64";

// Define the structure of the API response
interface SpeechToTextResponse {
  transcript: string;
  summary: string;
  facts: string;
}

// Define the hook return type
interface UseRecordVoice {
  recording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  audioBlob: Blob | null;
  transcription: string;
  summary: string;
}

export const useRecordVoice = (): UseRecordVoice => {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = (): void => {
    if (mediaRecorder.current) {
      try {
        mediaRecorder.current.start();
        setRecording(true);
      } catch (error) {
        console.error("Error starting recording: ", error);
      }
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const initializeMediaRecorder = (stream: MediaStream): void => {
    const recorder = new MediaRecorder(stream);
    mediaRecorder.current = recorder;

    recorder.ondataavailable = (event: BlobEvent) => {
      chunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      chunks.current = [];

      // Convert Blob to base64 and send to API
      blobToBase64(audioBlob, async (base64Audio: string) => {
        try {
          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (response.ok) {
            const data: SpeechToTextResponse = await response.json();
            setTranscription(data.transcript);
            setSummary(data.summary);
          } else {
            console.error("Failed to retrieve transcription");
          }
        } catch (error) {
          console.error("Error sending audio to API:", error);
        }
      });
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initializeMediaRecorder)
        .catch((error: Error) => console.error("Error accessing microphone:", error));
    }
  }, []);

  return { recording, startRecording, stopRecording, audioBlob, transcription, summary };
};
