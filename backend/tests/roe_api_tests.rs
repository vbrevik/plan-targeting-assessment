// Integration tests for ROE API endpoints
// Tests all ROE endpoints, workflows, and error handling

use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use template_repo_backend::features::roe::{
    repositories::ROERepository,
    services::DecisionRoutingService,
    domain::{ROEStatus, ROERequestStatus},
};
use std::time::Duration;

// Helper to create test database pool
// Each test gets its own isolated in-memory database
async fn create_test_pool() -> SqlitePool {
    // Use :memory: database - each connection gets its own isolated database
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .acquire_timeout(Duration::from_secs(3))
        .connect(":memory:")
        .await
        .expect("Failed to create test database");
    
    // Create tables manually for tests (simpler than running full migrations)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS decisions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            urgency TEXT NOT NULL,
            complexity TEXT NOT NULL,
            status TEXT NOT NULL,
            roe_status TEXT,
            roe_notes TEXT,
            roe_request_id TEXT,
            deadline TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        "#
    )
    .execute(&pool)
    .await
    .expect("Failed to create decisions table");
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS roe_requests (
            id TEXT PRIMARY KEY,
            decision_id TEXT NOT NULL,
            requested_by TEXT NOT NULL,
            requested_at TEXT NOT NULL DEFAULT (datetime('now')),
            approval_authority TEXT,
            request_justification TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            approved_by TEXT,
            approved_at TEXT,
            rejection_reason TEXT,
            roe_reference TEXT,
            expiration_date TEXT,
            conditions TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        "#
    )
    .execute(&pool)
    .await
    .expect("Failed to create roe_requests table");
    
    pool
}

// Helper to create a test decision
async fn create_test_decision(pool: &SqlitePool, decision_id: &str, title: &str, description: &str, category: &str) {
    sqlx::query(
        "INSERT INTO decisions (id, title, description, category, urgency, complexity, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
    )
    .bind(decision_id)
    .bind(title)
    .bind(description)
    .bind(category)
    .bind("high")
    .bind("medium")
    .bind("pending")
    .execute(pool)
    .await
    .expect("Failed to create test decision");
}

#[tokio::test]
async fn test_get_decision_roe_status() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-1", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Initially no ROE status
    let (roe_status, roe_notes, roe_request_id) = repo.get_decision_roe_status("decision-1")
        .await
        .expect("Failed to get ROE status");
    
    assert!(roe_status.is_none());
    assert!(roe_notes.is_none());
    assert!(roe_request_id.is_none());
    
    // Set ROE status
    repo.update_decision_roe_status(
        "decision-1",
        Some("requires_roe_release"),
        Some("Test notes"),
        None,
    )
    .await
    .expect("Failed to update ROE status");
    
    // Verify status was set
    let (roe_status, roe_notes, _) = repo.get_decision_roe_status("decision-1")
        .await
        .expect("Failed to get updated ROE status");
    
    assert_eq!(roe_status, Some("requires_roe_release".to_string()));
    assert_eq!(roe_notes, Some("Test notes".to_string()));
}

#[tokio::test]
async fn test_update_decision_roe_status() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-2", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Update ROE status
    repo.update_decision_roe_status(
        "decision-2",
        Some("within_approved_roe"),
        Some("Within approved ROE"),
        None,
    )
    .await
    .expect("Failed to update ROE status");
    
    // Verify update
    let (roe_status, roe_notes, _) = repo.get_decision_roe_status("decision-2")
        .await
        .expect("Failed to get ROE status");
    
    assert_eq!(roe_status, Some("within_approved_roe".to_string()));
    assert_eq!(roe_notes, Some("Within approved ROE".to_string()));
}

