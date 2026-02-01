# AI Agent Instructions for MshnCtrl Codebase

## 🎯 Project Overview
**MshnCtrl** is a military Command & Control (C2) dashboard for NATO targeting operations, BDA workbench, and ontology-driven information management. Production-ready features coexist with substantial POCs and high-fidelity frontend mocks.

**Tech Stack:** Rust (Axum/SQLx/SQLite) backend + React 19 (TypeScript/Vite/TanStack Router) frontend.

---

## 🏗️ Architecture Pattern: Feature-Based Modularity

Both backend and frontend follow **feature-based structure** with clear boundaries:

### Backend Features (`backend/src/features/`)
Each feature contains:
- `domain/` - Data models and business logic
- `handlers/` - HTTP request handlers (Axum)
- `repositories/` - Database access layer
- `services/` - Business services (composed in handlers)
- `mod.rs` - Feature module definition

**Core Features:**
- `auth/` - JWT authentication with RSA keys (auto-generated on startup)
- `targeting/` - NATO COPD targeting cell workflows
- `bda/` - Battle damage assessment reporting lifecycle
- `ontology/` - Graph-based entity/relationship information management
- `abac/` - Attribute-Based Access Control (permissions system)
- `navigation/` - Dynamic UI navigation metadata

**Pattern Example:** When adding a feature, create the directory structure above, define types in `domain/mod.rs`, implement DB queries in `repositories/`, and wire handlers into `mod.rs` router.

### Frontend Features (`frontend/src/features/`)
Each feature contains:
- Components (React functional components with hooks)
- `hooks/` - Custom data-fetching and state hooks
- `services/` - API integration layer
- Route definitions (TanStack Router file-based)

**Key Integration Point:** Frontend services call backend `/api/{feature}/*` endpoints; types defined in `frontend/src/lib/smartops/types.ts`.

---

## � Data Model Architecture

### Core Ontology: The "Everything is an Entity" Pattern

MshnCtrl uses a **unified knowledge graph** where diverse data (targets, units, assumptions, BDA reports, ISR platforms) are normalized into two core tables:

**1. `entities` table (Nodes):**
```sql
-- All domain objects become entities
CREATE TABLE entities (
    id TEXT PRIMARY KEY,
    type TEXT,  -- 'TARGET', 'UNIT', 'ASSUMPTION', 'BDA_REPORT', 'ISR_PLATFORM', etc.
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    properties JSONB,  -- Type-specific fields stored as JSON
    classification TEXT,
    confidence REAL,   -- 0.0 to 1.0 (Trusted Data Layer)
    created_at DATETIME,
    updated_at DATETIME
);
```

**2. `entity_relationships` table (Edges):**
```sql
CREATE TABLE entity_relationships (
    source_id TEXT,
    target_id TEXT,
    relation_type TEXT,  -- 'TARGETS', 'ASSESSES', 'COMMANDS', 'IMPACTS', 'DEPENDS_ON'
    properties JSONB,    -- Relationship metadata (probability, weight, etc.)
    PRIMARY KEY (source_id, target_id, relation_type)
);
```

**Why this design:**
- **Schema flexibility:** New entity types don't require new tables
- **Knowledge graph queries:** Find all relationships affecting a target with `WHERE target_id = ?`
- **Temporal reasoning:** Store `valid_from`/`valid_until` for temporal validity
- **Trusted data layer:** `confidence` scores enable uncertainty tracking

### Feature-Specific Models

#### Targeting Cell (NATO COPD)
**Tables:** `targets`, `dtl_entries`, `isr_platforms`, `intelligence_reports`, `strike_platforms`, `risk_assessments`, `assumption_challenges`

**Key Types** (`backend/src/features/targeting/domain/mod.rs`):
- `Target` - Core targeting object with F3EAD stage (FIND → FIX → FINISH → EXPLOIT → ANALYZE → DISSEMINATE)
- `DtlEntry` - Dynamic Target List entry with priority/feasibility scoring
- `RiskAssessment` - Fratricide, political sensitivity, legal review, collateral concern

**Data Flow:**
```
Target → ISR Platforms (collection) → Intelligence Reports (fusion)
       → Risk Assessments (legal/political) → Strike Platforms (execution)
       → DTL Entries (prioritization)
```

