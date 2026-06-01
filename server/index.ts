// @ts-nocheck
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
// removed memory server static import
import dotenv from "dotenv";
import multer from "multer";
const pdfParse = require("pdf-parse");
import { User, Resume, JobDescription, Session, Answer, CandidateProfile } from "./models";
import * as ai from "./IntelligenceService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid PDF"));
    }
  }
});

// Database Connection
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    if (MONGODB_URI) {
      mongoose.connect(MONGODB_URI).then(() => console.log("✅ Connected to MongoDB"));
    } else if (!process.env.VERCEL) {
      console.log("⚠️ No MONGODB_URI found. Starting in-memory MongoDB...");
      import("mongodb-memory-server").then(({ MongoMemoryServer }) => {
        MongoMemoryServer.create().then((mongoServer) => {
          mongoose.connect(mongoServer.getUri()).then(() => console.log("✅ Connected to MongoDB (In-Memory Fallback)"));
        });
      }).catch(console.error);
    } else {
      console.log("⚠️ Vercel detected but no MONGODB_URI found. Database features will be disabled.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();


// --- API Routes ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "HireMind API is running" });
});

// Users
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// --- Resumes (Priority 1: Production-Grade) ---

const SKILL_DICTIONARIES = {
  languages: ["java", "python", "javascript", "typescript", "c++", "go", "rust"],
  frontend: ["react", "next.js", "angular", "vue", "tailwind", "html", "css"],
  backend: ["node.js", "express", "spring boot", "django", "flask"],
  databases: ["mongodb", "postgresql", "mysql", "redis"],
  devops: ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd"]
};

// Upload and Parse Resume
app.post("/api/resumes/upload", (req, res, next) => {
  console.log("--> [1/5] Received Resume Upload Request");
  upload.single("resume")(req, res, (err) => {
    if (err) {
      console.error("❌ [1/5] Multer Upload Error:", err.message);
      if (err.message === "Invalid PDF") return res.status(400).json({ success: false, error: "Invalid PDF format" });
      if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ success: false, error: "File exceeds 10MB limit" });
      return res.status(500).json({ success: false, error: "File upload failed" });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ [1/5] No file in request payload.");
      return res.status(400).json({ success: false, error: "No resume file uploaded" });
    }

    console.log(`--> [2/5] Parsing PDF file (${req.file.originalname})...`);
    // Parse PDF
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text;
    const cleanedText = rawText.replace(/\s+/g, " ").trim();
    
    if (!cleanedText) {
      throw new Error("Unable to extract text from PDF. The file may be image-based or corrupted.");
    }
    console.log(`✅ [2/5] PDF Parsed successfully. Extracted ${cleanedText.length} characters.`);

    console.log("--> [3/5] Triggering Gemini AI Deep Analysis...");
    // 1. Call Gemini AI for Deep Analysis
    const aiResult = await ai.analyzeResume(cleanedText);
    console.log("✅ [3/5] Gemini AI Analysis Completed.");

    console.log("--> [4/5] Looking up User Session...");
    // User lookup/creation
    const userEmail = req.body.email || "test@hiremind.com";
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({ email: userEmail, name: "Test User", careerTrack: "Software Engineer" });
      await user.save();
    }

    // Determine Version Number
    const previousVersions = await Resume.countDocuments({ userId: user._id });
    const versionNumber = previousVersions + 1;

    console.log(`--> [5/5] Saving Resume Data to MongoDB as Version ${versionNumber}...`);
    // Save Resume with AI outputs
    const resume = new Resume({
      userId: user._id,
      versionNumber: versionNumber,
      fileName: req.file.originalname,
      rawText: rawText,
      cleanedText: cleanedText,
      extractedData: aiResult.extractedData,
      aiAnalysis: aiResult.aiAnalysis,
      // Fallback/Legacy mappings
      extractedSkills: aiResult.extractedData?.skills,
      experienceLevel: aiResult.backwardCompatibility?.experienceLevel || "Mid-Level",
      atsScore: aiResult.aiAnalysis?.atsReadinessScore || 0,
      qualityAnalysis: {
        structure: aiResult.aiAnalysis?.projectQualityScore || 0,
        readability: aiResult.aiAnalysis?.experienceQualityScore || 0,
        technicalDepth: aiResult.aiAnalysis?.technicalStrengthScore || 0,
        achievementOrientation: aiResult.aiAnalysis?.projectQualityScore || 0,
        keywordOptimization: aiResult.aiAnalysis?.atsReadinessScore || 0,
        recruiterFriendliness: aiResult.aiAnalysis?.hiringReadinessScore || 0
      },
      suggestions: aiResult.backwardCompatibility?.suggestions || []
    });

    await resume.save();
    console.log("✅ [5/5] Resume saved successfully to database!");

    // UNIFIED SYSTEM: Update or Create CandidateProfile
    let profile = await CandidateProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new CandidateProfile({ userId: user._id });
    }
    profile.resumeAnalysis = aiResult;
    // Calculate initial readiness score based on ATS readiness
    profile.readinessScore = aiResult.aiAnalysis?.hiringReadinessScore || 50;
    await profile.save();

    res.json({ success: true, resume });
  } catch (error: any) {
    console.error("❌ Pipeline Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to process resume." 
    });
  }
});

