import Summary from "../models/Summary.js";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";

// ✨ Generate Summary using Gemini AI
export const generateSummary = async (req, res) => {
  console.log("Inside generateSummary");

  try {
    const { data: text } = req.body; 

    const token = req.body.headers.Authorization
    const data = jwt.verify(token, "chut")
    const userId = data.id
    const fileId = req.body.fileId

    console.log(userId , fileId)


    // 🧠 Create a structured prompt for Gemini
    const prompt = `Summarize the following study material in simple, well-structured bullet points for students.
    Keep it concise and focus on key ideas and concepts:
    ${text}`;
   

    const geminiModel = new GoogleGenAI({
      apiKey: "AIzaSyB80SpQVX4-kzTWS9obLovuCu5PrZQ9_yY",
    });

    // ⚙️ Call Gemini API
    const result = await geminiModel.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const summarizedText = result.candidates[0].content.parts[0].text;
    // verify the token

    console.log("summarizedText" , summarizedText)
    // save into the data base 
    const summary = await Summary.create({
      userId ,
      fileId: fileId,
      summaryText: summarizedText,
    })
    // 📤 Send consistent response for frontend
    res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      data: summarizedText._id,
    });

  } catch (error) {
    console.error("❌ Error generating summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate summary",
      error: error.message,
    });
  }
};
