import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import Groq from "groq-sdk";
import { db } from "../../src/db/database";
import * as schema from "../../src/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });

// Dummy User ID for single-user context (until proper auth is implemented)
const USER_ID = 1;

router.post("/resumes/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.slice(0, 5000);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Extract candidate data. Return JSON: { \"atsScore\": 85, \"skills\": [\"React\"], \"projects\": [\"App\"], \"experience\": [\"Job\"] }" },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Create a User if not exists
    let user = await db.query.users.findFirst({ where: eq(schema.users.id, USER_ID) });
    if (!user) {
      [user] = await db.insert(schema.users).values({ email: "user@example.com", name: "User" }).returning();
    }

    // Create a Resume
    const [resume] = await db.insert(schema.resumes).values({
      userId: user.id,
      title: req.file.originalname,
    }).returning();

    // Create a Resume Version
    const [version] = await db.insert(schema.resumeVersions).values({
      resumeId: resume.id,
      versionNumber: 1,
      extractedText: text,
      atsScore: aiData.atsScore || 70,
      projects: aiData.projects || [],
      experience: aiData.experience || [],
    }).returning();

    res.json({ success: true, data: { resumeId: resume.id, versionId: version.id, ...aiData } });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Failed to process resume" });
  }
});

router.post("/interview/default/start", async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert technical interviewer. Generate 5 highly relevant interview questions. Return ONLY JSON array." },
        { role: "user", content: "Target Role: General Software Engineer. Generate 5 questions." }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(completion.choices[0]?.message?.content || '{"questions":[]}');
    res.json({ success: true, data: data.questions || data });
  } catch (e) {
    res.json({
      success: true,
      data: [
        { id: "1", text: "Explain the difference between a process and a thread.", type: "Technical", difficulty: "Medium", status: "pending" }
      ]
    });
  }
});

router.post("/interview/default/panel-grade", async (req, res) => {
  try {
    const { answer, question, questionId } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an AI interview panel. Return ONLY JSON: { \"evaluations\": [ { \"role\": \"Technical Expert\", \"score\": 85, \"feedback\": \"Good...\" } ] }" },
        { role: "user", content: `Question: ${question}\nAnswer: ${answer}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || '{"evaluations":[]}');
    res.json({ success: true, data: result });
  } catch (e) {
    res.json({ success: true, data: { evaluations: [{ role: "Technical Expert", score: 85, feedback: "Solid." }] } });
  }
});

router.get("/dashboard/analytics", async (req, res) => {
  try {
    const data = await db.select().from(schema.analytics).limit(1);
    if (data.length > 0) return res.json({ success: true, data: data[0] });
    res.json({ success: true, data: { atsProgression: [] } });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// Stubs for frontend ResumeContext
router.get("/users/:email", (req, res) => res.json({ success: true, data: null }));
router.get("/profile/:id", (req, res) => res.json({ success: true, data: null }));
router.get("/resumes/:id", (req, res) => res.json({ success: true, data: [] }));

export default router;
