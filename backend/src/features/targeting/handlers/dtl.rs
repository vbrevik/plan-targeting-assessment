use axum::{
    extract::{State, Query, Path},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use crate::features::targeting::router::TargetingState;

use crate::features::targeting::domain::*;
// use crate::features::targeting::repositories::*;
use crate::features::targeting::services::dtl_service::DtlService;
use super::common::TargetQueryParams;

pub async fn list_dtl(
    State(state): State<TargetingState>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = DtlService::new(state.ontology_svc.clone());
    
    let entries = service.list_entries(params.limit)
        .await
        .map_err(|e| {
            eprintln!("Error listing DTL: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        
    Ok(Json(entries))
}

pub async fn create_dtl_entry(
    State(state): State<TargetingState>,
    Json(req): Json<CreateDtlEntryRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = DtlService::new(state.ontology_svc.clone());
    
    let id = service.create_entry(&req)
        .await
        .map_err(|e| {
             eprintln!("Error creating DTL entry: {}", e);
             StatusCode::INTERNAL_SERVER_ERROR
        })?;
        
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn update_dtl_priority(
    State(state): State<TargetingState>,
    Path(target_id): Path<String>, // Rename from entry_id since we use target_id as key
    Json(req): Json<serde_json::Value>,
) -> Result<impl IntoResponse, StatusCode> {
    let priority_score = req.get("priority_score")
        .and_then(|v| v.as_f64())
        .ok_or(StatusCode::BAD_REQUEST)?;
        
    let feasibility_score = req.get("feasibility_score")
        .and_then(|v| v.as_f64())
        .ok_or(StatusCode::BAD_REQUEST)?;
    
    let service = DtlService::new(state.ontology_svc.clone());
    
    // Note: older API might have passed entry_id, but new service expects target_id.
    // DtlEntry ID = Target ID in new system.
    
    service.update_priority(&target_id, priority_score, feasibility_score)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
    Ok(StatusCode::OK)
}

pub async fn get_active_tsts(
    State(state): State<TargetingState>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = DtlService::new(state.ontology_svc.clone());
    
    let entries = service.get_active_tsts()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
    Ok(Json(entries))
}

