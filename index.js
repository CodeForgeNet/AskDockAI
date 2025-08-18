import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "5mb" }));

const upload = multer({ dest: "uploads/" });

// Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Summarize endpoint

app.post("/api/summarize", upload.single("transcript"), async (req, res) => {
  try {
    let transcript = "";

    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        try {
          // Dynamically import pdf-parse only when needed
          const pdfParse = (await import("pdf-parse")).default;
          const dataBuffer = fs.readFileSync(req.file.path);
          const parsed = await pdfParse(dataBuffer);
          transcript = parsed.text;
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          return res.status(400).json({ error: "Could not parse PDF file" });
        }
      } else {
        transcript = fs.readFileSync(req.file.path, "utf8");
      }
      // Clean up the uploaded file
      fs.unlink(req.file.path, () => {});
    } else if (req.body.transcriptContent) {
      transcript = req.body.transcriptContent;
    }

    // Rest of your code remains the same
    const userPrompt =
      req.body.transcriptText && req.body.transcriptText.trim() !== ""
        ? req.body.transcriptText
        : "Summarize the following document.";

    if (!transcript || transcript.trim().length < 10) {
      return res.status(400).json({ error: "No usable transcript text." });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [{ text: userPrompt }] },
        { role: "user", parts: [{ text: transcript }] },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    });

    res.json({ summary: result.text });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Summarization failed", detail: String(err) });
  }
});

// Email endpoint
app.post("/api/send", async (req, res) => {
  try {
    const { to, subject, bodyHtml } = req.body;
    if (!to || !subject || !bodyHtml) {
      return res.status(400).json({ error: "Missing to/subject/bodyHtml" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html: bodyHtml,
    });

    res.json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email failed", detail: String(err) });
  }
});

app.listen(port, () => {
  console.log(`AskDocAI running at http://localhost:${port}`);
});
