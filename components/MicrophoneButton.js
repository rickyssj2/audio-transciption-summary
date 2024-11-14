"use client";

import { useRecordVoice } from "@/hooks/useRecordVoice";
import { useEffect } from "react";

const MicrophoneButton = () => {
  const { startRecording, stopRecording, recording, transcription } = useRecordVoice();

  return (
    <div className="flex flex-col items-center">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className="border-none bg-transparent w-10"
      >
        🎙️
      </button>
      {transcription && <p>Transcription: {transcription}</p>}
    </div>
  );
};

export default MicrophoneButton;
