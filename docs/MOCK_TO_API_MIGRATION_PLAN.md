# Mock Data to Real API Migration Plan

**Created**: 2026-02-08
**Status**: In Progress
**Goal**: Replace all mock data sources with ontology-first, data-driven API calls

---

## 🎯 Migration Strategy

### Phase 1: Audit & Map (CURRENT)
- [x] Identify all MshnCtrlService usages (88 occurrences across 38 files)
- [ ] Map mock functions to existing backend endpoints
- [ ] Identify gaps requiring new endpoints

### Phase 2: Complete API Clients
- [ ] Ensure all API client files are complete
- [ ] Remove mock fallbacks from API clients
- [ ] Add proper TypeScript types from ontology

### Phase 3: Migrate Components (High Priority)
- [ ] Targeting Cell components
- [ ] BDA Workbench components
- [ ] ROE Management components
- [ ] Operations/Meetings components

### Phase 4: Handle Planning/Strategy
- [ ] Evaluate which features to keep vs remove
- [ ] Create minimal backends or mark as "Coming Soon"
- [ ] Remove aspirational documentation

### Phase 5: Cleanup
- [ ] Delete `mock-service.ts`
- [ ] Delete `mock-oplan.ts`
- [ ] Clean up `store.ts`
- [ ] Remove unused mock imports

---

## 📊 Mock Service Function Mapping

### ✅ READY TO MIGRATE (Backend Exists)

#### Targeting & BDA
| Mock Function | Backend Endpoint | API Client | Status |
|--------------|------------------|-----------|---------|
| `getTargets()` | `GET /api/targeting/targets` | `targeting.api.ts` | ✅ Ready |
| `getTarget(id)` | `GET /api/targeting/targets/:id` | `targeting.api.ts` | ✅ Ready |
| `updateTargetStatus(id, status)` | `PUT /api/targeting/targets/:id` | `targeting.api.ts` | ✅ Ready |
| `getBDAReports()` | `GET /api/bda/reports` | `bda.ts` | ✅ Ready |
| `getStrikeAnalysis(targetId)` | `GET /api/targeting/risk/:target_id` | `targeting.api.ts` | ⚠️ Map to risk |

#### JTB (Joint Targeting Board)
| Mock Function | Backend Endpoint | API Client | Status |
|--------------|------------------|-----------|---------|
| *(none in mock)* | `GET /api/targeting/jtb/sessions` | `targeting.api.ts` | ✅ Backend ready |
| *(none in mock)* | `POST /api/targeting/jtb/sessions` | `targeting.api.ts` | ✅ Backend ready |

#### ROE
| Mock Function | Backend Endpoint | API Client | Status |
|--------------|------------------|-----------|---------|
| `getROEs()` | `GET /api/roe/*` | `roe.api.ts` | ⚠️ Check integration |

#### Operations & Meetings
| Mock Function | Backend Endpoint | API Client | Status |
|--------------|------------------|-----------|---------|
| `getOperations(campaignId)` | `GET /api/operations/*` | `operations.ts` | ⚠️ Needs completion |
| `getBattleRhythmEvents()` | `GET /api/operations/*` | `meetings.api.ts` | ⚠️ Check endpoint |

#### Ontology/IM
| Mock Function | Backend Endpoint | API Client | Status |
|--------------|------------------|-----------|---------|
| *(Uses ontology)* | `GET /api/ontology/entities` | Direct ontology | ✅ Ready |
| *(Uses ontology)* | `GET /api/ontology/relationships` | Direct ontology | ✅ Ready |

### ⚠️ PARTIAL BACKEND (Needs Extension)

#### Intelligence
| Mock Function | Backend Endpoint | Notes |
|--------------|------------------|-------|
| `getRFIs()` | `GET /api/ontology/entities?type=RFI` | Use ontology |
| `addRFIResponse(id, response)` | `PUT /api/ontology/entities/:id` | Update via ontology |
| `getCCIRs()` | ❌ No backend | **Decision: Remove or stub** |
| `getCCIRHits()` | ❌ No backend | **Decision: Remove or stub** |

#### Strategy
| Mock Function | Backend Endpoint | Notes |
|--------------|------------------|-------|
| `getStrategicGuidance()` | `GET /api/strategy/*` | **Backend returns mock** |
| `getActiveCampaign()` | `GET /api/operations/*` | Check if real |

