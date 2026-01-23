# ROE Enhancements Implementation Plan

## Overview

This document outlines the plan for implementing optional ROE (Rules of Engagement) enhancements to complete the ROE feature integration with the Decision Support System.

**Status**: Core ROE backend complete (2026-01-22)  
**Timeline**: 1-2 weeks for all enhancements  
**Priority**: Medium (enhancements, not blockers)

---

## Current State

### ✅ Completed (2026-01-22)

**Backend Core**:
- ✅ Database migration (`20260122140000_add_roe_support.sql`)
- ✅ Domain models (ROEStatus, ROERequest, business logic)
- ✅ Repository (CRUD operations)
- ✅ API handlers (7 endpoints)
- ✅ Router integration (`/api/roe`)

**Frontend Core**:
- ✅ ROE status display in DecisionCard
- ✅ ROE section in DecisionAnalysisPanel
- ✅ TypeScript types
- ✅ Mock data with ROE examples

**What Works Now**:
- ✅ Create ROE requests via API
- ✅ Update ROE request status (approve/reject)
- ✅ Get decision ROE status
- ✅ Update decision ROE status manually
- ✅ Frontend displays ROE status

---

## Enhancement Plan

### Enhancement 1: ROE Determination Logic

**Objective**: Automatically determine if a decision requires ROE based on decision characteristics.

**Why**: Currently, ROE status must be set manually. Auto-determination will:
- Reduce manual work
- Ensure consistency
- Catch ROE requirements early
- Prevent missed ROE checks

**Implementation**:

#### 1.1 Create ROE Determination Service

**File**: `backend/src/features/roe/services/roe_determination.rs`

```rust
use crate::features::roe::domain::ROEStatus;
use crate::features::decisions::domain::Decision; // Assuming decisions feature exists

pub struct ROEDeterminationService;

impl ROEDeterminationService {
    /// Determine ROE status for a decision based on its characteristics
    pub fn determine_roe_status(decision: &Decision) -> ROEStatus {
        // Check decision category
        if Self::is_strike_decision(decision) {
            return Self::check_strike_roe(decision);
        }
        
        if Self::is_cross_border_decision(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        if Self::uses_restricted_weapons(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        if Self::targets_dual_use_infrastructure(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        if Self::near_civilian_areas(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        // Default: within approved ROE
        ROEStatus::WithinApprovedRoe
    }
    
    fn is_strike_decision(decision: &Decision) -> bool {
        decision.category == "strike" || 
        decision.title.to_lowercase().contains("strike") ||
        decision.description.to_lowercase().contains("strike")
    }
    
    fn check_strike_roe(decision: &Decision) -> ROEStatus {
        // Check for civilian proximity
        if Self::near_civilian_areas(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        // Check for restricted munitions
        if Self::uses_restricted_weapons(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        // Check target type
        if Self::targets_dual_use_infrastructure(decision) {
            return ROEStatus::RequiresRoeRelease;
        }
        
        // Standard strike within ROE
        ROEStatus::WithinApprovedRoe
    }
    
    fn is_cross_border_decision(decision: &Decision) -> bool {
        // Check decision context for cross-border indicators
        decision.description.to_lowercase().contains("cross-border") ||
        decision.description.to_lowercase().contains("border") ||
        decision.context.related_entity_ids.iter().any(|id| {
            // Check if entity is in different country/region
            // This would require entity lookup
            false // Placeholder
        })
    }
    
    fn uses_restricted_weapons(decision: &Decision) -> bool {
        // Check if decision involves restricted weapon types
        let restricted_keywords = vec![
            "cluster", "incendiary", "chemical", "biological",
            "nuclear", "depleted uranium"
        ];
        
        let text = format!("{} {}", decision.title, decision.description).to_lowercase();
        restricted_keywords.iter().any(|keyword| text.contains(keyword))
    }
    
    fn targets_dual_use_infrastructure(decision: &Decision) -> bool {
        let dual_use_keywords = vec![
            "power plant", "water treatment", "hospital", "school",
            "mosque", "church", "civilian infrastructure"
        ];
        
        let text = format!("{} {}", decision.title, decision.description).to_lowercase();
        dual_use_keywords.iter().any(|keyword| text.contains(keyword))
    }
    
    fn near_civilian_areas(decision: &Decision) -> bool {
        // Check for civilian proximity indicators
        let civilian_keywords = vec![
            "civilian", "residential", "urban", "population center",
            "near civilians", "proximity to civilians"
        ];
        
        let text = format!("{} {}", decision.title, decision.description).to_lowercase();
        civilian_keywords.iter().any(|keyword| text.contains(keyword))
    }
}
```

