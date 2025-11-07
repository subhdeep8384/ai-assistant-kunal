import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import { uploadFile, getFile } from "../controllers/fileController.js";

const router = express.Router();

// ✅ Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ✅ Upload a file (protected)
router.post("/upload", upload.single("file"), uploadFile);

// ✅ Get a file by ID (protected)
router.get("/:id", getFile);

// ✅ Future routes: list all files, delete file, etc.
// router.get("/", protect, listFiles);

export default router;
