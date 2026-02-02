use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Roe {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: String, // ACTIVE, CANCELLED, DRAFT
    pub roe_type: String, // SELF_DEFENSE, MISSION_SPECIFIC, STANDING
    pub created_at: String,
    pub created_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRoeRequest {
    pub name: String,
    pub description: String,
    pub roe_type: String, // SELF_DEFENSE, MISSION_SPECIFIC, STANDING
    pub status: String,   // Defaults to ACTIVE if omitted likely
    pub created_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoeComplianceRequest {
    pub target_id: String,
    pub proposed_action: String, // e.g., "KINETIC_STRIKE", "CAPTURE"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoeComplianceResult {
    pub compliant: bool,
    pub violated_rules: Vec<String>,
    pub caveats: Vec<String>,
}
