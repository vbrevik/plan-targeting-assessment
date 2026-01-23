# Targeting Backend API Documentation

## Overview

Complete backend implementation for the Targeting feature in SmartOps. Provides RESTful APIs for target management, approval workflows, and Battle Damage Assessment (BDA) reporting.

**Status**: ✅ Implemented  
**Version**: 1.0  
**Date**: January 21, 2026

---

## Architecture

### Module Structure

```
backend/src/features/targeting/
├── mod.rs                  # Module declarations
├── domain/mod.rs          # Data models and types
├── repositories/mod.rs    # Database operations
├── handlers/mod.rs        # API request handlers
└── routes.rs              # Route definitions
```

### Database Tables

1. **`targets`** - Target entities and workflow
2. **`bda_reports`** - Battle Damage Assessment reports

Migration: `backend/migrations/20260121140000_create_targets.sql`

---

## Data Models

### Target

The core targeting entity representing a nominated target through the kill chain.

```rust
pub struct Target {
    // Identity
    pub id: String,
    pub designator: String,        // e.g. "T-1001" (unique)
    pub name: String,
    pub be_number: Option<String>, // Basic Encyclopedia Number
    
    // Context
    pub operation_id: Option<String>,
    pub campaign_id: Option<String>,
    
    // Classification
    pub category: String,          // "C2", "Logistics", "Airfield"
    pub cat_code: String,          // "12000"
    pub target_type: String,       // "Unit", "Facility", etc.
    
    // Location
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub altitude: Option<f64>,
    pub mgrs: Option<String>,      // Military Grid Reference System
    
    // Status & Workflow
    pub target_status: String,     // 'Identified', 'Nominated', 'Validated', 'Approved', 'Engaged', 'Neutralized'
    pub operational_status: String, // 'Active', 'Degraded', 'Destroyed', 'Inactive', 'Unknown'
    pub affiliation: String,       // 'Red', 'Blue', etc.
    pub priority: String,          // 'High', 'Medium', 'Low'
    
    // Effects
    pub desired_effect: String,    // "Neutralize", "Disrupt", "Delay"
    pub collateral_damage_estimate: String, // 'Low', 'Medium', 'High'
    
    // Kill Chain
    pub kill_chain_phase: String,  // 'Find', 'Fix', 'Track', 'Target', 'Engage', 'Assess'
    
    // Personnel
    pub nominated_by_id: String,
    pub validated_by_id: Option<String>,
    pub approved_by_id: Option<String>,
    
    // ROE
    pub required_roe_id: Option<String>,
    pub roe_constraints: Option<Json<Value>>, // Array of constraints
    
    // Assessment
    pub bda_status: Option<String>,        // 'None', 'Assess', 'Re-strike', 'Effect Achieved', 'Monitor'
    pub assessment_status: Option<String>, // 'Pending Imagery', 'Initial', 'Supplemental', 'Final'
    
    // Metadata
    pub description: Option<String>,
    pub target_folder_url: Option<String>,
    pub uncertainty: Option<f64>,          // 0.0 to 1.0
    pub last_verified: Option<DateTime<Utc>>,
    
    // Validity
    pub valid_from: Option<DateTime<Utc>>,
    pub valid_until: Option<DateTime<Utc>>,
    
    // Timestamps
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
```

### BDAReport

Battle Damage Assessment report for post-strike analysis.

```rust
pub struct BDAReport {
    pub id: String,
    pub target_id: String,
    pub operation_id: Option<String>,
    
    // Strike Details (JSON)
    pub strikes: Option<Json<Value>>, // [{ timeOnTarget, weaponSystem, munition, impactCoordinates }]
    
    // Damage Assessment
    pub physical_damage: String,       // 'None', 'Light', 'Moderate', 'Severe', 'Destroyed'
    pub functional_damage: String,     // 'None', 'Degraded', 'Non-Mission Capable'
    pub collateral_damage_reported: bool,
    
    // Assessment
    pub recommendation: String,        // 'Re-strike', 'Effect Achieved', 'Monitor'
    pub confidence: f64,               // 0.0 to 1.0
    pub notes: Option<String>,
    
    // Metadata
    pub assessor_id: String,
    pub status: String,                // 'Draft', 'Submitted', 'Approved'
    pub assessment_type: String,       // 'Initial', 'Supplemental', 'Final'
    pub image_url: Option<String>,
    
    pub submitted_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
```

