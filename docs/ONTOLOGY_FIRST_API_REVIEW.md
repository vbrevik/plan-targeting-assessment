# Ontology-First API Conformance Review

**Date:** 2026-01-31  
**Status:** In Progress - Mixed Conformance  
**Verified:** 2026-02-01

---

## Verification Status (2026-02-01)

| Phase | Description | Status | Evidence |
|-------|-------------|--------|----------|
| **1** | Targeting handlers → ontology queries | ✅ **Done** | `targets.rs` uses `OntologyService` in `create_target`, `get_target`, `update_target`; includes `entity_to_target` and `query_params_to_filter` converters |
| **2** | BDA handlers use entity_relationships | ❌ **Not Done** | `reports.rs` still uses `BdaRepository` directly with no `OntologyService` injection |
| **3** | Frontend type unification | ❌ **Not Done** | `targeting.api.ts` defines separate `Target`, `BDAAssessment` interfaces; no `Entity<T>` generic pattern found |
| **4** | Graph traversal endpoints | ❌ **Not Done** | Ontology routes have `get_neighbors` but no `/graph/traverse` or `/graph/impact` endpoints |
| **5** | Relationship type validation | ❌ **Not Done** | No `is_valid_relationship` method in `OntologyService`; relationships accept any type string |

### Critical Gaps Still Open

1. **Search endpoint non-ontology-aware**: `search.rs` directly queries `targets`, `bda_reports`, `decisions`, `isr_platforms`, `strike_platforms` tables
2. **BDA handlers bypass ontology**: All BDA CRUD operations use legacy `BdaRepository`
3. **Frontend types siloed**: No unified `Entity<T>` discriminated union pattern implemented

## Executive Summary

The codebase has a **well-architected unified ontology layer** (`/ontology` feature) but **feature-specific handlers remain partially siloed**, creating a hybrid architecture:

- ✅ **Strong:** Ontology core is production-ready with proper entity/relationship CRUD
- ⚠️ **Mixed:** Targeting and BDA handlers use legacy tables alongside ontology
- ❌ **Gaps:** No dedicated syncing for all feature-specific endpoints to ontology patterns

---

## Architecture Assessment

### Current State: Hybrid Two-Tier Model

```
┌─────────────────────────────────────────────────────┐
│ LAYER 1: UNIFIED ONTOLOGY (Production Ready)       │
│ ─────────────────────────────────────────────────────│
│ • /api/ontology/entities (CRUD)                     │
│ • /api/ontology/relationships (CRUD)                │
│ • /api/ontology/entities/:id/neighbors (Graph)      │
│ • /api/ontology/schema (Discovery)                  │
│                                                       │
│ Backend: OntologyService (service.rs)               │
│ Frontend: OntologyService (ontology.service.ts)     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ LAYER 2: FEATURE-SPECIFIC HANDLERS (Transitioning) │
│ ─────────────────────────────────────────────────────│
│ /api/targeting/* → targets table (legacy)           │
│ /api/bda/*       → bda_reports table (legacy)       │
│ /api/intelligence/* → mixed                         │
│                                                       │
│ Uses sync triggers to populate entities table       │
│ BUT: Handlers don't leverage ontology queries       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DATA LAYER: Dual Table Structure                    │
│ ─────────────────────────────────────────────────────│
│ Legacy: targets, bda_reports, isr_platforms         │
│ Unified: entities, entity_relationships             │
│ Sync: Automatic triggers keep them in sync          │
└─────────────────────────────────────────────────────┘
```

---

## Gap Analysis: Ontology-First Conformance

### ✅ Fully Conformant Areas

**1. Ontology Feature Module** (`backend/src/features/ontology/`)
- Implements complete entity lifecycle: Create, Read, Update, Delete, Query
- Relationships properly modeled with properties support
- Entity filtering by type, operation_id, campaign_id
- Neighbor traversal for graph queries
- Schema discovery endpoint for client-side validation

**2. Frontend Ontology Integration** (`OntologyService`)
- Consistent API wrapping for all ontology operations
- Proper entity filtering with typed parameters
- Bidirectional relationship loading (incoming/outgoing)
- Entity context drawer shows related entities

**3. Sync Trigger Foundation**
- All legacy inserts/updates trigger entities table sync
- Relationships auto-created (e.g., BDA → Target "ASSESSES")
- No manual ontology writes needed for synced types

---

### ⚠️ Partially Conformant Areas

