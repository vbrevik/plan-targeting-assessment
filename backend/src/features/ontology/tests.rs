use super::models::*;
use super::service::OntologyService;
use sqlx::SqlitePool;

fn mock_create_entity_request(name: &str, type_: &str) -> CreateEntityRequest {
    CreateEntityRequest {
        id: None,
        operation_id: None,
        campaign_id: None,
        name: name.to_string(),
        type_: type_.to_string(),
        description: None,
        status: None,
        location_lat: None,
        location_lng: None,
        properties: None,
        source: None,
        classification: None,
        confidence: None,
    }
}

#[sqlx::test]
async fn test_create_and_get_entity(pool: SqlitePool) {
    let service = OntologyService::new(pool);
    
    let mut req = mock_create_entity_request("Test Entity", "test_type");
    req.properties = Some(serde_json::json!({"key": "value"}));

    let created = service.create_entity(req).await.unwrap();
    assert_eq!(created.name, "Test Entity");
    assert_eq!(created.type_, "test_type");

    let fetched = service.get_entity(&created.id).await.unwrap();
    assert_eq!(fetched.id, created.id);
    assert_eq!(fetched.name, "Test Entity");
}

#[sqlx::test]
async fn test_relationship_creation(pool: SqlitePool) {
    let service = OntologyService::new(pool);
    
    let e1 = service.create_entity(mock_create_entity_request("Source", "node")).await.unwrap();
    let e2 = service.create_entity(mock_create_entity_request("Target", "node")).await.unwrap();

    let rel_req = CreateRelationshipRequest {
        source_id: e1.id.clone(),
        target_id: e2.id.clone(),
        relation_type: "connects_to".to_string(),
        properties: None,
    };

    let rel = service.create_relationship(rel_req).await.unwrap();
    assert_eq!(rel.source_id, e1.id);
    assert_eq!(rel.target_id, e2.id);
    assert_eq!(rel.relation_type, "connects_to");

    let neighbors = service.get_neighbors(&e1.id).await.unwrap();
    assert_eq!(neighbors.len(), 1);
    assert_eq!(neighbors[0].id, e2.id);
}

#[sqlx::test]
async fn test_delete_entity_cascades(pool: SqlitePool) {
    let service = OntologyService::new(pool);
    
    let e1 = service.create_entity(mock_create_entity_request("S", "node")).await.unwrap();
    let e2 = service.create_entity(mock_create_entity_request("T", "node")).await.unwrap();

    service.create_relationship(CreateRelationshipRequest {
        source_id: e1.id.clone(),
        target_id: e2.id.clone(),
        relation_type: "rel".to_string(),
        properties: None,
    }).await.unwrap();

    service.delete_entity(&e1.id).await.unwrap();

    let res = service.get_entity(&e1.id).await;
    assert!(res.is_err());

    let neighbors = service.get_neighbors(&e2.id).await.unwrap();
    assert_eq!(neighbors.len(), 0);
}

