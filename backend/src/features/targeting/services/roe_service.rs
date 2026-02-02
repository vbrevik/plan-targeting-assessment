use std::sync::Arc;
use core_ontology::{OntologyService, models::{Entity, CreateEntityRequest, UpdateEntityRequest, EntityFilter}};
use crate::features::targeting::domain::roe::*;
use anyhow::Result;
use chrono::Utc;
use serde_json::json;

pub struct RoeService {
    ontology: Arc<OntologyService>,
}

impl RoeService {
    pub fn new(ontology: Arc<OntologyService>) -> Self {
        Self { ontology }
    }

    pub async fn create_roe(&self, req: &CreateRoeRequest) -> Result<String> {
        let props = json!({
            "status": req.status,
            "roe_type": req.roe_type,
            "description": req.description,
            "created_by": req.created_by,
            "created_at": Utc::now().to_rfc3339()
        });

        let entity_req = CreateEntityRequest {
            id: None,
            operation_id: None,
            campaign_id: None,
            name: req.name.clone(),
            type_: "ROE".to_string(),
            description: Some(req.description.clone()),
            status: Some(req.status.clone()),
            location_lat: None,
            location_lng: None,
            properties: Some(props),
            source: Some("RoeService".to_string()),
            classification: Some("SECRET".to_string()),
            confidence: Some(1.0),
        };

        let entity = self.ontology.create_entity(entity_req).await?;
        Ok(entity.id)
    }

    pub async fn get_active_roes(&self) -> Result<Vec<Roe>> {
        let filter = EntityFilter {
            type_: Some("ROE".to_string()),
            ..Default::default()
        };

        let entities = self.ontology.get_entities(filter).await?;
        
        let roes = entities.into_iter()
            .filter(|e| {
                e.properties.as_ref()
                    .and_then(|p| p.get("status"))
                    .and_then(|s| s.as_str())
                    .map(|s| s == "ACTIVE")
                    .unwrap_or(false)
            })
            .map(|e| self.map_entity_to_roe(&e))
            .collect();

        Ok(roes)
    }

    pub async fn check_compliance(&self, req: &RoeComplianceRequest) -> Result<RoeComplianceResult> {
        // 1. Fetch Target Details
        let target = self.ontology.get_entity(&req.target_id).await?;
        
        // 2. Fetch Active ROEs
        let active_roes = self.get_active_roes().await?;

        // 3. Simple Compliance Logic (Placeholder for sophisticated engine)
        let mut compliant = true;
        let mut violated_rules = Vec::new();
        let mut caveats = Vec::new();

        // Example Rule: No Kinetic Strikes on Civil/Unknown targets without confirmation
        let target_type = target.properties.as_ref()
            .and_then(|p| p.get("target_type")) // assuming 'target_type' or similar
            .and_then(|s| s.as_str())
            .unwrap_or("UNKNOWN");
        
        // Check generic rules based on ROE entities
        for roe in active_roes {
            caveats.push(format!("{}: {}", roe.name, roe.description));
            
            // Hardcoded Logic Simulator based on ROE content keywords
            if roe.description.contains("NO STRIKE") && req.proposed_action == "KINETIC_STRIKE" {
                if target_type == "CIVILIAN" || target_type == "RELIGIOUS" {
                    compliant = false;
                    violated_rules.push(format!("Violates ROE {}: {}", roe.name, roe.description));
                }
            }
        }

        // Safety Net
        if target_type == "UNKNOWN" && req.proposed_action == "KINETIC_STRIKE" {
           caveats.push("CAUTION: Target type is UNKNOWN. Positive Identification required.".to_string());
        }

        Ok(RoeComplianceResult {
            compliant,
            violated_rules,
            caveats
        })
    }

    fn map_entity_to_roe(&self, e: &Entity) -> Roe {
        let empty = json!({});
        let props = e.properties.as_ref().unwrap_or(&empty);

        Roe {
            id: e.id.clone(),
            name: e.name.clone(),
            description: props["description"].as_str().unwrap_or("").to_string(),
            status: props["status"].as_str().unwrap_or("DRAFT").to_string(),
            roe_type: props["roe_type"].as_str().unwrap_or("STANDING").to_string(),
            created_at: props["created_at"].as_str().unwrap_or("").to_string(),
            created_by: props["created_by"].as_str().unwrap_or("unknown").to_string(),
        }
    }
}
