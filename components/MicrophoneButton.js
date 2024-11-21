"use client";

import { useRecordVoice } from "@/hooks/useRecordVoice";
import { useEffect } from "react";
import * as Toggle from "@radix-ui/react-toggle";
import { FaMicrophone, FaStop} from 'react-icons/fa';
import "./styles.css";


const MicrophoneButton = () => {
  const { recording, startRecording, stopRecording, transcription, summary} = useRecordVoice();

  return (
    <div className="flex flex-col justify-center items-center">
      <Toggle.Root
        className="Toggle"
        aria-label="Toggle italic"
        onClick={recording ? stopRecording: startRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        >
          {recording ? <FaStop /> : <FaMicrophone /> }        
      </Toggle.Root>
      <p>Transcription: {transcription}</p>
      <p>Summary: {summary}</p>
    </div>
  );
}
export default MicrophoneButton;
