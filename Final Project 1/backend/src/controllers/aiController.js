import Summary from "../models/Summary.js";
import { geminiModel } from "../utils/geminiClient.js";

// ✨ Generate Summary using Gemini AI
export const generateSummary = async (req, res) => {
  console.log("inside generate summary")
  try {
    console.log(req)
    const text = req.body;
   


    // 🧠 Create a structured prompt for Gemini
    const prompt = `Summarize the following study material in simple, well-structured bullet points for students.
Keep it concise and focus on key ideas and concepts:

${text}`;

    // ⚙️ Call Gemini API
    const result = await geminiModel.generateContent(prompt);

    // ✅ Safely extract summarized text
    const summarizedText = result?.response?.text?.() || "No summary generated.";

    // 💾 Save summary in MongoDB
    const summary = await Summary.create({
      userId: req.user?._id || null,
      summaryText: summarizedText,
      createdAt: new Date(),
    });

    // 📤 Send consistent response for frontend
    res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      data: summary,
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
