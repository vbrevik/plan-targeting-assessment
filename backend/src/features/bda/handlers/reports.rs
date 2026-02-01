use crate::features::bda::BdaState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
    Extension,
};
use core_ontology::{EntityFilter, CreateEntityRequest, UpdateEntityRequest, CreateRelationshipRequest};
use serde::Deserialize;
use std::sync::Arc;
use chrono::Utc;


#[derive(Debug, Deserialize)]
pub struct BdaQuery {
    pub status: Option<String>,
    pub target_id: Option<String>,
    pub analyst_id: Option<String>,
}

/// Create new BDA report
pub async fn create_report(
    State(state): State<BdaState>,
    Extension(user_id): Extension<String>,  // From auth middleware
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    // Basic validation
    let target_id = match payload.get("target_id").and_then(|v| v.as_str()) {
        Some(id) => id.to_string(),
        None => return (StatusCode::BAD_REQUEST, "Missing target_id").into_response(),
    };
    
    // Build entity properties
    let mut properties = payload.clone();
    properties["analyst_id"] = serde_json::json!(user_id);
    properties["status"] = serde_json::json!("draft");
    
    // Create entity via ontology service
    let entity_req = CreateEntityRequest {
        id: None,
        operation_id: None,
        campaign_id: None,
        name: format!("BDA Report - {}", Utc::now().format("%Y%m%d-%H%M%S")),
        type_: "BDA_REPORT".to_string(),
        description: payload.get("damage_description").and_then(|v| v.as_str()).map(|s| s.to_string()),
        status: Some("draft".to_string()),
        location_lat: None,
        location_lng: None,
        properties: Some(properties),
        source: Some("BDA Analyst".to_string()),
        classification: Some(payload.get("classification_level").and_then(|v| v.as_str()).unwrap_or("SECRET").to_string()),
        confidence: payload.get("confidence_level").and_then(|v| v.as_f64()).or(Some(0.5)),
    };
    
    let entity = match state.ontology_svc.create_entity(entity_req).await {
        Ok(e) => e,
        Err(e) => {
            tracing::error!("Failed to create BDA report entity: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create BDA report").into_response();
        }
    };
    
    // Create ASSESSES relationship: BDA_REPORT -> TARGET
    let relationship_req = CreateRelationshipRequest {
        source_id: entity.id.clone(),
        target_id,
        relation_type: "ASSESSES".to_string(),
        properties: Some(serde_json::json!({
            "confidence": payload.get("confidence_level").and_then(|v| v.as_f64()).unwrap_or(0.5),
            "assessment_type": payload.get("assessment_type").and_then(|v| v.as_str()).unwrap_or("initial"),
        })),
    };
    
    if let Err(e) = state.ontology_svc.create_relationship(relationship_req).await {
        tracing::warn!("Failed to create ASSESSES relationship: {:?}", e);
    }
    
    (StatusCode::CREATED, Json(entity)).into_response()
}

/// Get all BDA reports with optional filtering
pub async fn get_reports(
    State(state): State<BdaState>,
    Query(query): Query<BdaQuery>,
) -> impl IntoResponse {
    // Query entities via ontology service
    let filter = EntityFilter {
        type_: Some("BDA_REPORT".to_string()),
        operation_id: None,
        campaign_id: None,
        urgent_only: None,
        created_after: None,
    };
    
    let entities = match state.ontology_svc.get_entities(filter).await {
        Ok(e) => e,
        Err(e) => {
            tracing::error!("Failed to fetch BDA reports via ontology: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch BDA reports").into_response();
        }
    };
    
    // Filter entities
    let filtered: Vec<_> = entities.into_iter()
        .filter(|e| {
            let props = match &e.properties {
                Some(p) => p,
                None => return false,
            };

            // Apply status filter
            if let Some(ref status) = query.status {
                let s = props.get("status").and_then(|v| v.as_str()).unwrap_or("");
                if s.to_lowercase() != status.to_lowercase() {
                    return false;
                }
            }
            
            // Apply target_id filter
            if let Some(ref target_id) = query.target_id {
                let tid = props.get("target_id").and_then(|v| v.as_str()).unwrap_or("");
                if tid != target_id {
                    return false;
                }
            }
            
            // Apply analyst_id filter
            if let Some(ref analyst_id) = query.analyst_id {
                let aid = props.get("analyst_id").and_then(|v| v.as_str()).unwrap_or("");
                if aid != analyst_id {
                    return false;
                }
            }
            
            true
        })
        .collect();
    
    Json(filtered).into_response()
}

