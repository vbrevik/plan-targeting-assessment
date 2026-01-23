use sqlx::SqlitePool;
use anyhow::Result;
use uuid::Uuid;
use chrono::Utc;
use super::models::*;

#[derive(Clone)]
pub struct OntologyService {
    pool: SqlitePool,
}

impl OntologyService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_entities(&self, filter: EntityFilter) -> Result<Vec<Entity>> {
        let mut query = String::from("SELECT * FROM entities WHERE 1=1");
        
        if filter.type_.is_some() {
            query.push_str(" AND type = ?");
        }
        if filter.operation_id.is_some() {
            query.push_str(" AND operation_id = ?");
        }
        if filter.campaign_id.is_some() {
            query.push_str(" AND campaign_id = ?");
        }

        let mut sql_query = sqlx::query_as::<_, Entity>(&query);

        if let Some(t) = filter.type_ {
            sql_query = sql_query.bind(t);
        }
        if let Some(op) = filter.operation_id {
            sql_query = sql_query.bind(op);
        }
        if let Some(camp) = filter.campaign_id {
            sql_query = sql_query.bind(camp);
        }

        let entities = sql_query.fetch_all(&self.pool).await?;
        Ok(entities)
    }

    pub async fn create_entity(&self, req: CreateEntityRequest) -> Result<Entity> {
        let id = req.id.unwrap_or_else(|| Uuid::new_v4().to_string());
        let now = Utc::now();

        sqlx::query(
            r#"
            INSERT INTO entities (
                id, operation_id, campaign_id, name, type, description, 
                status, location_lat, location_lng, properties, source, 
                classification, confidence, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(&req.operation_id)
        .bind(&req.campaign_id)
        .bind(&req.name)
        .bind(&req.type_)
        .bind(&req.description)
        .bind(&req.status)
        .bind(req.location_lat)
        .bind(req.location_lng)
        .bind(&req.properties)
        .bind(&req.source)
        .bind(&req.classification)
        .bind(req.confidence)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        self.get_entity_only(&id).await
    }

    pub async fn get_entity_only(&self, id: &str) -> Result<Entity> {
        let entity = sqlx::query_as::<_, Entity>(
            r#"SELECT id, operation_id, campaign_id, name, type, description, status, location_lat, location_lng, valid_from, valid_until, properties, source, classification, confidence, created_at, updated_at FROM entities WHERE id = ?"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await?;
        Ok(entity)
    }

    pub async fn get_entity_with_relationships(&self, id: &str) -> Result<EntityWithRelationships> {
        let entity = self.get_entity_only(id).await?;

        let outgoing = sqlx::query_as::<_, EntityRelationship>(
            "SELECT source_id, target_id, relation_type, properties, created_at FROM entity_relationships WHERE source_id = ?"
        )
        .bind(id)
        .fetch_all(&self.pool)
        .await?;

        let incoming = sqlx::query_as::<_, EntityRelationship>(
            "SELECT source_id, target_id, relation_type, properties, created_at FROM entity_relationships WHERE target_id = ?"
        )
        .bind(id)
        .fetch_all(&self.pool)
        .await?;

        Ok(EntityWithRelationships {
            entity,
            outgoing_relationships: outgoing,
            incoming_relationships: incoming,
        })
    }

    pub async fn update_entity(&self, id: &str, req: UpdateEntityRequest) -> Result<Entity> {
        let now = Utc::now();

        sqlx::query(
            r#"
            UPDATE entities SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                status = COALESCE(?, status),
                location_lat = COALESCE(?, location_lat),
                location_lng = COALESCE(?, location_lng),
                properties = COALESCE(?, properties),
                source = COALESCE(?, source),
                classification = COALESCE(?, classification),
                confidence = COALESCE(?, confidence),
                updated_at = ?
            WHERE id = ?
            "#,
        )
        .bind(&req.name)
        .bind(&req.description)
        .bind(&req.status)
        .bind(req.location_lat)
        .bind(req.location_lng)
        .bind(&req.properties)
        .bind(&req.source)
        .bind(&req.classification)
        .bind(req.confidence)
        .bind(now)
        .bind(id)
        .execute(&self.pool)
        .await?;

        self.get_entity_only(id).await
    }

    pub async fn delete_entity(&self, id: &str) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Delete relationships first
        sqlx::query("DELETE FROM entity_relationships WHERE source_id = ? OR target_id = ?")
            .bind(id)
            .bind(id)
            .execute(&mut *tx)
            .await?;

        // Delete entity
        sqlx::query("DELETE FROM entities WHERE id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn create_relationship(&self, req: CreateRelationshipRequest) -> Result<EntityRelationship> {
        let now = Utc::now();

        sqlx::query(
            r#"
            INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
            VALUES (?, ?, ?, ?, ?)
            "#,
        )
        .bind(&req.source_id)
        .bind(&req.target_id)
        .bind(&req.relation_type)
        .bind(&req.properties)
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(EntityRelationship {
            source_id: req.source_id,
            target_id: req.target_id,
            relation_type: req.relation_type,
            properties: req.properties,
            created_at: now,
        })
    }

    pub async fn get_relationships(&self, source_id: Option<String>, target_id: Option<String>, relation_type: Option<String>) -> Result<Vec<EntityRelationship>> {
        let mut query = String::from("SELECT * FROM entity_relationships WHERE 1=1");
        
        if source_id.is_some() {
            query.push_str(" AND source_id = ?");
        }
        if target_id.is_some() {
            query.push_str(" AND target_id = ?");
        }
        if relation_type.is_some() {
            query.push_str(" AND relation_type = ?");
        }

        let mut sql_query = sqlx::query_as::<_, EntityRelationship>(&query);

        if let Some(s) = source_id {
            sql_query = sql_query.bind(s);
        }
        if let Some(t) = target_id {
            sql_query = sql_query.bind(t);
        }
        if let Some(rt) = relation_type {
            sql_query = sql_query.bind(rt);
        }

        let relationships = sql_query.fetch_all(&self.pool).await?;
        Ok(relationships)
    }
    pub async fn get_neighbors(&self, entity_id: &str) -> Result<Vec<Entity>> {
        let entities = sqlx::query_as::<_, Entity>(
            r#"
            SELECT e.id, e.operation_id, e.campaign_id, e.name, e.type, e.description, 
                   e.status, e.location_lat, e.location_lng, e.valid_from, e.valid_until, 
                   e.properties, e.source, e.classification, e.confidence, e.created_at, e.updated_at
            FROM entities e
            JOIN entity_relationships r ON e.id = r.target_id
            WHERE r.source_id = ?
            "#,
        )
        .bind(entity_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(entities)
    }

    pub async fn get_entity(&self, id: &str) -> Result<Entity> {
        self.get_entity_only(id).await
    }

    pub async fn get_schema(&self) -> Result<OntologySchema> {
        // Standard NATO MDO Ontology
        // In the future, this could be fetched from a database table 'ontology_definitions'
        
        let domains = vec![
            "LAND".to_string(), "AIR".to_string(), "MARITIME".to_string(),
            "CYBER".to_string(), "SPACE".to_string(),
            "INFO".to_string(), "COGNITIVE".to_string(), "HUMAN".to_string(), "EMS".to_string()
        ];
        
        let levels_of_war = vec![
            "Strategic".to_string(), "Operational".to_string(), "Tactical".to_string(), "Sub-Tactical".to_string()
        ];
        
        let affiliations = vec![
            "Blue".to_string(), "Red".to_string(), "Green".to_string(), "Grey".to_string(), "White".to_string()
        ];
        
        // Entity Types
        let entity_types = vec![
            EntityTypeDefinition { 
                name: "Unit".to_string(), 
                description: "Military organization or force element".to_string(),
                properties_schema: None 
            },
            EntityTypeDefinition { 
                name: "Target".to_string(), 
                description: "Object of military action".to_string(),
                properties_schema: None 
            },
            EntityTypeDefinition { 
                name: "Facility".to_string(), 
                description: "Infrastructure or installation".to_string(),
                properties_schema: None 
            },
            EntityTypeDefinition { 
                name: "Event".to_string(), 
                description: "Occurrence or incident".to_string(),
                properties_schema: None 
            },
            EntityTypeDefinition { 
                name: "Track".to_string(), 
                description: "Sensor contact or moving object".to_string(),
                properties_schema: None 
            },
            EntityTypeDefinition { 
                name: "Sensor".to_string(), 
                description: "Collection asset or observer".to_string(),
                properties_schema: None 
            },
        ];
        
        // Relationship Types
        let relationship_types = vec![
            RelationshipTypeDefinition {
                name: "commanded_by".to_string(),
                description: "Command and Control relationship".to_string(),
                valid_sources: vec!["Unit".to_string()],
                valid_targets: vec!["Unit".to_string()],
            },
            RelationshipTypeDefinition {
                name: "located_at".to_string(),
                description: "Geographic position or facility association".to_string(),
                valid_sources: vec!["Unit".to_string(), "Target".to_string(), "Sensor".to_string()],
                valid_targets: vec!["Facility".to_string()],
            },
            RelationshipTypeDefinition {
                name: "monitoring".to_string(),
                description: "Surveillance or tracking assessment".to_string(),
                valid_sources: vec!["Sensor".to_string(), "Unit".to_string()],
                valid_targets: vec!["Target".to_string(), "Event".to_string(), "Track".to_string()],
            },
            RelationshipTypeDefinition {
                name: "targeting".to_string(),
                description: "Hostile intent or engagement".to_string(),
                valid_sources: vec!["Unit".to_string()],
                valid_targets: vec!["Target".to_string()],
            },
        ];

        Ok(OntologySchema {
            version: "1.0.0".to_string(),
            last_updated: Utc::now(),
            domains,
            entity_types,
            relationship_types,
            levels_of_war,
            affiliations,
            target_statuses: vec![
                "Nominated".to_string(), "Validated".to_string(), "Approved".to_string(), 
                "Active".to_string(), "Engaged".to_string(), "Destroyed".to_string()
            ],
            platform_types: vec![
                "FIGHTER".to_string(), "BOMBER".to_string(), "ARTILLERY".to_string(), 
                "MISSILE".to_string(), "CYBER".to_string(), "EW".to_string(), 
                "PSYOP".to_string(), "UAV".to_string(), "SATELLITE".to_string()
            ],
            confidence_levels: vec![
                "HIGH".to_string(), "MEDIUM".to_string(), "LOW".to_string()
            ],
            bda_statuses: vec![
                "DESTROYED".to_string(), "NEUTRALIZED".to_string(), 
                "DAMAGED".to_string(), "INTACT".to_string(), "PENDING".to_string()
            ],
        })
    }
}
