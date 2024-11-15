"use client";

import MicrophoneButton from "@/components/MicrophoneButton";
import AudioUploader from "@/components/AudioUploader";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme } from "baseui";
import {styletron} from './styletron';
// import "./globals.css";

function MyApp() {
  
  return (
    <StyletronProvider value={styletron}>
      <BaseProvider theme={LightTheme}>
        <div className="min-h-screen flex flex-col items-center justify-evenly">
          <h1>Voice Recording App</h1>
          <MicrophoneButton />
          <AudioUploader />
        </div>
      </BaseProvider>
    </StyletronProvider>
  );
}

export default MyApp;
