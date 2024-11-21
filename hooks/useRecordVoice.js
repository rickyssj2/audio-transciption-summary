"use client";
import { useEffect, useState, useRef } from "react";
import { blobToBase64 } from "@/utils/blobToBase64";

export const useRecordVoice = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = () => {
    if (mediaRecorder.current) {
      try {
        mediaRecorder.current.start();
        setRecording(true);
      } catch (error) {
        console.log("Error: ", error)
      }
      
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const initializeMediaRecorder = (stream) => {
    const recorder = new MediaRecorder(stream);
    mediaRecorder.current = recorder;

    recorder.ondataavailable = (event) => {
      chunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      chunks.current = [];

      // Convert Blob to base64 and send to API
      blobToBase64(audioBlob, async (base64Audio) => {
        try {
          const response = await fetch("/api/speechToText", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          const data = await response.json();
          if (data) {
            setTranscription(data.transcription);
            setSummary(data.summary)
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
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(initializeMediaRecorder)
        .catch(error => console.error("Error accessing microphone:", error));
    }
  }, []);

  return { recording, startRecording, stopRecording, audioBlob, transcription, summary };
};
