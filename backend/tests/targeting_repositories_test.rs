// Integration tests for targeting repositories
// Tests CRUD operations, filtering, pagination, transactions, classification queries

use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use template_repo_backend::features::targeting::repositories::*;
use template_repo_backend::features::targeting::domain::*;
use std::time::Duration;

// Helper to create test database pool
async fn create_test_pool() -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .acquire_timeout(Duration::from_secs(3))
        .connect(":memory:")
        .await
        .expect("Failed to create test database");
    
    // Run migrations
    sqlx::migrate!()
        .run(&pool)
        .await
        .expect("Failed to run migrations");
    
    pool
}

#[tokio::test]
async fn test_target_repository_crud() {
    let pool = create_test_pool().await;
    
    // Create target
    sqlx::query("INSERT INTO targets (id, name, description, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind("test-target-1")
        .bind("Test Target")
        .bind("Test description")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("32.0,44.0")
        .execute(&pool)
        .await
        .expect("Failed to create target");
    
    // Read target
    let target = TargetRepository::get_by_id(&pool, "test-target-1")
        .await
        .expect("Failed to get target");
    
    assert!(target.is_some());
    let target = target.unwrap();
    assert_eq!(target.id, "test-target-1");
    assert_eq!(target.name, "Test Target");
    assert_eq!(target.target_type, "HPT");
    assert_eq!(target.priority, "HIGH");
    assert_eq!(target.target_status, "Nominated");
    
    // Update F3EAD stage
    TargetRepository::update_f3ead_stage(&pool, "test-target-1", "FIX")
        .await
        .expect("Failed to update F3EAD stage");
    
    let updated = TargetRepository::get_by_id(&pool, "test-target-1")
        .await
        .expect("Failed to get updated target")
        .unwrap();
    assert_eq!(updated.f3ead_stage, Some("FIX".to_string()));
    
    // List all targets
    let targets = TargetRepository::list_all(&pool, None, None, Some(10), None)
        .await
        .expect("Failed to list targets");
    assert!(targets.len() >= 1);
    assert!(targets.iter().any(|t| t.id == "test-target-1"));
}

#[tokio::test]
async fn test_target_repository_filtering() {
    let pool = create_test_pool().await;
    
    // Create multiple targets with different statuses
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("target-1")
        .bind("Target 1")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("32.0,44.0")
        .execute(&pool)
        .await
        .unwrap();
    
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("target-2")
        .bind("Target 2")
        .bind("HPT")
        .bind("MEDIUM")
        .bind("Approved")
        .bind("SECRET")
        .bind("33.0,45.0")
        .execute(&pool)
        .await
        .unwrap();
    
    // Filter by status
    let nominated = TargetRepository::list_all(&pool, Some("Nominated"), None, Some(10), None)
        .await
        .expect("Failed to filter by status");
    assert!(nominated.iter().all(|t| t.target_status == "Nominated"));
    
    // Filter by priority
    let high_priority = TargetRepository::list_all(&pool, None, Some("HIGH"), Some(10), None)
        .await
        .expect("Failed to filter by priority");
    assert!(high_priority.iter().all(|t| t.priority == "HIGH"));
    
    // Filter by both status and priority
    let filtered = TargetRepository::list_all(&pool, Some("Nominated"), Some("HIGH"), Some(10), None)
        .await
        .expect("Failed to filter by status and priority");
    assert!(filtered.iter().all(|t| t.target_status == "Nominated" && t.priority == "HIGH"));
}

#[tokio::test]
async fn test_target_repository_pagination() {
    let pool = create_test_pool().await;
    
    // Create multiple targets
    for i in 1..=15 {
        sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(format!("target-{}", i))
            .bind(format!("Target {}", i))
            .bind("HPT")
            .bind("HIGH")
            .bind("Nominated")
            .bind("SECRET")
            .bind("34.0,46.0")
            .execute(&pool)
            .await
            .unwrap();
    }
    
    // Test limit
    let limited = TargetRepository::list_all(&pool, None, None, Some(5), None)
        .await
        .expect("Failed to list with limit");
    assert_eq!(limited.len(), 5);
    
    // Test default limit (should be 100)
    let all = TargetRepository::list_all(&pool, None, None, None, None)
        .await
        .expect("Failed to list all");
    assert!(all.len() >= 15);
}

#[tokio::test]
async fn test_target_repository_summary() {
    let pool = create_test_pool().await;
    
    // Create targets with different statuses
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("t1")
        .bind("Target 1")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("35.0,47.0")
        .execute(&pool)
        .await
        .unwrap();
    
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("t2")
        .bind("Target 2")
        .bind("HPT")
        .bind("HIGH")
        .bind("Approved")
        .bind("SECRET")
        .bind("36.0,48.0")
        .execute(&pool)
        .await
        .unwrap();
    
    let summary = TargetRepository::get_summary(&pool)
        .await
        .expect("Failed to get summary");
    
    assert_eq!(summary.total_targets, 2);
    assert_eq!(summary.active_targets, 2); // Nominated + Approved
    assert_eq!(summary.pending_nominations, 1);
    assert_eq!(summary.approved_targets, 1);
}

#[tokio::test]
async fn test_dtl_repository_crud() {
    let pool = create_test_pool().await;
    
    // Create target first
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))")
        .bind("dtl-target-1")
        .bind("DTL Target")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("40.0,52.0")
        .execute(&pool)
        .await
        .unwrap();
    
    // Create DTL entry
    let dtl_id = DtlRepository::create(&pool, "dtl-target-1", 0.8, 0.7)
        .await
        .expect("Failed to create DTL entry");
    
    assert!(!dtl_id.is_empty());
    
    // List DTL entries
    let entries = DtlRepository::list_all(&pool, Some(10))
        .await
        .expect("Failed to list DTL entries");
    
    assert!(entries.len() >= 1);
    let entry = entries.iter().find(|e| e.id == dtl_id).unwrap();
    assert_eq!(entry.target_id, "dtl-target-1");
    assert_eq!(entry.priority_score, 0.8);
    assert_eq!(entry.feasibility_score, 0.7);
    assert!(entry.combined_score.is_some());
    assert!(entry.combined_score.unwrap() > 0.0);
}

