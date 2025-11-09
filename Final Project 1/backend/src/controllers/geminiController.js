// src/controllers/geminiController.js
 // use your geminiClient.js

import { GoogleGenAI } from "@google/genai";


export const getGeminiResponse = async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required" });
  }

  try {
    // Call Gemini AI
    const geminiModel = new GoogleGenAI({
      apiKey: "AIzaSyB80SpQVX4-kzTWS9obLovuCu5PrZQ9_yY",
    })
    const result = await geminiModel.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // Extract text
    const answer = result.response?.text() || "";

    res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, message: "Failed to get response from Gemini API", error: error.message });
  }
};
