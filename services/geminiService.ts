import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Message, GroundingChunk } from '../types';
import type { Language } from '../i18n';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

export async function analyzeImageAndGenerateCopy(imageData: string, mimeType: string, language: Language): Promise<string> {
    const imagePart = fileToGenerativePart(imageData, mimeType);
    
    const langMap = {
        en: 'English',
        id: 'Indonesia'
    };
    
    const prompt = `You are an expert copywriter specializing in e-commerce and social media marketing. Analyze this product image and generate copywriting in four different writing styles: Formal, Casual, Persuasive, and Humorous.

For each style, you MUST provide:
1.  **Short Explanation:** A single sentence explaining how this style impacts audience perception.
2.  **Headline:** A catchy title.
3.  **Body:** Persuasive body copy (2-3 sentences).
4.  **CTA (Call to Action):** A clear call to action.

Format your entire response in ${langMap[language]} using markdown. Use level 2 headings for each style (e.g., '## Formal Style'), and level 3 headings for 'Short Explanation', 'Headline', 'Body', and 'CTA' within each style.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    return response.text;
}

export async function continueChat(history: Message[], newMessage: string, useSearch: boolean, language: Language): Promise<{ text: string, sources: GroundingChunk[] }> {
    
    const systemInstructions = {
        en: 'You are a helpful AI copywriter assistant. The user has provided a product image and you have given them some initial ideas. Now, help them refine the copy. Be concise and creative. Respond in English.',
        id: 'Anda adalah asisten copywriter AI yang sangat membantu. Pengguna telah memberikan gambar produk dan Anda telah memberikan beberapa ide awal. Sekarang, bantu mereka menyempurnakan copy tersebut. Berikan jawaban yang ringkas dan kreatif. Balas dalam Bahasa Indonesia.'
    };

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: systemInstructions[language],
            ...(useSearch && { tools: [{ googleSearch: {} }] })
        }
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources: groundingChunks as GroundingChunk[] };
}