### TargetSummary

Aggregated statistics for targeting dashboard.

```rust
pub struct TargetSummary {
    pub total: i64,
    pub identified: i64,
    pub nominated: i64,
    pub validated: i64,
    pub approved: i64,
    pub engaged: i64,
    pub neutralized: i64,
    pub high_priority: i64,
    pub pending_approval: i64,  // Validated but not yet approved
    pub require_bda: i64,        // bda_status = 'Assess'
}
```

---

## API Endpoints

### Base URL

All targeting endpoints are under:
```
/api/targeting
```

**Authentication**: Required (JWT)  
**CSRF Protection**: Enabled

---

## Target Management

### 1. Create Target

**POST** `/api/targeting/targets`

Nominate a new target for the targeting workflow.

#### Request Body

```json
{
  "operation_id": "uuid",
  "campaign_id": "uuid",
  "designator": "T-1001",
  "name": "Enemy Command Center",
  "be_number": "BE-12345",
  "category": "C2",
  "cat_code": "12000",
  "target_type": "Facility",
  "latitude": 35.6892,
  "longitude": 51.3890,
  "altitude": 1200.0,
  "mgrs": "38SNC1234567890",
  "affiliation": "Red",
  "priority": "High",
  "desired_effect": "Neutralize",
  "collateral_damage_estimate": "Low",
  "nominated_by_id": "user-uuid",
  "required_roe_id": "roe-uuid",
  "roe_constraints": ["No civilians within 500m", "Daylight only"],
  "description": "Primary enemy command facility",
  "target_folder_url": "https://..."
}
```

#### Response

**201 Created**

```json
{
  "id": "target-uuid",
  "designator": "T-1001",
  "name": "Enemy Command Center",
  "target_status": "Nominated",
  "operational_status": "Unknown",
  "kill_chain_phase": "Find",
  "created_at": "2026-01-21T14:30:00Z",
  "updated_at": "2026-01-21T14:30:00Z",
  ...
}
```

---

### 2. Get Targets

**GET** `/api/targeting/targets`

Retrieve all targets with optional filtering.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `operation_id` | String | Filter by operation |
| `campaign_id` | String | Filter by campaign |
| `target_status` | String | Filter by status (Nominated, Validated, etc.) |
| `priority` | String | Filter by priority (High, Medium, Low) |
| `kill_chain_phase` | String | Filter by phase (Find, Fix, Track, etc.) |

#### Examples

```bash
# All targets
GET /api/targeting/targets

# High priority targets
GET /api/targeting/targets?priority=High

# Targets pending approval
GET /api/targeting/targets?target_status=Validated

# Targets in Engage phase
GET /api/targeting/targets?kill_chain_phase=Engage

# Operation-specific targets
GET /api/targeting/targets?operation_id=op-123
```

#### Response

**200 OK**

```json
[
  {
    "id": "target-uuid",
    "designator": "T-1001",
    "name": "Enemy Command Center",
    "target_status": "Nominated",
    "priority": "High",
    "kill_chain_phase": "Find",
    ...
  },
  ...
]
```

---

### 3. Get Target by ID

**GET** `/api/targeting/targets/:id`

Retrieve detailed information for a specific target.

#### Response

**200 OK** - Full target object  
**404 Not Found** - Target doesn't exist

---

### 4. Update Target

**PUT** `/api/targeting/targets/:id`

Update target details or advance through the workflow.

#### Request Body (All fields optional)

```json
{
  "name": "Updated Target Name",
  "target_status": "Validated",
  "validated_by_id": "user-uuid",
  "priority": "High",
  "kill_chain_phase": "Fix",
  "bda_status": "Assess",
  "uncertainty": 0.2
}
```

#### Common Update Scenarios

**Validate Target** (J2 Intelligence):
```json
{
  "target_status": "Validated",
  "validated_by_id": "j2-user-uuid",
  "uncertainty": 0.1
}
```

**Approve Target** (Commander):
```json
{
  "target_status": "Approved",
  "approved_by_id": "commander-uuid",
  "kill_chain_phase": "Target"
}
```

**Update After Strike** (Targeting Cell):
```json
{
  "target_status": "Engaged",
  "kill_chain_phase": "Assess",
  "bda_status": "Assess"
}
```

#### Response

**200 OK** - Updated target object  
**404 Not Found** - Target doesn't exist

---

### 5. Delete Target

**DELETE** `/api/targeting/targets/:id`