#[tokio::test]
async fn test_dtl_repository_ordering() {
    let pool = create_test_pool().await;
    
    // Create targets
    for i in 1..=3 {
        sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' hours'))")
            .bind(format!("dtl-t{}", i))
            .bind(format!("Target {}", i))
            .bind("HPT")
            .bind("HIGH")
            .bind("Nominated")
            .bind("SECRET")
            .bind("41.0,53.0")
            .bind(-(i as i64)) // Different creation times
            .execute(&pool)
            .await
            .unwrap();
    }
    
    // Create DTL entries with different scores
    DtlRepository::create(&pool, "dtl-t1", 0.9, 0.8).await.unwrap(); // High combined
    DtlRepository::create(&pool, "dtl-t2", 0.5, 0.5).await.unwrap(); // Medium combined
    DtlRepository::create(&pool, "dtl-t3", 0.7, 0.6).await.unwrap(); // Medium-high combined
    
    // List should be ordered by combined_score DESC
    let entries = DtlRepository::list_all(&pool, Some(10))
        .await
        .expect("Failed to list DTL entries");
    
    assert!(entries.len() >= 3);
    // Verify ordering (highest combined score first)
    let scores: Vec<f64> = entries.iter()
        .take(3)
        .map(|e| e.combined_score.unwrap_or(0.0))
        .collect();
    
    // Should be descending order
    for i in 0..(scores.len() - 1) {
        assert!(scores[i] >= scores[i + 1], "DTL entries not ordered by combined_score DESC");
    }
}

#[tokio::test]
async fn test_isr_repository_crud() {
    let pool = create_test_pool().await;
    
    let platform = IsrPlatform {
        id: "".to_string(), // Will be generated
        platform_type: "UAV".to_string(),
        platform_name: "Test UAV".to_string(),
        callsign: Some("UAV-01".to_string()),
        current_position: Some("35.0,40.0".to_string()),
        sensor_type: "COMBINED".to_string(),
        sensor_range_km: Some(50.0),
        coverage_area: None,
        status: "ACTIVE".to_string(),
        loiter_time_remaining: Some(4),
        fuel_remaining_percent: Some(75),
        current_task: Some("Surveillance".to_string()),
        tasking_priority: Some("HIGH".to_string()),
        tasked_targets: None,
        classification: "SECRET".to_string(),
        created_at: "".to_string(),
        updated_at: "".to_string(),
    };
    
    let id = IsrRepository::create(&pool, &platform)
        .await
        .expect("Failed to create ISR platform");
    
    assert!(!id.is_empty());
    
    // List platforms
    let platforms = IsrRepository::list_all(&pool, None)
        .await
        .expect("Failed to list ISR platforms");
    
    assert!(platforms.len() >= 1);
    let found = platforms.iter().find(|p| p.id == id).unwrap();
    assert_eq!(found.platform_name, "Test UAV");
    assert_eq!(found.status, "ACTIVE");
}

