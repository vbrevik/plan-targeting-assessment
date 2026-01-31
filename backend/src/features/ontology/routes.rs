use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, patch, delete},
    Json, Router,
};
use serde_json::json;
use std::sync::Arc;
use super::service::OntologyService;
use super::models::*;

pub fn ontology_router<S>(service: OntologyService) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/entities", get(list_entities).post(create_entity))
        .route("/entities/:id", get(get_entity).patch(update_entity).delete(delete_entity))
        .route("/entities/:id/acknowledge", post(acknowledge_entity))
        .route("/relationships", get(list_relationships).post(create_relationship))
        .route("/schema", get(get_schema))
        .with_state(Arc::new(service))
}

async fn get_schema(
    State(service): State<Arc<OntologyService>>,
) -> impl IntoResponse {
    match service.get_schema().await {
        Ok(schema) => (StatusCode::OK, Json(schema)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn list_entities(
    State(service): State<Arc<OntologyService>>,
    Query(filter): Query<EntityFilter>,
) -> impl IntoResponse {
    match service.get_entities(filter).await {
        Ok(entities) => (StatusCode::OK, Json(entities)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn create_entity(
    State(service): State<Arc<OntologyService>>,
    Json(req): Json<CreateEntityRequest>,
) -> impl IntoResponse {
    match service.create_entity(req).await {
        Ok(entity) => (StatusCode::CREATED, Json(entity)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn get_entity(
    Path(id): Path<String>,
    State(service): State<Arc<OntologyService>>,
) -> impl IntoResponse {
    match service.get_entity_with_relationships(&id).await {
        Ok(entity) => (StatusCode::OK, Json(entity)).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, Json(json!({ "error": "Entity not found" }))).into_response(),
    }
}

async fn update_entity(
    Path(id): Path<String>,
    State(service): State<Arc<OntologyService>>,
    Json(req): Json<UpdateEntityRequest>,
) -> impl IntoResponse {
    match service.update_entity(&id, req).await {
        Ok(entity) => (StatusCode::OK, Json(entity)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn delete_entity(
    Path(id): Path<String>,
    State(service): State<Arc<OntologyService>>,
) -> impl IntoResponse {
    match service.delete_entity(&id).await {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn list_relationships(
    State(service): State<Arc<OntologyService>>,
    Query(query): Query<serde_json::Value>,
) -> impl IntoResponse {
    let source_id = query.get("source_id").and_then(|v| v.as_str()).map(String::from);
    let target_id = query.get("target_id").and_then(|v| v.as_str()).map(String::from);
    let relation_type = query.get("relation_type").and_then(|v| v.as_str()).map(String::from);

    match service.get_relationships(source_id, target_id, relation_type).await {
        Ok(rels) => (StatusCode::OK, Json(rels)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn create_relationship(
    State(service): State<Arc<OntologyService>>,
    Json(req): Json<CreateRelationshipRequest>,
) -> impl IntoResponse {
    match service.create_relationship(req).await {
        Ok(rel) => (StatusCode::CREATED, Json(rel)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn acknowledge_entity(
    Path(id): Path<String>,
    State(service): State<Arc<OntologyService>>,
    Json(req): Json<AcknowledgeEntityRequest>,
) -> impl IntoResponse {
    match service.acknowledge_entity(&id, req).await {
        Ok(entity) => (StatusCode::OK, Json(entity)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}
