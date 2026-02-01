use crate::features::intelligence::{
    domain::{CreateIntelFeedRequest, UpdateIntelFeedRequest},
    repositories::IntelRepository,
};
use axum::{
    extract::Path,
    http::StatusCode,
    response::IntoResponse,
    Json,
    Extension,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct IntelQuery {
    pub target_id: Option<String>,
    pub bda_report_id: Option<String>,
}

pub async fn create_feed(
    Extension(repo): Extension<Arc<IntelRepository>>,
    Json(payload): Json<CreateIntelFeedRequest>,
) -> impl IntoResponse {
    match repo.create(payload).await {
        Ok(feed) => (StatusCode::CREATED, Json(feed)).into_response(),
        Err(e) => {
            tracing::error!("Failed to create intelligence feed: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create intelligence feed").into_response()
        }
    }
}

pub async fn get_feeds_by_target(
    Extension(repo): Extension<Arc<IntelRepository>>,
    Path(target_id): Path<String>,
) -> impl IntoResponse {
    match repo.get_by_target(&target_id).await {
        Ok(feeds) => Json(feeds).into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch intelligence feeds for target: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch intelligence feeds").into_response()
        }
    }
}

pub async fn get_feeds_by_report(
    Extension(repo): Extension<Arc<IntelRepository>>,
    Path(report_id): Path<String>,
) -> impl IntoResponse {
    match repo.get_by_report(&report_id).await {
        Ok(feeds) => Json(feeds).into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch intelligence feeds for report: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch intelligence feeds").into_response()
        }
    }
}

pub async fn get_feed(
    Extension(repo): Extension<Arc<IntelRepository>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match repo.get_by_id(&id).await {
        Ok(Some(feed)) => Json(feed).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "Intelligence feed not found").into_response(),
        Err(e) => {
            tracing::error!("Failed to fetch intelligence feed: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch intelligence feed").into_response()
        }
    }
}

pub async fn update_feed(
    Extension(repo): Extension<Arc<IntelRepository>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateIntelFeedRequest>,
) -> impl IntoResponse {
    match repo.update(&id, payload).await {
        Ok(feed) => Json(feed).into_response(),
        Err(sqlx::Error::RowNotFound) => (StatusCode::NOT_FOUND, "Intelligence feed not found").into_response(),
        Err(e) => {
            tracing::error!("Failed to update intelligence feed: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update intelligence feed").into_response()
        }
    }
}

pub async fn delete_feed(
    Extension(repo): Extension<Arc<IntelRepository>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match repo.delete(&id).await {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(e) => {
            tracing::error!("Failed to delete intelligence feed: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete intelligence feed").into_response()
        }
    }
}
