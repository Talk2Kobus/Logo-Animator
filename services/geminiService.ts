
import { GoogleGenAI } from "@google/genai";

type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
type VideoAspectRatio = "16:9" | "9:16";

const getAiClient = () => {
    // Re-create the client for each call to ensure the latest API key is used
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateLogo = async (prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images returned.");
    }
    
    return response.generatedImages[0].image.imageBytes;
};

// FIX: Updated function signature to accept mimeType to support various image formats (e.g., png, jpeg) for animation.
export const animateImage = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: VideoAspectRatio): Promise<string> => {
    const ai = getAiClient();
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType, 
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        }
    });

    while (!operation.done) {
        // Poll every 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    return downloadLink;
};