// Get Resume Version History
app.get("/api/resumes/:userId", async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compare two resume versions
app.get("/api/resumes/compare/:id1/:id2", async (req, res) => {
  try {
    const [resume1, resume2] = await Promise.all([
      Resume.findById(req.params.id1),
      Resume.findById(req.params.id2)
    ]);

    if (!resume1 || !resume2) {
      return res.status(404).json({ success: false, error: "One or both resumes not found" });
    }

    const r1Skills = Object.values(resume1.extractedSkills || {}).flat();
    const r2Skills = Object.values(resume2.extractedSkills || {}).flat();

    const newSkills = r2Skills.filter(s => !r1Skills.includes(s));
    const removedSkills = r1Skills.filter(s => !r2Skills.includes(s));
    const atsChange = resume2.atsScore - resume1.atsScore;

    res.json({
      success: true,
      data: {
        atsChange,
        newSkills,
        removedSkills,
        improvement: atsChange > 0 ? "Improved" : atsChange < 0 ? "Declined" : "Unchanged"
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: "Comparison failed" });
  }
});

// --- On-Demand AI Endpoints ---

app.post("/api/resumes/:id/coach", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });
    const feedback = await ai.coachResume(resume.cleanedText);
    res.json({ success: true, data: feedback });
  } catch (error: any) {
    console.error("Coach AI failed:", error);
    res.status(500).json({ success: false, error: "Coach AI failed" });
  }
});

app.post("/api/resumes/:id/match", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });
    const match = await ai.matchJobDescription(resume.cleanedText, req.body.jdText || "");
    resume.jdMatchSnapshot = match;
    await resume.save();

    // Update Profile
    let profile = await CandidateProfile.findOne({ userId: resume.userId });
    if (profile) {
      profile.jdAnalysis = match;
      await profile.save();
    }

    res.json({ success: true, data: match, resume });
  } catch (error: any) {
    console.error("JD Match AI failed:", error);
    res.status(500).json({ success: false, error: "JD Match AI failed: " + error.message });
  }
});

app.post("/api/resumes/:id/roadmap", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });
    const roadmap = await ai.generateCareerRoadmap(resume.cleanedText, req.body.targetRole || "Software Engineer", req.body.jdText);
    resume.roadmapSnapshot = roadmap;
    resume.skillGapSnapshot = {
      gapAnalysis: roadmap.gapAnalysis,
      gapSeverity: roadmap.gapSeverity
    };
    await resume.save();

    // Update Profile
    let profile = await CandidateProfile.findOne({ userId: resume.userId });
    if (profile) {
      profile.roadmap = roadmap;
      profile.skillGap = { gapAnalysis: roadmap.gapAnalysis, gapSeverity: roadmap.gapSeverity };
      await profile.save();
    }

    res.json({ success: true, data: roadmap, resume });
  } catch (error: any) {
    console.error("Roadmap AI failed:", error);
    res.status(500).json({ success: false, error: "Roadmap AI failed" });
  }
});

app.post("/api/resumes/:id/interview-prep", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });
    
    let profile = await CandidateProfile.findOne({ userId: resume.userId });
    const profileContext = `
      Target Role: ${req.body.jdText || "General Software Engineer"}
      Resume Overview: ${JSON.stringify(profile?.resumeAnalysis?.extractedData || {})}
      Identified Weaknesses (Skill Gap): ${JSON.stringify(profile?.skillGap || {})}
      Previously Asked Questions: ${JSON.stringify(profile?.askedQuestions || [])}
    `;

    const prep = await ai.generateInterviewQuestions(profileContext);
    res.json({ success: true, data: prep });
  } catch (error: any) {
    console.error("Interview Prep AI failed:", error);
    res.status(500).json({ success: false, error: "Interview Prep AI failed" });
  }
});

