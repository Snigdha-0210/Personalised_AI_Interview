use reqwest::Client;
use serde_json::{json, Value};
use std::env;

pub async fn analyze_resume(resume_text: &str) -> Result<Value, String> {
    let api_key = env::var("GROQ_API_KEY").map_err(|_| "GROQ_API_KEY is missing")?;
    let client = Client::new();

    let prompt = format!(
        r#"You are an expert Senior Technical Recruiter, Engineering Manager, and ATS Specialist.
You must analyze the provided resume text and return a highly structured JSON object. 
DO NOT RETURN MARKDOWN. RETURN ONLY RAW VALID JSON.

Resume Text:
"""
{}
"""

Required JSON Structure:
{{
  "extractedData": {{
    "personalInfo": {{ "name": "...", "email": "...", "phone": "...", "linkedin": "...", "github": "..." }},
    "skills": {{ "languages": [], "frontend": [], "backend": [], "databases": [], "devops": [] }},
    "education": [ {{ "degree": "...", "institute": "...", "year": "..." }} ],
    "projects": [ {{ "name": "...", "description": "...", "technologies": [] }} ],
    "experience": [ {{ "role": "...", "company": "...", "duration": "..." }} ]
  }},
  "aiAnalysis": {{
    "technicalStrengthScore": 85,
    "projectQualityScore": 85,
    "experienceQualityScore": 85,
    "atsReadinessScore": 85,
    "hiringReadinessScore": 85,
    "interviewSuccessPrediction": {{
      "technical": 85,
      "hr": 85,
      "overall": 85,
      "reasoning": "..."
    }},
    "recruiterSummary": "<200 words max summary of strengths and weaknesses>"
  }},
  "backwardCompatibility": {{
    "experienceLevel": "<Fresher | Junior | Mid-Level | Senior>",
    "suggestions": [ "<Actionable suggestion 1>", "<Actionable suggestion 2>" ]
  }}
}}
"#,
        resume_text
    );

    let payload = json!({
        "model": "llama-3.3-70b-versatile",
        "messages": [
            { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
    });

    let res = client
        .post("https://api.groq.com/openai/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Groq API Error: {}", res.status()));
    }

    let response_body: Value = res.json().await.map_err(|e| e.to_string())?;
    let content_str = response_body["choices"][0]["message"]["content"].as_str().unwrap_or("{}");
    serde_json::from_str(content_str).map_err(|e| e.to_string())
}

async fn call_groq(prompt: &str) -> Result<Value, String> {
    let api_key = env::var("GROQ_API_KEY").map_err(|_| "GROQ_API_KEY is missing")?;
    let client = Client::new();
    let payload = json!({
        "model": "llama-3.3-70b-versatile",
        "messages": [{ "role": "user", "content": prompt }],
        "response_format": { "type": "json_object" }
    });
    let res = client.post("https://api.groq.com/openai/v1/chat/completions")
        .bearer_auth(api_key).json(&payload).send().await.map_err(|e| e.to_string())?;
    if !res.status().is_success() { return Err(format!("Groq Error: {}", res.status())); }
    let body: Value = res.json().await.map_err(|e| e.to_string())?;
    let content_str = body["choices"][0]["message"]["content"].as_str().unwrap_or("{}");
    serde_json::from_str(content_str).map_err(|e| e.to_string())
}

