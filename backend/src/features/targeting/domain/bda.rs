use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BdaAssessment {
    pub id: String,
    pub target_id: String,
    pub strike_id: String,
    pub bda_status: String, // DESTROYED, DAMAGED, INTACT
    pub effectiveness_pct: f64,
    pub re_attack_recommended: bool,
    pub assessment_time: String,
    pub analyst_id: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateBdaAssessmentRequest {
    pub target_id: String,
    pub strike_id: String,
    pub bda_status: String,
    pub analyst_id: String,
    pub notes: Option<String>,
}
