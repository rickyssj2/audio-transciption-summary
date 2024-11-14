export function blobToBase64(blob, callback) {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result.split(",")[1]); // Only the base64 part after the comma
    };
    reader.readAsDataURL(blob);
  }
  