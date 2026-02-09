# Missing Role Dashboards

**Status:** Backlog
**Priority:** Medium
**Date Identified:** 2026-02-08
**Type:** Feature Gap

## Problem

The role selector dropdown in the header (`RoleSelector.tsx`) shows 9 available roles, but not all roles have dedicated dashboard routes. This creates a broken user experience when users switch to J4 or J5 roles and navigate to their designated dashboard links.

## Current State

### Roles WITH Complete Implementation (7/9)
- ✅ Commander - Uses COP Summary as dashboard
- ✅ J2 Intelligence Officer - `mshnctrl.j2-dashboard.tsx`
- ✅ J3 Operations Officer - `mshnctrl.j3-dashboard.tsx`
- ✅ LEGAD - `mshnctrl.legad-dashboard.tsx`
- ✅ Targeting Cell - `mshnctrl.targeting-cell-dashboard.tsx`
- ✅ Intelligence Analyst - `mshnctrl.analyst-dashboard.tsx`
- ✅ Information Manager - `mshnctrl.information-management.tsx`

### Roles MISSING Dedicated Dashboards (2/9)
- ❌ **J4 Logistics Officer**
  - Sidebar config: `frontend/src/features/layout/config/navigation.config.ts:155-178`
  - Expected route: `/mshnctrl/j4-dashboard`
  - File location: `frontend/src/routes/mshnctrl.j4-dashboard.tsx` (DOES NOT EXIST)

- ❌ **J5 Plans Officer**
  - Sidebar config: `frontend/src/features/layout/config/navigation.config.ts:179-207`
  - Expected route: `/mshnctrl/j5-dashboard`
  - File location: `frontend/src/routes/mshnctrl.j5-dashboard.tsx` (DOES NOT EXIST)

## Technical Details

### J4 Sidebar Navigation Structure
```typescript
// Lines 155-178 in navigation.config.ts
j4: [
  {
    label: 'J4 Dashboard',
    items: [
      { icon: Package, label: 'J4 Logistics Center', to: '/mshnctrl/j4-dashboard', permission: 'logistics.view' },
    ]
  },
  {
    label: 'Logistics Management',
    items: [
      { icon: Package, label: 'Supply Status', to: '/mshnctrl/logistics', permission: 'logistics.view' },
      { icon: Factory, label: 'Critical Infrastructure', to: '/mshnctrl/infrastructure', permission: 'infrastructure.view' },
      { icon: Network, label: 'Supply Network', to: '/mshnctrl/supply-chain', permission: 'supply_chain.view' },
    ]
  },
  // ... coordination section
]
```

### J5 Sidebar Navigation Structure
```typescript
// Lines 179-207 in navigation.config.ts
j5: [
  {
    label: 'J5 Dashboard',
    items: [
      { icon: ScrollText, label: 'J5 Plans Center', to: '/mshnctrl/j5-dashboard', permission: 'oplan.view' },
      { icon: Layers, label: 'Ontology Matrix', to: '/mshnctrl/ontology', permission: 'ontology.view' },
    ]
  },
  {
    label: 'Strategic Planning',
    items: [
      { icon: ScrollText, label: 'OPLAN Manager', to: '/mshnctrl/oplan', permission: 'oplan.view' },
      { icon: Shield, label: 'Planning Assumptions', to: '/mshnctrl/assumptions', permission: 'assumptions.view' },
      // ... more planning tools
    ]
  },
  // ... coordination section
]
```

## Proposed Solution

### Create J4 Dashboard
**File:** `frontend/src/routes/mshnctrl.j4-dashboard.tsx`

**Required Components:**
- Logistics overview metrics (supply status, readiness levels)
- Critical infrastructure status dashboard
- Supply chain network visualization
- Quick action panel for supply requests
- Recent logistics activity feed

**Data Sources:**
- Backend logistics API endpoints (currently mock)
- Infrastructure monitoring endpoints
- Supply chain tracking endpoints

### Create J5 Dashboard
**File:** `frontend/src/routes/mshnctrl.j5-dashboard.tsx`

**Required Components:**
- Active OPLAN status summary
- Campaign phase indicators
- Planning assumptions tracker
- COA comparison matrix (if applicable)
- Wargaming results summary
- CONOPS workflow status

