"use client";

import { useRecordVoice } from "@/hooks/useRecordVoice";
import { useEffect } from "react";

const MicrophoneButton = () => {
  const { startRecording, stopRecording, recording, audioBlob } = useRecordVoice();

  useEffect(() => {
    if (audioBlob) {
      console.log("Audio Blob:", audioBlob);
      // Here you can handle what to do with the audioBlob, e.g., send it to your API
    }
  }, [audioBlob]);

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className="border-none bg-transparent w-10"
    >
      🎙️
    </button>
  );
};

export default MicrophoneButton;
