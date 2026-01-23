use super::{
    domain::{CreateCampaignRequest, CreateOperationRequest},
    repositories::SmartOpsRepository,
};
use axum::{
    extract::{Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
    Extension,
};
use std::sync::Arc;

pub async fn create_campaign(
    Extension(repo): Extension<Arc<SmartOpsRepository>>,
    Json(payload): Json<CreateCampaignRequest>,
) -> impl IntoResponse {
    match repo.create_campaign(payload).await {
        Ok(campaign) => (StatusCode::CREATED, Json(campaign)).into_response(),
        Err(e) => {
            tracing::error!("Failed to create campaign: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create campaign").into_response()
        }
    }
}

pub async fn get_campaigns(
    Extension(repo): Extension<Arc<SmartOpsRepository>>,
) -> impl IntoResponse {
    match repo.get_campaigns().await {
        Ok(campaigns) => Json(campaigns).into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch campaigns: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch campaigns").into_response()
        }
    }
}

pub async fn create_operation(
    Extension(repo): Extension<Arc<SmartOpsRepository>>,
    Json(payload): Json<CreateOperationRequest>,
) -> impl IntoResponse {
    match repo.create_operation(payload).await {
        Ok(operation) => (StatusCode::CREATED, Json(operation)).into_response(),
        Err(e) => {
            tracing::error!("Failed to create operation: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create operation").into_response()
        }
    }
}

pub async fn get_operations(
    Extension(repo): Extension<Arc<SmartOpsRepository>>,
    Path(campaign_id): Path<String>,
) -> impl IntoResponse {
    match repo.get_operations_by_campaign(&campaign_id).await {
        Ok(operations) => Json(operations).into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch operations: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch operations").into_response()
        }
    }
}