**Data Sources:**
- Backend planning API endpoints
- Strategy service endpoints
- Assumptions management API
- Ontology service for relationship visualization

## Implementation Checklist

### J4 Dashboard
- [ ] Create route file: `frontend/src/routes/mshnctrl.j4-dashboard.tsx`
- [ ] Design dashboard layout (reference existing dashboards)
- [ ] Implement logistics metrics cards
- [ ] Add supply status visualization
- [ ] Add infrastructure map/status grid
- [ ] Integrate with backend logistics API (or mock if needed)
- [ ] Add quick action buttons for common J4 tasks
- [ ] Test role-based permissions

### J5 Dashboard
- [ ] Create route file: `frontend/src/routes/mshnctrl.j5-dashboard.tsx`
- [ ] Design dashboard layout (reference existing dashboards)
- [ ] Implement OPLAN status overview
- [ ] Add campaign phase tracker
- [ ] Add assumptions summary panel
- [ ] Add planning workflow indicators
- [ ] Integrate with backend strategy/planning APIs
- [ ] Add quick action buttons for common J5 tasks
- [ ] Test role-based permissions

## Dependencies

### Backend APIs
Check if these endpoints exist or need to be created:
- `GET /api/logistics/summary` - Logistics overview data
- `GET /api/infrastructure/status` - Infrastructure status
- `GET /api/supply-chain/network` - Supply network data
- `GET /api/strategy/oplan-status` - OPLAN status
- `GET /api/strategy/campaign-phase` - Campaign information
- `GET /api/assumptions/summary` - Assumptions overview

### Design References
Use existing dashboard implementations as templates:
- `frontend/src/routes/mshnctrl.j2-dashboard.tsx` - Intelligence dashboard pattern
- `frontend/src/routes/mshnctrl.j3-dashboard.tsx` - Operations dashboard pattern
- `frontend/src/routes/mshnctrl.legad-dashboard.tsx` - Advisory dashboard pattern

## Acceptance Criteria

- [ ] J4 role can navigate to `/mshnctrl/j4-dashboard` without 404 error
- [ ] J5 role can navigate to `/mshnctrl/j5-dashboard` without 404 error
- [ ] Both dashboards display role-appropriate information
- [ ] Both dashboards match the visual style of existing dashboards
- [ ] Navigation sidebar highlights the dashboard link when active
- [ ] Dashboards are responsive and work on different screen sizes
- [ ] Role-based permissions are enforced
- [ ] All data displays correctly (mock or real API)

## Related Files

**Role Definitions:**
- `frontend/src/lib/mshnctrl/hooks/useRoleContext.tsx:44-321` - All role definitions

**Navigation Config:**
- `frontend/src/features/layout/config/navigation.config.ts:155-178` - J4 nav
- `frontend/src/features/layout/config/navigation.config.ts:179-207` - J5 nav

**Role Selector UI:**
- `frontend/src/features/shared/RoleSelector.tsx` - Role dropdown component

**Layout Components:**
- `frontend/src/features/layout/MshnCtrlLayout.tsx` - Main layout wrapper
- `frontend/src/features/layout/MshnCtrlSidebar.tsx` - Sidebar component
- `frontend/src/features/layout/MshnCtrlHeader.tsx` - Header component

**Existing Dashboard Examples:**
- `frontend/src/routes/mshnctrl.j2-dashboard.tsx`
- `frontend/src/routes/mshnctrl.j3-dashboard.tsx`
- `frontend/src/routes/mshnctrl.legad-dashboard.tsx`
- `frontend/src/routes/mshnctrl.targeting-cell-dashboard.tsx`
- `frontend/src/routes/mshnctrl.analyst-dashboard.tsx`

## Estimated Effort

- **J4 Dashboard:** 4-6 hours (design + implementation + testing)
- **J5 Dashboard:** 4-6 hours (design + implementation + testing)
- **Total:** 8-12 hours

## Notes

- J4 and J5 dashboards can be implemented in parallel since they're independent
- Consider whether these roles need backend API endpoints or can start with mock data
- The logistics and planning features are currently marked as "mock only" in REALITY_CHECK.md
- May want to coordinate with backend team to ensure necessary API endpoints exist
