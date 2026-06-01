import { pgTable, serial, text, integer, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Candidate Profiles Table
export const candidateProfiles = pgTable('candidate_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  headline: text('headline'),
  targetRole: text('target_role'),
  experienceLevel: text('experience_level'),
  skills: jsonb('skills').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Resumes Table
export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Resume Versions Table (For History)
export const resumeVersions = pgTable('resume_versions', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').references(() => resumes.id).notNull(),
  versionNumber: integer('version_number').notNull(),
  fileMetadata: jsonb('file_metadata'),
  extractedText: text('extracted_text').notNull(),
  atsScore: integer('ats_score'),
  aiSuggestions: jsonb('ai_suggestions').default('[]'),
  projects: jsonb('projects').default('[]'),
  experience: jsonb('experience').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Job Descriptions (JD Match Intelligence)
export const jobDescriptions = pgTable('job_descriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  matchScore: integer('match_score'),
  technicalMatch: integer('technical_match'),
  experienceMatch: integer('experience_match'),
  missingSkills: jsonb('missing_skills').default('[]'),
  missingKeywords: jsonb('missing_keywords').default('[]'),
  recommendations: jsonb('recommendations').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Skill Gaps Engine
export const skillGaps = pgTable('skill_gaps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  currentSkills: jsonb('current_skills').default('[]'),
  missingSkills: jsonb('missing_skills').default('[]'),
  priorityRanking: jsonb('priority_ranking').default('{}'),
  gapSeverity: text('gap_severity'),
  recommendedActions: jsonb('recommended_actions').default('[]'),
  learningResources: jsonb('learning_resources').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Career Roadmap
export const careerRoadmaps = pgTable('career_roadmaps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  plan30Days: jsonb('plan_30_days').default('[]'),
  plan60Days: jsonb('plan_60_days').default('[]'),
  plan90Days: jsonb('plan_90_days').default('[]'),
  projects: jsonb('projects').default('[]'),
  courses: jsonb('courses').default('[]'),
  certifications: jsonb('certifications').default('[]'),
  interviewPrepPlan: jsonb('interview_prep_plan').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Interview Sessions
export const interviewSessions = pgTable('interview_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  resumeVersionId: integer('resume_version_id').references(() => resumeVersions.id),
  jobDescriptionId: integer('job_description_id').references(() => jobDescriptions.id),
  interviewType: text('interview_type').notNull(),
  difficulty: text('difficulty').notNull(),
  finalRecommendation: text('final_recommendation'),
  overallScore: integer('overall_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

// Interview Questions
export const interviewQuestions = pgTable('interview_questions', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => interviewSessions.id).notNull(),
  questionText: text('question_text').notNull(),
  questionType: text('question_type'),
  difficulty: text('difficulty'),
  orderIndex: integer('order_index').notNull(),
});

// Interview Answers & Scores
export const interviewAnswers = pgTable('interview_answers', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').references(() => interviewQuestions.id).notNull(),
  answerText: text('answer_text').notNull(),
  voiceTranscript: text('voice_transcript'),
  score: integer('score'),
  panelFeedback: jsonb('panel_feedback').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Analytics
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  interviewTrends: jsonb('interview_trends').default('[]'),
  skillGrowth: jsonb('skill_growth').default('[]'),
  atsProgression: jsonb('ats_progression').default('[]'),
  confidenceGrowth: jsonb('confidence_growth').default('[]'),
  readinessGrowth: jsonb('readiness_growth').default('[]'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(candidateProfiles),
  resumes: many(resumes),
  sessions: many(interviewSessions),
  analytics: one(analytics),
}));

export const resumesRelations = relations(resumes, ({ many }) => ({
  versions: many(resumeVersions),
}));

export const sessionsRelations = relations(interviewSessions, ({ many }) => ({
  questions: many(interviewQuestions),
}));
