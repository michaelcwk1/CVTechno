export const config = {
  runtime: "nodejs",
};

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, cvData } = req.body;

    const finalPrompt = `
You are an intelligent CV assistant.

User request:
"${prompt}"

User CV data:
${JSON.stringify(cvData, null, 2)}

Respond clearly, structured, and helpful.
Do NOT return JSON.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: finalPrompt,
    });

    return res.status(200).json({
      content: result.text,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Gemini failed",
    });
  }
}