#[tokio::test]
async fn test_auto_determine_roe_status() {
    let pool = create_test_pool().await;
    
    // Test decision requiring ROE (strike near civilians)
    create_test_decision(
        &pool,
        "decision-strike",
        "Strike T-1002",
        "High-value enemy command post near civilian infrastructure",
        "strike"
    ).await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Auto-determine ROE status
    let (roe_status, roe_notes) = repo.auto_determine_roe_status("decision-strike")
        .await
        .expect("Failed to auto-determine ROE status");
    
    assert_eq!(roe_status, ROEStatus::RequiresRoeRelease);
    assert!(roe_notes.is_some());
    assert!(roe_notes.unwrap().contains("civilian"));
    
    // Test decision within ROE (standard maneuver)
    create_test_decision(
        &pool,
        "decision-maneuver",
        "Move 1 MECH BDE",
        "Reposition brigade to strengthen defensive posture",
        "maneuver"
    ).await;
    
    let (roe_status, roe_notes) = repo.auto_determine_roe_status("decision-maneuver")
        .await
        .expect("Failed to auto-determine ROE status");
    
    assert_eq!(roe_status, ROEStatus::WithinApprovedRoe);
    assert!(roe_notes.is_some());
}

#[tokio::test]
async fn test_create_roe_request() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-3", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Create ROE request
    use template_repo_backend::features::roe::domain::CreateROERequestRequest;
    
    let request = CreateROERequestRequest {
        decision_id: "decision-3".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "Test justification".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    let roe_request = repo.create_roe_request("user-1", request)
        .await
        .expect("Failed to create ROE request");
    
    assert_eq!(roe_request.decision_id, "decision-3");
    assert_eq!(roe_request.requested_by, "user-1");
    assert_eq!(roe_request.status, ROERequestStatus::Pending);
    assert_eq!(roe_request.request_justification, "Test justification");
    
    // Verify decision ROE status was updated
    let (roe_status, _, roe_request_id) = repo.get_decision_roe_status("decision-3")
        .await
        .expect("Failed to get ROE status");
    
    assert_eq!(roe_status, Some("roe_pending_approval".to_string()));
    assert_eq!(roe_request_id, Some(roe_request.id));
}

#[tokio::test]
async fn test_update_roe_request_status_approve() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-4", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Create ROE request
    use template_repo_backend::features::roe::domain::CreateROERequestRequest;
    
    let request = CreateROERequestRequest {
        decision_id: "decision-4".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "Test justification".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    let roe_request = repo.create_roe_request("user-1", request)
        .await
        .expect("Failed to create ROE request");
    
    // Approve request
    use template_repo_backend::features::roe::domain::UpdateROERequestStatusRequest;
    
    let update = UpdateROERequestStatusRequest {
        status: "approved".to_string(),
        approved_by: Some("commander-1".to_string()),
        rejection_reason: None,
        roe_reference: Some("ROE-2024-03".to_string()),
        expiration_date: Some("2024-12-31T23:59:59Z".to_string()),
        conditions: Some("No civilian casualties".to_string()),
    };
    
    repo.update_roe_request_status(&roe_request.id, update, "commander-1")
        .await
        .expect("Failed to update ROE request");
    
    // Verify request was approved
    let updated_request = repo.get_roe_request_by_id(&roe_request.id)
        .await
        .expect("Failed to get ROE request");
    
    assert_eq!(updated_request.status, ROERequestStatus::Approved);
    assert_eq!(updated_request.approved_by, Some("commander-1".to_string()));
    assert!(updated_request.approved_at.is_some());
    assert_eq!(updated_request.roe_reference, Some("ROE-2024-03".to_string()));
    
    // Verify decision ROE status was updated
    let (roe_status, _, _) = repo.get_decision_roe_status("decision-4")
        .await
        .expect("Failed to get ROE status");
    
    assert_eq!(roe_status, Some("roe_approved".to_string()));
}

#[tokio::test]
async fn test_update_roe_request_status_reject() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-5", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Create ROE request
    use template_repo_backend::features::roe::domain::CreateROERequestRequest;
    
    let request = CreateROERequestRequest {
        decision_id: "decision-5".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "Test justification".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    let roe_request = repo.create_roe_request("user-1", request)
        .await
        .expect("Failed to create ROE request");
    
    // Reject request
    use template_repo_backend::features::roe::domain::UpdateROERequestStatusRequest;
    
    let update = UpdateROERequestStatusRequest {
        status: "rejected".to_string(),
        approved_by: Some("commander-1".to_string()),
        rejection_reason: Some("Insufficient justification".to_string()),
        roe_reference: None,
        expiration_date: None,
        conditions: None,
    };
    
    repo.update_roe_request_status(&roe_request.id, update, "commander-1")
        .await
        .expect("Failed to update ROE request");
    
    // Verify request was rejected
    let updated_request = repo.get_roe_request_by_id(&roe_request.id)
        .await
        .expect("Failed to get ROE request");
    
    assert_eq!(updated_request.status, ROERequestStatus::Rejected);
    assert_eq!(updated_request.rejection_reason, Some("Insufficient justification".to_string()));
    
    // Verify decision ROE status was updated
    let (roe_status, _, _) = repo.get_decision_roe_status("decision-5")
        .await
        .expect("Failed to get ROE status");
    
    assert_eq!(roe_status, Some("roe_rejected".to_string()));
}

