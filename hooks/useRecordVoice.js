import { useEffect, useState, useRef } from "react";

export const useRecordVoice = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.start();
      setRecording(true);
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

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      chunks.current = [];
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(initializeMediaRecorder)
        .catch(error => console.error("Error accessing microphone:", error));
    }
  }, []);

  return { recording, startRecording, stopRecording, audioBlob };
};
