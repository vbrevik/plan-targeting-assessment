# Mock Data to API Migration - Progress Report

**Date**: 2026-02-08
**Status**: Phase 3 In Progress
**Files Migrated**: 3 of 38
**Overall Progress**: ~8% complete

---

## ✅ Completed Work

### Phase 1: Audit & Mapping ✅
- Created comprehensive migration plan (`MOCK_TO_API_MIGRATION_PLAN.md`)
- Mapped all 615 lines of mock service functions to backend endpoints
- Identified gaps: Planning, Logistics, Context Events have no backend

### Phase 2: API Client Completion ✅
- **Removed mock imports** from `targeting.api.ts`
- **Removed mock fallback** in `getTarget()` function
- **Added RFI support** to `intelligence.ts` using ontology API:
  - `getRFIs()` → `GET /ontology/entities?type=RFI`
  - `createRFI()`, `updateRFI()`, `deleteRFI()`
- **Created central API export** (`api/index.ts`):
  ```typescript
  import { TargetingApi, BDAApi, ROEApi, ... } from '@/lib/mshnctrl/api'
  ```

### Phase 3: Component Migration (Started) 🚧
**3 Components Migrated:**

1. ✅ **TargetDetailView.tsx**
   - Changed: `MshnCtrlService.getROEs()` → `roeApi.getRules()`
   - Status: Fully migrated

2. ✅ **ROEManagement.tsx**
   - Changed: `MshnCtrlService.getROEs()` → `roeApi.getRules()`
   - Status: Fully migrated

3. ✅ **JTBVotingView.tsx**
   - Changed: `MshnCtrlService.getTargets()` → `targetingApi.getTargets()`
   - Status: Fully migrated

---

## 📋 Remaining Work

### High Priority (Backend Ready) - 7 files
These have backend APIs and should be migrated next:

- [ ] `features/targeting/StrikeOptimizer.tsx` (2 calls)
- [ ] `features/operations/DecisionBoard.tsx` (1 call)
- [ ] `features/operations/COPSummary.tsx` (4 calls)
- [ ] `features/operations/CNRManagement.tsx` (3 calls)
- [ ] `features/operations/OrbatManagement.tsx` (1 call)
- [ ] `features/operations/WeatherManagement.tsx` (2 calls)
- [ ] `features/operations/BriefingManagement.tsx` (1 call)

### Medium Priority (Ontology Migration) - 4 files
These need ontology-based solutions:

- [ ] `features/intelligence/CCIRManagement.tsx` (7 calls) - **Decision needed: Keep or remove?**
- [ ] `features/intelligence/AssessmentManagement.tsx` (3 calls)
- [ ] `features/intelligence/UncertaintyManagement.tsx` (3 calls)
- [ ] `features/admin/StaffMonitor.tsx` (2 calls) - Use `/api/users` endpoint

### Low Priority (Mock Only - Remove or Stub) - 24 files

**Planning Suite (11 files)** - No backend:
- [ ] `features/planning/OPLANBuilder.tsx`
- [ ] `features/planning/OPLANViewer.tsx`
- [ ] `features/planning/ProposalDetail.tsx`
- [ ] `features/planning/CampaignManagement.tsx`
- [ ] `features/planning/COGAnalyzer.tsx`
- [ ] `features/planning/GapAnalysisView.tsx`
- [ ] `features/planning/CoAWargamer.tsx`
- [ ] `features/planning/CONOPSBuilder.tsx`
- [ ] `features/planning/ScenariosManagement.tsx`
- [ ] `features/planning/MDOSyncMatrix.tsx`
- [ ] `features/cockpit/hooks/useCockpitData.ts`

**Logistics Suite (3 files)** - No backend:
- [ ] `features/logistics/LogisticsManagement.tsx`
- [ ] `features/logistics/SupplyChainManagement.tsx`
- [ ] `features/logistics/InfrastructureMonitor.tsx`

**Context/External Events (3 files)** - No backend:
- [ ] `features/shared/context/PoliticalStatementsView.tsx`
- [ ] `features/shared/context/NaturalDisasterView.tsx`
- [ ] `features/shared/context/DisinformationView.tsx`

