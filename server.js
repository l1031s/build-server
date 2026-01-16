import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import process from "process";

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_API_KEY = process.env.SERVER_API_KEY;

// ===============================
// 🔐 인증 미들웨어 (핵심)
// ===============================
function authMiddleware(req, res, next) {
  const auth = req.headers["authorization"];

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = auth.replace("Bearer ", "");

  if (token !== SERVER_API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}

// ===============================
// 📦 ZIP 업로드 설정
// ===============================
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// ===============================
// 📤 ZIP 업로드 + 인증
// ===============================
app.post(
  "/upload",
  authMiddleware,          // 🔥 여기 중요
  upload.single("project"),
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({ error: "ZIP file missing" });
    }

    console.log("ZIP 업로드됨:", req.file.filename);

    // 여기서 빌드 트리거 or 저장
    res.json({
      success: true,
      file: req.file.filename
    });
  }
);

// ===============================
// 🚀 빌드 트리거 (예시)
// ===============================
app.post("/build", authMiddleware, async (req, res) => {
  // GitHub Actions or 내부 빌드 호출
  res.json({ success: true, message: "Build started" });
});

// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
