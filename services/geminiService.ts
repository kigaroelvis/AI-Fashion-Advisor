import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { FashionSuggestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string; } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("File reader did not return a string"));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export const getFashionSuggestions = async (imageFile: File, existingStyles: string[] = []): Promise<FashionSuggestion[]> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    
    let promptText = `Analyze the person in this full-body picture. Based on their body type, complexion, and overall appearance, suggest ten different fashion styles that would look good on them. For each style, provide a name, a detailed description, why this style would be a good fit, and a list of specific clothing items (top, bottom, footwear, accessories).`;

    if (existingStyles.length > 0) {
      promptText += ` Please provide new suggestions and avoid the following styles which have already been suggested: ${existingStyles.join(', ')}.`;
    }
    
    const textPart = { text: promptText };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: "A list of ten fashion suggestions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  styleName: {
                    type: Type.STRING,
                    description: "The name of the fashion style (e.g., 'Smart Casual').",
                  },
                  description: {
                    type: Type.STRING,
                    description: "A detailed description of the style.",
                  },
                  reasoning: {
                    type: Type.STRING,
                    description: "An explanation of why this style would be a good fit for the person.",
                  },
                  clothingItems: {
                    type: Type.OBJECT,
                    properties: {
                       top: { type: Type.STRING },
                       bottom: { type: Type.STRING },
                       footwear: { type: Type.STRING },
                       accessories: { type: Type.STRING }
                    },
                    required: ["top", "bottom", "footwear", "accessories"],
                  },
                },
                required: ["styleName", "description", "reasoning", "clothingItems"],
              }
            }
          },
          required: ["suggestions"],
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson && parsedJson.suggestions) {
      return parsedJson.suggestions as FashionSuggestion[];
    } else {
      throw new Error("Invalid response structure from API");
    }

  } catch (error) {
    console.error("Error getting fashion suggestions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get suggestions: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching suggestions.");
  }
};

export const generateFashionImage = async (suggestion: FashionSuggestion, imageFile: File): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Using the person in the provided image as a model, generate a new realistic, full-body photograph of them wearing an outfit in the '${suggestion.styleName}' style. The outfit should consist of: a ${suggestion.clothingItems.top} (top), ${suggestion.clothingItems.bottom} (bottom), ${suggestion.clothingItems.footwear} (footwear), and accessorized with ${suggestion.clothingItems.accessories}. The person's body shape and face should match the original image. The final image should be high-quality and look like a fashion magazine photo.`;
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating fashion image:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};