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
        if let Some(true) = filter.urgent_only {
            // Using SQLite JSON extraction to check priority
            query.push_str(" AND (json_extract(properties, '$.priority') = 'critical' OR json_extract(properties, '$.priority') = 'high')");
        }
        if filter.created_after.is_some() {
            query.push_str(" AND created_at > ?");
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
        if let Some(date) = filter.created_after {
            sql_query = sql_query.bind(date);
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

    pub async fn acknowledge_entity(&self, id: &str, req: AcknowledgeEntityRequest) -> Result<Entity> {
        let entity = self.get_entity_only(id).await?;
        
        let mut properties = match entity.properties {
            Some(p) => p,
            None => serde_json::json!({}),
        };

        if let serde_json::Value::Object(ref mut map) = properties {
            map.insert("acknowledged".to_string(), serde_json::Value::Bool(true));
            map.insert("acknowledged_at".to_string(), serde_json::Value::String(Utc::now().to_rfc3339()));
            map.insert("acknowledged_by".to_string(), serde_json::Value::String(req.acknowledged_by));
        }

        let update_req = UpdateEntityRequest {
            properties: Some(properties),
            name: None,
            description: None,
            status: None,
            location_lat: None,
            location_lng: None,
            source: None,
            classification: None,
            confidence: None,
        };

        self.update_entity(id, update_req).await
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
        // Phase 5: Validate relationship types before creation
        let source = self.get_entity_only(&req.source_id).await?;
        let target = self.get_entity_only(&req.target_id).await?;
        
        // Check if relationship is valid according to schema
        if let Some(error_msg) = self.get_relationship_validation_error(
            &source.type_,
            &target.type_,
            &req.relation_type,
        ).await? {
            return Err(anyhow::anyhow!("Relationship validation failed: {}", error_msg));
        }
        
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
        let mut entity_types = vec![
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
            EntityTypeDefinition { 
                name: "IntelFeed".to_string(), 
                description: "Multi-INT intelligence data stream".to_string(),
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
            RelationshipTypeDefinition {
                name: "assigned_to".to_string(),
                description: "Menu item assigned to a role".to_string(),
                valid_sources: vec!["MenuItem".to_string()],
                valid_targets: vec!["Role".to_string()],
            },
            RelationshipTypeDefinition {
                name: "performs_action".to_string(),
                description: "Menu item performs a specific action".to_string(),
                valid_sources: vec!["MenuItem".to_string()],
                valid_targets: vec!["Action".to_string()],
            },
            RelationshipTypeDefinition {
                name: "operates_on".to_string(),
                description: "Action operates on a specific dataset".to_string(),
                valid_sources: vec!["Action".to_string()],
                valid_targets: vec!["Dataset".to_string()],
            },
            RelationshipTypeDefinition {
                name: "available_for".to_string(),
                description: "Action is available for a specific role".to_string(),
                valid_sources: vec!["Action".to_string()],
                valid_targets: vec!["Role".to_string()],
            },
            RelationshipTypeDefinition {
                name: "leads_to".to_string(),
                description: "Agenda point leads to a decision".to_string(),
                valid_sources: vec!["AgendaPoint".to_string()],
                valid_targets: vec!["Decision".to_string()],
            },
            RelationshipTypeDefinition {
                name: "based_on".to_string(),
                description: "Decision is based on an assumption".to_string(),
                valid_sources: vec!["Decision".to_string()],
                valid_targets: vec!["Assumption".to_string()],
            },
            RelationshipTypeDefinition {
                name: "has_part".to_string(),
                description: "Hierarchical composition".to_string(),
                valid_sources: vec!["TOR".to_string()],
                valid_targets: vec!["AgendaPoint".to_string()],
            },
            RelationshipTypeDefinition {
                name: "provides_intel_for".to_string(),
                description: "Intelligence correlation with operational entities".to_string(),
                valid_sources: vec!["IntelFeed".to_string()],
                valid_targets: vec!["Target".to_string(), "BDA_REPORT".to_string()],
            },
        ];

        // Add MenuItem and TOR to entity_types
        entity_types.push(EntityTypeDefinition {
            name: "MenuItem".to_string(),
            description: "Application navigation item".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "TOR".to_string(),
            description: "Terms of Reference document".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Action".to_string(),
            description: "Operational or administrative action".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Dataset".to_string(),
            description: "Operational dataset or database".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "RFI".to_string(),
            description: "Request for Information".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Task".to_string(),
            description: "Assigned operational task".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Meeting".to_string(),
            description: "Scheduled meeting or event".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Decision".to_string(),
            description: "Command decision".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Person".to_string(),
            description: "Individual personnel".to_string(),
            properties_schema: None,
        });

        entity_types.push(EntityTypeDefinition {
            name: "AgendaPoint".to_string(),
            description: "Discussion item within a TOR or Meeting".to_string(),
            properties_schema: None,
        });
        entity_types.push(EntityTypeDefinition {
            name: "Assumption".to_string(),
            description: "Planning assumption with uncertainty".to_string(),
            properties_schema: None,
        });
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

    // ========================================================================
    // PHASE 4: GRAPH TRAVERSAL & IMPACT ANALYSIS
    // ========================================================================

    /// Traverse the graph using BFS or DFS
    pub async fn traverse_graph(&self, req: TraverseRequest) -> Result<TraverseResponse> {
        let max_hops = req.max_hops.min(10); // Cap at 10 hops for performance
        
        match req.algorithm {
            TraversalAlgorithm::Bfs => self.bfs_traverse(&req.start_entity_id, max_hops, &req).await,
            TraversalAlgorithm::Dfs => self.dfs_traverse(&req.start_entity_id, max_hops, &req).await,
        }
    }

    /// BFS traversal implementation
    async fn bfs_traverse(
        &self,
        start_id: &str,
        max_hops: usize,
        req: &TraverseRequest,
    ) -> Result<TraverseResponse> {
        use std::collections::{VecDeque, HashSet};

        let mut visited = HashSet::new();
        let mut queue = VecDeque::new();
        let mut all_paths: Vec<TraversalPath> = Vec::new();

        // Start with the initial entity
        let start_entity = self.get_entity_only(start_id).await?;
        visited.insert(start_id.to_string());

        queue.push_back((start_id.to_string(), 0, vec![start_entity.clone()], Vec::new()));

        while let Some((entity_id, depth, path_entities, path_rels)) = queue.pop_front() {
            if depth >= max_hops {
                // Save this path
                if path_entities.len() > 1 {
                    all_paths.push(TraversalPath {
                        entities: path_entities,
                        relationships: path_rels,
                        depth,
                    });
                }
                continue;
            }

            // Get relationships based on direction
            let rels = self.get_entity_relationships_for_traversal(&entity_id, req).await?;

            for rel in rels {
                let next_id = self.get_next_entity_id(&rel, &entity_id, req)?;

                if !visited.contains(&next_id) {
                    visited.insert(next_id.clone());

                    // Fetch next entity
                    if let Ok(next_entity) = self.get_entity_only(&next_id).await {
                        let mut new_path_entities = path_entities.clone();
                        new_path_entities.push(next_entity);

                        let mut new_path_rels = path_rels.clone();
                        new_path_rels.push(rel.clone());

                        queue.push_back((next_id, depth + 1, new_path_entities, new_path_rels));
                    }
                }
            }
        }

        let total_rels: usize = all_paths.iter().map(|p| p.relationships.len()).sum();

        Ok(TraverseResponse {
            start_entity_id: start_id.to_string(),
            total_entities_visited: visited.len(),
            total_relationships_traversed: total_rels,
            paths: all_paths,
        })
    }

    /// DFS traversal implementation
    async fn dfs_traverse(
        &self,
        start_id: &str,
        max_hops: usize,
        req: &TraverseRequest,
    ) -> Result<TraverseResponse> {
        use std::collections::HashSet;

        let mut visited = HashSet::new();
        let mut all_paths: Vec<TraversalPath> = Vec::new();

        let start_entity = self.get_entity_only(start_id).await?;
        visited.insert(start_id.to_string());

        self.dfs_visit(
            &start_entity,
            0,
            max_hops,
            req,
            &mut visited,
            &mut all_paths,
            vec![start_entity.clone()],
            Vec::new(),
        ).await?;

        let total_rels: usize = all_paths.iter().map(|p| p.relationships.len()).sum();

        Ok(TraverseResponse {
            start_entity_id: start_id.to_string(),
            total_entities_visited: visited.len(),
            total_relationships_traversed: total_rels,
            paths: all_paths,
        })
    }

    /// Recursive DFS visit helper
    #[async_recursion::async_recursion]
    async fn dfs_visit(
        &self,
        current_entity: &Entity,
        depth: usize,
        max_hops: usize,
        req: &TraverseRequest,
        visited: &mut HashSet<String>,
        all_paths: &mut Vec<TraversalPath>,
        path_entities: Vec<Entity>,
        path_rels: Vec<EntityRelationship>,
    ) -> Result<()> {
        if depth >= max_hops {
            if path_entities.len() > 1 {
                all_paths.push(TraversalPath {
                    entities: path_entities,
                    relationships: path_rels,
                    depth,
                });
            }
            return Ok(());
        }

        let rels = self.get_entity_relationships_for_traversal(&current_entity.id, req).await?;

        for rel in rels {
            let next_id = self.get_next_entity_id(&rel, &current_entity.id, req)?;

            if !visited.contains(&next_id) {
                visited.insert(next_id.clone());

                if let Ok(next_entity) = self.get_entity_only(&next_id).await {
                    let mut new_path_entities = path_entities.clone();
                    new_path_entities.push(next_entity.clone());

                    let mut new_path_rels = path_rels.clone();
                    new_path_rels.push(rel.clone());

                    self.dfs_visit(
                        &next_entity,
                        depth + 1,
                        max_hops,
                        req,
                        visited,
                        all_paths,
                        new_path_entities,
                        new_path_rels,
                    ).await?;
                }
            }
        }

        Ok(())
    }

    /// Get relationships for traversal based on direction
    async fn get_entity_relationships_for_traversal(
        &self,
        entity_id: &str,
        req: &TraverseRequest,
    ) -> Result<Vec<EntityRelationship>> {
        let mut all_rels = Vec::new();

        match req.direction {
            TraversalDirection::Outgoing => {
                let outgoing = self.get_relationships(Some(entity_id.to_string()), None, None).await?;
                all_rels.extend(outgoing);
            }
            TraversalDirection::Incoming => {
                let incoming = self.get_relationships(None, Some(entity_id.to_string()), None).await?;
                all_rels.extend(incoming);
            }
            TraversalDirection::Both => {
                let outgoing = self.get_relationships(Some(entity_id.to_string()), None, None).await?;
                let incoming = self.get_relationships(None, Some(entity_id.to_string()), None).await?;
                all_rels.extend(outgoing);
                all_rels.extend(incoming);
            }
        }

        // Filter by relationship types if specified
        if let Some(ref types) = req.relationship_types {
            all_rels.retain(|r| types.contains(&r.relation_type));
        }

        Ok(all_rels)
    }

    /// Get next entity ID based on direction
    fn get_next_entity_id(
        &self,
        rel: &EntityRelationship,
        current_id: &str,
        req: &TraverseRequest,
    ) -> Result<String> {
        match req.direction {
            TraversalDirection::Outgoing => Ok(rel.target_id.clone()),
            TraversalDirection::Incoming => Ok(rel.source_id.clone()),
            TraversalDirection::Both => {
                if rel.source_id == current_id {
                    Ok(rel.target_id.clone())
                } else {
                    Ok(rel.source_id.clone())
                }
            }
        }
    }

    /// Analyze impact of changes to an entity
    pub async fn analyze_impact(&self, req: ImpactAnalysisRequest) -> Result<ImpactAnalysisResponse> {
        let upstream_hops = req.upstream_hops.min(5);
        let downstream_hops = req.downstream_hops.min(5);

        // Find upstream dependencies (entities this depends on)
        let upstream = self.find_dependencies(
            &req.entity_id,
            upstream_hops,
            TraversalDirection::Incoming,
            &req.relationship_types,
        ).await?;

        // Find downstream dependencies (entities that depend on this)
        let downstream = self.find_dependencies(
            &req.entity_id,
            downstream_hops,
            TraversalDirection::Outgoing,
            &req.relationship_types,
        ).await?;

        let total = upstream.len() + downstream.len();

        Ok(ImpactAnalysisResponse {
            entity_id: req.entity_id,
            upstream_dependencies: upstream,
            downstream_dependencies: downstream,
            total_affected_entities: total,
        })
    }

    /// Find dependencies in a given direction
    async fn find_dependencies(
        &self,
        entity_id: &str,
        max_hops: usize,
        direction: TraversalDirection,
        relationship_types: &Option<Vec<String>>,
    ) -> Result<Vec<EntityImpact>> {
        use std::collections::{VecDeque, HashSet};

        let mut visited = HashSet::new();
        let mut queue = VecDeque::new();
        let mut impacts = Vec::new();

        visited.insert(entity_id.to_string());
        queue.push_back((entity_id.to_string(), 0, Vec::new()));

        while let Some((current_id, depth, path)) = queue.pop_front() {
            if depth >= max_hops {
                continue;
            }

            let rels = match direction {
                TraversalDirection::Outgoing => {
                    self.get_relationships(Some(current_id.clone()), None, None).await?
                }
                TraversalDirection::Incoming => {
                    self.get_relationships(None, Some(current_id.clone()), None).await?
                }
                _ => Vec::new(),
            };

            // Filter by relationship types if specified
            let filtered_rels: Vec<_> = if let Some(ref types) = relationship_types {
                rels.into_iter().filter(|r| types.contains(&r.relation_type)).collect()
            } else {
                rels
            };

            for rel in filtered_rels {
                let next_id = match direction {
                    TraversalDirection::Outgoing => &rel.target_id,
                    TraversalDirection::Incoming => &rel.source_id,
                    _ => continue,
                };

                if !visited.contains(next_id) {
                    visited.insert(next_id.clone());

                    if let Ok(entity) = self.get_entity_only(next_id).await {
                        let mut new_path = path.clone();
                        new_path.push(rel.relation_type.clone());

                        impacts.push(EntityImpact {
                            entity,
                            hop_distance: depth + 1,
                            relationship_path: new_path.clone(),
                        });

                        queue.push_back((next_id.clone(), depth + 1, new_path));
                    }
                }
            }
        }

        Ok(impacts)
    }

    // ========================================================================
    // PHASE 5: RELATIONSHIP TYPE VALIDATION
    // ========================================================================

    /// Validate if a relationship between two entity types is allowed by schema
    pub async fn is_valid_relationship(
        &self,
        source_type: &str,
        target_type: &str,
        relation_type: &str,
    ) -> Result<bool> {
        let schema = self.get_schema().await?;
        
        // Find the relationship type definition
        let rel_def = schema
            .relationship_types
            .iter()
            .find(|r| r.name == relation_type);
        
        match rel_def {
            Some(def) => {
                // Empty list means any type is allowed
                let valid_source = def.valid_sources.is_empty() 
                    || def.valid_sources.contains(&source_type.to_string());
                let valid_target = def.valid_targets.is_empty()
                    || def.valid_targets.contains(&target_type.to_string());
                
                Ok(valid_source && valid_target)
            }
            None => {
                // Unknown relationship type - allow for extensibility
                Ok(true)
            }
        }
    }
    
    /// Get detailed validation error message for invalid relationships
    pub async fn get_relationship_validation_error(
        &self,
        source_type: &str,
        target_type: &str,
        relation_type: &str,
    ) -> Result<Option<String>> {
        let schema = self.get_schema().await?;
        
        let rel_def = schema
            .relationship_types
            .iter()
            .find(|r| r.name == relation_type);
        
        match rel_def {
            Some(def) => {
                let valid_source = def.valid_sources.is_empty()
                    || def.valid_sources.contains(&source_type.to_string());
                let valid_target = def.valid_targets.is_empty()
                    || def.valid_targets.contains(&target_type.to_string());
                
                if !valid_source {
                    return Ok(Some(format!(
                        "Invalid source type '{}' for relationship '{}'. Valid sources: {:?}",
                        source_type, relation_type, def.valid_sources
                    )));
                }
                
                if !valid_target {
                    return Ok(Some(format!(
                        "Invalid target type '{}' for relationship '{}'. Valid targets: {:?}",
                        target_type, relation_type, def.valid_targets
                    )));
                }
                
                Ok(None) // Valid
            }
            None => {
                // Unknown relationship type - allow for extensibility
                Ok(None)
            }
        }
    }
}
