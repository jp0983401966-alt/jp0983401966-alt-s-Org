
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, GameStats } from "../types";

export interface AIAnalysis {
  fortalezas: string;
  debilidades: string;
  planEstudio: string;
  consejos: string;
}

export interface IntroData {
  imageUrl: string;
  story: string;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelay = 500): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuotaError && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Se superó el número máximo de reintentos");
}

export const generateAnalysis = async (userData: UserData, stats: GameStats): Promise<AIAnalysis> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza el rendimiento de: ${userData.name}, Dificultad: ${userData.difficulty}, ${stats.mathCorrect} aciertos, ${stats.misses} fallos. Estilo arcade cyberpunk.`,
      config: {
        systemInstruction: "Eres un sistema de diagnóstico retro de un arcade de los 80. Tu respuesta debe estar en ESPAÑOL y ser un JSON breve.",
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fortalezas: { type: Type.STRING },
            debilidades: { type: Type.STRING },
            planEstudio: { type: Type.STRING },
            consejos: { type: Type.STRING },
          },
          required: ["fortalezas", "debilidades", "planEstudio", "consejos"],
        },
      },
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateIntroData = async (userData: UserData): Promise<IntroData> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    const [imageRes, storyRes] = await Promise.all([
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Retrato cinematográfico hiperrealista de primer plano de un guerrero digital que TIENE EXACTAMENTE ${userData.age} AÑOS. El rostro debe mostrar claramente las facciones propias de una persona de ${userData.age} años de edad (si es niño, facciones infantiles; si es adulto mayor, arrugas y sabiduría; si es joven, vitalidad juvenil). Género: ${userData.gender}. Estilo de combate: ${userData.style}. Poder aura: ${userData.power}. Viste armadura tecnológica de neón inspirada en Tron y los 80. Fondo de laberinto cibernético. Calidad 8k, iluminación dramática de neón.`,
      }),
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escribe la historia de origen breve de ${userData.name}, un experto en ${userData.style} de ${userData.age} años con el poder del ${userData.power} en un laberinto de neón. Máximo 50 palabras, en ESPAÑOL.`,
        config: { 
          thinkingConfig: { thinkingBudget: 0 },
          systemInstruction: "Escribe mini-lore épico en español de un héroe de arcade cyberpunk."
        }
      })
    ]);

    let imageUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800";
    for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    return {
      imageUrl,
      story: storyRes.text || "La última esperanza de la red lógica."
    };
  });
};
