import mongoose, { Schema, Document } from "mongoose";

// --- Users ---
export interface IUser extends Document {
  email: string;
  name: string;
  careerTrack: string;
  readinessScore: number;
}
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  careerTrack: { type: String, default: "Frontend Engineer" },
  readinessScore: { type: Number, default: 0 },
}, { timestamps: true });
export const User = mongoose.model<IUser>("User", UserSchema);


// --- Resumes ---
export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  versionNumber: number;
  fileName: string;
  rawText: string;
  cleanedText: string;
  
  // Phase 1: Structured Extracted Data
  extractedData: {
    personalInfo: any;
    skills: any;
    education: any[];
    projects: any[];
    experience: any[];
  };

  // Phase 2, 4, 10: Deep AI Analysis
  aiAnalysis: {
    technicalStrengthScore: number;
    projectQualityScore: number;
    experienceQualityScore: number;
    atsReadinessScore: number;
    hiringReadinessScore: number;
    interviewSuccessPrediction: {
      technical: number;
      hr: number;
      overall: number;
      reasoning: string;
    };
    recruiterSummary: string;
  };

  // Explicit backward compatibility for existing UI
  extractedSkills: any;
  experienceLevel: string;
  atsScore: number;
  qualityAnalysis: any;
  suggestions: string[];

  // Snapshots for Unified Platform
  skillGapSnapshot?: any;
  roadmapSnapshot?: any;
  jdMatchSnapshot?: any;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  versionNumber: { type: Number, default: 1 },
  fileName: { type: String, required: true },
  rawText: { type: String, default: "" },
  cleanedText: { type: String, default: "" },

  extractedData: { type: Schema.Types.Mixed, default: {} },
  aiAnalysis: { type: Schema.Types.Mixed, default: {} },

  // Backward compatibility fields
  extractedSkills: { type: Schema.Types.Mixed, default: {} },
  experienceLevel: { type: String, default: "Fresher" },
  atsScore: { type: Number, default: 0 },
  qualityAnalysis: { type: Schema.Types.Mixed, default: {} },
  suggestions: [{ type: String }],

  // Snapshots
  skillGapSnapshot: { type: Schema.Types.Mixed },
  roadmapSnapshot: { type: Schema.Types.Mixed },
  jdMatchSnapshot: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const Resume = mongoose.model<IResume>("Resume", ResumeSchema);


// --- Job Descriptions ---
export interface IJobDescription extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  descriptionText: string;
  extractedKeywords: string[];
}
const JobDescriptionSchema = new Schema<IJobDescription>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: { type: String },
  descriptionText: { type: String, required: true },
  extractedKeywords: [{ type: String }],
}, { timestamps: true });
export const JobDescription = mongoose.model<IJobDescription>("JobDescription", JobDescriptionSchema);


// --- Sessions (Interviews) ---
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  jdId?: mongoose.Types.ObjectId;
  track: string;
  type: string; // voice, text, coding
  status: "in-progress" | "completed";
  overallScore: number;
  hiringConfidence: number;
  pressureIndex: number;
  transcript?: any;
}
const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  resumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
  jdId: { type: Schema.Types.ObjectId, ref: "JobDescription" },
  track: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  overallScore: { type: Number, default: 0 },
  hiringConfidence: { type: Number, default: 0 },
  pressureIndex: { type: Number, default: 0 },
  transcript: { type: Schema.Types.Mixed },
}, { timestamps: true });
export const Session = mongoose.model<ISession>("Session", SessionSchema);


// --- Answers ---
export interface IAnswer extends Document {
  sessionId: mongoose.Types.ObjectId;
  questionId?: string; // Optional if generated dynamically
  questionText: string;
  userResponse: string;
  score: number;
  timeSpentSec: number;
  difficulty: "Easy" | "Medium" | "Hard";
  metrics: {
    accuracy: number;
    clarity: number;
    depth: number;
  };
}
const AnswerSchema = new Schema<IAnswer>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  questionId: { type: String },
  questionText: { type: String, required: true },
  userResponse: { type: String, required: true },
  score: { type: Number, default: 0 },
  timeSpentSec: { type: Number, default: 0 },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  metrics: {
    accuracy: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
  },
}, { timestamps: true });
export const Answer = mongoose.model<IAnswer>("Answer", AnswerSchema);

// --- Candidate Profile ---
export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  readinessScore: number;
  hiringProbability: number;
  resumeAnalysis: any;
  jdAnalysis: any;
  skillGap: any;
  roadmap: any;
  interviewHistory: mongoose.Types.ObjectId[];
  askedQuestions: string[];
}

const CandidateProfileSchema = new Schema<ICandidateProfile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  readinessScore: { type: Number, default: 0 },
  hiringProbability: { type: Number, default: 0 },
  resumeAnalysis: { type: Schema.Types.Mixed, default: {} },
  jdAnalysis: { type: Schema.Types.Mixed, default: {} },
  skillGap: { type: Schema.Types.Mixed, default: {} },
  roadmap: { type: Schema.Types.Mixed, default: {} },
  interviewHistory: [{ type: Schema.Types.ObjectId, ref: "Session" }],
  askedQuestions: [{ type: String }],
}, { timestamps: true });
export const CandidateProfile = mongoose.model<ICandidateProfile>("CandidateProfile", CandidateProfileSchema);
