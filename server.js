import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

const GITHUB_OWNER = "l1031s";
const GITHUB_REPO = "apk-builder-web";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ZIP 업로드
app.post("/upload", upload.single("zip"), async (req, res) => {
  try {
    const fileId = req.file.filename;
    const zipUrl = `http://YOUR_SERVER_IP:${PORT}/zip/${fileId}`;

    // GitHub Actions 트리거
    await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event_type: "build_apk",
          client_payload: {
            zip_url: zipUrl
          }
        })
      }
    );

    res.json({ ok: true, zip_url: zipUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ZIP 다운로드 (Actions에서 사용)
app.get("/zip/:id", (req, res) => {
  const filePath = path.join("uploads", req.params.id);
  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`🚀 Build server running on ${PORT}`);
});
