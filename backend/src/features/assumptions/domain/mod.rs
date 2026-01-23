use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Assumption {
    pub id: String,
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub category: String, // 'Enemy', 'Friendly', 'Environmental', 'Political', 'Logistical', 'Intelligence'
    pub status: String,   // 'Valid', 'Monitoring', 'Challenged', 'Broken'
    pub risk_level: String, // 'Low', 'Medium', 'High', 'Critical'
    pub confidence_score: Option<f64>, // 0-100
    pub stated_by: Option<String>,     // user_id
    pub validated_by: Option<String>,  // user_id
    pub last_validated_at: Option<DateTime<Utc>>,
    pub dependencies: Option<sqlx::types::Json<serde_json::Value>>, // Array of plan/decision IDs
    pub impact_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAssumptionRequest {
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub category: String,
    pub confidence_score: Option<f64>,
    pub stated_by: Option<String>,
    pub dependencies: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAssumptionRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub status: Option<String>,
    pub risk_level: Option<String>,
    pub confidence_score: Option<f64>,
    pub validated_by: Option<String>,
    pub dependencies: Option<serde_json::Value>,
    pub impact_notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AssumptionSummary {
    pub total: i64,
    pub valid: i64,
    pub monitoring: i64,
    pub challenged: i64,
    pub broken: i64,
    pub high_risk: i64,
    pub critical_risk: i64,
}
