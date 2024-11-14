import { NextResponse } from "next/server";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const body = await req.json();
  const base64Audio = body.audio;

  // Convert the base64 audio data to a Buffer
  const audioBuffer = Buffer.from(base64Audio, "base64");

  // Define a temporary file path for the WAV file
  const filePath = "/tmp/input.wav";

  try {
    // Write the audio data to a temporary WAV file
    fs.writeFileSync(filePath, audioBuffer);

    // Create a readable stream from the temporary file
    const readStream = fs.createReadStream(filePath);

    // Transcription: Use OpenAI's Whisper model for transcription
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Clean up by deleting the temporary file
    fs.unlinkSync(filePath);

    // Extract the transcription text
    const transcriptionText = transcriptionResponse.text;

    console.log(transcriptionText);

    // // List available models
    // const models = await openai.models.list();
    // console.log(models);

    // Summarization: Use a text model like GPT-3.5 for summarization
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI that summarizes text in a concise manner.",  // System message setting the tone
        },
        {
          role: "user",
          content: `Please provide a concise summary of the following text:\n\n"${transcriptionText}"`,  // User message containing the text to summarize
        },
      ],
      temperature: 0.7,  // Adjust temperature for creativity (0.7 is a balanced setting)
    });

    const summaryText = summaryResponse.choices[0]?.message.content;

    console.log(summaryText)

    return NextResponse.json({ transcription: transcriptionText, summary: summaryText});
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}
