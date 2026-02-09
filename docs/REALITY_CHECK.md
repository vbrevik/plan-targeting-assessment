# Reality Check: MshnCtrl Feature Status

> **Created**: 2026-01-31  
> **Purpose**: Honest assessment of what actually works vs. what's documented

---

## 🟢 Production Ready

These features have backend APIs, frontend UI, and integration working:

### Authentication & Authorization
- ✅ JWT login/logout with refresh tokens
- ✅ User CRUD operations
- ✅ ABAC permission system
- ✅ Role-based navigation
- ✅ Rate limiting

### BDA Workbench
- ✅ Report creation and management
- ✅ Component assessment workflow
- ✅ Image annotation system
- ✅ Peer review workflow
- ✅ Historical data tracking
- ⚠️ PDF generation (needs verification)

---

## 🟡 Substantial but Incomplete

These have significant code but need integration testing:

### Targeting Cell
- ✅ 12 frontend components (JTB, CDE, Nominations, etc.)
- ✅ 27 backend files with handlers
- ⚠️ Some endpoints return mock data
- ⚠️ F3EAD pipeline visualization (frontend-only)

### ROE Management
- ✅ Frontend forms and displays complete (wired to real APIs)
- ✅ Backend module fully implemented (14 files)
- ✅ Auto-determination service (keyword-based ROE analysis)
- ✅ ROE blocking check for meeting routing
- ✅ Decision routing with ROE integration
- ✅ 99 unit tests across 7 test modules (including LEGAD compliance edge cases)
- ✅ Playwright integration tests verified and fixed (roe-api.spec.ts, roe-integration.spec.ts)

### Ontology/IM Dashboard
- ✅ Entity CRUD working
- ✅ Relationship management
- ✅ IM Dashboard fetching live data
- ⚠️ Limited to RFI and Task entity types

---

## 🔴 Mock Data Only (Backend Missing)

These have frontend UI but no real backend:

### Decision System
**Documented as**: Complete v2.0 with Battle Rhythm  
**Reality**: 
- 9 frontend components exist
- Zero backend code
- All data is mock/static

### Planning Modules
- ✅ J5 Plans Dashboard created (mock data, role-gated)
- CONOPS builder: Mock data
- COA wargamer: Mock data
- Campaign planning: Mock data
- Strategic direction: Mock data

### Logistics
- ✅ J4 Logistics Dashboard created (mock data, role-gated)
- Supply tracking: Mock data
- Convoy management: Mock data
- Equipment readiness: Mock data

### Intelligence
- RFI tracking: Partial (ontology-backed)
- Intel insights: Mock data
- CCIR: Mock data

---

## 🔴 Not Started

These are documented but have no code:

### Battle Rhythm Integration
**Documented as**: "Week 1 ready to start"  
**Reality**: Zero implementation
- No meeting_venues table
- No decision_routing table
- No staff_coordination table
- No agenda components

### Meeting Agendas
- No components
- No routes
- No backend

---

## Documentation vs. Reality

| Claim | Reality |
|-------|---------|
| "35+ docs" | 130+ docs (inflated) |
| "Week 1 implementation ready" | Never started |
| "Decision System v2.0 complete" | Frontend mock only |
| "42 REST API endpoints" | ~25 actually functional |
| "Frontend complete (100%)" | 70% functional |

---

## What to Trust

### Trust These Docs
- `docs/bda/BDA_MASTER_GUIDE.md` - Accurate
- `docs/BACKLOG.md` - Accurate backlog
- `docs/ports.md` - Accurate
- `CLAUDE.md` - Accurate dev guide

### Archived (Aspirational)
- All "COMPLETE" docs → `ARCHIVE/legacy/`
- Week 1 implementation plan → aspirational
- Decision System architecture → unimplemented

---

## Recommended Next Steps

1. **Complete BDA Phase 2** (Weaponeering) - Close to done
2. ~~Fix ROE integration~~ - ✅ Done (99 tests, integration tests fixed)
3. **Stabilize Targeting** - Add E2E tests
4. **Decide on Decision System** - Build it or remove docs
5. **Feedback Loops** - Dashboard, Plan vs Actual, event service (Sprint 1 remaining)
6. **Digital Twin indicators** - Mocked vs Integrated visual markers (Sprint 1 remaining)

---

_This document reflects the actual state as of 2026-02-09_
