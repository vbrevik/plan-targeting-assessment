use serde::{Deserialize, Serialize};
use serde_json::Value;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Entity {
    pub id: String,
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    pub name: String,
    #[sqlx(rename = "type")]
    pub type_: String,
    pub description: Option<String>,
    pub status: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub valid_from: Option<DateTime<Utc>>,
    pub valid_until: Option<DateTime<Utc>>,
    pub properties: Option<Value>,
    pub source: Option<String>,
    pub classification: Option<String>,
    pub confidence: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct EntityRelationship {
    pub source_id: String,
    pub target_id: String,
    pub relation_type: String,
    pub properties: Option<Value>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEntityRequest {
    pub id: Option<String>,
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    pub name: String,
    pub type_: String,
    pub description: Option<String>,
    pub status: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub properties: Option<Value>,
    pub source: Option<String>,
    pub classification: Option<String>,
    pub confidence: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEntityRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub location_lat: Option<f64>,
    pub location_lng: Option<f64>,
    pub properties: Option<Value>,
    pub source: Option<String>,
    pub classification: Option<String>,
    pub confidence: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRelationshipRequest {
    pub source_id: String,
    pub target_id: String,
    pub relation_type: String,
    pub properties: Option<Value>,
}

#[derive(Debug, Deserialize)]
pub struct AcknowledgeEntityRequest {
    pub acknowledged_by: String,
}

#[derive(Debug, Serialize)]
pub struct EntityWithRelationships {
    #[serde(flatten)]
    pub entity: Entity,
    pub outgoing_relationships: Vec<EntityRelationship>,
    pub incoming_relationships: Vec<EntityRelationship>,
}

#[derive(Debug, Deserialize)]
pub struct EntityFilter {
    pub type_: Option<String>,
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    pub urgent_only: Option<bool>,
    pub created_after: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OntologySchema {
    pub version: String,
    pub last_updated: DateTime<Utc>,
    pub domains: Vec<String>,
    pub entity_types: Vec<EntityTypeDefinition>,
    pub relationship_types: Vec<RelationshipTypeDefinition>,
    pub levels_of_war: Vec<String>,
    pub affiliations: Vec<String>,
    pub target_statuses: Vec<String>,
    pub platform_types: Vec<String>,
    pub confidence_levels: Vec<String>,
    pub bda_statuses: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntityTypeDefinition {
    pub name: String,
    pub description: String,
    pub properties_schema: Option<Value>, // JSON Schema for validation
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RelationshipTypeDefinition {
    pub name: String,
    pub description: String,
    pub valid_sources: Vec<String>,
    pub valid_targets: Vec<String>,
}