pub async fn coach_resume(resume_text: &str) -> Result<Value, String> {
    let prompt = format!(
        r#"You are a top-tier Career Coach. Review the following resume and identify 3 weak, generic, or poorly phrased bullet points.
Rewrite each to be highly impactful, quantified, and professional. Return ONLY RAW VALID JSON in this structure:
{{ "coaching": [ {{ "originalBullet": "...", "improvedBullet": "...", "reason": "..." }} ] }}
Resume Text:
"""
{}
"""
"#, resume_text);
    call_groq(&prompt).await
}

pub async fn match_job_description(resume_text: &str, jd_text: &str) -> Result<Value, String> {
    let prompt = format!(
        r#"You are a hiring manager analyzing a candidate's resume against a job description.
Resume:
"""
{}
"""
Job Description:
"""
{}
"""
Return ONLY RAW VALID JSON:
{{
  "matchScore": 85,
  "technicalMatch": 85,
  "experienceMatch": 85,
  "missingSkills": ["...", "..."],
  "missingKeywords": ["...", "..."],
  "gapAnalysis": {{ "existingSkills": ["..."], "highPrioritySkills": ["..."], "skillsNeededForRole": ["..."] }},
  "atsMatch": 85,
  "recommendedImprovements": ["..."]
}}
"#, resume_text, jd_text);
    call_groq(&prompt).await
}

pub async fn generate_career_roadmap(resume_text: &str, target_role: &str, jd_text: Option<&str>) -> Result<Value, String> {
    let context_block = if let Some(jd) = jd_text {
        format!("The candidate is applying for a role with this JD:\n\"\"\"\n{}\n\"\"\"\nBase the roadmap strictly around this.", jd)
    } else {
        format!("The candidate is aiming for: {}. Generate a gap analysis compared to standard requirements.", target_role)
    };
    
    let prompt = format!(
        r#"Generate a personalized career roadmap.
Resume:
"""
{}
"""
{}
Return ONLY RAW VALID JSON:
{{
  "gapAnalysis": {{ "existing": ["..."], "missing": ["..."], "weak": ["..."], "critical": ["..."] }},
  "gapSeverity": {{ "level": "<Low | Medium | High>", "reasoning": "..." }},
  "roadmap": {{
    "first30Days": {{ "topics": ["..."], "projects": ["..."], "resources": ["..."], "practiceGoals": ["..."] }},
    "days31To60": {{ "intermediateSkills": ["..."], "projects": ["..."], "mockInterviews": ["..."] }},
    "days61To90": {{ "advancedSkills": ["..."], "portfolioBuilding": ["..."], "interviewPrep": ["..."], "jobApplications": ["..."] }}
  }},
  "recommendedProjects": [ {{ "name": "...", "skillsLearned": ["..."], "difficulty": "...", "careerImpact": "..." }} ],
  "learningResources": [ {{ "type": "...", "title": "...", "description": "..." }} ],
  "careerReadiness": 85,
  "predictions": {{ "probabilityOfInterview": 85, "probabilityOfSelection": 85, "explanation": "..." }}
}}
"#, resume_text, context_block);
    call_groq(&prompt).await
}

pub async fn generate_interview_questions(resume_text: &str, jd_text: &str) -> Result<Value, String> {
    let prompt = format!(
        r#"You are a strict technical interviewer. Generate tailored interview questions based on the candidate's skill gaps and the job description.
Resume:
"""
{}
"""
Job Description:
"""
{}
"""
Return ONLY RAW VALID JSON:
{{
  "questions": [
    {{ "id": 1, "type": "Technical", "difficulty": "Medium", "q": "...", "skill": "System Design" }},
    {{ "id": 2, "type": "Behavioral", "difficulty": "Hard", "q": "...", "skill": "Leadership" }}
  ]
}}
"#, resume_text, jd_text);
    call_groq(&prompt).await
}

pub async fn grade_interview(transcript: &str, role: &str) -> Result<Value, String> {
    let prompt = format!(
        r#"You are a senior hiring manager. Grade this candidate's interview transcript for the role of {}.
Transcript:
"""
{}
"""
Return ONLY RAW VALID JSON:
{{
  "score": 85,
  "recommendation": "<Hire | Strong Hire | Borderline | No Hire>",
  "duration": "10m",
  "feedback": [
    {{ "aspect": "Technical Depth", "score": 85, "comments": "..." }},
    {{ "aspect": "Communication", "score": 90, "comments": "..." }}
  ],
  "summary": "..."
}}
"#, role, transcript);
    call_groq(&prompt).await
}
