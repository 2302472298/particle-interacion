import { GoogleGenAI } from "@google/genai";
import { ShapeType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShapeDescription = async (shape: ShapeType): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a very short, poetic, and whimsical 2-sentence description for a 3D particle visualization of a "${shape}". 
      Focus on the visual feeling (glowing, flowing, cosmic). Do not mention technical terms.`,
      config: {
          thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || `A beautiful formation of ${shape} particles.`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Visualizing the essence of ${shape} through light and motion.`;
  }
};
