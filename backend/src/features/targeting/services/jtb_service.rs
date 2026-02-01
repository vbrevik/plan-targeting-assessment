use std::sync::Arc;
use uuid::Uuid;
use chrono::{Utc};
use core_ontology::{OntologyService, models::{Entity, CreateEntityRequest, CreateRelationshipRequest, UpdateEntityRequest, EntityFilter}};
use crate::features::targeting::domain::*;
use anyhow::Result;

pub struct JtbService {
    ontology: Arc<OntologyService>,
}

impl JtbService {
    pub fn new(ontology: Arc<OntologyService>) -> Self {
        Self { ontology }
    }

    pub async fn create_session(
        &self,
        req: &CreateJtbSessionRequest,
        created_by: &str,
    ) -> Result<String> {
        let id = format!("jtb_{}", Uuid::new_v4().to_string().replace("-", ""));
        
        let properties = serde_json::json!({
            "subtype": "JTB_SESSION",
            "session_date": req.session_date,
            "session_time": req.session_time,
            "session_datetime": req.session_datetime,
            "chair": req.chair,
            "chair_rank": req.chair_rank,
            "required_attendees": req.required_attendees,
            "caveats": req.caveats,
            "created_by": created_by
        });

        let entity_req = CreateEntityRequest {
            id: Some(id.clone()),
            operation_id: None, 
            campaign_id: None,
            name: req.session_name.clone(),
            type_: "Event".to_string(), 
            description: Some(format!("Joint Targeting Board Session: {}", req.session_name)),
            status: Some("SCHEDULED".to_string()),
            location_lat: None,
            location_lng: None,
            properties: Some(properties),
            source: Some("JTB".to_string()),
            classification: Some(req.classification.clone()),
            confidence: None,
        };

        self.ontology.create_entity(entity_req).await?;
        Ok(id)
    }

    pub async fn list_sessions(&self, status: Option<&str>) -> Result<Vec<JtbSession>> {
        let mut filter = EntityFilter::default();
        filter.type_ = Some("Event".to_string());
        
        let entities = self.ontology.get_entities(filter).await?;
        
        let sessions: Vec<JtbSession> = entities.into_iter()
            .filter(|e| {
                e.properties.as_ref()
                    .and_then(|p| p.get("subtype"))
                    .and_then(|s| s.as_str())
                    .map(|s| s == "JTB_SESSION")
                    .unwrap_or(false)
            })
            .filter(|e| {
                if let Some(s) = status {
                   e.status.as_deref() == Some(s)
                } else {
                    true
                }
            })
            .map(|e| self.map_entity_to_session(&e))
            .collect();
            
        Ok(sessions)
    }

    pub async fn get_session(&self, id: &str) -> Result<Option<JtbSession>> {
        match self.ontology.get_entity(id).await {
            Ok(entity) => Ok(Some(self.map_entity_to_session(&entity))),
            Err(_) => Ok(None),
        }
    }

    pub async fn update_session_status(&self, id: &str, status: &str) -> Result<()> {
        let req = UpdateEntityRequest {
            status: Some(status.to_string()),
            properties: if status == "COMPLETED" {
                match self.ontology.get_entity(id).await {
                    Ok(entity) => {
                        let mut props = entity.properties.unwrap_or(serde_json::json!({}));
                        if let serde_json::Value::Object(ref mut map) = props {
                             map.insert("completed_at".to_string(), serde_json::Value::String(Utc::now().to_rfc3339()));
                        }
                        Some(props)
                    },
                    Err(_) => None
                }
            } else {
                None
            },
            ..Default::default()
        };
        
        self.ontology.update_entity(id, req).await?;
        Ok(())
    }

    pub async fn add_target_to_session(
        &self,
        session_id: &str,
        target_id: &str,
        presentation_order: i32,
    ) -> Result<String> {
        let props = serde_json::json!({
            "presentation_order": presentation_order,
            "added_at": Utc::now().to_rfc3339(),
            "votes_for": 0,
            "votes_against": 0,
            "votes_abstain": 0,
            "decision": "PENDING"
        });

        let req = CreateRelationshipRequest {
            source_id: target_id.to_string(),
            target_id: session_id.to_string(),
            relation_type: "DISCUSSED_IN".to_string(),
            properties: Some(props),
        };

        self.ontology.create_relationship(req).await?;
        
        Ok(Uuid::new_v4().to_string()) 
    }

    pub async fn get_targets_for_session(&self, session_id: &str) -> Result<Vec<JtbTarget>> {
        let rels = self.ontology.get_relationships(
            None, 
            Some(session_id.to_string()), 
            Some("DISCUSSED_IN".to_string())
        ).await?;

        let mut targets = Vec::new();
        for rel in rels {
            let target_name = match self.ontology.get_entity(&rel.source_id).await {
                Ok(e) => e.name,
                Err(_) => "Unknown Target".to_string(),
            };
            targets.push(self.map_relationship_to_jtb_target(&rel, target_name));
        }
        
        targets.sort_by_key(|t| t.presentation_order);
        
        Ok(targets)
    }

