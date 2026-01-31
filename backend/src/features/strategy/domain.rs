use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategicObjective {
    pub id: String,
    pub text: String,
    pub status: String, // "On track", "At risk", "Achieved"
    pub tasks: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategicGuidance {
    pub id: Uuid,
    pub title: String,
    pub source: String,
    pub intent: String,
    pub objectives: Vec<StrategicObjective>,
    #[serde(rename = "lastUpdated")]
    pub last_updated: DateTime<Utc>,
    #[serde(rename = "recommendedRoeIds")]
    pub recommended_roe_ids: Option<Vec<Uuid>>,
    #[serde(rename = "operationId")]
    pub operation_id: Option<String>,
    #[serde(rename = "campaignId")]
    pub campaign_id: Option<String>,
}
