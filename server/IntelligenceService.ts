import Groq from "groq-sdk";

function getAI() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in your .env file. Please add it.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function analyzeResume(resumeText: string) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Please configure it.");
  }

  const prompt = `
You are an expert Senior Technical Recruiter, Engineering Manager, and ATS Specialist.
You must analyze the provided resume text and return a highly structured JSON object. 
DO NOT RETURN MARKDOWN. RETURN ONLY RAW VALID JSON.

Resume Text:
"""
${resumeText}
"""

Required JSON Structure:
{
  "extractedData": {
    "personalInfo": { "name": "...", "email": "...", "phone": "...", "linkedin": "...", "github": "..." },
    "skills": { "languages": [], "frontend": [], "backend": [], "databases": [], "devops": [] },
    "education": [ { "degree": "...", "institute": "...", "year": "..." } ],
    "projects": [ { "name": "...", "description": "...", "technologies": [] } ],
    "experience": [ { "role": "...", "company": "...", "duration": "..." } ]
  },
  "aiAnalysis": {
    "technicalStrengthScore": 85,
    "projectQualityScore": 85,
    "experienceQualityScore": 85,
    "atsReadinessScore": 85,
    "hiringReadinessScore": 85,
    "interviewSuccessPrediction": {
      "technical": 85,
      "hr": 85,
      "overall": 85,
      "reasoning": "..."
    },
    "recruiterSummary": "<200 words max summary of strengths and weaknesses>"
  },
  "backwardCompatibility": {
    "experienceLevel": "<Fresher | Junior | Mid-Level | Senior>",
    "suggestions": [ "<Actionable suggestion 1>", "<Actionable suggestion 2>" ]
  }
}
`;

  try {
    const groq = getAI();
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    
    let text = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Groq Analysis Error:", error);
    if (error?.status === 429) {
      throw new Error("Groq API Rate Limit Exceeded. Please try again in 1 minute.");
    }
    throw new Error("AI analysis failed: " + (error?.message || "Unknown error"));
  }
}

export async function coachResume(resumeText: string) {
  const prompt = `
You are a top-tier Career Coach. Review the following resume and identify 3 weak, generic, or poorly phrased bullet points.
Rewrite each to be highly impactful, quantified, and professional.

Resume Text:
"""
${resumeText}
"""

Return ONLY RAW VALID JSON in this structure:
{
  "coaching": [
    {
      "originalBullet": "...",
      "improvedBullet": "...",
      "reason": "..."
    }
  ]
}
`;
  const groq = getAI();
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  let text = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(text);
}

export async function matchJobDescription(resumeText: string, jdText: string) {
  const prompt = `
You are a hiring manager analyzing a candidate's resume against a job description.

Resume:
"""
${resumeText}
"""

Job Description:
"""
${jdText}
"""

Return ONLY RAW VALID JSON:
{
  "matchScore": 85,
  "technicalMatch": 85,
  "experienceMatch": 85,
  "missingSkills": ["...", "..."],
  "missingKeywords": ["...", "..."],
  "gapAnalysis": {
    "existingSkills": ["..."],
    "highPrioritySkills": ["..."],
    "skillsNeededForRole": ["..."]
  },
  "atsMatch": 85,
  "recommendedImprovements": [
    "Add Docker experience.",
    "Highlight API development experience."
  ]
}
`;
  const groq = getAI();
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  let text = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(text);
}

export async function generateCareerRoadmap(resumeText: string, targetRole: string, jdText?: string) {
  const contextBlock = jdText 
    ? `The candidate is specifically applying for a role that has the following Job Description:\n"""\n${jdText}\n"""\n\nYou MUST base the entire roadmap and gap analysis strictly around fulfilling the exact requirements mentioned in this Job Description.`
    : `The candidate is aiming for the general role of: ${targetRole}.\nYou must generate a deep gap analysis and learning plan based on the candidate's existing experience compared to standard industry requirements for ${targetRole}.`;

  const prompt = `
Generate a personalized career roadmap for this candidate.

Resume:
"""
${resumeText}
"""

${contextBlock}

Return ONLY RAW VALID JSON:
{
  "gapAnalysis": {
    "existing": ["..."],
    "missing": ["..."],
    "weak": ["..."],
    "critical": ["..."]
  },
  "gapSeverity": {
    "level": "<Low | Medium | High>",
    "reasoning": "..."
  },
  "roadmap": {
    "first30Days": { "topics": ["..."], "projects": ["..."], "resources": ["..."], "practiceGoals": ["..."] },
    "days31To60": { "intermediateSkills": ["..."], "projects": ["..."], "mockInterviews": ["..."] },
    "days61To90": { "advancedSkills": ["..."], "portfolioBuilding": ["..."], "interviewPrep": ["..."], "jobApplications": ["..."] }
  },
  "recommendedProjects": [
    {
      "name": "...",
      "skillsLearned": ["..."],
      "difficulty": "<Beginner | Intermediate | Advanced>",
      "careerImpact": "..."
    }
  ],
  "learningResources": [
    { "type": "<Course | Documentation | Repo>", "title": "...", "description": "..." }
  ],
  "careerReadiness": 85,
  "predictions": {
    "probabilityOfInterview": 85,
    "probabilityOfSelection": 85,
    "explanation": "..."
  }
}
`;
  const groq = getAI();
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  let text = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(text);
}

export async function generateInterviewQuestions(resumeText: string, jdText: string) {
  const prompt = `
You are a strict technical interviewer. Generate tailored interview questions based on the candidate's resume and the job description.

Resume:
"""
${resumeText}
"""
Job Description:
"""
${jdText}
"""

Return ONLY RAW VALID JSON:
{
  "questions": [
    { "type": "Technical", "difficulty": "Medium", "question": "..." },
    { "type": "System Design", "difficulty": "Hard", "question": "..." },
    { "type": "Behavioral", "difficulty": "Medium", "question": "..." }
  ]
}
`;
  const groq = getAI();
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  let text = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(text);
}
