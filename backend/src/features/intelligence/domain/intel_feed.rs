use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum IntelType {
    Sigint,  // Signal Intelligence
    Osint,   // Open Source Intelligence
    Humint,  // Human Intelligence
    Geoint,  // Geospatial Intelligence
    Masint,  // Measurement and Signature Intelligence
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelFeed {
    pub id: String,
    pub target_id: String,
    pub bda_report_id: Option<String>,
    pub intel_type: IntelType,
    pub source_agency: String,
    pub raw_data: String,
    pub interpretation: String,
    pub confidence_score: f64, // 0.0 to 1.0
    pub reliability_rating: String, // e.g., A1, B2 (NATO standard)
    pub visibility_level: String, // classification level
    pub external_reference_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateIntelFeedRequest {
    pub target_id: String,
    pub bda_report_id: Option<String>,
    pub intel_type: IntelType,
    pub source_agency: String,
    pub raw_data: String,
    pub interpretation: String,
    pub confidence_score: f64,
    pub reliability_rating: String,
    pub visibility_level: String,
    pub external_reference_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateIntelFeedRequest {
    pub interpretation: Option<String>,
    pub confidence_score: Option<f64>,
    pub reliability_rating: Option<String>,
    pub visibility_level: Option<String>,
}
