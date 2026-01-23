use super::{handlers, repositories::SmartOpsRepository};
use axum::{
    routing::{get, post},
    Router,
    Extension,
};
use sqlx::{Pool, Sqlite};
use std::sync::Arc;

pub fn router<S>(pool: Pool<Sqlite>) -> Router<S> 
where S: Clone + Send + Sync + 'static {
    let repo = Arc::new(SmartOpsRepository::new(pool));

    Router::new()
        .route("/campaigns", post(handlers::create_campaign).get(handlers::get_campaigns))
        .route("/campaigns/:id/operations", get(handlers::get_operations))
        .route("/operations", post(handlers::create_operation))
        .layer(Extension(repo))
}
