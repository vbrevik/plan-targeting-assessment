use axum::{
    extract::{Path, State, Extension, Query},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use crate::features::targeting::router::TargetingState;

use crate::features::targeting::domain::*;
// use crate::features::targeting::repositories::*; // specific repositories replaced by service
use crate::features::targeting::services::jtb_service::JtbService;
use core_auth::jwt::Claims;
use super::common::PlatformQueryParams;

pub async fn list_jtb_sessions(
    State(state): State<TargetingState>,
    Query(params): Query<PlatformQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = JtbService::new(state.ontology_svc.clone());
    
    let sessions = service.list_sessions(params.status.as_deref())
        .await
        .map_err(|e| {
            eprintln!("Error listing sessions: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        
    Ok(Json(sessions))
}

pub async fn create_jtb_session(
    State(state): State<TargetingState>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateJtbSessionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let service = JtbService::new(state.ontology_svc.clone());
    
    let id = service.create_session(&req, user_id)
        .await
        .map_err(|e| {
            eprintln!("Error creating session: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_jtb_session(
    State(state): State<TargetingState>,
    Path(session_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = JtbService::new(state.ontology_svc.clone());
    
    let session = service.get_session(&session_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    
    let targets = service.get_targets_for_session(&session_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(serde_json::json!({
        "session": session,
        "targets": targets
    })))
}

pub async fn update_jtb_session_status(
    State(state): State<TargetingState>,
    Path(session_id): Path<String>,
    Json(req): Json<serde_json::Value>,
) -> Result<impl IntoResponse, StatusCode> {
    let status = req.get("status")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;
    
    let service = JtbService::new(state.ontology_svc.clone());
    
    service.update_session_status(&session_id, status)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
    Ok(StatusCode::OK)
}

pub async fn add_target_to_jtb_session(
    State(state): State<TargetingState>,
    Path(session_id): Path<String>,
    Json(req): Json<AddTargetToSessionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = JtbService::new(state.ontology_svc.clone());
    
    // Auto-calculate presentation order if missing
    let presentation_order = if let Some(order) = req.presentation_order {
        order
    } else {
        let existing = service.get_targets_for_session(&session_id)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        (existing.len() + 1) as i32
    };

    service.add_target_to_session(&session_id, &req.target_id, presentation_order)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
    Ok(StatusCode::OK)
}

pub async fn record_jtb_decision(
    State(state): State<TargetingState>,
    Path(jtb_target_id): Path<String>,
    Json(req): Json<RecordJtbDecisionRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let service = JtbService::new(state.ontology_svc.clone());
    
    // Parse composite ID: "targetId_sessionId"
    // Wait, in JtbService::map_relationship_to_jtb_target, we constructed it as `{source_id}_{target_id}`
    // which corresponds to `{target_id}_{session_id}`.
    
    // Since IDs are UUIDs (containing dashes, potentially), but we replaced dashes in generation?
    // Check JtbService: `format!("jtb_{}", uuid...replace("-", ""))` for session.
    // Entities created by us have `jtb_` prefix? JtbService creates session with `jtb_` prefix.
    // Target IDs are UUIDs. 
    // JtbService::create_session replacements: `replace("-", "")`.
    // JtbService::map_relationship_to_jtb_target: `format!("{}_{}", rel.source_id, rel.target_id)`.
    
    // If target_id or session_id contains `_`, split will fail.
    // UUIDs don't contain `_`.
    // Session IDs start with `jtb_`.
    // So if session id is `jtb_...`, and target uses standard UUID `...`,
    // composite is `UUID_jtb_...`.
    // Split on `_` might give > 2 parts due to `jtb_`.
    // Correct logic:
    // target_id is Source. session_id is Target.
    // Format: "source_target".
    // Since session_id starts with "jtb_", we can look for "jtb_" index?
    // Or just split.
    // 
    // Wait, target IDs (from `TargetRepository::create`) are typically UUIDs (dashes, no underscores).
    // Session IDs (from `JtbService::create_session`) are `jtb_XXXX`.
    
    // Example composite: `550e8400-e29b-41d4-a716-446655440000_jtb_12345678...`
    // Splitting by `_` gives:
    // [ "550e8400-e29b-41d4-a716-446655440000", "jtb", "12345678..." ]
    // We can reconstruct.
    
    // Safer: find the known separator `_jtb_`.
    
    let (target_id, session_id) = if jtb_target_id.contains("_jtb_") {
        let parts: Vec<&str> = jtb_target_id.split("_jtb_").collect();
        if parts.len() != 2 {
             return Err(StatusCode::BAD_REQUEST);
        }
        (parts[0].to_string(), format!("jtb_{}", parts[1]))
    } else {
        // Fallback or error.
        // What if session ID doesn't start with jtb_? (Legacy data?).
        // For new system, it does.
        return Err(StatusCode::BAD_REQUEST);
    };

    service.record_decision(&session_id, &target_id, &req)
        .await
        .map_err(|e| {
            eprintln!("Error recording decision: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        
    Ok(StatusCode::OK)
}