#### 1.2 Integrate with Decision Creation

**File**: `backend/src/features/decisions/handlers/decisions.rs` (or wherever decisions are created)

```rust
use crate::features::roe::services::roe_determination::ROEDeterminationService;
use crate::features::roe::repositories::ROERepository;

// When creating a decision:
pub async fn create_decision(...) -> Result<...> {
    // ... create decision ...
    
    // Auto-determine ROE status
    let roe_status = ROEDeterminationService::determine_roe_status(&decision);
    
    // Update decision with ROE status
    let roe_repo = ROERepository::new(pool.clone());
    roe_repo.update_decision_roe_status(
        &decision.id,
        Some(&roe_status.to_string()),
        None, // roe_notes can be set later
        None, // roe_request_id
    ).await?;
    
    // ... return decision ...
}
```

#### 1.3 Add ROE Notes Generation

```rust
impl ROEDeterminationService {
    pub fn generate_roe_notes(decision: &Decision, roe_status: ROEStatus) -> Option<String> {
        match roe_status {
            ROEStatus::RequiresRoeRelease => {
                let mut reasons = Vec::new();
                
                if Self::near_civilian_areas(decision) {
                    reasons.push("Target near civilian infrastructure");
                }
                if Self::uses_restricted_weapons(decision) {
                    reasons.push("Involves restricted weapon types");
                }
                if Self::targets_dual_use_infrastructure(decision) {
                    reasons.push("Targets dual-use infrastructure");
                }
                if Self::is_cross_border_decision(decision) {
                    reasons.push("Cross-border operation");
                }
                
                Some(format!("Requires new ROE authorization: {}", reasons.join(", ")))
            }
            ROEStatus::WithinApprovedRoe => {
                Some("Decision falls within approved ROE (ROE-2024-03)".to_string())
            }
            _ => None
        }
    }
}
```

**Tasks**:
- [ ] **Task ROE-E1.1**: Create ROE determination service (2 days)
- [ ] **Task ROE-E1.2**: Integrate with decision creation workflow (1 day)
- [ ] **Task ROE-E1.3**: Add ROE notes auto-generation (1 day)
- [ ] **Task ROE-E1.4**: Unit tests for determination logic (1 day)

**Estimated Time**: 5 days

---

### Enhancement 2: Integration with Decision Routing

**Objective**: Block decision routing to meetings if ROE is required but not approved.

**Why**: Decisions requiring ROE should not be presented at meetings until ROE is approved. This prevents:
- Wasted meeting time
- Premature decision discussions
- Legal compliance issues

**Implementation**:

#### 2.1 Update Decision Routing Logic

**File**: `backend/src/features/decisions/services/routing.rs` (or wherever routing logic exists)

