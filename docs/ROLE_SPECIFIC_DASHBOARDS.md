# Role-Specific Dashboards Design

## Overview

Each role in SmartOps has unique operational focus areas. Role-specific dashboards provide tailored views with relevant metrics, quick actions, and domain-specific insights.

## Dashboard Mapping

| Role | Dashboard Route | Focus Areas |
|------|----------------|-------------|
| **Commander** | `/smartops/cop-summary` | Overall operational picture, force readiness, multi-domain awareness |
| **Targeting Cell** | `/smartops/targeting-cell-dashboard` | ✅ **Exists** - Active targets, JTB sessions, ROE status |
| **J2 Intel** | `/smartops/j2-dashboard` | Intelligence assessments, uncertainty tracking, source reliability |
| **J3 Ops** | `/smartops/j3-dashboard` | Current operations, battle rhythm, RFIs, daily execution |
| **J5 Plans** | `/smartops/j5-dashboard` | Strategic planning, OPLANs, assumptions, campaign design |
| **J4 Log** | `/smartops/j4-dashboard` | Supply status, logistics nodes, critical infrastructure |
| **LEGAD** | `/smartops/legad-dashboard` | Advisory queue, ROE compliance, legal reviews |
| **Analyst** | `/smartops/analyst-dashboard` | Basic situational awareness, assigned tasks, read-only views |

---

## 1. Commander Dashboard (Existing: COP Summary)

**Route**: `/smartops/cop-summary`

### Sidebar Sections
- **Multi-Domain Picture**
  - RAP (Air): X tracks
  - RSP (Maritime): X tracks
  - RGP (Ground): X tracks
  
- **Force Status**
  - Forces ready: 94.2%
  - Logistics status: Green
  
- **Critical Decisions**
  - Pending approvals
  - CCIR notifications
  
- **Quick Actions**
  - View all operations
  - Decision board
  - Strategic direction

---

## 2. Targeting Cell Dashboard (Existing)

**Route**: `/smartops/targeting-cell-dashboard`

### Sidebar Sections ✅
- **Upcoming JTB Sessions**
  - Today 14:00Z
  - Tomorrow 09:00Z
  
- **ROE Status**
  - Engage: Authorized
  - Restricted: Caveats
  - Prohibited: Denied
  
- **Quick Actions**
  - Nominate new target
  - Review pending targets
  - Strike optimizer
  - BDA workbench

---

## 3. J2 Intelligence Officer Dashboard

**Route**: `/smartops/j2-dashboard`

### Key Metrics
- **Source Reliability**: 78% high confidence
- **Intelligence Gaps**: 12 active RFIs
- **Recent Updates**: 24 in last 6 hours
- **Critical Uncertainties**: 3 requiring validation

### Main Content
- **Critical Intelligence Assessments**
  - Low confidence entities (<60%)
  - Broken assumptions
  - Unvalidated reports
  
- **Recent Intelligence Updates**
  - SIGINT: Enemy comms intercepted (2h ago)
  - IMINT: New SAM deployment (4h ago)
  - HUMINT: Leadership meeting confirmed (6h ago)

### Sidebar
- **Active RFIs**
  - RFI-2401: Enemy disposition (Due today)
  - RFI-2398: Supply routes (Due tomorrow)
  
- **Source Distribution**
  - SIGINT: 45%
  - IMINT: 30%
  - HUMINT: 15%
  - OSINT: 10%
  
- **Quality Metrics**
  - Temporal currency: 6.2 hours avg
  - Corroboration rate: 72%
  
- **Quick Actions**
  - Submit new assessment
  - Review uncertainty page
  - Digital twin analysis
  - Sensor triage

---

## 4. J3 Operations Officer Dashboard

**Route**: `/smartops/j3-dashboard`

### Key Metrics
- **Operations Tempo**: High
- **Active Operations**: 3
- **Pending Proposals**: 7
- **Open RFIs**: 12

### Main Content
- **Today's Battle Rhythm**
  - 08:00Z: Morning brief
  - 12:00Z: Ops sync
  - 16:00Z: Evening update
  - 20:00Z: Night brief
  
- **Active Operations**
  - OP Resolve: Phase 3 (Execution)
  - OP Guardian: Phase 2 (Planning)
  - OP Shield: Phase 1 (Preparation)
  
