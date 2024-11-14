import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { audio } = await request.json();

    // Convert the base64 audio data to a Buffer
    const audioBuffer = Buffer.from(audio, "base64");

    // Define a path for a temporary file
    const filePath = path.join(process.cwd(), "tmp", "input.wav");

    // Ensure the tmp folder exists
    fs.mkdirSync(path.join(process.cwd(), "tmp"), { recursive: true });

    // Write the audio data to a temporary WAV file
    fs.writeFileSync(filePath, audioBuffer);

    // Read the audio file as a stream
    const readStream = fs.createReadStream(filePath);

    // Send the audio data to OpenAI's transcription API
    const transcription = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Clean up: delete the temporary file
    fs.unlinkSync(filePath);

    // Return the transcription text
    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
