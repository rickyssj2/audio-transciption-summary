export function blobToBase64(blob: Blob, callback: (base64: string) => void): void {
  const reader = new FileReader();

  reader.onloadend = () => {
    // Ensure `reader.result` is a string before splitting
    if (typeof reader.result === "string") {
      const base64 = reader.result.split(",")[1]; // Only the base64 part after the comma
      callback(base64);
    } else {
      console.error("Failed to convert Blob to Base64: Unexpected reader.result type.");
    }
  };

  reader.readAsDataURL(blob);
}
