use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use crate::features::targeting::router::TargetingState;
use crate::features::targeting::domain::bda::{CreateBdaAssessmentRequest};
use crate::features::targeting::services::bda_service::BdaService;

pub async fn create_bda_assessment(
    State(state): State<TargetingState>,
    Json(req): Json<CreateBdaAssessmentRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = BdaService::new(state.ontology_svc.clone());
    
    let id = service.create_assessment(&req)
        .await
        .map_err(|e| {
            eprintln!("Error creating BDA assessment: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_bda_assessments(
    State(state): State<TargetingState>,
    Path(target_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = BdaService::new(state.ontology_svc.clone());
    
    let assessments = service.get_assessments_for_target(&target_id)
        .await
        .map_err(|e| {
            eprintln!("Error fetching BDA assessments: {}", e);
             StatusCode::INTERNAL_SERVER_ERROR
        })?;
        
    Ok(Json(assessments))
}
