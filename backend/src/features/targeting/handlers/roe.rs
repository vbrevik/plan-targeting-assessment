use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use crate::features::targeting::domain::roe::{CreateRoeRequest, RoeComplianceRequest};
use crate::features::targeting::services::roe_service::RoeService;
use crate::features::targeting::router::TargetingState;

/// Create a new Rule of Engagement
pub async fn create_roe_rule(
    State(state): State<TargetingState>,
    Json(req): Json<CreateRoeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = RoeService::new(state.ontology_svc.clone());
    
    match service.create_roe(&req).await {
        Ok(id) => Ok((StatusCode::CREATED, Json(json!({"id": id})))),
        Err(e) => {
            eprintln!("Failed to create ROE: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Get all active Rules of Engagement
pub async fn get_active_roes(
    State(state): State<TargetingState>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = RoeService::new(state.ontology_svc.clone());
    
    match service.get_active_roes().await {
        Ok(roes) => Ok(Json(roes)),
        Err(e) => {
            eprintln!("Failed to fetch ROEs: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Check if a proposed action on a target complies with active ROEs
pub async fn check_compliance(
    State(state): State<TargetingState>,
    Json(req): Json<RoeComplianceRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = RoeService::new(state.ontology_svc.clone());
    
    match service.check_compliance(&req).await {
        Ok(result) => Ok(Json(result)),
        Err(e) => {
            eprintln!("Failed to check compliance: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