**Frontend Types** (`frontend/src/lib/mshnctrl/types.ts`):
- `DecisionGate` - Operational status (Green/Yellow/Red) with caveats
- `Target` - Subset of backend model, includes classification

#### Battle Damage Assessment (BDA)
**Tables:** `bda_reports`, `bda_imagery`, `bda_strike_correlations`, `bda_component_assessments`, `bda_peer_reviews`, `bda_report_distributions`

**Core Enums** (`backend/src/features/bda/domain/bda_report.rs`):
```rust
PhysicalDamage: ND (No Damage) | SD (Slight) | MD (Moderate) | SVD (Severe) | D (Destroyed)
FunctionalDamage: FMC (Fully Mission Capable) | PMC (Partially) | NMC (Not Capable)
AssessmentType: Initial (0-24h) | Interim (24-72h) | Final (72h+)
Recommendation: EffectAchieved | Monitor | ReAttack | ReWeaponeer
```

**Report Lifecycle:**
```
BDA Created (Initial) → Component Assessment → Peer Review → Distribution → History Tracking
```

**Relations:**
- BDA Report → Target (`ASSESSES`)
- BDA Report → Strike (`VALIDATES`)
- BDA Report → Imagery (`INCLUDES`)

#### Ontology/Information Management
**Core Table:** `entities` + `entity_relationships` (unified)

