# Ontology-First Migration Plan

**Created**: January 22, 2026  
**Status**: 📋 PLANNING ONLY - Not yet started  
**Priority**: Future Work  

---

## Overview

Migrate from siloed domain tables to unified ontology-driven architecture using the existing `entities` and `entity_relationships` tables.

---

## Phase 1: Foundation (3-4 days)

### 1.1 Create Ontology Service Module

```
backend/src/features/ontology/
├── domain/
│   ├── entity.rs          # Entity struct with JSONB properties
│   ├── relationship.rs    # Relationship struct
│   └── mod.rs
├── repositories/
│   ├── entity_repo.rs     # Entity CRUD
│   ├── relationship_repo.rs
│   └── mod.rs
├── handlers/
│   ├── entities.rs        # REST handlers
│   ├── relationships.rs
│   ├── graph.rs           # Graph traversal
│   └── mod.rs
├── router.rs
└── mod.rs
```

### 1.2 Create Ontology API Endpoints

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/api/ontology/entities` | GET | List entities with type/scope filters |
| `/api/ontology/entities` | POST | Create entity |
| `/api/ontology/entities/:id` | GET | Get entity by ID |
| `/api/ontology/entities/:id` | PUT | Update entity |
| `/api/ontology/entities/:id` | DELETE | Delete entity |
| `/api/ontology/relationships` | GET | List relationships |
| `/api/ontology/relationships` | POST | Create relationship |
| `/api/ontology/graph/traverse` | POST | Graph traversal query |
| `/api/ontology/graph/impact` | POST | Impact analysis query |

---

## Phase 2: Entity Migration (1-2 weeks)

### 2.1 Create Unified Views

```sql
-- View: Targets from ontology
CREATE VIEW v_targets AS
SELECT 
    id, name, 
    properties->>'target_type' as target_type,
    properties->>'priority' as priority,
    properties->>'f3ead_stage' as f3ead_stage,
    location_lat, location_lng,
    classification, confidence
FROM entities 
WHERE type = 'Target';

-- Similar views for Unit, BDAReport, ROERule, Decision
```

### 2.2 Data Migration Scripts

```sql
-- Migrate targets to entities
INSERT INTO entities (id, operation_id, name, type, properties, ...)
SELECT 
    id, 
    NULL, -- operation_id TBD
    name,
    'Target',
    jsonb_build_object(
        'target_type', target_type,
        'priority', priority,
        'f3ead_stage', f3ead_stage,
        'intelligence_confidence', intelligence_confidence
    ),
    ...
FROM targets;
```

### 2.3 Update Services to Use Views

Minimal code change approach - services continue to work via views while new code uses ontology API directly.

---

## Phase 3: Relationships (1 week)

### 3.1 Relationship Types

| Type | Source | Target | Example |
|:-----|:-------|:-------|:--------|
| `COMMANDS` | Unit | Unit | "1 BDE commands 1 BN" |
| `TARGETS` | Unit | Target | "1 BN targets T-1001" |
| `ENGAGED_BY` | Target | Strike | "T-1001 engaged by STK-001" |
| `ASSESSED_BY` | Strike | BDA | "STK-001 assessed by BDA-001" |
| `GOVERNED_BY` | Decision | ROE | "DEC-001 governed by ROE-Alpha" |
| `IMPACTS` | Entity | Entity | "POL-STMT impacts T-1002" |
| `LOCATED_AT` | Entity | GeoLocation | "T-1001 at Grid AB1234" |
| `DEPENDS_ON` | Entity | Entity | "MSN-002 depends on MSN-001" |

### 3.2 Populate Relationships

```sql
-- Link targets to BDA via strikes
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties)
SELECT 
    t.id,
    b.id,
    'ASSESSED_BY',
    jsonb_build_object('strike_id', b.strike_id, 'assessment_date', b.created_at)
FROM targets t
JOIN bda_reports b ON b.target_id = t.id;
```

---

## Phase 4: Frontend Migration (1 week)

### 4.1 Create Ontology API Client

```typescript
// frontend/src/lib/smartops/api/ontology.api.ts
export const ontologyApi = {
  getEntities: (filters: EntityFilters) => ...,
  createEntity: (entity: CreateEntityRequest) => ...,
  getRelationships: (filters: RelationshipFilters) => ...,
  traverseGraph: (query: GraphQuery) => ...,
};
```

### 4.2 Update OntologyManager

Replace mock service calls with real ontology API.

### 4.3 Add Impact Visualization

Show relationship-based impact when entities change.

---

## Phase 5: ReBAC Integration (Future)

### 5.1 Scoped Role Assignment

```sql
CREATE TABLE user_scoped_roles (
    user_id TEXT REFERENCES users(id),
    role_id TEXT NOT NULL,
    scope_id TEXT REFERENCES entities(id), -- Context entity
    valid_from DATETIME,
    valid_until DATETIME,
    PRIMARY KEY (user_id, role_id, scope_id)
);
```

### 5.2 Permission Checking

```rust
// Check: Can user access entity via relationship chain?
fn check_permission(user_id: &str, entity_id: &str, permission: Permission) -> bool {
    // 1. Get user's scoped roles
    // 2. Traverse entity graph upward
    // 3. Check if any role grants permission on any ancestor
    // 4. Check for explicit deny
}
```

---

## Phase 6: AI Features (Future)

| Feature | Technology | Priority |
|:--------|:-----------|:---------|
| Semantic Search | Node2Vec / Graph embeddings | High |
| Impact Prediction | Graph simulation | High |
| Auto-Classification | LLM (GPT-4/Claude) | Medium |
| NL Policy Authoring | LLM → Rego | Medium |
| Anomaly Detection | UEBA ML model | Low |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|:------|:---------|:-------------|
| Phase 1: Foundation | 3-4 days | None |
| Phase 2: Entity Migration | 1-2 weeks | Phase 1 |
| Phase 3: Relationships | 1 week | Phase 2 |
| Phase 4: Frontend | 1 week | Phase 1-3 |
| Phase 5: ReBAC | 2 weeks | Phase 3 |
| Phase 6: AI | 4+ weeks | Phase 3 |

**Total to Production Ontology**: ~6-8 weeks

---

## Risks & Mitigations

| Risk | Mitigation |
|:-----|:-----------|
| Data migration breaks existing features | Use views for backward compatibility |
| Performance degradation with JSONB | Add GIN indexes on properties |
| Complex graph queries slow | Materialize paths, add caching |
| Breaking API changes | Versioned API endpoints |

---

## Success Metrics

- [ ] All domain data stored in `entities` table
- [ ] All relationships in `entity_relationships`
- [ ] OntologyManager shows real graph
- [ ] Services query via unified views
- [ ] Graph traversal <100ms for 3-hop queries
- [ ] ReBAC permission checks <50ms