**1. Targeting Handlers Query Strategy**

**Current:**
```rust
// backend/src/features/targeting/handlers/targets.rs
pub async fn list_targets(...) -> Result<impl IntoResponse> {
    let targets = TargetRepository::list_all(&pool, status, priority, limit, offset)
        .await?;
    Ok(Json(targets))
}

// Queries: v_targets_ontology view (queries entities table)
// Problem: Handler is unaware of entity type filtering
```

**Gap:** Handlers bypass ontology filtering capabilities. Should leverage:
```rust
// SHOULD do this:
let entities = OntologyService::get_entities(EntityFilter {
    type_: Some("TARGET"),
    status: Some("Approved"),
    ..
}).await?;
```

**2. BDA Handlers Architecture**

**Current:**
```typescript
// frontend/src/lib/mshnctrl/api/bda.ts
export interface BdaReport {
    id: string;
    target_id: string;  // Foreign key to targets table
    // ... properties specific to BDA
}
```

**Gap:** BDA reports use direct `target_id` FK instead of ontology relationships. Should be:
```typescript
// SHOULD do this:
export interface BdaReport {
    id: string;
    // No direct target_id - use entity relationships instead
    relationships: {
        type: 'ASSESSES';  // Relationship type
        target_id: string;  // Target entity ID
    }[];
}
```

**3. Search & Filtering Endpoints**

**Current:**
```rust
// backend/src/features/targeting/handlers/search.rs
pub async fn search(...) -> Result<impl IntoResponse> {
    // Likely doing table-specific SQL
    // Not leveraging entity type filtering or relationship traversal
}
```

**Gap:** No integration with ontology's graph query capabilities for cross-entity search.

---

## Specific Endpoint Issues

### Backend Handlers: Non-Conformant Routes

| Endpoint | Handler File | Current Approach | Gap | Conformance |
|----------|--------------|------------------|-----|-------------|
| `GET /api/targeting/targets` | `targeting/handlers/targets.rs` | Direct `targets` table query | Should filter entities with type='TARGET' | 🟡 Partial |
| `POST /api/targeting/targets` | `targeting/handlers/targets.rs` | INSERT into targets; trigger syncs entities | Should POST directly to ontology | 🟡 Partial |
| `GET /api/targeting/targets/:id` | `targeting/handlers/targets.rs` | Single table lookup | Should use ontology's rich filtering (classification, operation_id) | 🟡 Partial |
| `GET /api/bda/reports` | `bda/handlers/reports.rs` | Direct `bda_reports` table | Should query entities with type='BDA_REPORT' | 🟡 Partial |
| `POST /api/bda/reports` | `bda/handlers/reports.rs` | INSERT into bda_reports; creates relationships in trigger | Should POST to ontology with relationship metadata | 🟡 Partial |
| `GET /api/targeting/search` | `targeting/handlers/search.rs` | Table-specific search | Should leverage entity graph queries | ❌ Non-Conformant |
| `GET /api/targeting/isr` | `targeting/handlers/isr.rs` | Direct `isr_platforms` table | Should query entities with type='ISR_PLATFORM' | 🟡 Partial |
| `GET /api/ontology/entities` | `ontology/routes.rs` | Entity CRUD ✅ | N/A | ✅ Conformant |
| `GET /api/ontology/relationships` | `ontology/routes.rs` | Relationship CRUD ✅ | N/A | ✅ Conformant |

---

### Frontend APIs: Non-Conformant Patterns

**1. Targeting API Types**
```typescript
// frontend/src/lib/mshnctrl/api/targeting.api.ts
export interface Target {
    id: string;
    name: string;
    target_type: string;  // Property
    priority: string;      // Property
    classification?: string;
}
```

**Issue:** These are entity properties, not separate attributes. Should be modeled as:
```typescript
export interface TargetEntity extends Entity {
    type: 'TARGET';
    properties: {
        target_type: string;
        priority: string;
    };
}
```

**2. BDA Report Relationships**
```typescript
// frontend/src/lib/mshnctrl/api/bda.ts
export interface BdaReport {
    target_id: string;  // Direct FK
    strike_id?: string;
}
```

**Should be:**
```typescript
export interface BdaReportEntity extends Entity {
    type: 'BDA_REPORT';
    relationships: Array<{
        type: 'ASSESSES' | 'VALIDATES' | 'INCLUDES';
        target_id: string;
    }>;
}
```