- **Pending Actions**
  - 5 proposals awaiting commander approval
  - 3 RFIs requiring J2 input
  - 2 CCIR notifications pending

### Sidebar
- **Current Phase**
  - Phase: Execution
  - DEFCON: 4
  - ROE: Green
  
- **Force Status**
  - Air: Ready
  - Maritime: Ready
  - Ground: 90% ready
  
- **Recent Activity**
  - Proposal submitted (1h ago)
  - RFI answered (2h ago)
  - CCIR triggered (3h ago)
  
- **Quick Actions**
  - Submit new proposal
  - Create RFI
  - View battle rhythm
  - Combat net radio
  - Targeting board

---

## 5. J5 Plans Officer Dashboard

**Route**: `/smartops/j5-dashboard`

### Key Metrics
- **Active OPLANs**: 2
- **Campaign Phases**: 5
- **Planning Assumptions**: 34 (3 broken)
- **CoA Analysis**: 4 under review

### Main Content
- **🚨 Critical Planning Alerts**
  - 3 broken assumptions requiring immediate review
  - 1 OPLAN approaching decision point
  
- **Active Planning Efforts**
  - OPLAN 5027: Phase 3 development
  - Campaign Design: Northern axis approved
  - CoA Wargaming: Blue vs Red (in progress)
  
- **Upcoming Milestones**
  - OPLAN 5027 CDR: 3 days
  - Campaign approval: 7 days
  - Strategic direction review: 14 days

### Sidebar
- **Planning Assumptions Status**
  - 🔴 Broken: 3
  - 🟡 Challenged: 5
  - 🔵 Monitoring: 8
  - 🟢 Valid: 18
  
- **OPLAN Status**
  - Active: 2
  - In development: 1
  - Under review: 1
  
- **Strategic Context**
  - Political situation: Deteriorating
  - Enemy capability: Improving
  - Timeline pressure: High
  
- **Quick Actions**
  - Review assumptions
  - OPLAN manager
  - Campaign design
  - CoA wargamer
  - CONOPS builder
  - Strategic direction

---

## 6. J4 Logistics Officer Dashboard

**Route**: `/smartops/j4-dashboard`

### Key Metrics
- **Supply Status**: 82% stocked
- **Critical Shortages**: 2 items
- **In-Transit**: 15 shipments
- **Infrastructure Health**: 91%

### Main Content
- **Critical Supply Issues**
  - Ammunition: 72% (Below threshold)
  - Fuel: 68% (Critical)
  - Spare parts: 85% (Adequate)
  
- **Active Shipments**
  - Convoy Alpha: ETA 6 hours
  - Convoy Bravo: ETA 12 hours
  - Air resupply: ETA 2 hours
  
- **Infrastructure Status**
  - Port Alpha: Operational
  - Airfield Bravo: Operational
  - Rail line Charlie: Degraded (repair ongoing)

### Sidebar
- **Supply Levels**
  - Class I (Food): 90%
  - Class III (Fuel): 68% 🔴
  - Class V (Ammo): 72% 🟡
  - Class IX (Parts): 85%
  
- **Distribution Network**
  - Active nodes: 12
  - Degraded: 2
  - Offline: 0
  
- **Upcoming Deliveries**
  - Today: 3 shipments
  - Tomorrow: 5 shipments
  - This week: 18 shipments
  
- **Quick Actions**
  - Request resupply
  - View supply chain
  - Infrastructure map
  - Logistics dashboard

---

## 7. LEGAD (Legal Advisor) Dashboard

**Route**: `/smartops/legad-dashboard`

### Key Metrics
- **Pending Reviews**: 8
- **ROE Queries**: 3
- **Legal Holds**: 1
- **Compliance Rate**: 97%

### Main Content
- **Urgent Legal Reviews**
  - Target nomination T-2401: Dual-use facility (6h pending)
  - Strike package: Urban proximity concern (2h pending)
  - ROE interpretation: Self-defense scope (4h pending)
  
- **Recent Decisions**
  - T-2398 approved with caveats (2h ago)
  - ROE amendment authorized (6h ago)
  - Targeting restriction lifted (12h ago)
  
