// BDA Router
// Purpose: Define API routes for BDA feature
// ONTOLOGY-FIRST: Simplified to remove legacy repositories and routes

use super::handlers;
use axum::{
    routing::{get, post},
    Router,
};
use sqlx::{Pool, Sqlite};
use std::sync::Arc;
use core_ontology::OntologyService;

/// Shared state for BDA router
/// Pure ontology-first service
#[derive(Clone)]
pub struct BdaState {
    pub pool: Pool<Sqlite>,
    pub ontology_svc: Arc<OntologyService>,
}

pub fn router<S>(pool: Pool<Sqlite>, ontology_service: Arc<OntologyService>) -> Router<S> 
where S: Clone + Send + Sync + 'static {
    // Create shared state for ontology-first handlers
    let bda_state = BdaState {
        pool: pool.clone(),
        ontology_svc: ontology_service,
    };
    
    Router::new()
        // BDA Reports endpoints (relative to /api/bda)
        .route("/", get(handlers::get_reports))
        .route("/re-attack", get(handlers::get_reattack_recommendations))
        .route("/reports", 
            post(handlers::create_report)
            .get(handlers::get_reports)
        )
        .route("/reports/:id", 
            get(handlers::get_report)
            .put(handlers::update_report)
            .delete(handlers::delete_report)
        )
        .route("/reports/:id/submit", 
            post(handlers::submit_report)
        )
        .route("/reports/:id/approve", 
            post(handlers::approve_report)
        )
        .route("/reports/:id/reject", 
            post(handlers::reject_report)
        )
        
        // Queue and Statistics
        .route("/queue", 
            get(handlers::get_queue)
        )
        .route("/statistics", 
            get(handlers::get_statistics)
        )
        
        // Add shared state for ontology-first handlers
        .with_state(bda_state)
}