Delete a target from the system.

#### Response

**204 No Content** - Successfully deleted  
**404 Not Found** - Target doesn't exist

---

### 6. Get Target Summary

**GET** `/api/targeting/targets/summary`

Get aggregated statistics for the targeting dashboard.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `operation_id` | String | Filter by operation |
| `campaign_id` | String | Filter by campaign |

#### Response

**200 OK**

```json
{
  "total": 42,
  "identified": 5,
  "nominated": 12,
  "validated": 8,
  "approved": 6,
  "engaged": 7,
  "neutralized": 4,
  "high_priority": 15,
  "pending_approval": 8,
  "require_bda": 3
}
```

---

## BDA (Battle Damage Assessment)

### 7. Create BDA Report

**POST** `/api/targeting/bda`

Submit a new Battle Damage Assessment report.

#### Request Body

```json
{
  "target_id": "target-uuid",
  "operation_id": "op-uuid",
  "strikes": [
    {
      "timeOnTarget": "2026-01-21T15:00:00Z",
      "weaponSystem": "F-16",
      "munition": "GBU-12",
      "impactCoordinates": "35.6892, 51.3890"
    }
  ],
  "physical_damage": "Severe",
  "functional_damage": "Non-Mission Capable",
  "collateral_damage_reported": false,
  "recommendation": "Effect Achieved",
  "confidence": 0.85,
  "notes": "Direct hit on command building. Secondary explosions observed.",
  "assessor_id": "analyst-uuid",
  "assessment_type": "Initial",
  "image_url": "https://..."
}
```

#### Response

**201 Created**

```json
{
  "id": "bda-uuid",
  "target_id": "target-uuid",
  "status": "Draft",
  "physical_damage": "Severe",
  "functional_damage": "Non-Mission Capable",
  "recommendation": "Effect Achieved",
  "confidence": 0.85,
  "submitted_at": "2026-01-21T15:30:00Z",
  "created_at": "2026-01-21T15:30:00Z",
  ...
}
```

---

### 8. Get BDA Reports

**GET** `/api/targeting/bda`

Retrieve all BDA reports with optional filtering by target.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target_id` | String | Filter by target |

#### Examples

```bash
# All BDA reports
GET /api/targeting/bda

# Reports for specific target
GET /api/targeting/bda?target_id=target-123
```

#### Response

**200 OK**

```json
[
  {
    "id": "bda-uuid",
    "target_id": "target-uuid",
    "physical_damage": "Severe",
    "functional_damage": "Non-Mission Capable",
    "recommendation": "Effect Achieved",
    "status": "Submitted",
    ...
  },
  ...
]
```

---

### 9. Get BDA Report by ID

**GET** `/api/targeting/bda/:id`

Retrieve a specific BDA report.

#### Response

**200 OK** - Full BDA report object  
**404 Not Found** - Report doesn't exist

---

### 10. Update BDA Report

**PUT** `/api/targeting/bda/:id`

Update an existing BDA report (typically to approve or revise).

#### Request Body (All fields optional)

```json
{
  "physical_damage": "Destroyed",
  "functional_damage": "Non-Mission Capable",
  "recommendation": "Effect Achieved",
  "confidence": 0.95,
  "status": "Approved",
  "notes": "Updated after supplemental imagery review"
}
```

#### Response

**200 OK** - Updated BDA report  
**404 Not Found** - Report doesn't exist

---

### 11. Delete BDA Report

**DELETE** `/api/targeting/bda/:id`

Delete a BDA report (typically only for drafts).

#### Response

**204 No Content** - Successfully deleted  
**404 Not Found** - Report doesn't exist

---

## Workflow Integration

### Targeting Kill Chain

The targeting feature supports the full F2T2EA (Find, Fix, Track, Target, Engage, Assess) kill chain:

```
1. FIND (Intelligence)
   └─> Target created with status='Nominated', phase='Find'

2. FIX (Intelligence Validation)
   └─> Update: target_status='Validated', phase='Fix', validated_by_id=<j2-user>

3. TRACK (Monitoring)
   └─> Update: phase='Track', uncertainty=<low>

4. TARGET (Commander Approval)
   └─> Update: target_status='Approved', phase='Target', approved_by_id=<cdr>

5. ENGAGE (Strike Execution)
   └─> Update: target_status='Engaged', phase='Engage'

