import File from "../models/File.js";
import path from "path";
import fs from "fs";
import pdf from "pdf-parse-new";


const quietPdfParse = async (buffer) => {
  const originalWarn = console.warn;
  const originalLog = console.log;
  console.warn = () => {};
  console.log = () => {};
  try {
    return await pdf(buffer);
  } finally {
    console.warn = originalWarn;
    console.log = originalLog;
  }
};
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const normalizedPath = path.resolve(filePath);

    const file = await File.create({
      userId: req.user?._id || null,
      fileName: originalname,
      filePath: normalizedPath,
      fileType: mimetype,
      fileSize: size,
      uploadedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully!",
      data: {
        id: file._id,
        name: originalname,
        type: mimetype,
        size,
        url: `/uploads/${filename}`,
      },
    });

  } catch (error) {
    console.error("❌ File Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};


export const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found in database" });
    }

    const filePath = path.resolve(file.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const data = await quietPdfParse(fileBuffer);

    let cleanText = data.text
      .replace(/\n{2,}/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\s+$/, "")
      .trim();

    res.json({
      success: true,
      fileName: file.fileName,
      fileType: file.fileType,
      text: cleanText.length > 1 ? cleanText : file,
    });

  } catch (error) {
    console.error("❌ File Retrieval Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving file",
      error: error.message,
    });
  }
};
