use std::sync::Arc;
use core_ontology::{OntologyService, models::{Entity, CreateEntityRequest, UpdateEntityRequest, EntityFilter}};
use crate::features::targeting::domain::*;
use anyhow::Result;
use chrono::Utc;
use serde_json::json;

pub struct BdaService {
    ontology: Arc<OntologyService>,
}

impl BdaService {
    pub fn new(ontology: Arc<OntologyService>) -> Self {
        Self { ontology }
    }

    /// Create a new BDA Assessment as an Entity and link it to the Target
    pub async fn create_assessment(
        &self,
        req: &CreateBdaAssessmentRequest,
    ) -> Result<String> {
        // 1. Calculate effectiveness
        let effectiveness = self.calculate_effectiveness(&req.bda_status);
        let re_attack = effectiveness < 0.7; // Re-attack if < 70% effectiveness

        // 2. Create the Assessment Entity
        let props = json!({
            "assessment_time": Utc::now().to_rfc3339(),
            "status": req.bda_status, // DESTROYED, DAMAGED, etc.
            "effectiveness_pct": effectiveness,
            "re_attack_recommended": re_attack,
            "analyst_id": req.analyst_id,
            "notes": req.notes,
            "strike_id": req.strike_id
        });

        // Use core-ontology types directly
        let entity_req = CreateEntityRequest {
            id: None, // Let DB generate ID or use Uuid::new_v4().to_string()
            operation_id: None,
            campaign_id: None,
            name: format!("BDA-{}", Utc::now().timestamp()),
            type_: "ASSESSMENT".to_string(),
            description: None,
            status: None,
            location_lat: None,
            location_lng: None,
            properties: Some(props),
            source: Some("BdaService".to_string()),
            classification: Some("SECRET".to_string()),
            confidence: Some(0.9),
        };

        // create_entity returns Result<Entity>
        let assessment_entity = self.ontology.create_entity(entity_req).await?;
        let assessment_id = assessment_entity.id;

        // 3. Link Assessment -> Target ("assesses")
        // create_relationship takes CreateRelationshipRequest
        let rel_req = core_ontology::models::CreateRelationshipRequest {
            source_id: assessment_id.clone(),
            target_id: req.target_id.clone(),
            relation_type: "assesses".to_string(),
            properties: Some(json!({
                "confidence": 0.9,
                "source": "BdaService"
            })),
        };

        self.ontology.create_relationship(rel_req).await?;

        // 4. Update Target status if DESTROYED
        if req.bda_status == "DESTROYED" {
            let target_props = json!({
                "target_status": "Neutralized", // or Destroyed
                "last_assessment_date": Utc::now().to_rfc3339()
            });
            
            self.ontology.update_entity(
                &req.target_id, 
                UpdateEntityRequest { properties: Some(target_props), ..Default::default() }
            ).await?;
        }

        Ok(assessment_id)
    }

    /// Get all assessments for a specific target
    pub async fn get_assessments_for_target(&self, target_id: &str) -> Result<Vec<BdaAssessment>> {
        // Query neighbors: Target <-(assesses)- Assessment
        // Direction isn't a parameter in get_neighbors signature found in service.rs
        // It just gets all neighbors. We filter manually.
        let neighbors = self.ontology.get_neighbors(target_id).await?;

        let mut assessments = Vec::new();
        for neighbor in neighbors {
             // Neighbor is the Entity itself
             if neighbor.type_ == "ASSESSMENT" {
                 assessments.push(self.map_entity_to_assessment(&neighbor, target_id));
             }
        }

        // Sort by time descending
        assessments.sort_by(|a, b| b.assessment_time.cmp(&a.assessment_time));

        Ok(assessments)
    }

    fn calculate_effectiveness(&self, status: &str) -> f64 {
        match status.to_uppercase().as_str() {
            "DESTROYED" => 1.0,
            "NEUTRALIZED" => 0.9,
            "DAMAGED" => 0.7, // Fixed to simply DAMAGED to match enum if needed, or keeping generic string matching
            "DAMAGED_SEVERE" => 0.7,
            "DAMAGED_MODERATE" => 0.5,
            "DAMAGED_LIGHT" => 0.3,
            "INTACT" => 0.0,
            _ => 0.0,
        }
    }

    fn map_entity_to_assessment(&self, e: &Entity, target_id: &str) -> BdaAssessment {
        let empty = json!({});
        let props = e.properties.as_ref().unwrap_or(&empty);

        BdaAssessment {
            id: e.id.clone(),
            target_id: target_id.to_string(),
            strike_id: props["strike_id"].as_str().unwrap_or("").to_string(),
            bda_status: props["status"].as_str().unwrap_or("UNKNOWN").to_string(),
            effectiveness_pct: props["effectiveness_pct"].as_f64().unwrap_or(0.0),
            re_attack_recommended: props["re_attack_recommended"].as_bool().unwrap_or(false),
            assessment_time: props["assessment_time"].as_str().unwrap_or("").to_string(),
            analyst_id: props["analyst_id"].as_str().unwrap_or("").to_string(),
            notes: props.get("notes").and_then(|v| v.as_str()).map(|s| s.to_string()),
        }
    }
}