#[tokio::test]
async fn test_strike_platform_repository_crud() {
    let pool = create_test_pool().await;
    
    let platform = StrikePlatform {
        id: "".to_string(),
        platform_type: "FIGHTER".to_string(),
        platform_name: "Test Fighter".to_string(),
        callsign: Some("FIGHTER-01".to_string()),
        unit: Some("Squadron 1".to_string()),
        munitions_available: None,
        sorties_available: 5,
        platform_status: "READY".to_string(),
        classification: "SECRET".to_string(),
        created_at: "".to_string(),
        updated_at: "".to_string(),
    };
    
    let id = StrikePlatformRepository::create(&pool, &platform)
        .await
        .expect("Failed to create strike platform");
    
    assert!(!id.is_empty());
    
    // List platforms
    let platforms = StrikePlatformRepository::list_all(&pool, None)
        .await
        .expect("Failed to list strike platforms");
    
    assert!(platforms.len() >= 1);
    let found = platforms.iter().find(|p| p.id == id).unwrap();
    assert_eq!(found.platform_name, "Test Fighter");
    assert_eq!(found.platform_status, "READY");
}

#[tokio::test]
async fn test_assumption_challenge_repository_filtering() {
    let pool = create_test_pool().await;
    
    // Create assumptions with different statuses
    AssumptionChallengeRepository::create(&pool, "Assumption 1", 80, "VALID")
        .await
        .unwrap();
    AssumptionChallengeRepository::create(&pool, "Assumption 2", 60, "MONITORING")
        .await
        .unwrap();
    AssumptionChallengeRepository::create(&pool, "Assumption 3", 70, "VALID")
        .await
        .unwrap();
    
    // List all
    let all = AssumptionChallengeRepository::list_all(&pool, None)
        .await
        .expect("Failed to list assumptions");
    assert!(all.len() >= 3);
    
    // Filter by status
    let validated = AssumptionChallengeRepository::list_all(&pool, Some("VALID"))
        .await
        .expect("Failed to filter by status");
    assert!(validated.iter().all(|a| a.validation_status == "VALID"));
    assert_eq!(validated.len(), 2);
}

#[tokio::test]
async fn test_annotation_repository_crud() {
    let pool = create_test_pool().await;
    
    // Create target first
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("annot-target-1")
        .bind("Annotated Target")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("37.0,49.0")
        .execute(&pool)
        .await
        .unwrap();
    
    // Create annotation
    let annot_id = AnnotationRepository::create(
        &pool,
        Some("annot-target-1"),
        "Test annotation",
        "COMMENT",
        false,
        "SECRET",
        "user-1"
    )
    .await
    .expect("Failed to create annotation");
    
    assert!(!annot_id.is_empty());
    
    // Get annotations by target
    let annotations = AnnotationRepository::get_by_target_id(&pool, "annot-target-1")
        .await
        .expect("Failed to get annotations");
    
    assert!(annotations.len() >= 1);
    let found = annotations.iter().find(|a| a.id == annot_id).unwrap();
    assert_eq!(found.annotation_text, "Test annotation");
    assert_eq!(found.annotation_type, "COMMENT");
    assert_eq!(found.is_critical, false);
}

#[tokio::test]
async fn test_repository_transaction_rollback() {
    let pool = create_test_pool().await;
    
    // Test that transaction rollback works
    let mut tx = pool.begin().await.expect("Failed to begin transaction");
    
    // Insert in transaction
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("tx-target-1")
        .bind("Transaction Target")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("38.0,50.0")
        .execute(&mut *tx)
        .await
        .unwrap();
    
    // Rollback
    tx.rollback().await.expect("Failed to rollback");
    
    // Verify target doesn't exist
    let target = TargetRepository::get_by_id(&pool, "tx-target-1")
        .await
        .expect("Failed to query");
    assert!(target.is_none(), "Target should not exist after rollback");
}

#[tokio::test]
async fn test_repository_transaction_commit() {
    let pool = create_test_pool().await;
    
    // Test that transaction commit works
    let mut tx = pool.begin().await.expect("Failed to begin transaction");
    
    // Insert in transaction
    sqlx::query("INSERT INTO targets (id, name, target_type, priority, target_status, classification, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind("tx-target-2")
        .bind("Committed Target")
        .bind("HPT")
        .bind("HIGH")
        .bind("Nominated")
        .bind("SECRET")
        .bind("39.0,51.0")
        .execute(&mut *tx)
        .await
        .unwrap();
    
    // Commit
    tx.commit().await.expect("Failed to commit");
    
    // Verify target exists
    let target = TargetRepository::get_by_id(&pool, "tx-target-2")
        .await
        .expect("Failed to query")
        .unwrap();
    assert_eq!(target.name, "Committed Target");
}