/// Get single BDA report by ID
pub async fn get_report(
    State(state): State<BdaState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    // Query entity via ontology service
    match state.ontology_svc.get_entity_only(&id).await {
        Ok(entity) => {
            // Verify it's a BDA_REPORT entity
            if entity.type_ != "BDA_REPORT" {
                return (StatusCode::NOT_FOUND, "BDA report not found").into_response();
            }
            Json(entity).into_response()
        },
        Err(_) => (StatusCode::NOT_FOUND, "BDA report not found").into_response(),
    }
}

/// Update BDA report
pub async fn update_report(
    State(state): State<BdaState>,
    Path(id): Path<String>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    // Verify entity exists and is BDA_REPORT
    match state.ontology_svc.get_entity_only(&id).await {
        Ok(entity) if entity.type_ == "BDA_REPORT" => {
            let mut updated_props = entity.properties.unwrap_or(serde_json::json!({}));
            
            // Merge properties
            if let Some(obj) = payload.as_object() {
                for (k, v) in obj {
                    updated_props[k] = v.clone();
                }
            }

            let update_req = UpdateEntityRequest {
                name: None,
                description: payload.get("damage_description").and_then(|v| v.as_str()).map(|s| s.to_string()),
                status: None,
                location_lat: None,
                location_lng: None,
                properties: Some(updated_props),
                source: None,
                classification: None,
                confidence: payload.get("confidence_level").and_then(|v| v.as_f64()),
            };
            
            match state.ontology_svc.update_entity(&id, update_req).await {
                Ok(updated_entity) => Json(updated_entity).into_response(),
                Err(e) => {
                    tracing::error!("Failed to update BDA report: {:?}", e);
                    (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update BDA report").into_response()
                }
            }
        },
        Ok(_) => (StatusCode::NOT_FOUND, "BDA report not found").into_response(),
        Err(_) => (StatusCode::NOT_FOUND, "BDA report not found").into_response(),
    }
}

/// Delete BDA report
pub async fn delete_report(
    State(state): State<BdaState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.ontology_svc.delete_entity(&id).await {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(e) => {
            tracing::error!("Failed to delete BDA report: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to delete BDA report").into_response()
        }
    }
}

/// Get assessment queue (pending BDA reports)
/// Returns reports with status: draft, submitted, or reviewed
pub async fn get_queue(
    State(state): State<BdaState>,
) -> impl IntoResponse {
    // Query entities with BDA_REPORT type (queue = not yet approved/rejected)
    let filter = EntityFilter {
        type_: Some("BDA_REPORT".to_string()),
        operation_id: None,
        campaign_id: None,
        urgent_only: None,
        created_after: None,
    };
    
    match state.ontology_svc.get_entities(filter).await {
        Ok(entities) => {
            // Filter for queue statuses (draft, submitted, reviewed)
            let queue: Vec<_> = entities
                .into_iter()
                .filter(|e| {
                    if let Some(props) = &e.properties {
                        let status = props.get("status").and_then(|v| v.as_str()).unwrap_or("");
                        matches!(status, "draft" | "submitted" | "reviewed")
                    } else {
                        false
                    }
                })
                .collect();
            
            Json(queue).into_response()
        }
        Err(e) => {
            tracing::error!("Failed to fetch assessment queue: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch assessment queue").into_response()
        }
    }
}

/// Get BDA statistics - ONTOLOGY-FIRST
/// Computes statistics from ontology entities
pub async fn get_statistics(
    State(state): State<BdaState>,
) -> impl IntoResponse {
    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    pub struct BdaStatusCounts {
        pub draft: i64,
        pub submitted: i64,
        pub reviewed: i64,
        pub approved: i64,
        pub rejected: i64,
    }

    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    pub struct BdaRecommendationCounts {
        pub effect_achieved: i64,
        pub monitor: i64,
        pub re_attack: i64,
        pub re_weaponeer: i64,
    }

    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    pub struct BdaPhysicalDamageCounts {
        pub nd: i64,
        pub sd: i64,
        pub md: i64,
        pub svd: i64,
        pub d: i64,
    }

    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    pub struct BdaStatistics {
        pub total_reports: i64,
        pub by_status: BdaStatusCounts,
        pub by_recommendation: BdaRecommendationCounts,
        pub by_physical_damage: BdaPhysicalDamageCounts,
        pub average_confidence: f32,
        pub collateral_damage_incidents: i64,
    }

    
    // Query all BDA_REPORT entities
    let filter = EntityFilter {
        type_: Some("BDA_REPORT".to_string()),
        operation_id: None,
        campaign_id: None,
        urgent_only: None,
        created_after: None,
    };
    
    match state.ontology_svc.get_entities(filter).await {
        Ok(entities) => {
            // Initialize counters
            let mut status_counts = BdaStatusCounts {
                draft: 0,
                submitted: 0,
                reviewed: 0,
                approved: 0,
                rejected: 0,
            };
            
            let mut recommendation_counts = BdaRecommendationCounts {
                effect_achieved: 0,
                monitor: 0,
                re_attack: 0,
                re_weaponeer: 0,
            };
            
            let mut physical_damage_counts = BdaPhysicalDamageCounts {
                nd: 0,
                sd: 0,
                md: 0,
                svd: 0,
                d: 0,
            };
            
            // Count by iterating entities
            for entity in &entities {
                if let Some(props) = &entity.properties {
                    // Count by status
                    match props.get("status").and_then(|v| v.as_str()) {
                        Some("draft") => status_counts.draft += 1,
                        Some("submitted") => status_counts.submitted += 1,
                        Some("reviewed") => status_counts.reviewed += 1,
                        Some("approved") => status_counts.approved += 1,
                        Some("rejected") => status_counts.rejected += 1,
                        _ => {}
                    }
                    
                    // Count by recommendation
                    match props.get("recommendation").and_then(|v| v.as_str()) {
                        Some("effect_achieved") => recommendation_counts.effect_achieved += 1,
                        Some("monitor") => recommendation_counts.monitor += 1,
                        Some("re_attack") => recommendation_counts.re_attack += 1,
                        Some("re_weaponeer") => recommendation_counts.re_weaponeer += 1,
                        _ => {}
                    }
                    
                    // Count by physical damage
                    match props.get("physical_damage").and_then(|v| v.as_str()) {
                        Some("ND") => physical_damage_counts.nd += 1,
                        Some("SD") => physical_damage_counts.sd += 1,
                        Some("MD") => physical_damage_counts.md += 1,
                        Some("SVD") => physical_damage_counts.svd += 1,
                        Some("D") => physical_damage_counts.d += 1,
                        _ => {}
                    }
                }
            }
            
            let stats = BdaStatistics {
                total_reports: entities.len() as i64,
                by_status: status_counts,
                by_recommendation: recommendation_counts,
                by_physical_damage: physical_damage_counts,
                average_confidence: {
                    let sum: f64 = entities.iter()
                        .filter_map(|e| e.properties.as_ref())
                        .filter_map(|p| p.get("confidence_level"))
                        .filter_map(|v| v.as_f64())
                        .sum();
                    let count = entities.len();
                    if count > 0 { (sum / count as f64) as f32 } else { 0.0 }
                },
                collateral_damage_incidents: entities.iter()
                    .filter_map(|e| e.properties.as_ref())
                    .filter(|p| p.get("collateral_damage_detected").and_then(|v| v.as_bool()).unwrap_or(false))
                    .count() as i64,
            };
            
            Json(stats).into_response()
        }
        Err(e) => {
            tracing::error!("Failed to compute BDA statistics: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch BDA statistics").into_response()
        }
    }
}


/// Submit BDA report for review
pub async fn submit_report(
    State(state): State<BdaState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.ontology_svc.get_entity_only(&id).await {
        Ok(entity) if entity.type_ == "BDA_REPORT" => {
            let mut props = entity.properties.unwrap_or(serde_json::json!({}));
            props["status"] = serde_json::json!("submitted");
            props["submitted_at"] = serde_json::json!(Utc::now().to_rfc3339());

            let update_req = UpdateEntityRequest {
                name: None,
                description: None,
                status: Some("submitted".to_string()),
                location_lat: None,
                location_lng: None,
                properties: Some(props),
                source: None,
                classification: None,
                confidence: None,
            };
            
            match state.ontology_svc.update_entity(&id, update_req).await {
                Ok(updated) => Json(updated).into_response(),
                Err(e) => {
                    tracing::error!("Failed to submit BDA report: {:?}", e);
                    (StatusCode::INTERNAL_SERVER_ERROR, "Failed to submit BDA report").into_response()
                }
            }
        },
        _ => (StatusCode::NOT_FOUND, "BDA report not found").into_response(),
    }
}

#[derive(Debug, Deserialize)]
pub struct ApprovalRequest {
    pub comments: Option<String>,
}

/// Approve BDA report
pub async fn approve_report(
    State(state): State<BdaState>,
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    Json(payload): Json<ApprovalRequest>,
) -> impl IntoResponse {
    match state.ontology_svc.get_entity_only(&id).await {
        Ok(entity) if entity.type_ == "BDA_REPORT" => {
            let mut props = entity.properties.unwrap_or(serde_json::json!({}));
            props["status"] = serde_json::json!("approved");
            props["approved_at"] = serde_json::json!(Utc::now().to_rfc3339());
            props["approved_by"] = serde_json::json!(user_id);
            if let Some(comments) = &payload.comments {
                props["review_comments"] = serde_json::json!(comments);
            }

            let update_req = UpdateEntityRequest {
                name: None,
                description: None,
                status: Some("approved".to_string()),
                location_lat: None,
                location_lng: None,
                properties: Some(props),
                source: None,
                classification: None,
                confidence: None,
            };
            
            match state.ontology_svc.update_entity(&id, update_req).await {
                Ok(updated) => Json(updated).into_response(),
                Err(e) => {
                    tracing::error!("Failed to approve BDA report: {:?}", e);
                    (StatusCode::INTERNAL_SERVER_ERROR, "Failed to approve BDA report").into_response()
                }
            }
        },
        _ => (StatusCode::NOT_FOUND, "BDA report not found").into_response(),
    }
}

#[derive(Debug, Deserialize)]
pub struct RejectionRequest {
    pub comments: String,
}

/// Reject BDA report
pub async fn reject_report(
    State(state): State<BdaState>,
    Extension(user_id): Extension<String>,
    Path(id): Path<String>,
    Json(payload): Json<RejectionRequest>,
) -> impl IntoResponse {
    match state.ontology_svc.get_entity_only(&id).await {
        Ok(entity) if entity.type_ == "BDA_REPORT" => {
            let mut props = entity.properties.unwrap_or(serde_json::json!({}));
            props["status"] = serde_json::json!("rejected");
            props["reviewed_at"] = serde_json::json!(Utc::now().to_rfc3339());
            props["reviewed_by"] = serde_json::json!(user_id);
            props["review_comments"] = serde_json::json!(payload.comments);

            let update_req = UpdateEntityRequest {
                name: None,
                description: None,
                status: Some("rejected".to_string()),
                location_lat: None,
                location_lng: None,
                properties: Some(props),
                source: None,
                classification: None,
                confidence: None,
            };
            
            match state.ontology_svc.update_entity(&id, update_req).await {
                Ok(updated) => Json(updated).into_response(),
                Err(e) => {
                    tracing::error!("Failed to reject BDA report: {:?}", e);
                    (StatusCode::INTERNAL_SERVER_ERROR, "Failed to reject BDA report").into_response()
                }
            }
        },
        _ => (StatusCode::NOT_FOUND, "BDA report not found").into_response(),
    }
}

/// Get re-attack recommendations
pub async fn get_reattack_recommendations(
    State(state): State<BdaState>,
) -> impl IntoResponse {
    // Query all BDA_REPORT entities
    let filter = EntityFilter {
        type_: Some("BDA_REPORT".to_string()),
        operation_id: None,
        campaign_id: None,
        urgent_only: None,
        created_after: None,
    };
    
    match state.ontology_svc.get_entities(filter).await {
        Ok(entities) => {
            let recommendations: Vec<_> = entities.into_iter()
                .filter(|e| {
                    if let Some(props) = &e.properties {
                        props.get("recommendation").and_then(|v| v.as_str()) == Some("re_attack")
                    } else {
                        false
                    }
                })
                .collect();
            
            Json(recommendations).into_response()
        }
        Err(e) => {
            tracing::error!("Failed to fetch re-attack recommendations: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch re-attack recommendations").into_response()
        }
    }
}