---

## Recommended Conformance Roadmap

### Phase 1: Handler Refactoring (Targeting)

**Goal:** Make targeting handlers query-aware of ontology layer

```rust
// BEFORE: backend/src/features/targeting/handlers/targets.rs
pub async fn list_targets(
    State(pool): State<Pool<Sqlite>>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse> {
    let targets = TargetRepository::list_all(&pool, params.status, params.priority, ...).await?;
    Ok(Json(targets))
}

// AFTER: Use ontology service
pub async fn list_targets(
    State(ontology_svc): State<Arc<OntologyService>>,
    Query(params): Query<TargetQueryParams>,
) -> Result<impl IntoResponse> {
    let filter = EntityFilter {
        type_: Some("TARGET".to_string()),
        status: params.status.clone(),
        ..
    };
    let entities = ontology_svc.get_entities(filter).await?;
    let targets: Vec<Target> = entities.into_iter().map(|e| Entity::into_target(e)).collect();
    Ok(Json(targets))
}
```

**Implementation:**
1. Inject `OntologyService` into targeting handlers
2. Convert `TargetQueryParams` → `EntityFilter`
3. Add `Entity::into_target()` converter method
4. Update handler to return consistent format

**Files to modify:**
- `backend/src/features/targeting/handlers/targets.rs` (~50 lines)
- `backend/src/features/targeting/handlers/isr.rs` (~50 lines)
- `backend/src/features/targeting/handlers/intelligence.rs` (~50 lines)

---

### Phase 2: BDA Handler Alignment

**Goal:** Make BDA relationships use entity_relationships instead of FKs

```rust
// BEFORE
pub async fn create_report(
    Extension(repo): Extension<Arc<BdaRepository>>,
    Json(payload): Json<CreateBdaReportRequest>,
) -> impl IntoResponse {
    repo.create(&user_id, payload).await
}

// AFTER: Create entity + relationships
pub async fn create_report(
    Extension(ontology_svc): Extension<Arc<OntologyService>>,
    Json(payload): Json<CreateBdaReportRequest>,
) -> impl IntoResponse {
    // 1. Create entity
    let bda_entity = ontology_svc.create_entity(CreateEntityRequest {
        type_: "BDA_REPORT",
        properties: serde_json::to_value(&payload)?,
        ..
    }).await?;
    
    // 2. Create relationship: BDA_REPORT -ASSESSES-> TARGET
    ontology_svc.create_relationship(CreateRelationshipRequest {
        source_id: bda_entity.id.clone(),
        target_id: payload.target_id.clone(),
        relation_type: "ASSESSES".to_string(),
        properties: serde_json::json!({ "confidence": payload.confidence_level }),
    }).await?;
    
    Ok((StatusCode::CREATED, Json(bda_entity)))
}
```

**Files to modify:**
- `backend/src/features/bda/handlers/reports.rs` (~100 lines)
- `backend/src/features/bda/domain/bda_report.rs` (type updates)

---

### Phase 3: Frontend Type Standardization

**Goal:** Align all feature types with ontology entity model

```typescript
// frontend/src/lib/mshnctrl/types.ts (unified)
export interface Entity<T extends string = string> {
    id: UUID;
    name: string;
    type: T;
    properties: Record<string, any>;
    relationships: EntityRelationship[];
    // ...
}

// Specialized entity types (discriminated union)
export type DomainEntity = 
    | Entity<'TARGET'> 
    | Entity<'BDA_REPORT'> 
    | Entity<'ISR_PLATFORM'>;

// BEFORE: Separate, unrelated types
export interface Target { id: string; target_type: string; ... }
export interface BdaReport { id: string; target_id: string; ... }

// AFTER: Unified entity with discriminated properties
export interface TargetEntity extends Entity<'TARGET'> {
    properties: {
        target_type: string;
        priority: string;
        coordinates: string;
    };
}

export interface BdaReportEntity extends Entity<'BDA_REPORT'> {
    properties: {
        physical_damage: PhysicalDamage;
        functional_damage: FunctionalDamage;
        recommendation: Recommendation;
    };
}
```

---

## Critical Gaps to Address

### 1. **Search Endpoint Not Ontology-Aware** ❌
```rust
// backend/src/features/targeting/handlers/search.rs
pub async fn search(...) -> Result<impl IntoResponse> {
    // TODO: Implement graph traversal for cross-entity search
    // Should support: Find all targets related to a BDA report
}
```