- **ROE Compliance**
  - Strikes reviewed: 45
  - Approved: 42
  - Denied: 1
  - Conditional: 2

### Sidebar
- **Advisory Queue**
  - High priority: 3
  - Normal: 5
  - Low: 2
  
- **ROE Status**
  - Current state: Green (Restricted)
  - Pending changes: 1
  - Recent updates: 2 (last 24h)
  
- **Legal Framework**
  - LOAC compliance: Active
  - IHL monitoring: Active
  - CJCS guidance: Current
  
- **Quick Actions**
  - Review advisory queue
  - ROE manager
  - Targeting review
  - Decision board
  - Submit legal opinion

---

## 8. Intelligence Analyst Dashboard

**Route**: `/smartops/analyst-dashboard`

### Key Metrics
- **Assigned Tasks**: 5
- **Completed Today**: 3
- **Pending RFIs**: 2
- **Reports Submitted**: 12 this week

### Main Content
- **My Assigned Tasks**
  - Analyze SIGINT intercepts (Due: 4h)
  - Update enemy ORBAT (Due: today)
  - RFI-2401 research (Due: today)
  - Track analysis for RAP (Due: tomorrow)
  - Intelligence summary draft (Due: tomorrow)
  
- **Recent Activity**
  - ORBAT update submitted (2h ago)
  - Track classification complete (4h ago)
  - RFI answered (6h ago)
  
- **Training & Resources**
  - Intel 101 course: 80% complete
  - Classification guide: v2.3
  - Reporting template: Latest

### Sidebar
- **My Workspace**
  - Tasks: 5 open
  - RFIs: 2 assigned
  - Reports: 3 drafts
  
- **Current Focus**
  - Area: Eastern sector
  - Domain: Air
  - Priority: Urgent
  
- **Quick Reference**
  - Classification guide
  - Reporting templates
  - Intel procedures
  
- **Quick Actions**
  - Submit report
  - Update track
  - View COP
  - View ORBAT
  - Weather data

---

## Implementation Strategy

### Phase 1: Core Dashboards (Priority)
1. ✅ Commander (COP Summary) - Exists
2. ✅ Targeting Cell - Exists
3. J2 Intelligence - High priority
4. J3 Operations - High priority
5. J5 Plans - High priority

### Phase 2: Supporting Dashboards
6. J4 Logistics
7. LEGAD
8. Analyst

### Phase 3: Integration
- Update SmartOpsLayout to detect role and redirect
- Add role-specific quick actions
- Cross-dashboard navigation links
- Role-specific notifications

---

## Routing Logic

```typescript
// In SmartOpsLayout or index route
const { currentRole } = useRoleContext();

const roleDashboardMap = {
    'commander': '/smartops/cop-summary',
    'targeting-cell': '/smartops/targeting-cell-dashboard',
    'j2-intel': '/smartops/j2-dashboard',
    'j3-ops': '/smartops/j3-dashboard',
    'j5-plans': '/smartops/j5-dashboard',
    'j4-log': '/smartops/j4-dashboard',
    'legad': '/smartops/legad-dashboard',
    'analyst': '/smartops/analyst-dashboard',
};

// Redirect to role-specific dashboard
if (location.pathname === '/smartops') {
    navigate({ to: roleDashboardMap[currentRole.id] });
}
```

---

## Design Patterns

### Consistent Structure
All dashboards follow:
1. **Header**: Role-specific title, key status indicators
2. **Metrics Row**: 4 key performance indicators
3. **Main Content** (2/3 width): Priority information, recent activity
4. **Sidebar** (1/3 width): Quick reference, metrics, actions

### Color Coding
- 🔴 **Red**: Critical/Urgent
- 🟡 **Amber**: Warning/Attention
- 🟢 **Green**: Normal/Good
- 🔵 **Blue**: Info/Neutral
- 🟣 **Purple**: Planning/Future

### Priority Order
1. **Critical Alerts** (always visible)
2. **Active Tasks** (current focus)
3. **Recent Activity** (context)
4. **Reference Info** (as needed)

---

**Status**: Design Complete - Ready for Implementation  
**Priority**: High - Core user experience feature  
**Estimated Effort**: 2-3 hours for all dashboards
