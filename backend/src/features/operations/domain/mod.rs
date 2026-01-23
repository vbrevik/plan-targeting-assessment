use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub status: String,
    pub objective: Option<String>,
    pub end_state: Option<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Operation {
    pub id: String,
    pub campaign_id: String,
    pub name: String,
    pub current_phase: String,
    pub commander_id: Option<String>,
    pub status: String, // 'Planning', 'Executing', 'Complete'
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Entity {
    pub id: String,
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    pub name: String,
    pub r#type: String, // 'Unit', 'Target', 'PoliticalStatement', etc.
    pub description: Option<String>,
    pub status: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub valid_from: Option<DateTime<Utc>>,
    pub valid_until: Option<DateTime<Utc>>,
    pub properties: Option<sqlx::types::Json<serde_json::Value>>,
    pub source: Option<String>,
    pub classification: Option<String>,
    pub confidence: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCampaignRequest {
    pub name: String,
    pub status: String,
    pub objective: Option<String>,
    pub start_date: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOperationRequest {
    pub campaign_id: String,
    pub name: String,
    pub current_phase: String,
    pub status: String,
}
