use axum::{
    extract::{Multipart, Path, State},
    http::{StatusCode, Method},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use axum::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use dotenv::dotenv;
use mongodb::{bson::doc, options::ClientOptions, Client, Collection};
use pdf_extract::extract_text_from_mem;
use serde_json::{json, Value};
use std::env;
use tower_http::cors::{Any, CorsLayer};

mod models;
mod ai;

use models::{Resume, User};

#[derive(Clone)]
struct AppState {
    db: mongodb::Database,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    // Connect to MongoDB
    let db_uri = env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017/hiremind".into());
    let mut client_options = ClientOptions::parse(&db_uri).await.unwrap();
    client_options.app_name = Some("hiremind-rust".to_string());
    let client = Client::with_options(client_options).unwrap();
    let db = client.database("hiremind");

    println!("✅ Connected to MongoDB");

    let state = AppState { db };

    // CORS
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
        .allow_origin(Any);

    // Routes
    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/resumes/upload", post(upload_resume))
        .route("/api/resumes/:user_id", get(get_resumes))
        .route("/api/resumes/:id/match", post(match_jd))
        .route("/api/resumes/:id/roadmap", post(generate_roadmap))
        .route("/api/resumes/:id/interview-prep", post(generate_interview_prep))
        .route("/api/resumes/:id/coach", post(coach_resume))
        .layer(cors)
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "3001".into());
    let addr = format!("0.0.0.0:{}", port);
    println!("🚀 Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    Json(json!({ "status": "ok", "message": "HireMind Rust API is running" }))
}

async fn get_resumes(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    use futures::stream::StreamExt;
    
    let obj_id = match mongodb::bson::oid::ObjectId::parse_str(&user_id) {
        Ok(id) => id,
        Err(_) => return Err((StatusCode::BAD_REQUEST, "Invalid User ID".into())),
    };

    let coll: Collection<Resume> = state.db.collection("resumes");
    
    let filter = doc! { "userId": obj_id };
    // NOTE: sorting by createdAt requires the field in struct, but doc! sort works on BSON level
    let find_options = mongodb::options::FindOptions::builder().sort(doc! { "createdAt": -1 }).build();

    let mut cursor = coll.find(filter, find_options).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut resumes = Vec::new();
    while let Some(result) = cursor.next().await {
        if let Ok(doc) = result {
            resumes.push(doc);
        }
    }

    Ok(Json(json!({ "success": true, "data": resumes })))
}

async fn upload_resume(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<Value>, (StatusCode, String)> {
    println!("--> [1/5] Received Resume Upload Request");

    let mut file_name = String::new();
    let mut file_bytes = Vec::new();

    while let Some(field) = multipart.next_field().await.map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))? {
        if let Some(name) = field.name() {
            if name == "resume" {
                file_name = field.file_name().unwrap_or("resume.pdf").to_string();
                file_bytes = field.bytes().await.map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?.to_vec();
            }
        }
    }

    if file_bytes.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "No resume file uploaded".into()));
    }

    println!("--> [2/5] Parsing PDF file ({})...", file_name);
    let raw_text = extract_text_from_mem(&file_bytes).map_err(|_| (StatusCode::BAD_REQUEST, "Failed to parse PDF".into()))?;
    
    // Basic whitespace cleanup
    let cleaned_text: String = raw_text.split_whitespace().collect::<Vec<_>>().join(" ");
    if cleaned_text.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "PDF is empty or unreadable".into()));
    }
    println!("✅ [2/5] PDF Parsed successfully.");

    println!("--> [3/5] Triggering Gemini/Groq AI Deep Analysis...");
    let ai_result = ai::analyze_resume(&cleaned_text).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    println!("✅ [3/5] AI Analysis Completed.");

    println!("--> [4/5] Looking up User Session...");
    let users_coll: Collection<User> = state.db.collection("users");
    let test_email = "test@hiremind.com".to_string();
    
    let mut user = users_coll.find_one(doc! { "email": &test_email }, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    let user_id = if let Some(u) = user {
        u.id.unwrap()
    } else {
        let new_user = User {
            id: None,
            email: test_email,
            name: "Test User".to_string(),
            career_track: Some("Software Engineer".to_string()),
            readiness_score: Some(0.0),
        };
        let res = users_coll.insert_one(new_user, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        res.inserted_id.as_object_id().unwrap()
    };

    let resumes_coll: Collection<Resume> = state.db.collection("resumes");
    let previous_versions = resumes_coll.count_documents(doc! { "userId": user_id }, None).await.unwrap_or(0);
    let version_number = (previous_versions + 1) as i32;

    println!("--> [5/5] Saving Resume Data to MongoDB as Version {}...", version_number);

    let extracted_data = ai_result.get("extractedData").cloned();
    let ai_analysis = ai_result.get("aiAnalysis").cloned();
    let bc = ai_result.get("backwardCompatibility");

    let experience_level = bc.and_then(|b| b.get("experienceLevel")).and_then(|e| e.as_str()).map(|s| s.to_string()).unwrap_or("Mid-Level".to_string());
    
    let mut suggestions = Vec::new();
    if let Some(suggs) = bc.and_then(|b| b.get("suggestions")).and_then(|s| s.as_array()) {
        for s in suggs {
            if let Some(str_val) = s.as_str() {
                suggestions.push(str_val.to_string());
            }
        }
    }

    let ats_score = ai_analysis.as_ref()
        .and_then(|a| a.get("atsReadinessScore"))
        .and_then(|v| v.as_f64())
        .unwrap_or(0.0);

    let resume = Resume {
        id: None,
        user_id,
        version_number,
        file_name,
        raw_text,
        cleaned_text,
        extracted_skills: extracted_data.as_ref().and_then(|d| d.get("skills")).cloned(),
        extracted_data,
        ai_analysis,
        experience_level: Some(experience_level),
        ats_score: Some(ats_score),
        quality_analysis: None,
        suggestions: Some(suggestions),
        skill_gap_snapshot: None,
        roadmap_snapshot: None,
        jd_match_snapshot: None,
    };

    let res = resumes_coll.insert_one(&resume, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    
    let mut inserted_resume = resume;
    inserted_resume.id = res.inserted_id.as_object_id();

    println!("✅ [5/5] Resume saved successfully to database!");

    Ok(Json(json!({ "success": true, "resume": inserted_resume })))
}

#[derive(serde::Deserialize)]
struct MatchRequest {
    #[serde(rename = "jdText")]
    jd_text: Option<String>,
}

async fn match_jd(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<MatchRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).map_err(|_| (StatusCode::BAD_REQUEST, "Invalid ID".into()))?;
    let coll: Collection<Resume> = state.db.collection("resumes");
    let mut resume = coll.find_one(doc! { "_id": obj_id }, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Resume not found".into()))?;

    let match_res = ai::match_job_description(&resume.cleaned_text, &payload.jd_text.unwrap_or_default()).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    resume.jd_match_snapshot = Some(match_res.clone());
    coll.replace_one(doc! { "_id": obj_id }, &resume, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(json!({ "success": true, "data": match_res, "resume": resume })))
}

#[derive(serde::Deserialize)]
struct RoadmapRequest {
    #[serde(rename = "targetRole")]
    target_role: Option<String>,
    #[serde(rename = "jdText")]
    jd_text: Option<String>,
}

async fn generate_roadmap(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<RoadmapRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).map_err(|_| (StatusCode::BAD_REQUEST, "Invalid ID".into()))?;
    let coll: Collection<Resume> = state.db.collection("resumes");
    let mut resume = coll.find_one(doc! { "_id": obj_id }, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Resume not found".into()))?;

    let role = payload.target_role.unwrap_or_else(|| "Software Engineer".into());
    let roadmap = ai::generate_career_roadmap(&resume.cleaned_text, &role, payload.jd_text.as_deref()).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    resume.roadmap_snapshot = Some(roadmap.clone());
    
    let gap_analysis = roadmap.get("gapAnalysis").cloned();
    let gap_severity = roadmap.get("gapSeverity").cloned();
    resume.skill_gap_snapshot = Some(json!({
        "gapAnalysis": gap_analysis,
        "gapSeverity": gap_severity
    }));

    coll.replace_one(doc! { "_id": obj_id }, &resume, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(json!({ "success": true, "data": roadmap, "resume": resume })))
}

async fn generate_interview_prep(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<MatchRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).map_err(|_| (StatusCode::BAD_REQUEST, "Invalid ID".into()))?;
    let coll: Collection<Resume> = state.db.collection("resumes");
    let resume = coll.find_one(doc! { "_id": obj_id }, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Resume not found".into()))?;

    let jd = payload.jd_text.unwrap_or_else(|| "General Software Engineer".into());
    let prep = ai::generate_interview_questions(&resume.cleaned_text, &jd).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    Ok(Json(json!({ "success": true, "data": prep })))
}

async fn coach_resume(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).map_err(|_| (StatusCode::BAD_REQUEST, "Invalid ID".into()))?;
    let coll: Collection<Resume> = state.db.collection("resumes");
    let resume = coll.find_one(doc! { "_id": obj_id }, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Resume not found".into()))?;

    let feedback = ai::coach_resume(&resume.cleaned_text).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    Ok(Json(json!({ "success": true, "data": feedback })))
}
