use axum::{
    routing::{get, post},
    Router,
    Extension,
};
use sqlx::{Pool, Sqlite};
use std::sync::Arc;
use crate::features::intelligence::{handlers, repositories::IntelRepository};

pub fn router<S>(pool: Pool<Sqlite>) -> Router<S> 
where S: Clone + Send + Sync + 'static {
    let intel_repo = Arc::new(IntelRepository::new(pool));
    
    Router::new()
        .route("/", post(handlers::create_feed))
        .route("/target/:target_id", get(handlers::get_feeds_by_target))
        .route("/report/:report_id", get(handlers::get_feeds_by_report))
        .route("/:id", 
            get(handlers::get_feed)
            .put(handlers::update_feed)
            .delete(handlers::delete_feed)
        )
        .layer(Extension(intel_repo))
}