```rust
use crate::features::roe::repositories::ROERepository;
use crate::features::roe::domain::ROEStatus;

pub struct DecisionRouter {
    roe_repo: ROERepository,
    // ... other dependencies
}

impl DecisionRouter {
    pub async fn route_decision(&self, decision: &Decision) -> Result<RoutingPlan, Error> {
        // Check ROE status first
        let (roe_status, _, _) = self.roe_repo.get_decision_roe_status(&decision.id).await?;
        
        if let Some(status_str) = roe_status {
            let status = ROEStatus::try_from(status_str.as_str())?;
            
            // Block routing if ROE required but not approved
            if status.is_blocked() {
                return Ok(RoutingPlan {
                    venue: None,
                    venue_name: "ROE Coordination".to_string(),
                    meeting_instance_id: None,
                    meeting_date: None,
                    meeting_time: None,
                    agenda_order: None,
                    presenter: None,
                    estimated_duration: None,
                    routing_reason: Some(format!(
                        "Decision requires ROE authorization. Current status: {}. Cannot route to meeting until ROE approved.",
                        status
                    )),
                    routed_at: chrono::Utc::now(),
                    can_proceed: false,
                    urgency_override: Some("ROE_BLOCKER".to_string()),
                });
            }
            
            // Hold routing if ROE pending
            if status.is_pending() {
                return Ok(RoutingPlan {
                    venue: None,
                    venue_name: "Awaiting ROE Approval".to_string(),
                    meeting_instance_id: None,
                    meeting_date: None,
                    meeting_time: None,
                    agenda_order: None,
                    presenter: None,
                    estimated_duration: None,
                    routing_reason: Some(
                        "ROE request pending approval. Decision on hold until ROE approved.".to_string()
                    ),
                    routed_at: chrono::Utc::now(),
                    can_proceed: false,
                    urgency_override: None,
                });
            }
        }
        
        // ROE approved or within approved ROE - proceed with normal routing
        self.route_by_urgency(decision).await
    }
    
    async fn route_by_urgency(&self, decision: &Decision) -> Result<RoutingPlan, Error> {
        // Existing routing logic
        // ...
    }
}
```

#### 2.2 Update Routing Response Type

**File**: `backend/src/features/decisions/domain/routing.rs`

```rust
#[derive(Debug, Serialize)]
pub struct RoutingPlan {
    pub venue: Option<String>,
    pub venue_name: String,
    pub meeting_instance_id: Option<String>,
    pub meeting_date: Option<String>,
    pub meeting_time: Option<String>,
    pub agenda_order: Option<i32>,
    pub presenter: Option<String>,
    pub estimated_duration: Option<i32>,
    pub routing_reason: Option<String>,
    pub routed_at: chrono::DateTime<chrono::Utc>,
    pub can_proceed: bool,  // NEW: Indicates if decision can proceed to meeting
    pub urgency_override: Option<String>,  // NEW: For blockers like ROE
}
```

#### 2.3 Update Frontend to Show ROE Blockers

**File**: `frontend/src/features/smartops/components/decisions/DecisionCard.tsx`

```typescript
{decision.routing && !decision.routing.can_proceed && (
    <div className="mt-2 pt-2 border-t border-red-500/50">
        <div className="flex items-center gap-2 text-[9px]">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-red-400 font-bold uppercase">
                BLOCKED: {decision.routing.routing_reason}
            </span>
        </div>
        {decision.roeStatus === 'requires_roe_release' && (
            <button
                onClick={() => handleCreateROERequest(decision.id)}
                className="mt-1 px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-bold rounded"
            >
                Submit ROE Request
            </button>
        )}
    </div>
)}
```

**Tasks**:
- [ ] **Task ROE-E2.1**: Update routing logic to check ROE status (2 days)
- [ ] **Task ROE-E2.2**: Add can_proceed flag to RoutingPlan (1 day)
- [ ] **Task ROE-E2.3**: Update frontend to show ROE blockers (1 day)
- [ ] **Task ROE-E2.4**: Integration tests for blocked routing (1 day)

**Estimated Time**: 5 days

---

### Enhancement 3: Unit Tests

**Objective**: Comprehensive unit test coverage for ROE domain logic.

**Implementation**:

#### 3.1 Domain Model Tests

