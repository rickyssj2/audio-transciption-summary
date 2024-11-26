import { NextResponse } from "next/server";
import fs from "fs";
import { ReadStream } from "fs";
import axios from "axios";
import OpenAI from "openai";
import dotenv from "dotenv";
import FormData from "form-data";

dotenv.config();

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // Ensure the API key is non-nullable
});

// Azure FastAPI endpoint
const AZURE_API_URL =
  "https://lawspeakapi-eke8dva6fehpbnh0.centralindia-01.azurewebsites.net/audioInput/";

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the incoming JSON body
    const body = await req.json();
    const base64Audio: string = body.audio;

    // Convert the base64 audio data to a Buffer
    const audioBuffer: Buffer = Buffer.from(base64Audio, "base64");

    // Define a temporary file path for the WAV file
    const filePath = "/tmp/input.wav";

    // Write the audio data to a temporary WAV file
    fs.writeFileSync(filePath, audioBuffer);

    // Create a readable stream from the temporary file
    const readStream: ReadStream = fs.createReadStream(filePath);

    try {

      // Create a form-data payload
      const formData = new FormData();
      formData.append("audioFile", fs.createReadStream(filePath), {
        filename: "input.wav",
        contentType: "audio/wav",
      });

      const azureResponse = await axios.post(AZURE_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json",
        },
      });

      const { transcript, summary, facts } = azureResponse.data;

      console.log(azureResponse.data);

      return NextResponse.json({
        transcript,
        summary,
        facts,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data); // Log response body
        console.error("Status Code:", error.response?.status); // Log HTTP status code
        console.error(error)
      } else {
        console.error("Unexpected Error:", error);
      }
    }

    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Clean up by deleting the temporary file
    fs.unlinkSync(filePath);

    // Extract the transcription text
    const transcriptionText: string = transcriptionResponse.text;

    console.log("OpenAI Transcription:", transcriptionText);

    // Summarization: Use a text model like GPT-3.5 or GPT-4 for summarization
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI that summarizes text in a concise manner.", // System message setting the tone
        },
        {
          role: "user",
          content: `Please provide a concise summary of the following text:\n\n"${transcriptionText}"`, // User message containing the text to summarize
        },
      ],
      temperature: 0.7, // Adjust temperature for creativity
    });

    const summaryText: string | null =
      summaryResponse.choices[0]?.message?.content;

    console.log("OpenAI Summary:", summaryText);

    return NextResponse.json({
      transcript: transcriptionText,
      summary: summaryText,
      facts: "Not available (OpenAI fallback)", // Facts not available from OpenAI
    });
  } catch (error: unknown) {
    console.error("Error processing audio:", error);

    return NextResponse.error();
  }
}
