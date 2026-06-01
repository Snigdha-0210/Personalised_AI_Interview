use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub email: String,
    pub name: String,
    #[serde(rename = "careerTrack")]
    pub career_track: Option<String>,
    #[serde(rename = "readinessScore")]
    pub readiness_score: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Resume {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "userId")]
    pub user_id: ObjectId,
    #[serde(rename = "versionNumber")]
    pub version_number: i32,
    #[serde(rename = "fileName")]
    pub file_name: String,
    #[serde(rename = "rawText")]
    pub raw_text: String,
    #[serde(rename = "cleanedText")]
    pub cleaned_text: String,
    
    #[serde(rename = "extractedData", skip_serializing_if = "Option::is_none")]
    pub extracted_data: Option<Value>,
    #[serde(rename = "aiAnalysis", skip_serializing_if = "Option::is_none")]
    pub ai_analysis: Option<Value>,

    #[serde(rename = "extractedSkills", skip_serializing_if = "Option::is_none")]
    pub extracted_skills: Option<Value>,
    #[serde(rename = "experienceLevel")]
    pub experience_level: Option<String>,
    #[serde(rename = "atsScore")]
    pub ats_score: Option<f64>,
    #[serde(rename = "qualityAnalysis", skip_serializing_if = "Option::is_none")]
    pub quality_analysis: Option<Value>,
    pub suggestions: Option<Vec<String>>,

    #[serde(rename = "skillGapSnapshot", skip_serializing_if = "Option::is_none")]
    pub skill_gap_snapshot: Option<Value>,
    #[serde(rename = "roadmapSnapshot", skip_serializing_if = "Option::is_none")]
    pub roadmap_snapshot: Option<Value>,
    #[serde(rename = "jdMatchSnapshot", skip_serializing_if = "Option::is_none")]
    pub jd_match_snapshot: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JobDescription {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "userId")]
    pub user_id: ObjectId,
    pub title: String,
    pub company: Option<String>,
    #[serde(rename = "descriptionText")]
    pub description_text: String,
    #[serde(rename = "extractedKeywords")]
    pub extracted_keywords: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InterviewSession {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "userId", skip_serializing_if = "Option::is_none")]
    pub user_id: Option<ObjectId>,
    #[serde(rename = "resumeId", skip_serializing_if = "Option::is_none")]
    pub resume_id: Option<ObjectId>,
    pub date: Option<String>,
    pub role: Option<String>,
    #[serde(rename = "type")]
    pub interview_type: Option<String>,
    pub score: Option<i32>,
    pub recommendation: Option<String>,
    pub duration: Option<String>,
    pub transcript: Option<Value>,
}
