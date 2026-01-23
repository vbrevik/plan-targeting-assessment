use super::{handlers, repositories::AssumptionRepository};
use axum::{
    routing::{get, post},
    Router,
    Extension,
};
use sqlx::{Pool, Sqlite};
use std::sync::Arc;

pub fn router<S>(pool: Pool<Sqlite>) -> Router<S> 
where S: Clone + Send + Sync + 'static {
    let repo = Arc::new(AssumptionRepository::new(pool));

    Router::new()
        .route("/assumptions", 
            post(handlers::create_assumption)
            .get(handlers::get_assumptions)
        )
        .route("/assumptions/summary", get(handlers::get_summary))
        .route("/assumptions/:id", 
            get(handlers::get_assumption)
                .put(handlers::update_assumption)
                .delete(handlers::delete_assumption)
        )
        .layer(Extension(repo))
}
