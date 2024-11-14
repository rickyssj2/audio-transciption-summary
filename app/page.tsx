import MicrophoneButton from "@/components/MicrophoneButton";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex min-h-screen flex-col items-center justify-center">
      <h1>Voice Recording App</h1>
      <MicrophoneButton />
      </main>
    </div>
  );
}
