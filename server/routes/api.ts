import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import Groq from "groq-sdk";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../src/db/database";
import * as schema from "../../src/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });
const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key";

// Auth Middleware
const requireAuth = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

// --- AUTHENTICATION ---
router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existing) return res.status(400).json({ success: false, error: "Email already in use" });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(schema.users).values({ name, email, passwordHash }).returning();
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ success: false, error: "Signup failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (!user || !user.passwordHash) return res.status(401).json({ success: false, error: "Invalid credentials" });
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ success: false, error: "Invalid credentials" });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
});
router.post("/resumes/upload", requireAuth, upload.single("resume"), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const userId = req.user.id;

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.slice(0, 5000);

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
Analyze the provided resume text and extract highly detailed, granular data.
You MUST return ONLY a valid JSON object. Do NOT wrap it in markdown block quotes. Do NOT add explanation.
Use the following strict JSON schema:
{
  "atsScore": <number 0-100 based on keyword density and impact>,
  "extractedSkills": {
    "Languages": [<array of programming languages>],
    "Frameworks": [<array of frameworks/libraries>],
    "Tools": [<array of tools/platforms>],
    "Soft Skills": [<array of soft skills>]
  },
  "qualityAnalysis": {
    "structure": <number 0-100>,
    "readability": <number 0-100>,
    "technicalDepth": <number 0-100>,
    "achievementOrientation": <number 0-100 measuring impact metrics>,
    "keywordOptimization": <number 0-100>,
    "recruiterFriendliness": <number 0-100>
  },
  "suggestions": [
    <Provide 3-5 highly actionable, critical improvements for this specific resume>
  ],
  "projects": [<array of major project names>],
  "experience": [<array of company names worked at>]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    let aiData;
    try {
      aiData = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (e) {
      console.error("Failed to parse Groq JSON", e);
      aiData = {};
    }

    // Create a Resume
    const [resume] = await db.insert(schema.resumes).values({
      userId: userId,
      title: req.file.originalname,
    }).returning();

    // Create a Resume Version
    const [version] = await db.insert(schema.resumeVersions).values({
      resumeId: resume.id,
      versionNumber: 1,
      extractedText: text,
      atsScore: aiData.atsScore || 70,
      aiSuggestions: aiData,
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

// --- REAL TESTIMONIALS ---
router.get("/testimonials", async (req, res) => {
  try {
    // Fetch testimonials and join with users to get names
    const data = await db.select({
      id: schema.testimonials.id,
      content: schema.testimonials.content,
      rating: schema.testimonials.rating,
      role: schema.testimonials.role,
      name: schema.users.name,
    })
    .from(schema.testimonials)
    .innerJoin(schema.users, eq(schema.testimonials.userId, schema.users.id))
    .orderBy(desc(schema.testimonials.createdAt))
    .limit(10);
    
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.post("/testimonials", requireAuth, async (req: any, res) => {
  try {
    const { content, rating, role } = req.body;
    await db.insert(schema.testimonials).values({
      userId: req.user.id,
      content,
      rating,
      role
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// --- DATA FETCHING (Fixing the Resume Display) ---
router.get("/users/:email", async (req, res) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(schema.users.email, req.params.email) });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    // Map id to _id for frontend compatibility
    res.json({ _id: user.id, ...user });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.get("/profile/:id", async (req, res) => {
  try {
    const profile = await db.query.candidateProfiles.findFirst({ where: eq(schema.candidateProfiles.userId, parseInt(req.params.id)) });
    res.json({ success: true, data: profile });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.get("/resumes/:userId", async (req, res) => {
  try {
    // Fetch all resumes for user
    const resumes = await db.query.resumes.findMany({ 
      where: eq(schema.resumes.userId, parseInt(req.params.userId)),
      with: { versions: { orderBy: (versions, { desc }) => [desc(versions.createdAt)] } }
    });
    
    // Map them to frontend format
    const formatted = resumes.map(r => {
      const v = r.versions[0];
      const ai = (v?.aiSuggestions as any) || {};
      return {
        _id: r.id,
        fileName: r.title,
        versionNumber: v?.versionNumber || 1,
        createdAt: r.createdAt,
        experienceLevel: "Mid-Level",
        atsScore: v?.atsScore || 0,
        qualityAnalysis: ai.qualityAnalysis || {},
        aiAnalysis: {
          hiringReadinessScore: ai.qualityAnalysis?.recruiterFriendliness || 0,
          recruiterSummary: ai.suggestions?.[0] || "Strong candidate."
        },
        suggestions: ai.suggestions || [],
        extractedSkills: ai.extractedSkills || {},
        skills: ai.skills || [],
        experience: v?.experience || []
      };
    });
    
    res.json({ success: true, data: formatted });
  } catch (e) {
    console.error("GET /resumes/:userId ERROR:", e);
    res.status(500).json({ success: false }); 
  }
});

export default router;
