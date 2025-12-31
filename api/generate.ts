import { GoogleGenAI } from "@google/genai";

export default async function handler(req: Request) {
  try {
    const body = await req.json();
    const { model, systemInstruction, userPrompt, temperature } = body;

    const genAI = new GoogleGenAI({
     apiKey : process.env.API_KEY!,
    });

    const response = await genAI.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature,
      },
    });

    return new Response(
      JSON.stringify({ text: response.text }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ error: "Generation failed" }),
      { status: 500 }
    );
  }
}