**File**: `backend/src/features/roe/domain/roe.rs` (add tests at end)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roe_status_can_proceed() {
        assert!(ROEStatus::WithinApprovedRoe.can_proceed());
        assert!(ROEStatus::RoeApproved.can_proceed());
        assert!(!ROEStatus::RequiresRoeRelease.can_proceed());
        assert!(!ROEStatus::RoeRejected.can_proceed());
    }

    #[test]
    fn test_roe_status_is_blocked() {
        assert!(ROEStatus::RequiresRoeRelease.is_blocked());
        assert!(ROEStatus::RoeRejected.is_blocked());
        assert!(!ROEStatus::WithinApprovedRoe.is_blocked());
        assert!(!ROEStatus::RoeApproved.is_blocked());
    }

    #[test]
    fn test_roe_status_is_pending() {
        assert!(ROEStatus::RoePendingApproval.is_pending());
        assert!(!ROEStatus::RequiresRoeRelease.is_pending());
    }

    #[test]
    fn test_roe_request_approve() {
        let mut request = ROERequest::new(
            "req-1".to_string(),
            "decision-1".to_string(),
            "user-1".to_string(),
            "Test justification".to_string(),
            Some("Higher HQ".to_string()),
        );

        request.approve(
            "approver-1".to_string(),
            Some("ROE-2024-05".to_string()),
            Some("2026-02-01T00:00:00Z".to_string()),
            Some("Valid for 72 hours".to_string()),
        );

        assert_eq!(request.status, ROERequestStatus::Approved);
        assert_eq!(request.approved_by, Some("approver-1".to_string()));
        assert!(request.approved_at.is_some());
        assert_eq!(request.roe_reference, Some("ROE-2024-05".to_string()));
    }

    #[test]
    fn test_roe_request_reject() {
        let mut request = ROERequest::new(
            "req-1".to_string(),
            "decision-1".to_string(),
            "user-1".to_string(),
            "Test justification".to_string(),
            None,
        );

        request.reject(
            "approver-1".to_string(),
            "Does not meet proportionality requirements".to_string(),
        );

        assert_eq!(request.status, ROERequestStatus::Rejected);
        assert_eq!(
            request.rejection_reason,
            Some("Does not meet proportionality requirements".to_string())
        );
    }

    #[test]
    fn test_roe_status_from_string() {
        assert_eq!(
            ROEStatus::try_from("within_approved_roe").unwrap(),
            ROEStatus::WithinApprovedRoe
        );
        assert_eq!(
            ROEStatus::try_from("requires_roe_release").unwrap(),
            ROEStatus::RequiresRoeRelease
        );
        assert!(ROEStatus::try_from("invalid").is_err());
    }
}
```

#### 3.2 Determination Service Tests

**File**: `backend/src/features/roe/services/roe_determination.rs` (add tests)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::features::decisions::domain::Decision;

    #[test]
    fn test_strike_near_civilians_requires_roe() {
        let decision = Decision {
            id: "test-1".to_string(),
            title: "Strike T-1002".to_string(),
            description: "Enemy command post near civilian infrastructure".to_string(),
            category: "strike".to_string(),
            // ... other fields
        };

        let status = ROEDeterminationService::determine_roe_status(&decision);
        assert_eq!(status, ROEStatus::RequiresRoeRelease);
    }

    #[test]
    fn test_standard_maneuver_within_roe() {
        let decision = Decision {
            id: "test-2".to_string(),
            title: "Move 1 MECH BDE".to_string(),
            description: "Reposition to Sector Beta".to_string(),
            category: "maneuver".to_string(),
            // ... other fields
        };

        let status = ROEDeterminationService::determine_roe_status(&decision);
        assert_eq!(status, ROEStatus::WithinApprovedRoe);
    }

    #[test]
    fn test_cross_border_requires_roe() {
        let decision = Decision {
            id: "test-3".to_string(),
            title: "Border Reconnaissance".to_string(),
            description: "Cross-border ISR operation".to_string(),
            category: "intelligence".to_string(),
            // ... other fields
        };

        let status = ROEDeterminationService::determine_roe_status(&decision);
        assert_eq!(status, ROEStatus::RequiresRoeRelease);
    }
}
```

**Tasks**:
- [ ] **Task ROE-E3.1**: Write domain model unit tests (1 day)
- [ ] **Task ROE-E3.2**: Write determination service tests (1 day)
- [ ] **Task ROE-E3.3**: Achieve 80%+ test coverage (1 day)

**Estimated Time**: 3 days

---

### Enhancement 4: Integration Tests

**Objective**: End-to-end integration tests for ROE API endpoints.

**Implementation**:

#### 4.1 API Integration Tests

**File**: `backend/tests/integration/roe_api_tests.rs`

