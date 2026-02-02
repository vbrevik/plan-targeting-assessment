use std::sync::Arc;
use core_ontology::{OntologyService, models::{Entity, UpdateEntityRequest, EntityFilter}};
use crate::features::targeting::domain::*;
use crate::features::targeting::services::DtlScoring;
use anyhow::Result;
use chrono::Utc;

pub struct DtlService {
    ontology: Arc<OntologyService>,
}

impl DtlService {
    pub fn new(ontology: Arc<OntologyService>) -> Self {
        Self { ontology }
    }

    pub async fn create_entry(
        &self,
        req: &CreateDtlEntryRequest,
    ) -> Result<String> {
        // In Ontology approach, we don't create a separate "entry". 
        // We just update the Target entity with DTL scores.
        
        // Calculate combined score
        let combined_score = DtlScoring::calculate_combined_score(
            req.priority_score, 
            req.feasibility_score
        );

        // Fetch existing entity to preserve other props
        let entity = self.ontology.get_entity(&req.target_id).await?;
        let mut props = entity.properties.unwrap_or(serde_json::json!({}));
        
        props["priority_score"] = serde_json::json!(req.priority_score);
        props["feasibility_score"] = serde_json::json!(req.feasibility_score);
        props["combined_score"] = serde_json::json!(combined_score);
        props["is_tst"] = serde_json::json!(req.is_tst);
        
        if let Some(deadline) = &req.tst_deadline {
            props["tst_deadline"] = serde_json::json!(deadline);
        }
        
        // Mark as on DTL if not already?
        // Might want a specific property "in_dtl": true
        props["in_dtl"] = serde_json::json!(true);

        let update_req = UpdateEntityRequest {
            properties: Some(props),
            ..Default::default()
        };

        self.ontology.update_entity(&req.target_id, update_req).await?;
        
        Ok(req.target_id.clone()) // Return target ID as the "entry ID"
    }

    pub async fn list_entries(&self, limit: Option<i64>) -> Result<Vec<DtlEntry>> {
        // Query for entities that have "priority_score" property
        // Filter: Type="Target" AND properties.in_dtl = true
        // Since OntologyService `get_entities` only supports simple filters, 
        // we might need to fetch all Targets and filter in memory for now.
        
        let mut filter = EntityFilter::default();
        filter.type_ = Some("TARGET".to_string());
        
        let entities = self.ontology.get_entities(filter).await?;
        
        let mut entries: Vec<DtlEntry> = entities.into_iter()
            .filter(|e| {
                e.properties.as_ref()
                    .and_then(|p| p.get("in_dtl"))
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false)
            })
            .map(|e| self.map_entity_to_dtl_entry(&e))
            .collect();
            
        // Sort by combined_score DESC
        entries.sort_by(|a, b| {
            b.combined_score.partial_cmp(&a.combined_score).unwrap_or(std::cmp::Ordering::Equal)
        });
        
        if let Some(l) = limit {
            entries.truncate(l as usize);
        }
        
        Ok(entries)
    }

    pub async fn update_priority(
        &self,
        target_id: &str, // This was "entry_id" in SQL, but we use target_id now
        priority_score: f64,
        feasibility_score: f64,
    ) -> Result<()> {
        let combined_score = DtlScoring::calculate_combined_score(priority_score, feasibility_score);
        
        let entity = self.ontology.get_entity(target_id).await?;
        let mut props = entity.properties.unwrap_or(serde_json::json!({}));
        
        props["priority_score"] = serde_json::json!(priority_score);
        props["feasibility_score"] = serde_json::json!(feasibility_score);
        props["combined_score"] = serde_json::json!(combined_score);
        
        let update_req = UpdateEntityRequest {
            properties: Some(props),
            ..Default::default()
        };
        
        self.ontology.update_entity(target_id, update_req).await?;
        Ok(())
    }
    
    pub async fn get_active_tsts(&self) -> Result<Vec<DtlEntry>> {
         let mut filter = EntityFilter::default();
        filter.type_ = Some("TARGET".to_string());
        filter.urgent_only = Some(true); // This filters by priority=critical/high in SQL
        
        // We need to filter by is_tst=true
        let entities = self.ontology.get_entities(filter).await?;
        
        let entries: Vec<DtlEntry> = entities.into_iter()
            .filter(|e| {
                e.properties.as_ref()
                    .and_then(|p| p.get("is_tst"))
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false)
            })
            .map(|e| self.map_entity_to_dtl_entry(&e))
            .collect();
            
        Ok(entries)
    }

    fn map_entity_to_dtl_entry(&self, e: &Entity) -> DtlEntry {
        let empty = serde_json::json!({});
        let props = e.properties.as_ref().unwrap_or(&empty);
        
        DtlEntry {
            id: e.id.clone(), // Using Target ID as DTL Entry ID
            target_id: e.id.clone(),
            target_name: e.name.clone(),
            priority_score: props["priority_score"].as_f64().unwrap_or(0.0),
            feasibility_score: props["feasibility_score"].as_f64().unwrap_or(0.0),
            combined_score: props["combined_score"].as_f64(),
            aging_hours: (Utc::now() - e.created_at).num_hours() as i32,
            is_tst: props["is_tst"].as_bool().unwrap_or(false),
            tst_deadline: props.get("tst_deadline").and_then(|v| v.as_str()).map(|s| s.to_string()),
            approval_chain: None,
            current_approver: None,
            approval_level: None,
            created_at: e.created_at.to_rfc3339(),
            updated_at: e.updated_at.to_rfc3339(),
        }
    }
}