6. ASSESS (BDA)
   └─> Create BDA Report
   └─> Update: phase='Assess', bda_status='Assess'
   └─> If re-strike: target_status='Nominated', phase='Target'
   └─> If success: target_status='Neutralized'
```

### Role-Based Workflows

| Role | Can Nominate | Can Validate | Can Approve | Can BDA |
|------|--------------|--------------|-------------|---------|
| **Targeting Cell** | ✅ | ❌ | ❌ | ✅ |
| **J2 Intelligence** | ✅ | ✅ | ❌ | ❌ |
| **Commander** | ✅ | ✅ | ✅ | ❌ |
| **J3 Operations** | ❌ | ❌ | ❌ | ❌ |
| **Analyst** | ❌ | ❌ | ❌ | ✅ (view only) |

---

## Database Schema

### Targets Table

```sql
CREATE TABLE targets (
    id TEXT PRIMARY KEY,
    operation_id TEXT,
    campaign_id TEXT,
    
    -- Identification
    designator TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    be_number TEXT,
    
    -- Classification
    category TEXT NOT NULL,
    cat_code TEXT NOT NULL,
    target_type TEXT NOT NULL,
    
    -- Location
    latitude REAL,
    longitude REAL,
    altitude REAL,
    mgrs TEXT,
    
    -- Status & Workflow
    target_status TEXT NOT NULL DEFAULT 'Nominated',
    operational_status TEXT NOT NULL DEFAULT 'Unknown',
    affiliation TEXT NOT NULL,
    priority TEXT NOT NULL,
    
    -- Effects
    desired_effect TEXT NOT NULL,
    collateral_damage_estimate TEXT NOT NULL DEFAULT 'Low',
    
    -- Kill Chain
    kill_chain_phase TEXT NOT NULL DEFAULT 'Find',
    
    -- Personnel
    nominated_by_id TEXT NOT NULL,
    validated_by_id TEXT,
    approved_by_id TEXT,
    
    -- ROE
    required_roe_id TEXT,
    roe_constraints TEXT, -- JSON
    
    -- Assessment
    bda_status TEXT,
    assessment_status TEXT,
    
    -- Metadata
    description TEXT,
    target_folder_url TEXT,
    uncertainty REAL,
    last_verified TEXT,
    
    -- Validity
    valid_from TEXT,
    valid_until TEXT,
    
    -- Timestamps
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
```

### BDA Reports Table

```sql
CREATE TABLE bda_reports (
    id TEXT PRIMARY KEY,
    target_id TEXT NOT NULL,
    operation_id TEXT,
    
    strikes TEXT, -- JSON
    
    physical_damage TEXT NOT NULL,
    functional_damage TEXT NOT NULL,
    collateral_damage_reported INTEGER NOT NULL DEFAULT 0,
    
    recommendation TEXT NOT NULL,
    confidence REAL NOT NULL,
    notes TEXT,
    
    assessor_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    assessment_type TEXT NOT NULL,
    image_url TEXT,
    
    submitted_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE,
    FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Target indexes for efficient querying
CREATE INDEX idx_targets_operation ON targets(operation_id);
CREATE INDEX idx_targets_campaign ON targets(campaign_id);
CREATE INDEX idx_targets_status ON targets(target_status);
CREATE INDEX idx_targets_priority ON targets(priority);
CREATE INDEX idx_targets_kill_chain ON targets(kill_chain_phase);
CREATE INDEX idx_targets_pending_approval ON targets(target_status) WHERE target_status = 'Validated';
CREATE INDEX idx_targets_high_priority ON targets(priority, target_status) WHERE priority = 'High';
CREATE INDEX idx_targets_bda_required ON targets(bda_status) WHERE bda_status = 'Assess';

-- BDA indexes
CREATE INDEX idx_bda_target ON bda_reports(target_id);
CREATE INDEX idx_bda_operation ON bda_reports(operation_id);
CREATE INDEX idx_bda_status ON bda_reports(status);
CREATE INDEX idx_bda_target_status ON bda_reports(target_id, status);
```

---

## Integration Points

### With Assumptions Feature

- Broken assumptions can trigger target re-validation
- Update target `uncertainty` based on assumption status

### With ROE Feature

- Targets link to required ROE via `required_roe_id`
- Store ROE constraints in `roe_constraints` JSON field

### With Operations Feature

- Targets associated with operations via `operation_id`
- Cascade delete when operation is removed

### With User Management

- Track nomination, validation, approval via user IDs
- Audit trail for all target updates

---

## Example Usage Scenarios

### Scenario 1: Nominate and Approve Target

```bash
# 1. Targeting Cell nominates target
POST /api/targeting/targets
{
  "designator": "T-2001",
  "name": "Enemy Radar Site",
  "category": "Air Defense",
  "priority": "High",
  "nominated_by_id": "tc-user-123",
  ...
}

# 2. J2 validates target
PUT /api/targeting/targets/target-uuid
{
  "target_status": "Validated",
  "validated_by_id": "j2-user-456",
  "uncertainty": 0.05
}

# 3. Commander approves target
PUT /api/targeting/targets/target-uuid
{
  "target_status": "Approved",
  "approved_by_id": "cdr-user-789",
  "kill_chain_phase": "Target"
}
```

### Scenario 2: Strike and BDA

```bash
# 1. Target engaged (after strike)
PUT /api/targeting/targets/target-uuid
{
  "target_status": "Engaged",
  "kill_chain_phase": "Assess",
  "bda_status": "Assess"
}

# 2. Analyst submits initial BDA
POST /api/targeting/bda
{
  "target_id": "target-uuid",
  "physical_damage": "Moderate",
  "functional_damage": "Degraded",
  "recommendation": "Monitor",
  "confidence": 0.70,
  "assessment_type": "Initial",
  "assessor_id": "analyst-123"
}

# 3. After supplemental imagery, update BDA
PUT /api/targeting/bda/bda-uuid
{
  "physical_damage": "Severe",
  "functional_damage": "Non-Mission Capable",
  "recommendation": "Effect Achieved",
  "confidence": 0.90,
  "status": "Approved"
}

# 4. Mark target as neutralized
PUT /api/targeting/targets/target-uuid
{
  "target_status": "Neutralized",
  "bda_status": "Effect Achieved"
}
```

### Scenario 3: Re-strike Required

```bash
# 1. BDA indicates re-strike needed
PUT /api/targeting/bda/bda-uuid
{
  "recommendation": "Re-strike",
  "status": "Approved"
}

# 2. Move target back to targeting phase
PUT /api/targeting/targets/target-uuid
{
  "target_status": "Approved",
  "kill_chain_phase": "Target",
  "bda_status": "Re-strike"
}

# (Repeat strike and BDA process)
```

---

## Error Handling

All endpoints return standard HTTP status codes and JSON error responses:

```json
{
  "error": "Descriptive error message"
}
```

### Common Status Codes

- **200 OK** - Successful GET/PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

---

## Testing

### Unit Tests

```bash
cd backend
cargo test targeting
```

### Integration Tests

```bash
# Start backend
cd backend && cargo run

# Test target creation
curl -X POST http://localhost:3000/api/targeting/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "designator": "T-TEST-001",
    "name": "Test Target",
    "category": "Test",
    "cat_code": "99999",
    "target_type": "Facility",
    "affiliation": "Red",
    "priority": "Low",
    "desired_effect": "Test",
    "collateral_damage_estimate": "Low",
    "nominated_by_id": "test-user"
  }'

# Get all targets
curl http://localhost:3000/api/targeting/targets \
  -H "Authorization: Bearer <token>"

# Get summary
curl http://localhost:3000/api/targeting/targets/summary \
  -H "Authorization: Bearer <token>"
```

---

## Future Enhancements

### Phase 2 Features

1. **Collection Management**
   - Link ISR collection requests to targets
   - Track collection status (Planned → Tasked → Completed)

2. **Strike Analysis**
   - Weaponeering calculations
   - Collateral damage estimation (CDE)
   - Strike package generation

3. **Target Systems**
   - Group targets into systems (e.g., IADS)
   - System-level targeting strategies

4. **Activity Logging**
   - Pattern of life analysis
   - Optimal strike timing

5. **Advanced Workflows**
   - Multi-step approval chains
   - Legal review integration
   - ROE compliance checks

---

## Related Documentation

- **Frontend Integration**: See `frontend/src/lib/smartops/services/targeting.service.ts`
- **Targeting Workbench**: Being developed by other agents
- **BDA Workbench**: Being developed by other agents
- **Role Capabilities**: `docs/ROLE_CAPABILITIES_MATRIX.md`

---

**Status**: ✅ Backend Complete  
**Next Steps**: Frontend integration with targeting workbench  
**Maintainer**: Backend Team  
**Last Updated**: January 21, 2026
