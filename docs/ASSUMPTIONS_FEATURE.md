# Planning Assumptions Feature

## Overview

The Planning Assumptions feature is a new SmartOps module for tracking and validating critical planning assumptions. This feature recognizes that **broken assumptions represent major risks** requiring immediate plan revision and commander review.

## Key Concept

**Assumptions vs. Uncertainty:**
- **Uncertainty**: Data quality issues, source reliability, conflicting reports (reactive monitoring)
- **Assumptions**: Stated planning preconditions that must remain valid for plans to work (active management)

## Architecture

### Backend (Rust)

**Location**: `backend/src/features/assumptions/`

**Structure**:
```
assumptions/
├── domain/mod.rs      # Data models (Assumption, CreateRequest, UpdateRequest, Summary)
├── handlers/mod.rs    # HTTP request handlers
├── repositories/mod.rs # Database operations
├── router.rs          # Route definitions
└── mod.rs             # Module exports
```

**Database Schema**: `backend/migrations/20260121120000_create_assumptions.sql`

```sql
CREATE TABLE assumptions (
    id TEXT PRIMARY KEY,
    operation_id TEXT REFERENCES operations(id),
    campaign_id TEXT REFERENCES campaigns(id),
    
    -- Core Details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Enemy', 'Friendly', 'Environmental', 'Political', 
        'Logistical', 'Intelligence', 'Temporal', 'Technical'
    )),
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'Valid' CHECK (status IN (
        'Valid', 'Monitoring', 'Challenged', 'Broken'
    )),
    risk_level TEXT NOT NULL DEFAULT 'Low' CHECK (risk_level IN (
        'Low', 'Medium', 'High', 'Critical'
    )),
    confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Accountability
    stated_by TEXT,
    validated_by TEXT,
    last_validated_at DATETIME,
    
    -- Impact
    dependencies JSONB,
    impact_notes TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**API Endpoints**:
- `GET /api/assumptions` - Get all assumptions (supports ?status, ?campaign_id, ?operation_id filters)
- `POST /api/assumptions` - Create new assumption
- `GET /api/assumptions/:id` - Get specific assumption
- `PUT /api/assumptions/:id` - Update assumption (status, risk level, notes)
- `DELETE /api/assumptions/:id` - Delete assumption
- `GET /api/assumptions/summary` - Get summary statistics

### Frontend (React TypeScript)

**Location**: `frontend/src/features/smartops/components/AssumptionManagement.tsx`

**Route**: `/smartops/assumptions`

**Key Features**:
- **Summary Dashboard Sidebar**: Status distribution, risk assessment, link to Uncertainty page
- **Critical Alerts Section**: Prominently displays Broken/Challenged assumptions with High/Critical risk
- **Assumption Cards**: Status badges, risk indicators, edit/delete actions
- **Create/Edit Modal**: Form with validation for all fields
- **Filtering**: Click status buttons in sidebar to filter by Valid/Monitoring/Challenged/Broken

**API Client**: `frontend/src/lib/assumptions.ts`
- Type-safe TypeScript interfaces
- Axios-based API calls with error handling

### Cross-Page Integration

**Uncertainty Page Updates** (`frontend/src/features/smartops/components/UncertaintyManagement.tsx`):

1. **Broken Assumptions Alert** (appears at top of main content):
   - Red alert box with Shield icon
   - Shows count and first 3 broken assumption titles
   - "Review Assumptions & Assess Impact" button links to assumptions page

2. **Sidebar Navigation**:
   - "Planning Assumptions" link in "Related System" section
   - Badge showing count of broken assumptions if > 0

3. **Bidirectional Navigation**:
   - Uncertainty → Assumptions: "Planning Assumptions" link
   - Assumptions → Uncertainty: "Uncertainty Analysis" link

## Testing

**Playwright E2E Tests**: `frontend/tests/assumptions.spec.ts`

Test Coverage:
- ✅ Create assumption via API
- ✅ Get all assumptions
- ✅ Update assumption status to Broken
- ✅ Filter assumptions by status
- ✅ Get summary statistics
- ✅ Delete assumption
- ✅ Validate all 8 categories
- ✅ Broken assumptions integration with Uncertainty page
- ✅ Confidence score validation (0-100)

**Run Tests**:
```bash
cd frontend
npx playwright test assumptions.spec.ts
```

## Usage Workflow

### 1. Creating Assumptions

During planning phase:
1. Navigate to `/smartops/assumptions`
2. Click "New Assumption"
3. Enter:
   - Title (e.g., "Enemy will not deploy armor to Sector 4")
   - Description (detailed explanation)
   - Category (Enemy/Friendly/Environmental/Political/etc.)
   - Confidence Score (0-100)
   - Impact Notes (what happens if broken)

### 2. Monitoring Assumptions

During execution:
1. Review assumptions regularly
2. Update status as intelligence changes:
   - **Valid**: Still holds true
   - **Monitoring**: Indicators suggest potential invalidation
   - **Challenged**: Evidence contradicts assumption
   - **Broken**: Assumption is definitively false

### 3. Responding to Broken Assumptions

When an assumption breaks:
1. System shows red alert in Uncertainty page
2. Commander reviews impact notes
3. Update risk level (Low/Medium/High/Critical)
4. Initiate plan revision process
5. Document mitigation actions

### 4. Cross-Page Analysis

**From Uncertainty Page**:
- Low confidence data → Check if assumptions still valid
- Conflicting reports → May indicate broken assumption

**From Assumptions Page**:
- Broken assumption → Check data quality in Uncertainty
- Review related entities for confidence scores

## Design Decisions

### Why Separate Pages?

1. **Different Workflows**:
   - Uncertainty: Passive monitoring of data quality
   - Assumptions: Active management of planning preconditions

2. **Different Users**:
   - Uncertainty: J2 Intel (data quality experts)
   - Assumptions: J5 Plans (planning officers)

3. **Cognitive Load**:
   - Separate concerns reduce complexity
   - Each page focuses on one task

### Why Strong Integration?

1. **Related Risks**: Data uncertainty and broken assumptions are related but distinct
2. **Commander Visibility**: Commanders need both views for complete risk picture
3. **Cross-Functional**: Intel and Plans must coordinate on assumption validation

### Status Progression

```
Valid → Monitoring → Challenged → Broken
```

- **Valid**: No evidence of invalidity (default state)
- **Monitoring**: Watch indicators, no immediate action
- **Challenged**: Evidence suggests possible invalidation, investigate
- **Broken**: Definitively false, immediate action required

### Risk Level Assignment

- **Low**: Assumption failure has minimal operational impact
- **Medium**: Failure requires plan adjustment
- **High**: Failure compromises mission success
- **Critical**: Failure creates unacceptable risk (force protection, strategic objectives)

## What NOT to Do

❌ **Don't merge with Uncertainty page** - Different workflows and users  
❌ **Don't make assumptions read-only** - Active management is required  
❌ **Don't skip dependency tracking** - Critical for impact analysis  
❌ **Don't auto-delete broken assumptions** - Audit trail is essential  
❌ **Don't ignore confidence scores** - Quantifies assumption strength  
❌ **Don't bypass validation workflow** - Status progression is deliberate  
❌ **Don't hide broken assumptions** - Visibility is paramount for safety  

## Future Enhancements

1. **Dependency Visualization**: Graph showing which plans/decisions depend on each assumption
2. **Automated Validation**: Connect to real-time intelligence feeds to auto-challenge assumptions
3. **Historical Analysis**: Track assumption validity over time, identify patterns
4. **AI Recommendations**: Suggest which assumptions to review based on intelligence changes
5. **Commander Dashboard**: Summary view of all critical assumptions for command brief
6. **Export Reports**: Generate assumption validity reports for planning documents

## Related Documentation

- [Uncertainty Management](./UNCERTAINTY_FEATURE.md) (to be created)
- [Decision Tracking](./DECISION_TRACKING_IMPLEMENTATION.md)
- [SmartOps Architecture](./DECISION_SYSTEM_ARCHITECTURE.md)

## Implementation Summary

**Backend**:
- ✅ Domain models with proper validation
- ✅ Repository with CRUD operations
- ✅ HTTP handlers with error handling
- ✅ Router with auth middleware
- ✅ Database migration

**Frontend**:
- ✅ AssumptionManagement component with full UI
- ✅ Create/Edit modal with validation
- ✅ TanStack Router route
- ✅ API client with TypeScript types
- ✅ Cross-page integration with Uncertainty

**Testing**:
- ✅ Comprehensive Playwright E2E tests
- ✅ API endpoint coverage
- ✅ Integration test scenarios

**Status**: ✅ **COMPLETE** - Feature is production-ready