### ❌ NO BACKEND (Mock Only)

#### Planning (No Backend)
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getOPLANs(campaignId)` | ❌ | Mark UI as "Coming Soon" |
| `getOPLAN(id)` | ❌ | Mark UI as "Coming Soon" |
| `getScenarios()` | ❌ | Remove or stub |
| `getCOAs()` | ❌ | Remove or stub |
| `updateCOA(id, updates)` | ❌ | Remove or stub |
| `getGapAnalysis(campaignId)` | ❌ | Remove or stub |

#### Logistics (No Backend)
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getSupplyStatuses()` | ❌ | Mark UI as "Coming Soon" |
| `getVehicleAssets()` | ❌ | Mark UI as "Coming Soon" |
| `getInfrastructure()` | ❌ | Remove or stub |
| `getCivilAgencies()` | ❌ | Remove or stub |

#### Context/External Events (No Backend)
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getPoliticalStatements()` | ❌ | Remove or create ontology entities |
| `getNaturalDisasters()` | ❌ | Remove or create ontology entities |
| `getDisinformationEvents()` | ❌ | Remove or create ontology entities |
| `getFakeMedia()` | ❌ | Remove or stub |

#### Decision System (No Backend)
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getDecisionBoards()` | ❌ | **Backend exists but separate** |
| `getGovernanceSessions()` | ❌ | Check c2 routes |
| `saveMeetingRecord()` | ❌ | Check c2 routes |

#### Personnel/Admin (Partial)
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getStaffMembers()` | ⚠️ | Use `/api/users` or ontology |
| `getBiometrics()` | ❌ | Remove (mock only) |
| `getOrbat()` | ❌ | Remove or create ontology |

#### Weather
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getWeatherReport()` | ❌ | Remove or external API |
| `getWeatherImpacts()` | ❌ | Remove or stub |

#### Misc
| Mock Function | Status | Decision |
|--------------|--------|----------|
| `getRecognisedPicture(domain)` | ❌ | Remove (digital twin mock) |
| `getCOGs(side)` | ❌ | Remove or stub |
| `getProductReports()` | ❌ | Remove or stub |
| `getTORs()` | ❌ | Use ontology |
| `getPMESIIData()` | ❌ | Remove or stub |

---

## 🔧 Component Migration Priority

### Priority 1: High Value, Backend Ready (Week 1)
1. **Targeting Cell Dashboard** (`targeting-cell-dashboard.tsx`)
   - Uses: `getTargets`, `updateTargetStatus`
   - Replace with: `targeting.api.ts`

2. **BDA Workbench** (`features/bda/*`)
   - Already uses real APIs mostly
   - Verify no mock fallbacks

3. **Target Detail View** (`features/targeting/TargetDetailView.tsx`)
   - Uses: `getTarget`, `updateTargetStatus`
   - Replace with: `targeting.api.ts`

4. **JTB Voting View** (`features/targeting/JTBVotingView.tsx`)
   - Backend ready, never used mock
   - Verify integration

### Priority 2: Substantial Backend (Week 2)
5. **ROE Management** (`features/legal/ROEManagement.tsx`)
   - Backend exists, needs integration test
   - Replace with: `roe.api.ts`

6. **Operations Dashboard** (`features/operations/*`)
   - Use: `operations.ts`, `meetings.api.ts`
   - Verify endpoints

7. **CCIR Management** (`features/intelligence/CCIRManagement.tsx`)
   - **Decision needed**: Keep or remove? (7 mock calls)

### Priority 3: Stub or Remove (Week 3)
8. **Planning Components** (`features/planning/*`)
   - OPLAN Builder, COA Wargamer, Campaign Management
   - **Decision**: Mark as "Coming Soon" or remove

9. **Logistics Components** (`features/logistics/*`)
   - Supply Chain, Asset Management, Infrastructure
   - **Decision**: Mark as "Coming Soon" or remove

10. **Context Viewers** (`features/shared/context/*`)
    - Political Statements, Natural Disasters, Disinformation
    - **Decision**: Remove or create as ontology entities

---

## 📝 Implementation Steps

### Step 1: Complete API Clients (Day 1-2)

