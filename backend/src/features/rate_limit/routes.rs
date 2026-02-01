use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use std::sync::Arc;

use crate::features::rate_limit::service::RateLimitService;

/// Get all rate limit rules
pub async fn list_rules_handler(
    State(service): State<Arc<RateLimitService>>,
) -> impl IntoResponse {
    match service.list_rules().await {
        Ok(rules) => (StatusCode::OK, Json(rules)).into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Failed to fetch rules"})),
        ).into_response(),
    }
}

/// Get a single rate limit rule
pub async fn get_rule_handler(
    State(service): State<Arc<RateLimitService>>,
    Path(rule_id): Path<String>,
) -> impl IntoResponse {
    match service.get_rule(&rule_id).await {
        Ok(Some(rule)) => (StatusCode::OK, Json(rule)).into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "Rule not found"})),
        ).into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Failed to fetch rule"})),
        ).into_response(),
    }
}

/// List all bypass tokens
pub async fn list_bypass_tokens_handler(
    State(service): State<Arc<RateLimitService>>,
) -> impl IntoResponse {
    match service.list_bypass_tokens().await {
        Ok(tokens) => (StatusCode::OK, Json(tokens)).into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Failed to fetch tokens"})),
        ).into_response(),
    }
}

pub fn public_rate_limit_routes() -> Router<Arc<RateLimitService>> {
    Router::new()
        .route("/rules", get(list_rules_handler))
        .route("/rules/:id", get(get_rule_handler))
        .route("/bypass-tokens", get(list_bypass_tokens_handler))
}