**Intelligence/Digital Twin (2 files)** - Mock only:
- [ ] `features/intelligence/RecognisedPicture.tsx`
- [ ] `features/intelligence/SocialDomain.tsx`

**Admin/Shared (5 files)**:
- [ ] `features/admin/PersonnelManagement.tsx`
- [ ] `features/admin/ProductCenter.tsx`
- [ ] `features/shared/MshnCtrlDashboard.tsx`
- [ ] `features/shared/SmartTag.tsx`
- [ ] `features/shared/ContextSelector.tsx`

---

## 🎯 Next Steps

### Immediate (Next 2-3 Hours)
1. **Migrate 7 high-priority components** listed above
2. **Test migrated components** to ensure no breaks
3. **Handle CCIR decision**: Keep with backend or remove

### Short Term (This Week)
4. **Stub or remove Planning suite** (mark as "Coming Soon" or delete)
5. **Stub or remove Logistics suite** (mark as "Coming Soon" or delete)
6. **Remove Context Events** (Political Statements, Disasters, Disinfo)
7. **Remove Digital Twin mockups** (RecognisedPicture, SocialDomain)

### Final Cleanup (End of Week)
8. **Delete mock-service.ts** (615 lines)
9. **Delete mock-oplan.ts** (116 lines)
10. **Clean up store.ts** (remove mock data sections)
11. **Update REALITY_CHECK.md** with new status
12. **Run full test suite** to verify no breakage

---

## 📈 Impact Assessment

### Before Migration
- **Mock data lines**: ~800 lines (mock-service.ts + mock-oplan.ts + store.ts)
- **Files using mocks**: 38 files
- **API client maturity**: 60% (had fallbacks)

### After Migration (Projected)
- **Mock data lines**: 0 lines ✅
- **Files using real APIs**: 38 files → ~15-20 production files
- **Files removed/stubbed**: ~18-23 aspirational files
- **API client maturity**: 100% (no mock fallbacks)

### Benefits
1. ✅ **Ontology-first**: All data queries use unified entity model
2. ✅ **Data-driven**: Frontend reflects actual backend state
3. ✅ **Honest documentation**: Features marked as implemented actually work
4. ✅ **Reduced maintenance**: Less code, clearer boundaries
5. ✅ **Better testing**: E2E tests work against real APIs

---

## 🚨 Decisions Needed

1. **CCIR Management** (7 mock calls):
   - Option A: Build minimal backend `/api/intelligence/ccir`
   - Option B: Remove feature (out of MVP scope)
   - **Recommendation**: Remove - not in REALITY_CHECK.md as production

2. **Planning Suite** (11 files, no backend):
   - Option A: Build minimal OPLAN/Campaign backend
   - Option B: Mark all as "Coming Soon" (stub UI)
   - Option C: Delete all planning components
   - **Recommendation**: Stub with "Coming Soon" message, keep routes

3. **Logistics Suite** (3 files, no backend):
   - Same options as Planning
   - **Recommendation**: Stub with "Coming Soon" message

4. **Context Events** (Political, Disasters, Disinfo):
   - Option A: Create as ontology entities
   - Option B: Remove entirely
   - **Recommendation**: Remove - aspirational features

---

## 🔧 Migration Pattern

For each component, follow this pattern:

```typescript
// BEFORE
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
const data = await MshnCtrlService.getTargets();

// AFTER
import { TargetingApi } from '@/lib/mshnctrl/api';
const data = await TargetingApi.getTargets();
```

---

## ✅ Files Ready to Delete

Once all migrations complete, delete these files:

1. `frontend/src/lib/mshnctrl/mock-service.ts` (615 lines)
2. `frontend/src/lib/mshnctrl/services/mock-oplan.ts` (116 lines)
3. Clean sections from `frontend/src/lib/mshnctrl/services/store.ts`

---

**Last Updated**: 2026-02-08 (After completing Phase 2 and 3 components)
