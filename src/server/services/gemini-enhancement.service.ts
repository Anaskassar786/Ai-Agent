import { GoogleGenAI } from '@google/genai';

let genaiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {

  if (!genaiClient && process.env.GEMINI_API_KEY) {
    genaiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return genaiClient;
}


export class GeminiEnhancementService {

  async generateExplanation(prompt: string): Promise<{
    reason: string;
    actionSummary: string;
  } | null> {

    const ai = getGenAI();

    if (!ai) {
      return null;
    }

    try {

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });


      if (!response.text) {
        return null;
      }


      const parsed = JSON.parse(response.text.trim());


      return {
        reason: parsed.reason || '',
        actionSummary: parsed.actionSummary || ''
      };


    } catch (error) {

      console.error('Gemini Enhancement Error:', error);

      return null;
    }
  }
}


export const geminiEnhancementService =
  new GeminiEnhancementService();