    pub async fn record_decision(
        &self,
        session_id: &str,
        target_id: &str,
        req: &RecordJtbDecisionRequest,
    ) -> Result<()> {
       // Fetch existing relationship to preserve other props like presentation_order
       let rels = self.ontology.get_relationships(
           Some(target_id.to_string()),
           Some(session_id.to_string()),
           Some("DISCUSSED_IN".to_string())
       ).await?;
       
       if let Some(existing) = rels.first() {
           // Safely clone existing properties or create new object
           let mut props_map = match &existing.properties {
                Some(serde_json::Value::Object(map)) => map.clone(),
                _ => serde_json::Map::new(),
           };
           
           props_map.insert("decision".to_string(), serde_json::Value::String(req.decision.clone()));
           props_map.insert("decision_rationale".to_string(), serde_json::Value::String(req.decision_rationale.clone()));
           props_map.insert("decided_by".to_string(), serde_json::Value::String(req.decided_by.clone()));
           
           props_map.insert("decided_at".to_string(), serde_json::Value::String(Utc::now().to_rfc3339()));
           props_map.insert("votes_for".to_string(), serde_json::json!(req.votes_for.unwrap_or(0)));
           props_map.insert("votes_against".to_string(), serde_json::json!(req.votes_against.unwrap_or(0)));
           props_map.insert("votes_abstain".to_string(), serde_json::json!(req.votes_abstain.unwrap_or(0)));
           
           if let Some(cond) = &req.approval_conditions {
                props_map.insert("approval_conditions".to_string(), serde_json::Value::String(cond.clone()));
           }
           if let Some(mit) = &req.mitigation_requirements {
                props_map.insert("mitigation_requirements".to_string(), serde_json::Value::String(mit.clone()));
           }
           
           // Delete existing relationship
           self.ontology.delete_relationship(target_id, session_id, "DISCUSSED_IN").await?;
           
           // Create new relationship with updated props
            let create_req = CreateRelationshipRequest {
                source_id: target_id.to_string(),
                target_id: session_id.to_string(),
                relation_type: "DISCUSSED_IN".to_string(),
                properties: Some(serde_json::Value::Object(props_map)),
            };
            self.ontology.create_relationship(create_req).await?;
       }
       Ok(())
    }

    fn map_entity_to_session(&self, e: &Entity) -> JtbSession {
        // Need to handle potential missing JTB properties if Entity is generic Event
        // But we filter by subtype JTB_SESSION, so properties should exist.
        // Using unwrap_or defaults for safety.
        
        let binding = serde_json::json!({});
        let props = e.properties.as_ref().unwrap_or(&binding);
        
        JtbSession {
            id: e.id.clone(),
            session_name: e.name.clone(),
            session_date: props.get("session_date").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            session_time: props.get("session_time").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            session_datetime: props.get("session_datetime").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            chair: props.get("chair").and_then(|v| v.as_str()).unwrap_or("Unknown").to_string(),
            chair_rank: props.get("chair_rank").and_then(|v| v.as_str()).map(|s| s.to_string()),
            status: e.status.clone().unwrap_or("SCHEDULED".to_string()),
            required_attendees: None, 
            actual_attendees: None,
            quorum_verified: false,
            protocol_notes: None,
            session_minutes: None,
            classification: e.classification.as_deref().unwrap_or("UNCLASSIFIED").to_string(),
            caveats: None,
            created_by: props.get("created_by").and_then(|v| v.as_str()).unwrap_or("System").to_string(),
            created_at: e.created_at.to_rfc3339(),
            updated_at: e.updated_at.to_rfc3339(),
            completed_at: props.get("completed_at").and_then(|v| v.as_str()).map(|s| s.to_string()),
        }
    }
    
    fn map_relationship_to_jtb_target(&self, rel: &core_ontology::models::EntityRelationship, target_name: String) -> JtbTarget {
         // Create a composite ID for API compatibility
         let id = format!("{}_{}", rel.source_id, rel.target_id); 
         
         let binding = serde_json::json!({});
         let props = rel.properties.as_ref().unwrap_or(&binding);
         
         JtbTarget {
            id,
            session_id: rel.target_id.clone(),
            target_id: rel.source_id.clone(),
            target_name,
            presentation_order: props.get("presentation_order").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
            decision: props.get("decision").and_then(|v| v.as_str()).map(|s| s.to_string()),
            decision_rationale: props.get("decision_rationale").and_then(|v| v.as_str()).map(|s| s.to_string()),
            decided_by: props.get("decided_by").and_then(|v| v.as_str()).map(|s| s.to_string()),
            decided_at: props.get("decided_at").and_then(|v| v.as_str()).map(|s| s.to_string()),
            votes_for: props.get("votes_for").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
            votes_against: props.get("votes_against").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
            votes_abstain: props.get("votes_abstain").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
            approval_conditions: props.get("approval_conditions").and_then(|v| v.as_str()).map(|s| s.to_string()),
            mitigation_requirements: props.get("mitigation_requirements").and_then(|v| v.as_str()).map(|s| s.to_string()),
            added_to_session_at: rel.created_at.to_rfc3339(),
            created_at: rel.created_at.to_rfc3339(),
            updated_at: rel.created_at.to_rfc3339(),
         }
    }
}