**Specialized Types:**
- `Unit` - Military organizational hierarchy
- `Facility` - Infrastructure nodes
- `PoliticalStatement` - Command directives
- `CCIR` (Commander's Critical Information Requirement) - Info dependencies

**Relations:**
- Unit → Target (`COMMANDS`, `TARGETS`)
- Entity → CCIR (`SATISFIES`)
- ISR Platform → Target (`MONITORS`)

### Sync Triggers: Maintaining Ontology Consistency

Legacy feature tables (targets, bda_reports, isr_platforms) have **automatic sync triggers** that keep the unified `entities` table up-to-date:

```sql
-- Example: When targets table changes, entities table is auto-synced
CREATE TRIGGER tr_targets_sync_insert AFTER INSERT ON targets
BEGIN
    INSERT INTO entities (id, type, name, properties, ...)
    VALUES (NEW.id, 'TARGET', NEW.name, json_object(...), ...);
END;
```

**Pattern:** If modifying legacy tables, sync triggers handle `entities` automatically. **Never manually update entities for synced types.**

### Classification & Permissions

**Classification Levels:**
```typescript
enum ClassificationLevel {
    UNCLASS, CUI, SECRET, TOP_SECRET, TS_SCI
}
```

**ABAC Enforcement:**
- Handlers check: `abac_service.check_permission(user, action, resource, classification)`
- Frontend receives `permissions` array in auth response
- UI gates on permissions, but **backend always validates**

### Database State Inspection

**Common queries:**
```bash
# List all entities by type
sqlite3 backend/data/app.db "SELECT type, COUNT(*) FROM entities GROUP BY type;"

# Find relationships for a target
sqlite3 backend/data/app.db "SELECT relation_type FROM entity_relationships WHERE target_id = 'abc123';"

# Check BDA report status
sqlite3 backend/data/app.db "SELECT id, status, created_at FROM bda_reports ORDER BY created_at DESC LIMIT 10;"

# Inspect a target's properties (JSON)
sqlite3 backend/data/app.db ".mode line" "SELECT properties FROM entities WHERE type='TARGET' LIMIT 1;"
```

---
## 🔄 Data Flow Patterns & Integration Points

### Request-Response Flow

**Typical API Request Lifecycle:**
```
1. Frontend Component calls hook (e.g., useGetTargets())
2. Hook sends HTTP request: GET /api/targeting/targets
3. Backend Handler receives → extracts auth from middleware
4. Handler calls ABAC service: check_permission(user, "read", "targets")
5. Handler queries Repository → Repository uses SQLx to query database
6. Repository returns Rust domain objects (FromRow derived)
7. Handler converts to Response DTO (Serialize derived)
8. Handler returns JSON response with HTTP status
9. Frontend hook receives response → updates component state
10. Component re-renders with new data
```

### Entity Synchronization Pattern

When you **modify a legacy table** (targets, bda_reports, isr_platforms):
1. SQL trigger fires automatically on INSERT/UPDATE/DELETE
2. Trigger inserts/updates corresponding `entities` row
3. Trigger may also create `entity_relationships` rows
4. Frontend queries can then use the unified ontology

**Example:** Insert target into `targets` table → `tr_targets_sync_insert` trigger fires → `entities` table gets new row with type='TARGET' and properties JSON containing target-specific data.

### Querying the Ontology

**Find all targets being assessed by BDA reports:**
```sql
SELECT e.* FROM entities e
JOIN entity_relationships r ON r.target_id = e.id
WHERE e.type = 'TARGET' AND r.relation_type = 'ASSESSES'
GROUP BY e.id;
```

**Find all ISR platforms tasked with monitoring a target:**
```sql
SELECT e.* FROM entities e
JOIN entity_relationships r ON r.source_id = e.id
WHERE r.target_id = 'target-123' AND r.relation_type = 'MONITORS';
```

### Type Consistency: Backend → Frontend

**Single Source of Truth Pattern:**
- Backend defines Rust types in `backend/src/features/{feature}/domain/*.rs`
- Backend exports JSON via HTTP endpoints (Serialize derived)
- Frontend consumes via TypeScript types in `frontend/src/lib/mshnctrl/types.ts`
- **Important:** If backend model changes, update both the Rust type AND the TypeScript type

**Example:** Adding `f3ead_stage` to targets:
1. Update `backend/src/features/targeting/domain/mod.rs` - add field to `Target` struct
2. Create migration to add `f3ead_stage` column to `targets` table
3. Update `frontend/src/lib/mshnctrl/types.ts` - add field to `Target` interface
4. Frontend components can now access the new field

---
## �🔐 Authentication & Access Control

### JWT Authentication Flow
1. **Key Generation:** RSA keys auto-generated in `backend/utils/jwt_keys.rs` on first run
2. **Token Storage:** HTTP-only cookies (secure, not vulnerable to XSS)
3. **Key Rotation:** 90-day rotation configured; keys in `backend/keys/` directory
4. **Middleware:** `backend/src/middleware/auth.rs` extracts and validates tokens

**For Testing:** Use credentials `targeting_cell@test.mil` / `TargetingCell2026!` (seeded via `backend/seed_meetings.sql`)

### ABAC Permission System
- **Model:** Action (read/write/delete) + Subject (user/role) + Attribute (resource/scope)
- **Location:** `backend/src/features/abac/`
- **Usage:** Backend handlers call `abac_service.check_permission()` before operations
- **Frontend:** Permissions array returned with auth response; drives UI visibility

**Pattern:** When building new features requiring permissions, define action constants in `abac/domain/` and check in handlers.

---

## 🚀 Developer Workflow

### Quick Start (3 Terminal Setup)
```bash
# Terminal 1: Backend (port 3000)
cd backend && cargo run

# Terminal 2: Frontend (port 5173)
cd frontend && npm run dev

# Terminal 3: Testing
cd frontend && npx playwright test --ui
```

### Database
- **Type:** SQLite (file-based at `backend/data/app.db`)
- **Migrations:** Automatic on backend startup from `backend/migrations/`
- **Access:** `sqlite3 backend/data/app.db` for direct inspection

### Testing Strategy
1. **Unit Tests:** `cargo test` (backend), `npm run test` (frontend/vitest)
2. **E2E Tests:** `npx playwright test` (Playwright, runs against live backend)
3. **Integration Tests:** `./test_integration.sh` (shell script testing API endpoints)
4. **CI Status:** Intentionally disabled; all testing must pass locally

**Key Test Files:** `frontend/tests/*.spec.ts` for E2E; examples in `targeting-workbench-integration.spec.ts`

---

## 📡 API Structure & Data Flow

### Backend Routes
**Base:** `http://localhost:3000/api/`

- `/auth/*` - Login, token refresh, user info
- `/targeting/*` - NATO COPD JTB/CDE/Nominations workflows
- `/bda/*` - Report management, component assessment, annotations
- `/ontology/*` - Entity/relationship CRUD, RFI/task management
- `/users/*` - User CRUD and administration
- `/abac/*` - Permission queries
- `/navigation/*` - Dynamic navigation menu structure
- `/discovery/*` - OpenAPI-like endpoint listing (debug tool)

### Frontend Routes
**Base:** `http://localhost:5173/smartops/`

- `/targeting/*` - Targeting cell dashboard and workbenches
- `/bda/*` - BDA workbench workflows
- `/operations/*` - Operations dashboard
- `/intelligence/*` - Intelligence management
- `/admin/*` - Admin panels (user management)
- `/decisions/*` - Decision tracking (frontend mock, no backend)

---

## 🎯 Feature-Specific Patterns

### Adding a Backend Feature
1. Create `backend/src/features/{feature_name}/` with domain/handlers/repositories/services structure
2. Define domain types in `domain/mod.rs` with SQLx derives (`#[sqlx(...)]`)
3. Implement database queries in `repositories/` using SQLx macros
4. Wire routes in `handlers/` using Axum's `Router` and middlewares
5. Add to `backend/src/features/mod.rs` router: `router.nest("/feature_name", routes::feature_name::routes())`
6. Create migrations in `backend/migrations/` if adding tables

**Error Handling:** Use `thiserror` for custom errors; convert to HTTP responses with status codes in handlers.

### Adding a Frontend Component
1. Create `frontend/src/features/{feature_name}/` with components and hooks
2. Define TypeScript types in `frontend/src/lib/smartops/types.ts` (shared types file)
3. Implement custom hooks in `hooks/` to fetch data from backend API
4. Create React components consuming hooks
5. Add TanStack Router route in `frontend/src/routes/` (file-based routing)
6. Import and link in layout/navigation

**State Management:** Use React hooks + custom hooks for API integration; no global state manager (by design).

---

## 🛠️ Critical Developer Commands

| Task | Command | Notes |
|------|---------|-------|
| Backend startup | `cd backend && cargo run` | Port 3000; logs set by `RUST_LOG` env var |
| Frontend startup | `cd frontend && npm run dev` | Port 5173; auto-reload on file change |
| Backend build | `cargo build --release` | Creates optimized binary in `target/release/` |
| Database inspect | `sqlite3 backend/data/app.db` | Query tables, check schema |
| Run E2E tests | `cd frontend && npx playwright test` | Requires backend running |
| Enable debug logging | `RUST_LOG=debug cargo run` | Shows SQL, auth, middleware details |
| Docker full stack | `docker-compose up --build` | Builds and runs both services |

---

## 📚 Key Files Reference

### Backend Essentials
- `backend/src/main.rs` - App entry, router setup, middleware chain
- `backend/src/features/auth/handlers.rs` - JWT token generation logic
- `backend/src/features/abac/domain.rs` - Permission model definition
- `backend/src/middleware/auth.rs` - Token extraction and validation
- `backend/migrations/` - SQL schema definitions (auto-applied)

### Data Model Files
**Ontology/Entities:**
- `backend/migrations/20260110150000_init_mshnctrl_core.sql` - Unified `entities` & `entity_relationships` tables
- `backend/migrations/20260123083000_unify_data_ontology.sql` - Sync triggers for legacy → ontology mapping

**Targeting:**
- `backend/src/features/targeting/domain/mod.rs` - Target, DTL, Risk Assessment types
- `backend/migrations/20260121160000_add_nato_copd_tables.sql` - Full NATO COPD schema (targets, ISR, strike platforms)

**BDA:**
- `backend/src/features/bda/domain/bda_report.rs` - PhysicalDamage, FunctionalDamage, Recommendation enums
- `backend/src/features/bda/domain/component_assessment.rs` - Component damage modeling
- `backend/migrations/20260121171000_create_bda_workbench.sql` - BDA tables

**Frontend Types:**
- `frontend/src/lib/mshnctrl/types.ts` - Comprehensive TypeScript models; **single source of truth** (1460+ lines)

### Frontend Essentials
- `frontend/src/main.tsx` - React app entry and providers
- `frontend/src/lib/mshnctrl/types.ts` - Canonical TypeScript types (single source of truth)
- `frontend/src/features/auth/hooks.ts` - Authentication state and login logic
- `frontend/src/routes/` - TanStack Router file-based route definitions
- `frontend/src/features/targeting/` - Most complete feature (reference for patterns)

### Documentation
- [CLAUDE.md](../CLAUDE.md) - Development commands and debugging
- `docs/DECISION_SYSTEM_ARCHITECTURE.md` - System design and data flows
- `docs/BDA_*.md` - Battle damage assessment implementation details
- `docs/scenarios/` - Real-world usage examples and workflows

---

## ⚠️ Critical Context for Success

1. **Feature Status Levels:**
   - 🟢 Production: Full backend + frontend, integrated (Auth, BDA, Ontology)
   - 🟡 Substantial: Backend exists, frontend may have mock integration (Targeting, ROE)
   - 🔴 Frontend Only: Visual mocks, no backend (Decision System, Planning, Logistics)

2. **No Feature Flags:** All code paths always enabled; branching based on permissions (ABAC), not toggles

3. **Database Persistence:** Changes survive process restarts; SQLite file at `backend/data/app.db`

4. **Permissions Are Runtime Enforced:** ABAC checks happen in handlers; frontend respects but backend validates

5. **Mock vs Reality:** Frontend has mock services for 🔴 features; backend real endpoints for 🟢/🟡 features

---

## 🔄 Common Workflows for AI Agents

**Implement a new API endpoint (Ontology-First):**
1. Create entity types in ontology `schema` (if new)
2. Define relationship types in `/api/ontology/schema` endpoint
3. Use `OntologyService` for CRUD, not legacy table directly
4. Create `EntityRelationship` entries instead of foreign keys
5. Update frontend to consume via `OntologyService.getEntities()`
6. All handlers should filter/query through ontology layer, not bypass it

**Example (Targeting Workflow):**
- Don't: `SELECT * FROM targets WHERE id = ?`
- Do: `ontology_svc.get_entity("target-123").await` with type='TARGET'

**Implement a new API endpoint (Legacy Approach - avoid):**
1. Add types to `backend/src/features/{feature}/domain/mod.rs`
2. Implement handler in `backend/src/features/{feature}/handlers/mod.rs`
3. Wire into router via `backend/src/features/{feature}/mod.rs`
4. Test with integration test or Playwright E2E
5. Update `frontend/src/lib/mshnctrl/types.ts` with response types
6. Create frontend hook in `frontend/src/features/{feature}/hooks/`

**Debug failing test:**
1. Check test file for API URL and expected response shape
2. Start backend with `RUST_LOG=debug cargo run`
3. Verify database state: `sqlite3 backend/data/app.db "SELECT * FROM {table};"`
4. Check middleware chain (auth → CSRF → ABAC) in `backend/src/main.rs`
5. Use Playwright inspector: `npx playwright test --debug`

**Add a UI feature:**
1. Check `frontend/src/lib/mshnctrl/types.ts` for entity model
2. For ontology-aware features: use `OntologyService.getEntities()` with filters
3. For legacy features: create component consuming custom hook (from `frontend/src/features/{feature}/hooks/`)
4. Wire hook to backend endpoint (check `backend/src/features/{feature}/handlers/`)
5. Add TanStack Router route
6. Update navigation metadata (may need `/api/navigation/` endpoint update)

---

## ⚠️ Ontology-First Architecture Compliance

**Status:** Transitional (Mixed Conformance) - See detailed analysis in [ONTOLOGY_FIRST_API_REVIEW.md](../../docs/ONTOLOGY_FIRST_API_REVIEW.md)

### What's Ontology-First:
- ✅ `OntologyService` (service.rs) - Complete entity/relationship CRUD
- ✅ `/api/ontology/*` endpoints - Production-ready
- ✅ Sync triggers - Automatic entity table population from legacy tables
- ✅ Frontend `OntologyService` - Proper entity filtering and relationship loading

### What's Still Legacy:
- 🟡 Targeting handlers query `v_targets_ontology` view instead of `OntologyService`
- 🟡 BDA reports use direct `target_id` FK instead of `ASSESSES` relationships
- 🟡 Search handler not leveraging relationship traversal
- ❌ No graph traversal endpoints for cross-entity queries
- ❌ No relationship type validation against schema

### Key Principle for New Handlers:
**All handlers should treat the ontology layer as the source of truth, not bypass it:**

```rust
// ❌ DON'T: Query table directly
let targets = TargetRepository::list_all(&pool, status, priority).await?;

// ✅ DO: Query through ontology service
let entities = ontology_service.get_entities(EntityFilter {
    type_: Some("TARGET".to_string()),
    status: status.map(|s| s.to_string()),
    ..
}).await?;
```

---

## 🔄 Common Workflows for AI Agents

