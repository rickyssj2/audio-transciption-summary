"use client";

import { useRecordVoice } from "@/hooks/useRecordVoice";
import { useEffect } from "react";


const MicrophoneButton = () => {
  const { startRecording, stopRecording, audioBlob, transcription, summary } = useRecordVoice();

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className="border-none bg-transparent w-10"
      >
        🎙️
      </button>
      <p>Transcription: {transcription}</p>
      <p>Summary: {summary}</p>
    </div>
  );
}
export default MicrophoneButton;
