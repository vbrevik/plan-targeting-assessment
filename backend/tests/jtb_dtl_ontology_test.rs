use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use std::sync::Arc;
use std::time::Duration;
use core_ontology::OntologyService;
use template_repo_backend::features::targeting::services::jtb_service::JtbService;
use template_repo_backend::features::targeting::services::dtl_service::DtlService;
use template_repo_backend::features::targeting::domain::{CreateJtbSessionRequest, AddTargetToSessionRequest, CreateDtlEntryRequest};

async fn create_test_pool() -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .acquire_timeout(Duration::from_secs(3))
        .connect(":memory:")
        .await
        .expect("Failed to create test database");
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS entities (
            id TEXT PRIMARY KEY,
            operation_id TEXT,
            campaign_id TEXT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            status TEXT,
            properties TEXT,
            location_lat REAL,
            location_lng REAL,
            valid_from TIMESTAMP,
            valid_until TIMESTAMP,
            source TEXT,
            confidence REAL,
            classification TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(&pool)
    .await
    .expect("Failed to create entities table");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS entity_relationships (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            properties TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (source_id, target_id, relation_type)
        )
        "#
    )
    .execute(&pool)
    .await
    .expect("Failed to create entity_relationships table");

    pool
}

#[tokio::test]
async fn test_jtb_session_creation() {
    let pool = create_test_pool().await;
    let ontology = Arc::new(OntologyService::new(pool.clone()));
    let jtb_service = JtbService::new(ontology.clone());

    let req = CreateJtbSessionRequest {
        session_name: "Test JTB Session".to_string(),
        session_date: "2026-02-01".to_string(),
        session_time: "14:00".to_string(),
        session_datetime: "2026-02-01T14:00:00Z".to_string(),
        chair: "Col Test".to_string(),
        chair_rank: Some("OF-5".to_string()),
        required_attendees: Some(vec!["J2".to_string(), "J3".to_string()]),
        classification: "SECRET".to_string(),
        caveats: None,
    };

    let session_id = jtb_service.create_session(&req, "test_user").await.expect("Failed to create session");
    
    // Verify entity exists
    let entity = ontology.get_entity(&session_id).await.expect("Failed to get session entity");
    assert_eq!(entity.name, "Test JTB Session");
    assert_eq!(entity.type_, "Event");
    
    let props = entity.properties.expect("Session properties missing");
    assert_eq!(props["subtype"], "JTB_SESSION");
    assert_eq!(props["chair"], "Col Test");
}

#[tokio::test]
async fn test_jtb_target_assignment() {
    let pool = create_test_pool().await;
    let ontology = Arc::new(OntologyService::new(pool.clone()));
    let jtb_service = JtbService::new(ontology.clone());

    // Create session
    let session_req = CreateJtbSessionRequest {
        session_name: "Test JTB Session".to_string(),
        session_date: "2026-02-01".to_string(),
        session_time: "14:00".to_string(),
        session_datetime: "2026-02-01T14:00:00Z".to_string(),
        chair: "Col Test".to_string(),
        chair_rank: Some("OF-5".to_string()),
        required_attendees: None,
        classification: "SECRET".to_string(),
        caveats: None,
    };
    let session_id = jtb_service.create_session(&session_req, "test_user").await.unwrap();

    // Create target entity
    sqlx::query("INSERT INTO entities (id, type, name) VALUES (?, ?, ?)")
        .bind("T1")
        .bind("Target")
        .bind("Target One")
        .execute(&pool)
        .await
        .unwrap();

    // Add target to session
    jtb_service.add_target_to_session(&session_id, "T1", 1).await.expect("Failed to add target");

    // Verify relationship exists
    let rels = ontology.get_relationships(Some("T1".to_string()), Some(session_id), Some("DISCUSSED_IN".to_string())).await.expect("Failed to get relationships");
    assert_eq!(rels.len(), 1);
    assert_eq!(rels[0].relation_type, "DISCUSSED_IN");
    
    let props = rels[0].properties.as_ref().expect("Relationship properties missing");
    assert_eq!(props["presentation_order"], 1);
}

#[tokio::test]
async fn test_dtl_prioritization() {
    let pool = create_test_pool().await;
    let ontology = Arc::new(OntologyService::new(pool.clone()));
    let dtl_service = DtlService::new(ontology.clone());

    // Create target entity
    sqlx::query("INSERT INTO entities (id, type, name) VALUES (?, ?, ?)")
        .bind("T1")
        .bind("Target")
        .bind("Target One")
        .execute(&pool)
        .await
        .unwrap();

    // Create DTL entry (updates target properties)
    let dtl_req = CreateDtlEntryRequest {
        target_id: "T1".to_string(),
        priority_score: 0.8,
        feasibility_score: 0.7,
        is_tst: true,
        tst_deadline: Some("2026-02-01T18:00:00Z".to_string()),
    };
    dtl_service.create_entry(&dtl_req).await.expect("Failed to create DTL entry");

    // Verify properties updated on entity
    let entity = ontology.get_entity("T1").await.expect("Failed to get target entity");
    let props = entity.properties.expect("Target properties missing");
    
    assert_eq!(props["priority_score"], 0.8);
    assert_eq!(props["feasibility_score"], 0.7);
    assert_eq!(props["is_tst"], true);
    assert_eq!(props["in_dtl"], true);
    
    // Test listing entries
    let entries = dtl_service.list_entries(None).await.expect("Failed to list DTL entries");
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].target_id, "T1");
    assert!(entries[0].combined_score.is_some());
    // Combined score = 0.8 * 0.6 + 0.7 * 0.4 = 0.48 + 0.28 = 0.76
    assert!((entries[0].combined_score.unwrap() - 0.76).abs() < 0.001);
}
