export const generateAiProfilePicture = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        mimeType,
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const { base64Data, mimeType: generatedMimeType } = await response.json();

    if (!base64Data || !generatedMimeType) {
      throw new Error("Invalid response from server: missing image data.");
    }

    const dataUrl = `data:${generatedMimeType};base64,${base64Data}`;
    return dataUrl;

  } catch (error) {
    console.error("Error calling the generation service:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while generating the image.");
  }
};
