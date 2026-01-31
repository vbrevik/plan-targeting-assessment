use axum::{
    Router,
    routing::get,
    Json,
    extract::State,
};
use crate::features::strategy::service::StrategyService;

pub fn strategy_routes() -> Router<StrategyService> {
    Router::new()
        .route("/guidance", get(get_guidance))
}

async fn get_guidance(
    State(service): State<StrategyService>,
) -> Json<serde_json::Value> {
    let guidance = service.get_current_guidance().await;
    Json(serde_json::json!(guidance))
}
