use super::{
    domain::{CreateAssumptionRequest, UpdateAssumptionRequest},
    repositories::AssumptionRepository,
};
use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
    Extension,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct AssumptionQuery {
    pub status: Option<String>,
    pub campaign_id: Option<String>,
    pub operation_id: Option<String>,
}

pub async fn create_assumption(
    Extension(repo): Extension<Arc<AssumptionRepository>>,
    Json(payload): Json<CreateAssumptionRequest>,
) -> impl IntoResponse {
    match repo.create_assumption(payload).await {
        Ok(assumption) => (StatusCode::CREATED, Json(assumption)).into_response(),
        Err(e) => {
            tracing::error!("Failed to create assumption: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create assumption").into_response()
        }
    }
}

pub async fn get_assumptions(
    Extension(repo): Extension<Arc<AssumptionRepository>>,
    Query(query): Query<AssumptionQuery>,
) -> impl IntoResponse {
    // Filter by query parameters
    let result = if let Some(status) = query.status {
        repo.get_assumptions_by_status(&status).await
    } else if let Some(campaign_id) = query.campaign_id {
        repo.get_assumptions_by_campaign(&campaign_id).await
    } else if let Some(operation_id) = query.operation_id {
        repo.get_assumptions_by_operation(&operation_id).await
    } else {
        repo.get_all_assumptions().await
    };

    match result {
        Ok(assumptions) => Json(assumptions).into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch assumptions: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch assumptions").into_response()
        }
    }
}

pub async fn get_assumption(
    Extension(repo): Extension<Arc<AssumptionRepository>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match repo.get_assumption_by_id(&id).await {
        Ok(Some(assumption)) => Json(assumption).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "Assumption not found").into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch assumption: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch assumption").into_response()
        }
    }
}

pub async fn update_assumption(
    Extension(repo): Extension<Arc<AssumptionRepository>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateAssumptionRequest>,
) -> impl IntoResponse {
    match repo.update_assumption(&id, payload).await {
        Ok(assumption) => Json(assumption).into_response(),
        Err(sqlx::Error::RowNotFound) => (StatusCode::NOT_FOUND, "Assumption not found").into_response(),
        Err(e) => {
            tracing::error!("Failed to update assumption: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update assumption").into_response()
        }
    }
}

pub async fn delete_assumption(
    Extension(repo): Extension<Arc<AssumptionRepository>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match repo.delete_assumption(&id).await {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(e) => {
            tracing::error!("Failed to delete assumption: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete assumption").into_response()
        }
    }
}

pub async fn get_summary(
    Extension(repo): Extension<Arc<AssumptionRepository>>,
) -> impl IntoResponse {
    match repo.get_summary().await {
        Ok(summary) => Json(summary).into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch summary: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch summary").into_response()
        }
    }
}
