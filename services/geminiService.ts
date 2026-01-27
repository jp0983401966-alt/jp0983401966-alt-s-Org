
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

export const generateAnalysis = async (userData: UserData, stats: GameStats): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    DIAGNÓSTICO DE HARDWARE HUMANO - SISTEMA MATH-MAN ARCADE
    USUARIO: ${userData.name}
    NIVEL DE DIFICULTAD: ${userData.difficulty}
    REGISTROS: ${stats.mathCorrect} aciertos, ${stats.misses} colisiones.
    Genera un JSON con: fortalezas, debilidades, planEstudio, consejos (estilo retro-gaming).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
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
};

export const generateIntroData = async (userData: UserData): Promise<IntroData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 1. Generar Imagen con Gemini 2.5 Flash Image
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `A high-quality 80s neon arcade poster for a game called "Math-Man". Feature a glowing yellow hero in a digital grid maze, vibrant pink and blue synthwave aesthetics, dramatic lighting, cinematic style.`,
  });

  let imageUrl = "";
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  // 2. Generar Historia con Gemini 3 Flash
  const storyResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Escribe una breve historia inspiradora (máximo 100 palabras) sobre el héroe digital "${userData.name}" en el universo de Math-Man. El mundo de neón está siendo consumido por el caos de la desinformación y solo su capacidad de procesar la lógica y las matemáticas puede restaurar el Orden Cuántico. Estilo épico y retro.`,
  });

  return {
    imageUrl: imageUrl || "https://picsum.photos/seed/arcade/800/800",
    story: storyResponse.text || "La leyenda de Math-Man comienza hoy."
  };
};