```rust
use axum_test::TestServer;
use sqlx::SqlitePool;
use crate::features::roe::domain::*;

#[sqlx::test]
async fn test_create_roe_request(pool: SqlitePool) {
    // Setup: Create a test decision
    let decision_id = create_test_decision(&pool).await;
    
    // Test: Create ROE request
    let response = test_server
        .post(&format!("/api/roe/decisions/{}/request", decision_id))
        .json(&CreateROERequestRequest {
            decision_id: decision_id.clone(),
            approval_authority: Some("Higher HQ".to_string()),
            request_justification: "Target near civilians".to_string(),
            roe_reference: None,
            conditions: None,
        })
        .await;
    
    assert_eq!(response.status_code(), 201);
    let request: ROERequest = response.json();
    assert_eq!(request.decision_id, decision_id);
    assert_eq!(request.status, ROERequestStatus::Pending);
    
    // Verify decision ROE status updated
    let status_response = test_server
        .get(&format!("/api/roe/decisions/{}/status", decision_id))
        .await;
    
    let status: DecisionROEStatusResponse = status_response.json();
    assert_eq!(status.roe_status, Some("roe_pending_approval".to_string()));
}

#[sqlx::test]
async fn test_approve_roe_request(pool: SqlitePool) {
    // Setup: Create decision and ROE request
    let decision_id = create_test_decision(&pool).await;
    let request_id = create_test_roe_request(&pool, &decision_id).await;
    
    // Test: Approve ROE request
    let response = test_server
        .patch(&format!("/api/roe/requests/{}", request_id))
        .json(&UpdateROERequestStatusRequest {
            status: "approved".to_string(),
            approved_by: Some("approver-1".to_string()),
            rejection_reason: None,
            roe_reference: Some("ROE-2024-05".to_string()),
            expiration_date: Some("2026-02-01T00:00:00Z".to_string()),
            conditions: Some("Valid for 72 hours".to_string()),
        })
        .await;
    
    assert_eq!(response.status_code(), 200);
    let request: ROERequest = response.json();
    assert_eq!(request.status, ROERequestStatus::Approved);
    
    // Verify decision ROE status updated
    let status_response = test_server
        .get(&format!("/api/roe/decisions/{}/status", decision_id))
        .await;
    
    let status: DecisionROEStatusResponse = status_response.json();
    assert_eq!(status.roe_status, Some("roe_approved".to_string()));
}

#[sqlx::test]
async fn test_list_roe_requests_by_status(pool: SqlitePool) {
    // Setup: Create multiple ROE requests with different statuses
    create_test_roe_request_with_status(&pool, "pending").await;
    create_test_roe_request_with_status(&pool, "approved").await;
    create_test_roe_request_with_status(&pool, "pending").await;
    
    // Test: List pending requests
    let response = test_server
        .get("/api/roe/requests?status=pending")
        .await;
    
    assert_eq!(response.status_code(), 200);
    let requests: Vec<ROERequest> = response.json();
    assert_eq!(requests.len(), 2);
    assert!(requests.iter().all(|r| r.status == ROERequestStatus::Pending));
}
```

#### 4.2 Playwright E2E Tests

**File**: `frontend/tests/e2e/roe-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('ROE Workflow', () => {
  test('should display ROE status on decision card', async ({ page }) => {
    await page.goto('/smartops/');
    
    // Check for ROE badge on decision card
    const roeBadge = page.locator('[data-testid="decision-card"]').first()
      .locator('[data-testid="roe-badge"]');
    
    await expect(roeBadge).toBeVisible();
  });

  test('should show ROE section in decision analysis', async ({ page }) => {
    await page.goto('/smartops/');
    
    // Click on a decision
    await page.click('[data-testid="decision-card"]').first();
    
    // Check for ROE section
    const roeSection = page.locator('[data-testid="roe-status-section"]');
    await expect(roeSection).toBeVisible();
  });

  test('should create ROE request', async ({ page }) => {
    await page.goto('/smartops/');
    
    // Navigate to decision that requires ROE
    await page.click('text=Strike T-1002');
    
    // Click "Submit ROE Request" button
    await page.click('[data-testid="submit-roe-request"]');
    
    // Fill form
    await page.fill('[name="justification"]', 'Target near civilian infrastructure');
    await page.fill('[name="approval_authority"]', 'Higher HQ');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=ROE request submitted')).toBeVisible();
  });

  test('should block decision routing when ROE required', async ({ page }) => {
    await page.goto('/smartops/');
    
    // Check decision with ROE required
    const decisionCard = page.locator('[data-testid="decision-card"]')
      .filter({ hasText: 'ROE REQUIRED' });
    
    // Should show blocked status
    await expect(decisionCard.locator('text=BLOCKED')).toBeVisible();
    await expect(decisionCard.locator('text=Cannot route')).toBeVisible();
  });
});
```

