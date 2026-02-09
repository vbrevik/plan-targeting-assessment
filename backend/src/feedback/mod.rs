use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json, Router,
    routing::get,
};
use core_ontology::OntologyService;
use core_common_types::Entity;
use serde::Deserialize;
use std::sync::Arc;

// --- Request/Response types ---

#[derive(Debug, Deserialize)]
pub struct CreateFeedbackEventRequest {
    pub event_type: String,
    pub source_module: String,
    pub target_module: String,
    pub severity: Option<String>,
    pub title: String,
    pub description: String,
    pub recommendation: Option<String>,
    pub linked_entity_type: Option<String>,
    pub linked_entity_id: Option<String>,
    pub linked_entity_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateFeedbackEventRequest {
    pub status: Option<String>,
    pub resolved_by: Option<String>,
    pub recommendation: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct FeedbackEventFilter {
    pub event_type: Option<String>,
    pub status: Option<String>,
    pub severity: Option<String>,
}

// --- Helpers ---

fn entity_matches_filter(entity: &Entity, filter: &FeedbackEventFilter) -> bool {
    let props = match &entity.properties {
        Some(p) => p,
        None => return false,
    };

    if let Some(ref et) = filter.event_type {
        let val = props.get("event_type").and_then(|v| v.as_str()).unwrap_or("");
        if val != et {
            return false;
        }
    }
    if let Some(ref st) = filter.status {
        let entity_status = entity.status.as_deref().unwrap_or("OPEN");
        if entity_status != st {
            return false;
        }
    }
    if let Some(ref sv) = filter.severity {
        let val = props.get("severity").and_then(|v| v.as_str()).unwrap_or("INFO");
        if val != sv {
            return false;
        }
    }
    true
}

// --- Handlers ---

pub async fn list_feedback_events(
    State(svc): State<Arc<OntologyService>>,
    Query(filter): Query<FeedbackEventFilter>,
) -> Result<impl IntoResponse, StatusCode> {
    let entity_filter = core_ontology::models::EntityFilter {
        type_: Some("FEEDBACK_EVENT".to_string()),
        ..Default::default()
    };

    match svc.get_entities(entity_filter).await {
        Ok(entities) => {
            let filtered: Vec<_> = entities
                .into_iter()
                .filter(|e| entity_matches_filter(e, &filter))
                .collect();
            Ok(Json(filtered))
        }
        Err(e) => {
            tracing::error!("Failed to list feedback events: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_feedback_event(
    State(svc): State<Arc<OntologyService>>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    match svc.get_entity_only(&id).await {
        Ok(entity) if entity.type_ == "FEEDBACK_EVENT" => Ok(Json(entity)),
        Ok(_) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn create_feedback_event(
    State(svc): State<Arc<OntologyService>>,
    Json(payload): Json<CreateFeedbackEventRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let severity = payload.severity.unwrap_or_else(|| "INFO".to_string());

    let properties = serde_json::json!({
        "event_type": payload.event_type,
        "source_module": payload.source_module,
        "target_module": payload.target_module,
        "severity": severity,
        "recommendation": payload.recommendation,
        "linked_entity_type": payload.linked_entity_type,
        "linked_entity_id": payload.linked_entity_id,
        "linked_entity_name": payload.linked_entity_name,
    });

    let entity_req = core_ontology::models::CreateEntityRequest {
        id: None,
        operation_id: None,
        campaign_id: None,
        name: payload.title,
        type_: "FEEDBACK_EVENT".to_string(),
        description: Some(payload.description),
        status: Some("OPEN".to_string()),
        location_lat: None,
        location_lng: None,
        properties: Some(properties),
        source: Some(format!("Feedback/{}", payload.source_module)),
        classification: None,
        confidence: Some(1.0),
    };

    let entity = svc.create_entity(entity_req).await.map_err(|e| {
        tracing::error!("Failed to create feedback event: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Create relationship to linked entity if provided
    if let Some(ref linked_id) = payload.linked_entity_id {
        let rel_req = core_ontology::models::CreateRelationshipRequest {
            source_id: entity.id.clone(),
            target_id: linked_id.clone(),
            relation_type: "CONCERNS".to_string(),
            properties: Some(serde_json::json!({
                "entity_type": payload.linked_entity_type,
                "entity_name": payload.linked_entity_name,
            })),
        };
        if let Err(e) = svc.create_relationship(rel_req).await {
            tracing::warn!("Failed to create CONCERNS relationship: {:?}", e);
        }
    }

    Ok((StatusCode::CREATED, Json(entity)))
}

pub async fn update_feedback_event(
    State(svc): State<Arc<OntologyService>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateFeedbackEventRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // Verify entity exists and is a feedback event
    let entity = svc.get_entity_only(&id).await.map_err(|_| StatusCode::NOT_FOUND)?;
    if entity.type_ != "FEEDBACK_EVENT" {
        return Err(StatusCode::NOT_FOUND);
    }

    // Merge updated fields into existing properties
    let mut props = entity.properties.unwrap_or(serde_json::json!({}));

    if let Some(ref resolved_by) = payload.resolved_by {
        props["resolved_by"] = serde_json::json!(resolved_by);
    }
    if let Some(ref recommendation) = payload.recommendation {
        props["recommendation"] = serde_json::json!(recommendation);
    }

    let new_status = if let Some(ref status) = payload.status {
        if status == "RESOLVED" {
            props["resolved_at"] = serde_json::json!(chrono::Utc::now().to_rfc3339());
        }
        Some(status.clone())
    } else {
        None
    };

    let update_req = core_ontology::models::UpdateEntityRequest {
        status: new_status,
        properties: Some(props),
        ..Default::default()
    };

    match svc.update_entity(&id, update_req).await {
        Ok(updated) => Ok(Json(updated)),
        Err(e) => {
            tracing::error!("Failed to update feedback event: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// --- Router ---

pub fn feedback_routes<S>(svc: Arc<OntologyService>) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/", get(list_feedback_events).post(create_feedback_event))
        .route("/{id}", get(get_feedback_event).patch(update_feedback_event))
        .with_state(svc)
}
