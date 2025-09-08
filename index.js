// Load environment variables from .env file
import "dotenv/config";
// Import Express framework for building the server
import express from "express";
// Import Multer for handling file uploads
import multer from "multer";
// Import Node.js file system module
import fs from "fs";
// Import Node.js path module for file paths
import path from "path";
// Import Nodemailer for sending emails
import nodemailer from "nodemailer";
// Import fileURLToPath to get file path from import.meta.url
import { fileURLToPath } from "url";
// Import GoogleGenAI for Gemini API access
import { GoogleGenAI } from "@google/genai";

// Create Express app instance
const app = express();
// Set server port from environment or default to 8080
const port = process.env.PORT || 8080;

// Get current file name and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
// Parse incoming JSON requests with a size limit
app.use(express.json({ limit: "5mb" }));

// Configure Multer to store uploaded files in 'uploads/'
const upload = multer({ dest: "uploads/" });

// Initialize Gemini AI client with API key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Summarize endpoint: handles transcript upload and AI summarization
app.post("/api/summarize", upload.single("transcript"), async (req, res) => {
  try {
    // Initialize transcript variable
    let transcript = "";

    // If a file was uploaded
    if (req.file) {
      // If the file is a PDF
      if (req.file.mimetype === "application/pdf") {
        try {
          // Dynamically import pdf-parse for PDF extraction
          const pdfParse = (await import("pdf-parse")).default;
          // Read PDF file buffer
          const dataBuffer = fs.readFileSync(req.file.path);
          // Parse PDF to extract text
          const parsed = await pdfParse(dataBuffer);
          transcript = parsed.text;
        } catch (pdfError) {
          // Log PDF parsing error and respond with error
          console.error("PDF parsing error:", pdfError);
          return res.status(400).json({ error: "Could not parse PDF file" });
        }
      } else {
        // For non-PDF files, read as UTF-8 text
        transcript = fs.readFileSync(req.file.path, "utf8");
      }
      // Delete the uploaded file after processing
      fs.unlink(req.file.path, () => {});
    } else if (req.body.transcriptContent) {
      // If transcript text was pasted, use it
      transcript = req.body.transcriptContent;
    }

    // Get user prompt or use default if not provided
    const userPrompt =
      req.body.transcriptText && req.body.transcriptText.trim() !== ""
        ? req.body.transcriptText
        : "Summarize the following document.";

    // If transcript is missing or too short, respond with error
    if (!transcript || transcript.trim().length < 10) {
      return res.status(400).json({ error: "No usable transcript text." });
    }

    // Call Gemini AI to generate summary
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

    // Respond with the summary text
    res.json({ summary: result.text });
  } catch (err) {
    // Log error and respond with failure
    console.error(err);
    res
      .status(500)
      .json({ error: "Summarization failed", detail: String(err) });
  }
});

// Email endpoint: sends summary via email using SMTP
app.post("/api/send", async (req, res) => {
  try {
    // Extract recipient, subject, and body from request
    const { to, subject, bodyHtml } = req.body;
    // Validate required fields
    if (!to || !subject || !bodyHtml) {
      return res.status(400).json({ error: "Missing to/subject/bodyHtml" });
    }

    // Create Nodemailer transporter with SMTP config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html: bodyHtml,
    });

    // Respond with success and message ID
    res.json({ ok: true, id: info.messageId });
  } catch (err) {
    // Log error and respond with failure
    console.error(err);
    res.status(500).json({ error: "Email failed", detail: String(err) });
  }
});

// Start the Express server and log the URL
app.listen(port, () => {
  console.log(`AskDocAI running at http://localhost:${port}`);
});