**Tasks**:
- [ ] **Task ROE-E4.1**: Write API integration tests (2 days)
- [ ] **Task ROE-E4.2**: Write Playwright E2E tests (2 days)
- [ ] **Task ROE-E4.3**: Test ROE workflow end-to-end (1 day)

**Estimated Time**: 5 days

---

## Implementation Timeline

### Week 1 (5 days)

**Monday-Tuesday**: Enhancement 1 - ROE Determination Logic
- Day 1: Create determination service
- Day 2: Integrate with decision creation, add notes generation

**Wednesday**: Enhancement 1 - Testing
- Day 3: Unit tests for determination logic

**Thursday-Friday**: Enhancement 2 - Routing Integration
- Day 4: Update routing logic, add can_proceed flag
- Day 5: Update frontend to show blockers

### Week 2 (5 days)

**Monday-Tuesday**: Enhancement 3 - Unit Tests
- Day 1: Domain model tests
- Day 2: Determination service tests, achieve coverage

**Wednesday-Friday**: Enhancement 4 - Integration Tests
- Day 3: API integration tests
- Day 4: Playwright E2E tests
- Day 5: End-to-end workflow testing, bug fixes

**Total Estimated Time**: 10 days (2 weeks)

---

## Success Criteria

### Enhancement 1: ROE Determination
- ✅ Decisions automatically get ROE status on creation
- ✅ ROE notes auto-generated with reasons
- ✅ 90%+ accuracy in ROE determination
- ✅ Unit tests cover all determination scenarios

### Enhancement 2: Routing Integration
- ✅ Decisions blocked from routing if ROE required
- ✅ Decisions held if ROE pending
- ✅ Frontend clearly shows ROE blockers
- ✅ Integration tests verify blocking behavior

### Enhancement 3: Unit Tests
- ✅ 80%+ code coverage for ROE domain
- ✅ All business logic methods tested
- ✅ Edge cases covered

### Enhancement 4: Integration Tests
- ✅ All 7 API endpoints tested
- ✅ Complete ROE workflow tested (create → approve → proceed)
- ✅ Playwright tests cover user-facing flows
- ✅ All tests passing

---

## Dependencies

### Required Features
- ✅ Decisions feature module (for decision creation hooks)
- ✅ Decision routing service (for integration)
- ✅ Frontend decision components (for UI updates)

### Optional Features (Nice to Have)
- Entity lookup service (for cross-border detection)
- Geographic data service (for civilian proximity checks)
- Weapon type registry (for restricted weapons check)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| ROE determination logic too simplistic | Medium | High | Start with keyword-based, iterate based on feedback |
| False positives in ROE detection | Medium | Medium | Allow manual override, log all determinations |
| Routing integration breaks existing flow | Low | High | Comprehensive integration tests before merge |
| Performance impact of ROE checks | Low | Low | Cache determination results, async processing |

---

## Documentation Updates

After implementation:
- [x] Update `ROE_STATUS_FEATURE.md` with enhancement details ✅
- [x] Create `ROE_FRONTEND_VERIFICATION.md` with UI integration details ✅
- [x] Create completion documents for each enhancement ✅
- [ ] Update API documentation with new endpoints (in progress)
- [ ] Create user guide for ROE determination (optional)
- [ ] Update architecture diagrams (optional)

---

## Backlog Integration

These enhancements will be added to:
- **BACKLOG.md**: As new stories under appropriate Epic
- **TASKS_COORDINATOR.md**: As new work stream
- **WEEK_1_IMPLEMENTATION_PLAN.md**: If within Week 1 scope

---

**Status**: Plan ready for implementation  
**Next Step**: Review plan, prioritize enhancements, assign to sprints  
**Estimated Completion**: 2 weeks from start

_Version: 1.0_  
_Date: 2026-01-22_  
_Status: Plan complete, ready for implementation_
