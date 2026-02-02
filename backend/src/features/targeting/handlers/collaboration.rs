use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Json},
};
use crate::features::targeting::router::TargetingState;
use sqlx::{Pool, Sqlite};
use core_auth::jwt::Claims;
use crate::features::targeting::domain::*;
use crate::features::targeting::repositories::*;
use super::common::TargetQueryParams;

pub async fn list_decisions(
    State(state): State<TargetingState>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let decisions = DecisionLogRepository::list_recent(&state.pool, params.limit)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(decisions))
}

pub async fn create_decision(
    State(state): State<TargetingState>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateDecisionLogRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let id = DecisionLogRepository::create(
        &state.pool,
        &req.decision_type,
        &req.decision_text,
        &req.decision_rationale,
        &req.decision_maker_role,
        &req.authority_level,
        &req.classification,
        user_id,
        req.assumption_ids
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn list_handovers(
    State(state): State<TargetingState>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse, StatusCode> {
    let handovers = ShiftHandoverRepository::get_recent(&state.pool, params.limit)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(handovers))
}

pub async fn generate_handover(
    State(state): State<TargetingState>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateShiftHandoverRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let summary = TargetRepository::get_summary(&state.pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let id = ShiftHandoverRepository::create(
        &state.pool,
        &req.shift_date,
        &req.shift_type,
        &req.incoming_watch_officer,
        &format!("{} active targets", summary.active_targets),
        &format!("{} pending nominations", summary.pending_nominations),
        &req.classification,
        user_id
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}

pub async fn get_target_annotations(
    State(state): State<TargetingState>,
    Path(target_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let annotations = AnnotationRepository::get_by_target_id(&state.pool, &target_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(annotations))
}

pub async fn create_annotation(
    State(state): State<TargetingState>,
    Extension(claims): Extension<Claims>,
    Json(req): Json<CreateAnnotationRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = &claims.sub;
    let id = AnnotationRepository::create(
        &state.pool,
        req.target_id.as_deref(),
        &req.annotation_text,
        &req.annotation_type,
        req.is_critical,
        &req.classification,
        user_id
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(serde_json::json!({"id": id}))))
}