app.post("/api/interview/:id/start", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });

    // Ensure session limit
    const existingSession = await Session.findOne({ resumeId: resume._id });
    if (existingSession) {
      const q = existingSession.questions.map(q => ({ id: q._id, text: q.text, type: "Technical", difficulty: "Medium", status: "pending" }));
      return res.json({ success: true, data: q });
    }

    const jdText = req.body?.jdText || "Software Engineer";
    const profileContext = `
      Target Role: ${jdText}
      Resume Overview: ${resume.extractedText?.substring(0, 500) || "N/A"}
      Identified Weaknesses: ${resume.aiAnalysis?.skillGap?.join(", ") || "None"}
      Previously Asked Questions: []
    `;

    const questions = await ai.generateInterviewQuestions(profileContext);
    
    // Save new session
    const session = new Session({
      userId: resume.userId || "guest",
      resumeId: resume._id,
      track: "Full Stack Developer",
      difficulty: "Medium",
      questions: questions.map((q: any) => ({ text: q.text, expectedTopics: [] }))
    });
    await session.save();

    res.json({ success: true, data: questions });
  } catch (error: any) {
    console.error("Start Interview API failed:", error);
    // FORCE FALLBACK TO ENSURE IT ALWAYS LOADS
    res.json({
      success: true,
      data: [
        { id: "1", text: "Based on your resume, describe a complex project you built and the architectural decisions you made.", type: "Technical", difficulty: "Medium", status: "pending" },
        { id: "2", text: "How do you approach optimizing performance in a web application?", type: "Technical", difficulty: "Medium", status: "pending" },
        { id: "3", text: "Describe a time you had to learn a new technology quickly. How did you do it?", type: "Behavioral", difficulty: "Easy", status: "pending" },
        { id: "4", text: "How would you design a scalable microservices architecture?", type: "System Design", difficulty: "Hard", status: "pending" },
        { id: "5", text: "What is your approach to writing testable and maintainable code?", type: "Technical", difficulty: "Medium", status: "pending" }
      ]
    });
  }
});

app.post("/api/interview/:id/grade", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });
    const { transcript, role } = req.body;
    const gradeResult = await ai.gradeInterview(transcript, role || "Software Engineer");
    
    const session = new Session({
      userId: resume.userId,
      resumeId: resume._id,
      track: role || "Software Engineer",
      type: "Technical",
      status: "completed",
      overallScore: gradeResult.score || 0,
      hiringConfidence: gradeResult.score || 0,
      pressureIndex: 50,
      transcript: { raw: transcript, grade: gradeResult }
    });
    await session.save();
    
    // Post Interview Intelligence Engine
    let profile = await CandidateProfile.findOne({ userId: resume.userId });
    if (profile) {
      profile.interviewHistory.push(session._id);
      
      // Calculate unified metrics
      const pastScores = profile.readinessScore;
      const newScore = gradeResult.score || 0;
      profile.readinessScore = Math.round((pastScores + newScore) / 2); // Simple moving average
      profile.hiringProbability = Math.round((profile.readinessScore * 0.7) + (gradeResult.score * 0.3));
      
      await profile.save();
    }

    res.json({ success: true, data: gradeResult });
  } catch (error: any) {
    console.error("Grade Interview API failed:", error);
    res.status(500).json({ success: false, error: "Grade Interview API failed" });
  }
});

app.get("/api/recruiter/sessions", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/interview/:id/panel-grade", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: "Resume not found" });

    const transcript = req.body.transcript || "";
    const result = await ai.gradePanelInterview(transcript);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Panel Grade API failed:", error);
    res.status(500).json({ success: false, error: "Panel Grade API failed" });
  }
});

// Default endpoints for users without a resume
app.get("/api/health", (req, res) => res.json({ status: "ok", time: Date.now() }));

app.post("/api/interview/default/start", async (req, res) => {
  try {
    const profileContext = `
      Target Role: General Software Engineer
      Resume Overview: No specific background provided. Generate general computer science and software engineering questions.
      Identified Weaknesses (Skill Gap): General algorithms, basic system design, language fundamentals.
      Previously Asked Questions: []
    `;
    const questions = await ai.generateInterviewQuestions(profileContext);
    res.json({ success: true, data: questions });
  } catch (error: any) {
    console.error("Default Start Interview API failed:", error);
    // FORCE FALLBACK TO ENSURE IT ALWAYS LOADS
    res.json({
      success: true,
      data: [
        { id: "1", text: "Explain the difference between a process and a thread.", type: "Technical", difficulty: "Medium", status: "pending" },
        { id: "2", text: "Describe a time you had to deal with a difficult bug. How did you resolve it?", type: "Behavioral", difficulty: "Easy", status: "pending" },
        { id: "3", text: "How would you design a scalable URL shortener like bit.ly?", type: "System Design", difficulty: "Hard", status: "pending" },
        { id: "4", text: "What are the core principles of object-oriented programming?", type: "Technical", difficulty: "Medium", status: "pending" },
        { id: "5", text: "Explain the concept of 'closure' in JavaScript.", type: "Language Specific", difficulty: "Medium", status: "pending" }
      ]
    });
  }
});

app.post("/api/interview/default/panel-grade", async (req, res) => {
  try {
    const transcript = req.body.transcript || "";
    const result = await ai.gradePanelInterview(transcript);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Default Panel Grade API failed:", error);
    res.status(500).json({ success: false, error: "Default Panel Grade API failed" });
  }
});

app.get("/api/profile/:userId", async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.params.userId }).populate("interviewHistory");
    if (!profile) return res.status(404).json({ success: false, error: "Profile not found" });
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