**Fix:** Leverage ontology's relationship model:
```rust
pub async fn search(
    State(ontology_svc): State<Arc<OntologyService>>,
    Query(q): Query<SearchQuery>,
) -> Result<impl IntoResponse> {
    // Search entities by name/type
    let entities = ontology_svc.search_entities(&q.term, q.entity_type.clone()).await?;
    
    // Return with relationship context
    let enriched = futures::future::join_all(
        entities.iter().map(|e| ontology_svc.get_entity_with_relationships(&e.id))
    ).await;
    
    Ok(Json(enriched))
}
```

### 2. **No Graph Traversal Endpoints** ❌
Missing endpoints for:
- Find all targets impacted by a decision
- Find all BDA reports for a target
- Find equipment dependencies

**Solution:** Add to ontology routes:
```rust
// backend/src/features/ontology/routes.rs
.route("/graph/traverse", post(traverse_graph))
.route("/graph/impact", post(calculate_impact))

async fn traverse_graph(
    State(svc): State<Arc<OntologyService>>,
    Json(query): Json<GraphTraversalQuery>,
) -> impl IntoResponse {
    // BFS/DFS up to N hops following specific relationship types
}
```

### 3. **No Relationship Type Validation** ⚠️
Handlers accept any `relation_type` string. Should validate against schema.

```rust
// SHOULD add:
pub async fn create_relationship(
    State(svc): State<Arc<OntologyService>>,
    Json(req): Json<CreateRelationshipRequest>,
) -> impl IntoResponse {
    // Validate source_id type and target_id type against allowed relationships
    let source = svc.get_entity_only(&req.source_id).await?;
    let target = svc.get_entity_only(&req.target_id).await?;
    
    // Check schema: Is this relationship valid for these entity types?
    if !svc.is_valid_relationship(&source.type_, &target.type_, &req.relation_type).await? {
        return Err(StatusCode::BAD_REQUEST);
    }
    
    svc.create_relationship(req).await
}
```

### 4. **Frontend Not Using Ontology-Aware Queries** ⚠️

Currently fetches targets, then in handlers manually adds relationships. Should be:

```typescript
// BEFORE
const targets = await targetingApi.getTargets();

// AFTER - Use ontology service directly
const targetEntities = await OntologyService.getEntities({ type: 'TARGET' });
const bdaRelationships = targetEntities
    .flatMap(t => t.relationships.filter(r => r.type === 'ASSESSES'))
    .map(r => r.source_id);
```

---

## Implementation Priority

| Phase | Component | Effort | Impact | Timeline |
|-------|-----------|--------|--------|----------|
| **1** | Targeting handlers → ontology queries | 2-3 days | High (Core workflow) | Week 1 |
| **2** | BDA handlers use entity_relationships | 2-3 days | High (Core workflow) | Week 1 |
| **3** | Frontend type unification | 3-4 days | Medium (Type safety) | Week 2 |
| **4** | Add graph traversal endpoints | 2-3 days | Medium (Advanced queries) | Week 2 |
| **5** | Relationship type validation | 1-2 days | Low (Safety net) | Week 3 |

---

## Success Criteria

Once complete, the system will be **fully ontology-first**:

- ✅ All domain data modeled as `Entity` with `type` field
- ✅ All relationships modeled as `EntityRelationship` (not FKs)
- ✅ Handlers query `OntologyService`, not legacy tables directly
- ✅ Frontend uses unified `Entity<T>` type for all domains
- ✅ Graph queries (neighbors, traversal, impact) available via API
- ✅ Relationship types validated at creation time
- ✅ No orphaned legacy table queries outside sync triggers

---

## Migration Risk Mitigation

**Risk:** Breaking changes to existing API consumers

**Mitigation:**
1. Keep legacy endpoints working during Phase 1-2 (deprecation window)
2. Add version flag: `/api/v2/targeting/targets` uses ontology
3. Maintain backward compatibility in response format
4. Document migration path for frontend consumers

```rust
// Feature flag approach
#[derive(Debug)]
pub struct ApiVersion {
    pub use_ontology_queries: bool,  // false for v1, true for v2
}

pub async fn list_targets(
    State(config): State<ApiVersion>,
    ..
) -> Result<impl IntoResponse> {
    if config.use_ontology_queries {
        // Query ontology service
    } else {
        // Query legacy table
    }
}
```