**`targeting.api.ts`** - Add missing functions:
```typescript
export const TargetingApi = {
  // Already exists
  getTargets: () => api.get('/targeting/targets'),
  getTarget: (id: string) => api.get(`/targeting/targets/${id}`),

  // Add these
  getDecisionGates: () => api.get('/targeting/decision-gates'),
  getActionRequired: () => api.get('/targeting/action-required'),
  getHistoricalStatus: (params) => api.get('/targeting/historical/status', { params }),
  getHistoricalF3ead: (params) => api.get('/targeting/historical/f3ead', { params }),

  // JTB
  listJtbSessions: () => api.get('/targeting/jtb/sessions'),
  createJtbSession: (data) => api.post('/targeting/jtb/sessions', data),
  // ... etc
};
```

**`operations.ts`** - Complete implementation:
```typescript
export const OperationsApi = {
  getCampaigns: () => api.get('/operations/campaigns'),
  getOperations: (campaignId: string) => api.get(`/operations/campaigns/${campaignId}/operations`),
  getMeetings: () => api.get('/operations/meetings'),
  // ... etc
};
```

**`intelligence.ts`** - Migrate to ontology:
```typescript
export const IntelligenceApi = {
  getRFIs: () => api.get('/ontology/entities?type=RFI'),
  getRFI: (id: string) => api.get(`/ontology/entities/${id}`),
  createRFI: (data) => api.post('/ontology/entities', { ...data, type: 'RFI' }),
  updateRFI: (id: string, data) => api.put(`/ontology/entities/${id}`, data),
};
```

### Step 2: Create Migration Helper (Day 2)

Create `frontend/src/lib/mshnctrl/api/index.ts`:
```typescript
// Central API export - replaces MshnCtrlService
export { TargetingApi } from './targeting.api';
export { BDAApi } from './bda';
export { ROEApi } from './roe.api';
export { OperationsApi } from './operations';
export { IntelligenceApi } from './intelligence';
export { DecisionsApi } from './decisions.api';
export { MeetingsApi } from './meetings.api';
```

### Step 3: Migrate Components (Day 3-5)

For each component:
1. Remove `import { MshnCtrlService } from '@/lib/mshnctrl/mock-service'`
2. Add `import { TargetingApi, BDAApi, ... } from '@/lib/mshnctrl/api'`
3. Replace function calls:
   - `MshnCtrlService.getTargets()` → `TargetingApi.getTargets()`
   - `MshnCtrlService.getBDAReports()` → `BDAApi.getReports()`
4. Update error handling for real API responses
5. Test component

### Step 4: Handle "No Backend" Components (Day 6-7)

For components with no backend:

**Option A: Stub UI**
```typescript
export default function OPLANViewer() {
  return (
    <div className="p-4 text-center">
      <h2>OPLAN Viewer</h2>
      <p className="text-muted-foreground mt-2">
        This feature is under development. Backend integration coming soon.
      </p>
    </div>
  );
}
```

**Option B: Remove Component**
- Delete component file
- Remove from routes
- Update documentation

### Step 5: Delete Mock Files (Day 8)

```bash
rm frontend/src/lib/mshnctrl/mock-service.ts
rm frontend/src/lib/mshnctrl/services/mock-oplan.ts
# Clean up store.ts - remove mock data sections
```

### Step 6: Verify & Test (Day 9-10)

1. Run type checking: `npm run type-check`
2. Run E2E tests: `npx playwright test`
3. Manual smoke test each migrated component
4. Update REALITY_CHECK.md with new status

---

## 🎯 Success Criteria

- ✅ Zero imports of `mock-service.ts` in codebase
- ✅ All "Production Ready" components use real APIs
- ✅ No mock data in API client files
- ✅ Documentation reflects actual feature status
- ✅ E2E tests pass

---

## 🚧 Decisions Needed

1. **CCIR Management**: Keep (need backend) or Remove (out of scope)?
2. **Planning Suite**: Build minimal backend or mark "Coming Soon"?
3. **Logistics Suite**: Build minimal backend or mark "Coming Soon"?
4. **Context Events**: Use ontology entities or remove?
5. **Digital Twin**: Remove entirely (aspirational)?

---

## 📈 Progress Tracking

- [ ] Phase 1: Audit complete
- [ ] Phase 2: API clients complete
- [ ] Phase 3: High-priority components migrated (0/4)
- [ ] Phase 4: Planning/Strategy handled
- [ ] Phase 5: Mock files deleted

**Last Updated**: 2026-02-08