#[tokio::test]
async fn test_get_roe_request_by_decision() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-6", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Create ROE request
    use template_repo_backend::features::roe::domain::CreateROERequestRequest;
    
    let request = CreateROERequestRequest {
        decision_id: "decision-6".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "Test justification".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    let roe_request = repo.create_roe_request("user-1", request)
        .await
        .expect("Failed to create ROE request");
    
    // Get request by decision ID
    let found_request = repo.get_roe_request_by_decision_id("decision-6")
        .await
        .expect("Failed to get ROE request by decision")
        .expect("ROE request not found");
    
    assert_eq!(found_request.id, roe_request.id);
    assert_eq!(found_request.decision_id, "decision-6");
}

#[tokio::test]
async fn test_list_roe_requests_by_status() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-7", "Test Decision 1", "Test description", "strike").await;
    create_test_decision(&pool, "decision-8", "Test Decision 2", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Create multiple ROE requests
    use template_repo_backend::features::roe::domain::CreateROERequestRequest;
    
    let request1 = CreateROERequestRequest {
        decision_id: "decision-7".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "Test 1".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    let request2 = CreateROERequestRequest {
        decision_id: "decision-8".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "Test 2".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    repo.create_roe_request("user-1", request1)
        .await
        .expect("Failed to create ROE request 1");
    
    repo.create_roe_request("user-1", request2)
        .await
        .expect("Failed to create ROE request 2");
    
    // List all pending requests
    let pending_requests = repo.list_roe_requests_by_status(Some("pending"))
        .await
        .expect("Failed to list pending ROE requests");
    
    assert!(pending_requests.len() >= 2);
    assert!(pending_requests.iter().all(|r| r.status == ROERequestStatus::Pending));
}

#[tokio::test]
async fn test_roe_blocking_check() {
    let pool = create_test_pool().await;
    create_test_decision(&pool, "decision-9", "Test Decision", "Test description", "strike").await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Set ROE status to requires_roe_release
    repo.update_decision_roe_status(
        "decision-9",
        Some("requires_roe_release"),
        Some("Test notes"),
        None,
    )
    .await
    .expect("Failed to update ROE status");
    
    // Check blocking
    use template_repo_backend::features::roe::services::ROEBlockingCheckService;
    
    let blocking_result = ROEBlockingCheckService::check_decision_from_db(&pool, "decision-9")
        .await
        .expect("Failed to check ROE blocking");
    
    assert!(!blocking_result.can_proceed);
    assert!(blocking_result.is_blocked);
    assert!(!blocking_result.is_pending);
    assert_eq!(blocking_result.roe_status, Some("requires_roe_release".to_string()));
    assert!(blocking_result.blocking_reason.is_some());
    assert!(blocking_result.suggested_action.is_some());
}

#[tokio::test]
async fn test_decision_routing_with_roe_blocking() {
    let pool = create_test_pool().await;
    
    // Create decision requiring ROE
    create_test_decision(
        &pool,
        "decision-blocked",
        "Strike T-1002",
        "Strike near civilian infrastructure",
        "strike"
    ).await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Set ROE status to requires_roe_release
    repo.update_decision_roe_status(
        "decision-blocked",
        Some("requires_roe_release"),
        Some("Requires ROE"),
        None,
    )
    .await
    .expect("Failed to update ROE status");
    
    // Try to route decision
    let routing_service = DecisionRoutingService::new(pool.clone());
    
    let routing_plan = routing_service.route_decision(
        "decision-blocked",
        Some("high"),
        None,
    )
    .await
    .expect("Failed to route decision");
    
    // Should be blocked
    assert!(!routing_plan.can_proceed);
    assert_eq!(routing_plan.venue_name, "ROE Coordination");
    assert!(routing_plan.routing_reason.is_some());
    assert!(routing_plan.routing_reason.unwrap().contains("ROE"));
    assert_eq!(routing_plan.urgency_override, Some("ROE_BLOCKER".to_string()));
}

#[tokio::test]
async fn test_decision_routing_can_proceed() {
    let pool = create_test_pool().await;
    
    // Create decision within ROE
    create_test_decision(
        &pool,
        "decision-proceed",
        "Move 1 MECH BDE",
        "Reposition brigade",
        "maneuver"
    ).await;
    
    let repo = ROERepository::new(pool.clone());
    
    // Set ROE status to within_approved_roe
    repo.update_decision_roe_status(
        "decision-proceed",
        Some("within_approved_roe"),
        None,
        None,
    )
    .await
    .expect("Failed to update ROE status");
    
    // Route decision
    let routing_service = DecisionRoutingService::new(pool.clone());
    
    let routing_plan = routing_service.route_decision(
        "decision-proceed",
        Some("high"),
        Some((chrono::Utc::now() + chrono::Duration::hours(36)).to_rfc3339().as_str()),
    )
    .await
    .expect("Failed to route decision");
    
    // Should be able to proceed
    assert!(routing_plan.can_proceed);
    assert_ne!(routing_plan.venue_name, "ROE Coordination");
    assert!(routing_plan.meeting_date.is_some());
    assert!(routing_plan.meeting_time.is_some());
}

#[tokio::test]
async fn test_complete_roe_workflow() {
    let pool = create_test_pool().await;
    
    // 1. Create decision
    create_test_decision(
        &pool,
        "decision-workflow",
        "Strike T-1002",
        "High-value target near civilian area",
        "strike"
    ).await;
    
    let repo = ROERepository::new(pool.clone());
    
    // 2. Auto-determine ROE status
    let (roe_status, _roe_notes) = repo.auto_determine_roe_status("decision-workflow")
        .await
        .expect("Failed to auto-determine ROE");
    
    assert_eq!(roe_status, ROEStatus::RequiresRoeRelease);
    
    // 3. Create ROE request
    use template_repo_backend::features::roe::domain::CreateROERequestRequest;
    
    let request = CreateROERequestRequest {
        decision_id: "decision-workflow".to_string(),
        approval_authority: Some("Commander".to_string()),
        request_justification: "High-value target requires new ROE".to_string(),
        roe_reference: None,
        conditions: None,
    };
    
    let roe_request = repo.create_roe_request("user-1", request)
        .await
        .expect("Failed to create ROE request");
    
    // Verify status is pending
    let (roe_status, _, _) = repo.get_decision_roe_status("decision-workflow")
        .await
        .expect("Failed to get ROE status");
    
    assert_eq!(roe_status, Some("roe_pending_approval".to_string()));
    
    // 4. Approve ROE request
    use template_repo_backend::features::roe::domain::UpdateROERequestStatusRequest;
    
    let update = UpdateROERequestStatusRequest {
        status: "approved".to_string(),
        approved_by: Some("commander-1".to_string()),
        rejection_reason: None,
        roe_reference: Some("ROE-2024-03".to_string()),
        expiration_date: Some("2024-12-31T23:59:59Z".to_string()),
        conditions: Some("No civilian casualties".to_string()),
    };
    
    repo.update_roe_request_status(&roe_request.id, update, "commander-1")
        .await
        .expect("Failed to approve ROE request");
    
    // 5. Verify decision can now proceed
    let (roe_status, _, _) = repo.get_decision_roe_status("decision-workflow")
        .await
        .expect("Failed to get ROE status");
    
    assert_eq!(roe_status, Some("roe_approved".to_string()));
    
    // 6. Route decision (should now succeed)
    let routing_service = DecisionRoutingService::new(pool.clone());
    
    let routing_plan = routing_service.route_decision(
        "decision-workflow",
        Some("high"),
        Some((chrono::Utc::now() + chrono::Duration::hours(36)).to_rfc3339().as_str()),
    )
    .await
    .expect("Failed to route decision");
    
    assert!(routing_plan.can_proceed);
}
