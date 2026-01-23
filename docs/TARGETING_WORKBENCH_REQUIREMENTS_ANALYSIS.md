# Targeting Workbench Requirements Analysis
## NATO COPD Full Implementation Assessment

**Date**: 2026-01-21  
**Status**: Requirements Analysis Complete  
**Classification**: UNCLASSIFIED  
**Version**: 1.0

---

## Executive Summary

This document analyzes comprehensive NATO Comprehensive Operations Planning Directive (COPD) requirements for a modern targeting workbench against the current SmartOps implementation. The requirements encompass 100+ functional requirements (FR) across 10 domains, plus extensive non-functional requirements (NFR).

### Current State
- **Implementation**: 35% complete (Targeting Cell Dashboard with basic features)
- **Components**: SecurityBadge, DecisionGatesBar, 6 supporting panels
- **Backend**: Basic targeting feature module exists
- **Database**: User clearances, decision gates, limited target data

### Gap Analysis Summary
- **Implemented**: ~10% of full NATO COPD requirements
- **Planned**: ~25% in existing roadmap
- **Gap**: 65% requires new implementation

### Recommendation
**Adopt phased implementation approach**:
- **Phase 1** (MVP): Essential targeting ops (12 weeks)
- **Phase 2**: Intelligence integration (8 weeks)
- **Phase 3**: Advanced features (12 weeks)
- **Phase 4**: NATO integrations (16+ weeks)

---

## Table of Contents

1. [Requirements Mapping](#requirements-mapping)
2. [Gap Analysis by Domain](#gap-analysis-by-domain)
3. [Current Implementation Review](#current-implementation-review)
4. [Scope Definition](#scope-definition)
5. [What NOT to Do](#what-not-to-do)
6. [Phased Implementation Plan](#phased-implementation-plan)
7. [Technical Architecture](#technical-architecture)
8. [Success Criteria](#success-criteria)

---

## 1. Requirements Mapping

### 1.1 Target Development & Analysis (FR-1.1.1 to FR-1.1.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.1.1 - Create/edit/manage target records | 🟡 PARTIAL | Frontend UI exists, limited backend |
| FR-1.1.2 - Multi-INT data fusion | ❌ NOT STARTED | No intelligence integration |
| FR-1.1.3 - NATO STANAG templates | ❌ NOT STARTED | Templates not implemented |
| FR-1.1.4 - Pattern of Life (90 days) | ❌ NOT STARTED | No PoL analytics |
| FR-1.1.5 - Link analysis | ❌ NOT STARTED | No network graph |
| FR-1.1.6 - Automated characterization | ❌ NOT STARTED | No automation |
| FR-1.1.7 - Multi-spectral imagery | ❌ NOT STARTED | No imagery integration |
| FR-1.1.8 - 3D modeling | ❌ NOT STARTED | No 3D capability |
| FR-1.1.9 - Mensuration | ❌ NOT STARTED | No coordinate calculations |
| FR-1.1.10 - Change detection | ❌ NOT STARTED | No comparison tools |

**Domain Coverage**: 10% (1 of 10 requirements)

### 1.2 Weaponeering & Strike Planning (FR-1.2.1 to FR-1.2.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.2.1 - Automated weaponeering | ❌ NOT STARTED | No weaponeering engine |
| FR-1.2.2 - DMPI calculation | ❌ NOT STARTED | No coordinate precision |
| FR-1.2.3 - Multiple DMPI support | ❌ NOT STARTED | Single target only |
| FR-1.2.4 - Weapon effects calculation | ❌ NOT STARTED | No effects modeling |
| FR-1.2.5 - JMEM integration | ❌ NOT STARTED | No JMEM access |
| FR-1.2.6 - TOT coordination | ❌ NOT STARTED | No timing coordination |
| FR-1.2.7 - Route planning | ❌ NOT STARTED | No route calculation |
| FR-1.2.8 - Strike package options | ❌ NOT STARTED | No option generation |
| FR-1.2.9 - Multi-domain support | ❌ NOT STARTED | Air focus only |
| FR-1.2.10 - Fuel/time calculations | ❌ NOT STARTED | No logistics |

**Domain Coverage**: 0% (0 of 10 requirements)

### 1.3 Collateral Damage Estimation (FR-1.3.1 to FR-1.3.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.3.1 - Automated CDE (CJCSI 3160.01) | 🟡 PARTIAL | DecisionGatesBar shows status |
| FR-1.3.2 - Structure identification | ❌ NOT STARTED | No spatial analysis |
| FR-1.3.3 - Casualty estimation | ❌ NOT STARTED | No population models |
| FR-1.3.4 - CDE Level 1-5 support | ❌ NOT STARTED | No level differentiation |
| FR-1.3.5 - Protected structure ID | ❌ NOT STARTED | No database of protected sites |
| FR-1.3.6 - Fragmentation patterns | ❌ NOT STARTED | No physics modeling |
| FR-1.3.7 - Time-of-day analysis | ❌ NOT STARTED | No temporal population |
| FR-1.3.8 - What-if analysis | ❌ NOT STARTED | No scenario comparison |
| FR-1.3.9 - CDE report generation | ❌ NOT STARTED | No reporting |
| FR-1.3.10 - Mitigation recommendations | ❌ NOT STARTED | No AI recommendations |

**Domain Coverage**: 10% (1 of 10 requirements, status-only)

### 1.4 Geospatial Integration (FR-1.4.1 to FR-1.4.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.4.1 - Multi-layer mapping (50+ layers) | ❌ NOT STARTED | No map integration |
| FR-1.4.2 - Standard formats (KML, GeoJSON, etc.) | ❌ NOT STARTED | No geospatial I/O |
| FR-1.4.3 - ROZ, NSL overlays | 🟡 PARTIAL | ROE panel, no map display |
| FR-1.4.4 - Terrain analysis | ❌ NOT STARTED | No elevation data |
| FR-1.4.5 - Coordinate conversion | ❌ NOT STARTED | No datum support |
| FR-1.4.6 - Measurement tools | ❌ NOT STARTED | No distance/bearing tools |
| FR-1.4.7 - Drawing/annotation | ❌ NOT STARTED | No map annotation |
| FR-1.4.8 - 3D terrain visualization | ❌ NOT STARTED | No 3D capability |
| FR-1.4.9 - Threat range rings | ❌ NOT STARTED | No threat modeling |
| FR-1.4.10 - Route planning | ❌ NOT STARTED | No route tools |

**Domain Coverage**: 5% (0.5 of 10 requirements)

### 1.5 Intelligence Support (FR-1.5.1 to FR-1.5.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.5.1 - DCGS interface | ❌ NOT STARTED | No external systems |
| FR-1.5.2 - Automated intel query | ❌ NOT STARTED | No federation |
| FR-1.5.3 - ISR collection cueing | ❌ NOT STARTED | No ISR integration |
| FR-1.5.4 - Intelligence gaps tracking | ❌ NOT STARTED | No gap analysis |
| FR-1.5.5 - NAI/TAI management | ❌ NOT STARTED | No area management |
| FR-1.5.6 - Timeline correlation | ❌ NOT STARTED | No temporal analysis |
| FR-1.5.7 - Automated alerts | ❌ NOT STARTED | No alert system |
| FR-1.5.8 - Source reliability tracking | ❌ NOT STARTED | No credibility system |
| FR-1.5.9 - Hypothesis testing | ❌ NOT STARTED | No alternative analysis |
| FR-1.5.10 - Red team perspectives | ❌ NOT STARTED | No red team support |

**Domain Coverage**: 0% (0 of 10 requirements)

### 1.6 Target List Management (FR-1.6.1 to FR-1.6.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.6.1 - JTL structure | 🟡 PARTIAL | Basic target list |
| FR-1.6.2 - Dynamic Target List | 🟡 PARTIAL | DTL concept in UI |
| FR-1.6.3 - Nomination workflow | 🟡 PARTIAL | Basic workflow |
| FR-1.6.4 - Target prioritization | 🟡 PARTIAL | Manual priority only |
| FR-1.6.5 - Target set grouping | ❌ NOT STARTED | No grouping logic |
| FR-1.6.6 - Status tracking | 🟢 IMPLEMENTED | Multiple statuses shown |
| FR-1.6.7 - Deconfliction | 🟡 PARTIAL | DecisionGatesBar shows status |
| FR-1.6.8 - TST support | ❌ NOT STARTED | No TST differentiation |
| FR-1.6.9 - NSL/RTL maintenance | 🟡 PARTIAL | ROE panel shows restrictions |
| FR-1.6.10 - Bulk operations | ❌ NOT STARTED | No batch processing |

**Domain Coverage**: 35% (3.5 of 10 requirements)

### 1.7 Strike Coordination & Execution (FR-1.7.1 to FR-1.7.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.7.1 - ATO nominations | ❌ NOT STARTED | No ATO generation |
| FR-1.7.2 - Target materials (9-line, etc.) | ❌ NOT STARTED | No standardized products |
| FR-1.7.3 - Real-time updates | ❌ NOT STARTED | No real-time comms |
| FR-1.7.4 - Weapon employment tracking | ❌ NOT STARTED | No munitions tracking |
| FR-1.7.5 - TBMCS coordination | ❌ NOT STARTED | No external integration |
| FR-1.7.6 - Dynamic re-targeting | ❌ NOT STARTED | No re-tasking |
| FR-1.7.7 - Abort/divert recommendations | ❌ NOT STARTED | No real-time assessment |
| FR-1.7.8 - Munitions expenditure | ❌ NOT STARTED | No inventory tracking |
| FR-1.7.9 - Multi-domain coordination | ❌ NOT STARTED | No joint ops support |
| FR-1.7.10 - Order generation | ❌ NOT STARTED | No FRAGO/EXORD |

**Domain Coverage**: 0% (0 of 10 requirements)

### 1.8 Battle Damage Assessment (FR-1.8.1 to FR-1.8.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.8.1 - Post-strike imagery | ❌ NOT STARTED | No imagery integration |
| FR-1.8.2 - Before/after comparison | ❌ NOT STARTED | No comparison tools |
| FR-1.8.3 - Physical damage assessment | 🟡 PARTIAL | RecentBDAPanel shows results |
| FR-1.8.4 - Functional damage assessment | ❌ NOT STARTED | No effects tracking |
| FR-1.8.5 - Re-attack recommendation | ❌ NOT STARTED | No automation |
| FR-1.8.6 - Effects achievement tracking | ❌ NOT STARTED | No desired vs. actual |
| FR-1.8.7 - Multi-source BDA integration | ❌ NOT STARTED | No multi-INT BDA |
| FR-1.8.8 - BDA report generation | ❌ NOT STARTED | No reporting |
| FR-1.8.9 - Collateral tracking | ❌ NOT STARTED | No actual vs. estimate |
| FR-1.8.10 - Lessons learned capture | ❌ NOT STARTED | No learning system |

**Domain Coverage**: 10% (1 of 10 requirements)

### 1.9 Legal & Policy Compliance (FR-1.9.1 to FR-1.9.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.9.1 - ROE checks | 🟡 PARTIAL | ROE panel displays rules |
| FR-1.9.2 - Legal review workflow | ❌ NOT STARTED | No JAG workflow |
| FR-1.9.3 - LOAC verification | ❌ NOT STARTED | No compliance checks |
| FR-1.9.4 - Proportionality assessments | ❌ NOT STARTED | No assessments |
| FR-1.9.5 - Audit trail | 🟡 PARTIAL | Classification audit log exists |
| FR-1.9.6 - Military necessity docs | ❌ NOT STARTED | No documentation |
| FR-1.9.7 - Higher approval flagging | ❌ NOT STARTED | No authority checks |
| FR-1.9.8 - Restricted target procedures | ❌ NOT STARTED | No enforcement |
| FR-1.9.9 - POLMIL advisor review | ❌ NOT STARTED | No advisor workflow |
| FR-1.9.10 - Legal review packages | ❌ NOT STARTED | No package generation |

**Domain Coverage**: 20% (2 of 10 requirements)

### 1.10 Collaboration & Workflow (FR-1.10.1 to FR-1.10.10)

| Requirement | Status | Notes |
|------------|--------|-------|
| FR-1.10.1 - Multi-user concurrent access | 🟢 IMPLEMENTED | Backend supports concurrency |
| FR-1.10.2 - RBAC | 🟢 IMPLEMENTED | Role-based access functional |
| FR-1.10.3 - Commenting/annotation | ❌ NOT STARTED | No collaboration features |
| FR-1.10.4 - Workflow routing | 🟡 PARTIAL | JTB workflow exists |
| FR-1.10.5 - Notifications/alerting | ❌ NOT STARTED | No notification system |
| FR-1.10.6 - Version control | ❌ NOT STARTED | No versioning |
| FR-1.10.7 - Chat/messaging | ❌ NOT STARTED | No chat |
| FR-1.10.8 - Coalition sharing | ❌ NOT STARTED | No REL TO implementation |
| FR-1.10.9 - Shift handover docs | ❌ NOT STARTED | No handover system |
| FR-1.10.10 - Activity dashboard | 🟡 PARTIAL | ActionRequiredPanel shows work |

**Domain Coverage**: 35% (3.5 of 10 requirements)

---

## 2. Gap Analysis by Domain

### Summary Table

| Domain | Requirements | Implemented | Partial | Not Started | Coverage |
|--------|--------------|-------------|---------|-------------|----------|
| 1.1 Target Development | 10 | 0 | 1 | 9 | 10% |
| 1.2 Weaponeering | 10 | 0 | 0 | 10 | 0% |
| 1.3 CDE | 10 | 0 | 1 | 9 | 10% |
| 1.4 Geospatial | 10 | 0 | 1 | 9 | 5% |
| 1.5 Intelligence | 10 | 0 | 0 | 10 | 0% |
| 1.6 Target Lists | 10 | 1 | 4 | 5 | 35% |
| 1.7 Strike Coordination | 10 | 0 | 0 | 10 | 0% |
| 1.8 BDA | 10 | 0 | 1 | 9 | 10% |
| 1.9 Legal/Policy | 10 | 0 | 2 | 8 | 20% |
| 1.10 Collaboration | 10 | 2 | 3 | 5 | 35% |
| **TOTAL** | **100** | **3** | **13** | **84** | **12.5%** |

### Non-Functional Requirements Status

| Category | Status | Notes |
|----------|--------|-------|
| **NFR-2.1 Performance** | 🟡 PARTIAL | No load testing, refresh rates TBD |
| **NFR-2.2 Security** | 🟢 GOOD | Classification system implemented |
| **NFR-2.3 Availability** | 🟡 PARTIAL | No HA, no DR testing |
| **NFR-2.4 Usability** | 🟢 GOOD | Modern UI, dark mode, intuitive |
| **NFR-2.5 Interoperability** | ❌ NOT STARTED | No external integrations |
| **NFR-2.6 Scalability** | ❌ NOT TESTED | Unknown capacity |
| **NFR-2.7 Maintainability** | 🟢 GOOD | Modular architecture |

---

## 3. Current Implementation Review

### What Exists Today (35% of Redesign Scope)

#### Frontend Components ✅
1. **SecurityBadge** - Classification markings (U, CUI, S, TS, TS/SCI)
2. **DecisionGatesBar** - 4 GO/NO-GO indicators (ROE, CDE, Weather, Deconfliction)
3. **ActionRequiredPanel** - Priority work queue
4. **QuickStatsPanel** - Key metrics display
5. **ROEQuickReferencePanel** - ROE status
6. **MissionContextPanel** - Operational context
7. **RecentBDAPanel** - BDA results
8. **TargetingCellDashboard** - Main dashboard layout (50/50 split)
9. **JTBSessionsWithTabs** - JTB scheduling (Today/Week/Month/Operation views)

#### Backend Features ✅
1. **Targeting Feature Module** - `backend/src/features/targeting/`
2. **User Clearances** - `user_clearances` table
3. **Classification Audit** - `classification_audit_log` table
4. **Decision Gates** - Status tables for ROE, CDE, Weather, Deconfliction
5. **RBAC** - Role-based access control functional
6. **JWT Auth** - RS256 authentication with refresh tokens

#### Database Schema ✅
- `user_clearances` - User security clearances
- `classification_audit_log` - Classified data access logs
- `roe_status` - Rules of Engagement status
- `cde_status` - Collateral Damage Estimation status
- `weather_status` - Weather conditions for ops
- `deconfliction_status` - Airspace deconfliction

### What's Missing (65% Gap)

#### Critical Gaps (Must Have for MVP)
1. **Target Database** - No comprehensive target data model
2. **Nomination Workflow** - No backend workflow engine
3. **Intelligence Integration** - No multi-INT fusion
4. **Weaponeering Engine** - No munitions-to-target pairing
5. **CDE Calculator** - No actual CDE computation
6. **Geospatial Services** - No map, coordinates, terrain
7. **BDA Tracking** - No structured BDA workflow
8. **API Completeness** - Only basic endpoints exist

#### Important Gaps (Post-MVP)
1. **External Integrations** - No DCGS, TBMCS, MIDB
2. **Real-Time Updates** - No WebSocket infrastructure
3. **Reporting System** - No document generation
4. **Advanced Analytics** - No Pattern of Life, no predictive
5. **3D Visualization** - No terrain modeling
6. **Coalition Support** - No REL TO filtering
7. **ML/AI Features** - No automated recommendations
8. **Shift Handover** - No automated briefs

---

## 4. Scope Definition

### MVP Scope (Phase 1: 12 Weeks)

#### What We WILL Build ✅

**Core Targeting Operations**
1. ✅ **Target Management**
   - Create, read, update, delete targets
   - Target types: HPT, HVT, TST
   - Priority levels: CRITICAL, HIGH, MEDIUM, LOW
   - Status workflow: NOMINATED → VALIDATED → APPROVED → ENGAGED → ASSESSED
   - F3EAD stage tracking
   - Basic geolocation (lat/lon coordinates)
   - Classification per target

2. ✅ **Dynamic Target List (DTL)**
   - Target prioritization (manual)
   - TST identification with countdown
   - Aging indicators (hours since nomination)
   - Approval workflow tracking
   - JTB session assignment

3. ✅ **Joint Targeting Board (JTB) Support**
   - Session scheduling
   - Target assignment to sessions
   - Session status (SCHEDULED, DRAFT, COMPLETED)
   - Attendee tracking
   - Decision recording

4. ✅ **Battle Damage Assessment (BDA)**
   - BDA submission (DESTROYED, DAMAGED, INTACT, UNKNOWN)
   - Effectiveness percentage
   - Desired vs. achieved effects
   - Re-attack recommendations (manual)
   - Before/after notes

5. ✅ **Rules of Engagement (ROE)**
   - ROE categories (ENGAGE, RESTRICTED, PROHIBITED)
   - Target association
   - Status tracking
   - Quick reference display

6. ✅ **Collateral Damage Estimation (CDE)**
   - CDE level (1-5)
   - Estimated civilian casualties
   - Protected structures nearby
   - Approval status
   - Mitigation notes

7. ✅ **Decision Gates**
   - ROE compliance check
   - CDE approval status
   - Weather conditions
   - Deconfliction status
   - GO/NO-GO display

8. ✅ **Classification & Security**
   - Panel-level classification
   - Item-level classification
   - User clearance filtering
   - Audit logging
   - Security banners

**Supporting Features**
9. ✅ **Action Required Panel** - Work queue with priorities
10. ✅ **Mission Context** - Commander's intent, guidance
11. ✅ **Quick Stats** - Key metrics dashboard
12. ✅ **Role-Based Access** - Targeting Manager, Analyst, View Only

#### Backend Architecture (Phase 1)

**Database Schema**
```sql
-- Core tables to implement:
targets
dtl_entries
jtb_sessions
jtb_targets (junction)
bda_assessments
roe_entries
cde_assessments
decision_gates_status
mission_context
targeting_annotations
```

**API Endpoints** (~40 endpoints)
```
/api/targeting/targets/*
/api/targeting/dtl/*
/api/targeting/jtb/*
/api/targeting/bda/*
/api/targeting/roe/*
/api/targeting/cde/*
/api/targeting/decision-gates/*
/api/targeting/mission-context/*
```

**Rust Feature Modules**
- `targeting::targets` - Target CRUD
- `targeting::dtl` - Dynamic target list
- `targeting::jtb` - JTB management
- `targeting::bda` - BDA tracking
- `targeting::roe` - ROE enforcement
- `targeting::cde` - CDE workflow
- `targeting::gates` - Decision gates
- `targeting::mission` - Mission context

### Post-MVP Scope (Phases 2-4: 36+ Weeks)

#### Phase 2: Intelligence Integration (8 weeks)
- Multi-INT data fusion (SIGINT, IMINT, HUMINT, GEOINT)
- Pattern of Life analytics
- ISR platform integration
- Intelligence reports database
- Alternative analysis framework
- Red team perspectives

#### Phase 3: Advanced Targeting (12 weeks)
- Automated weaponeering engine
- JMEM integration
- Multi-spectral imagery comparison
- Link analysis (network graphs)
- Strike package generation
- TOT coordination planning
- Route planning (ingress/egress)

#### Phase 4: NATO Integration (16+ weeks)
- DCGS interface (Distributed Common Ground System)
- TBMCS integration (Theater Battle Management Core Systems)
- MIDB access (Modernized Integrated Database)
- VMF/USMTF messaging
- ATO generation
- Coalition data sharing (REL TO)
- NITFS imagery format support

---

## 5. What NOT to Do

### Explicit Out-of-Scope Items ❌

#### External Integrations (Phase 1)
1. ❌ **NO DCGS integration** - Distributed Common Ground System
2. ❌ **NO TBMCS integration** - Theater Battle Management
3. ❌ **NO MIDB access** - Modernized Integrated Database
4. ❌ **NO NGA imagery** - National Geospatial-Intelligence Agency
5. ❌ **NO JMEM integration** - Joint Munitions Effectiveness Manual
6. ❌ **NO JWICS messaging** - Joint Worldwide Intelligence Communications System
7. ❌ **NO SIPRNET gateways** - Secret Internet Protocol Router Network
8. ❌ **NO Blue Force Tracking** - Friendly force location systems
9. ❌ **NO METOC services** - Meteorological and Oceanographic
10. ❌ **NO ATO exports** - Air Tasking Order generation

#### Advanced Features (Phase 1)
1. ❌ **NO automated weaponeering** - Munitions recommendations
2. ❌ **NO automated CDE calculation** - Physics-based models
3. ❌ **NO Pattern of Life** - 90-day behavioral analytics
4. ❌ **NO link analysis** - Target network graphs
5. ❌ **NO multi-spectral imagery** - IR, SAR, multispectral
6. ❌ **NO 3D modeling** - 3D target reconstruction
7. ❌ **NO mensuration tools** - Precision measurements
8. ❌ **NO change detection** - Temporal imagery comparison
9. ❌ **NO route planning** - Ingress/egress calculation
10. ❌ **NO TOT coordination** - Time on target deconfliction

#### Geospatial Features (Phase 1)
1. ❌ **NO interactive maps** - Leaflet/OpenLayers/Mapbox
2. ❌ **NO multi-layer GIS** - 50+ layer support
3. ❌ **NO KML/KMZ import** - Geospatial file formats
4. ❌ **NO terrain analysis** - Elevation profiles, LOS
5. ❌ **NO coordinate conversion** - Multiple datum support
6. ❌ **NO distance/bearing tools** - Measurement utilities
7. ❌ **NO drawing/annotation** - Map markup
8. ❌ **NO 3D terrain** - 3D visualization
9. ❌ **NO threat range rings** - SAM/AAA coverage
10. ❌ **NO protected sites overlay** - No-strike database

#### Intelligence Features (Phase 1)
1. ❌ **NO ISR collection cueing** - No sensor tasking
2. ❌ **NO intelligence gaps tracking** - No gap analysis
3. ❌ **NO NAI/TAI management** - No area of interest tools
4. ❌ **NO timeline correlation** - No temporal analysis
5. ❌ **NO automated alerts** - No new intelligence push
6. ❌ **NO source reliability** - No credibility scoring
7. ❌ **NO hypothesis testing** - No alternative analysis
8. ❌ **NO red team integration** - No adversary COA
9. ❌ **NO cognitive bias detection** - No AI bias alerts
10. ❌ **NO multi-INT fusion** - No SIGINT/IMINT/HUMINT merging

#### Collaboration Features (Phase 1)
1. ❌ **NO real-time chat** - No messaging system
2. ❌ **NO video conferencing** - No virtual JTB
3. ❌ **NO screen sharing** - No collaboration tools
4. ❌ **NO whiteboarding** - No digital canvas
5. ❌ **NO email integration** - No Outlook/Gmail sync
6. ❌ **NO calendar sync** - No meeting integration
7. ❌ **NO notifications** - No email/SMS alerts (in-app only)
8. ❌ **NO document sharing** - No SharePoint integration
9. ❌ **NO version control** - No track changes
10. ❌ **NO shift handover automation** - Manual handoffs only

#### Reporting & Analytics (Phase 1)
1. ❌ **NO PowerPoint export** - No briefing generation
2. ❌ **NO PDF reports** - No formatted documents
3. ❌ **NO Excel export** - CSV only if needed
4. ❌ **NO dashboard customization** - Fixed layout
5. ❌ **NO custom widgets** - Standard panels only
6. ❌ **NO data warehouse** - Operational data only
7. ❌ **NO business intelligence** - No Tableau/Power BI
8. ❌ **NO predictive analytics** - No ML forecasting
9. ❌ **NO trend analysis** - No historical charting
10. ❌ **NO lessons learned system** - No knowledge base

#### User Experience (Phase 1)
1. ❌ **NO mobile app** - Desktop web only
2. ❌ **NO tablet optimization** - Desktop focus
3. ❌ **NO offline mode** - Network required
4. ❌ **NO custom themes** - Dark mode only
5. ❌ **NO layout customization** - Fixed dashboard
6. ❌ **NO language support** - English only
7. ❌ **NO accessibility beyond basics** - Basic compliance
8. ❌ **NO tutorial/onboarding** - Assume trained users
9. ❌ **NO in-app help** - External documentation
10. ❌ **NO voice commands** - Mouse/keyboard only

#### Technical Constraints (Always)
1. ❌ **NO real classified data in development** - Mock data only
2. ❌ **NO .sh test scripts** - Playwright tests only (user requirement)
3. ❌ **NO library replacements without approval** - User requirement
4. ❌ **NO blockchain/distributed ledger** - Standard database
5. ❌ **NO custom encryption** - TLS/HTTPS standard
6. ❌ **NO quantum-resistant crypto** - Standard algorithms
7. ❌ **NO hardware token auth** - JWT only for now
8. ❌ **NO biometric authentication** - Username/password
9. ❌ **NO screenshot prevention** - Browser limitation
10. ❌ **NO watermarking** - Classification banners only

### Why These Boundaries?

**Focus on Core Value**
- 80/20 Rule: 80% of targeting value from 20% of features
- Ship functional MVP in 12 weeks, not "perfect" product in 12 months
- Get user feedback early, iterate based on real usage

**Technical Constraints**
- Browser limitations (no native app capabilities)
- Security requirements (classification handling complex enough)
- Development time (12 weeks = hard choices required)
- Integration complexity (external systems require months of coordination)

**Risk Management**
- Attack surface (more features = more vulnerabilities)
- Maintenance burden (every feature needs long-term support)
- User confusion (too many options slow down targeting decisions)
- Classification creep (each feature needs security review)

**Resource Constraints**
- Small team (can't build everything at once)
- Limited military SME availability (validate core workflows first)
- No external system access yet (integrations require ATO/STIGs)
- Budget limitations (prioritize highest ROI features)

---

## 6. Phased Implementation Plan

### Phase 1: MVP Foundation (12 Weeks)

**Objective**: Functional targeting workbench for local operations

#### Week 1-2: Backend Foundation
- Database schema design and implementation
- Core CRUD APIs for targets, DTL, JTB, BDA
- Classification middleware
- Migration scripts

**Deliverables**:
- ✅ 9 database tables created
- ✅ ~40 API endpoints functional
- ✅ Rust feature modules structured
- ✅ Unit tests passing

#### Week 3-4: Target Management
- Target nomination workflow
- F3EAD stage tracking
- Priority/status management
- Target detail views

**Deliverables**:
- ✅ Create/edit/delete targets
- ✅ Workflow state machine
- ✅ Classification enforcement
- ✅ Playwright E2E tests

#### Week 5-6: JTB & DTL
- JTB session management
- Target-to-session assignment
- DTL prioritization
- TST countdown timers

**Deliverables**:
- ✅ JTB scheduling interface
- ✅ DTL priority matrix
- ✅ TST identification
- ✅ Session decision recording

#### Week 7-8: BDA & ROE
- BDA submission workflow
- Effects tracking
- ROE enforcement
- Protected target lists

**Deliverables**:
- ✅ BDA assessment interface
- ✅ Re-attack recommendations
- ✅ ROE compliance checks
- ✅ NSL/RTL management

#### Week 9-10: CDE & Decision Gates
- CDE assessment workflow
- Decision gates integration
- Mission context panel
- Real-time status updates

**Deliverables**:
- ✅ CDE levels 1-5 support
- ✅ GO/NO-GO indicators
- ✅ Commander's intent display
- ✅ Weather/deconfliction status

#### Week 11-12: Integration & Testing
- Full system integration
- Performance optimization
- Comprehensive E2E tests
- Documentation completion

**Deliverables**:
- ✅ All components integrated
- ✅ <30s refresh rate
- ✅ 100% test coverage for workflows
- ✅ User documentation complete

**Success Criteria**:
- ✅ Can nominate target through full cycle (Find → Assess)
- ✅ JTB can review and approve targets
- ✅ BDA can be submitted and tracked
- ✅ Decision gates display correctly
- ✅ Classification markings enforced
- ✅ All Playwright tests pass
- ✅ No linter errors

### Phase 2: Intelligence Integration (8 Weeks)

**Objective**: Multi-INT data fusion and pattern analysis

#### Week 13-14: Intelligence Database
- Intelligence reports schema
- Multi-INT source types (SIGINT, IMINT, HUMINT, GEOINT)
- Source reliability tracking
- Confidence scoring

#### Week 15-16: ISR Platform Integration
- ISR platform tracking
- Collection status
- Coverage gap analysis
- Tasking interface

#### Week 17-18: Pattern of Life
- Temporal analytics
- Behavioral patterns
- Predictive windows
- Targeting cues

#### Week 19-20: Alternative Analysis
- Assumption challenge board
- Red team perspectives
- Cognitive bias detection
- Devil's advocate questions

**Phase 2 Deliverables**:
- ✅ Multi-INT fusion display
- ✅ Pattern of Life analytics (30-day minimum)
- ✅ ISR collection management
- ✅ Alternative analysis framework

### Phase 3: Advanced Targeting (12 Weeks)

**Objective**: Weaponeering and strike planning automation

#### Week 21-24: Weaponeering Engine
- Munitions database
- Munitions-to-target pairing
- JMEM integration (if available)
- Weapon effects calculation

#### Week 25-28: Geospatial Services
- Map integration (Leaflet/OpenLayers)
- Multi-layer GIS (15-20 layers minimum)
- Coordinate management
- Distance/bearing tools

#### Week 29-32: Strike Planning
- DMPI calculation
- TOT coordination
- Strike package generation
- Route planning (basic)

**Phase 3 Deliverables**:
- ✅ Automated weaponeering recommendations
- ✅ Interactive map with target overlays
- ✅ Strike package options
- ✅ TOT deconfliction

### Phase 4: NATO Integration (16+ Weeks)

**Objective**: External system interfaces and coalition support

#### Week 33-36: DCGS Interface
- DCGS connector development
- Intelligence query API
- Data synchronization
- Error handling

#### Week 37-40: TBMCS Integration
- ATO nomination export
- Target materials generation
- 9-line/mission card format
- Status synchronization

#### Week 41-44: Coalition Support
- REL TO filtering
- Mission Partner Environment (MPE)
- Foreign disclosure controls
- Partner data sharing

#### Week 45-48: Final Integration
- End-to-end testing with external systems
- Performance tuning
- Security accreditation prep
- Training material development

**Phase 4 Deliverables**:
- ✅ DCGS/TBMCS interfaces functional
- ✅ ATO nominations generated
- ✅ Coalition data sharing
- ✅ System accreditation ready

---

## 7. Technical Architecture

### Backend Architecture (Rust/Axum)

```
backend/src/features/targeting/
├── domain/
│   ├── target.rs          # Target entity & business logic
│   ├── dtl.rs             # Dynamic Target List
│   ├── jtb.rs             # Joint Targeting Board
│   ├── bda.rs             # Battle Damage Assessment
│   ├── roe.rs             # Rules of Engagement
│   ├── cde.rs             # Collateral Damage Estimation
│   ├── gates.rs           # Decision Gates
│   ├── mission.rs         # Mission Context
│   └── mod.rs
├── handlers/
│   ├── targets.rs         # Target HTTP handlers
│   ├── dtl.rs             # DTL handlers
│   ├── jtb.rs             # JTB handlers
│   ├── bda.rs             # BDA handlers
│   ├── roe.rs             # ROE handlers
│   ├── cde.rs             # CDE handlers
│   ├── gates.rs           # Decision gates handlers
│   ├── mission.rs         # Mission context handlers
│   └── mod.rs
├── repositories/
│   ├── targets.rs         # Target database access
│   ├── dtl.rs             # DTL database access
│   ├── jtb.rs             # JTB database access
│   ├── bda.rs             # BDA database access
│   ├── roe.rs             # ROE database access
│   ├── cde.rs             # CDE database access
│   ├── gates.rs           # Decision gates DB access
│   ├── mission.rs         # Mission context DB access
│   └── mod.rs
├── services/
│   ├── workflow.rs        # Workflow orchestration
│   ├── prioritization.rs  # Target prioritization logic
│   ├── validation.rs      # Business rule validation
│   ├── notification.rs    # Alert/notification service
│   └── mod.rs
├── middleware/
│   ├── classification.rs  # Classification filtering
│   ├── clearance.rs       # User clearance checks
│   └── mod.rs
├── router.rs              # Route definitions
└── mod.rs
```

### Database Schema (SQLite → PostgreSQL for Production)

**Phase 1 Core Tables** (9 tables):
```sql
1. targets                 -- Core target entities
2. dtl_entries             -- Dynamic Target List
3. jtb_sessions            -- Joint Targeting Board sessions
4. jtb_targets             -- Junction table (sessions ↔ targets)
5. bda_assessments         -- Battle Damage Assessments
6. roe_entries             -- Rules of Engagement
7. cde_assessments         -- Collateral Damage Estimates
8. decision_gates_status   -- GO/NO-GO indicators
9. mission_context         -- Commander's intent, guidance
```

**Phase 2 Intelligence Tables** (3 tables):
```sql
10. intelligence_reports   -- Multi-INT reports
11. isr_platforms          -- ISR asset tracking
12. pattern_of_life        -- Behavioral analytics
```

**Phase 3 Advanced Tables** (4 tables):
```sql
13. munitions_inventory    -- Munitions database
14. weaponeering_pairs     -- Munitions-to-target recommendations
15. strike_packages        -- Strike planning
16. geospatial_layers      -- GIS layer management
```

**Phase 4 Integration Tables** (2 tables):
```sql
17. external_sync_log      -- External system sync tracking
18. coalition_sharing      -- REL TO sharing records
```

### Frontend Architecture (React TypeScript)

```
frontend/src/features/smartops/
├── components/
│   ├── targeting/         # NEW: Targeting-specific components
│   │   ├── TargetCard.tsx
│   │   ├── TargetDetailView.tsx (already exists)
│   │   ├── TargetNominationForm.tsx
│   │   ├── DTLBoard.tsx
│   │   ├── JTBSessionManager.tsx
│   │   ├── BDASubmissionForm.tsx
│   │   ├── ROECheckPanel.tsx
│   │   ├── CDEWorkflow.tsx
│   │   ├── F3EADPipelineFunnel.tsx
│   │   ├── TSTAlertBanner.tsx
│   │   └── TargetPriorityMatrix.tsx
│   ├── DecisionGatesBar.tsx (already exists)
│   ├── SecurityBadge.tsx (already exists)
│   └── ...
├── services/
│   └── targetingService.ts  # API client for targeting
├── types/
│   └── targeting.ts          # TypeScript interfaces
└── routes/
    ├── targeting-cell-dashboard.tsx (already exists)
    ├── targeting/
    │   ├── index.tsx          # Target list
    │   ├── $targetId.tsx      # Target detail
    │   ├── nominate.tsx       # Nomination form
    │   ├── dtl.tsx            # Dynamic Target List
    │   ├── jtb/
    │   │   ├── index.tsx      # JTB session list
    │   │   └── $sessionId.tsx # JTB session detail
    │   ├── bda/
    │   │   ├── index.tsx      # BDA list
    │   │   └── $bdaId.tsx     # BDA detail
    │   └── ...
```

### API Endpoints (Phase 1: ~40 endpoints)

```
# Target Management
GET    /api/targeting/targets
POST   /api/targeting/targets
GET    /api/targeting/targets/:id
PUT    /api/targeting/targets/:id
DELETE /api/targeting/targets/:id
PATCH  /api/targeting/targets/:id/status
PATCH  /api/targeting/targets/:id/f3ead-stage
GET    /api/targeting/targets/:id/timeline

# Dynamic Target List
GET    /api/targeting/dtl
POST   /api/targeting/dtl
PUT    /api/targeting/dtl/:id/priority
GET    /api/targeting/dtl/tst
GET    /api/targeting/dtl/matrix

# Joint Targeting Board
GET    /api/targeting/jtb/sessions
POST   /api/targeting/jtb/sessions
GET    /api/targeting/jtb/sessions/:id
PUT    /api/targeting/jtb/sessions/:id
DELETE /api/targeting/jtb/sessions/:id
POST   /api/targeting/jtb/sessions/:id/targets
DELETE /api/targeting/jtb/sessions/:sessionId/targets/:targetId
POST   /api/targeting/jtb/sessions/:id/decisions

# Battle Damage Assessment
GET    /api/targeting/bda
POST   /api/targeting/bda
GET    /api/targeting/bda/:id
PUT    /api/targeting/bda/:id
GET    /api/targeting/bda/target/:targetId

# Rules of Engagement
GET    /api/targeting/roe
POST   /api/targeting/roe
GET    /api/targeting/roe/:id
PUT    /api/targeting/roe/:id
DELETE /api/targeting/roe/:id
GET    /api/targeting/roe/target/:targetId

# Collateral Damage Estimation
GET    /api/targeting/cde
POST   /api/targeting/cde
GET    /api/targeting/cde/:id
PUT    /api/targeting/cde/:id
GET    /api/targeting/cde/target/:targetId

# Decision Gates
GET    /api/targeting/decision-gates
GET    /api/targeting/decision-gates/:targetId
PUT    /api/targeting/decision-gates/:targetId

# Mission Context
GET    /api/targeting/mission-context
PUT    /api/targeting/mission-context
```

---

## 8. Success Criteria

### Phase 1 MVP Acceptance Criteria

#### Functional Requirements
- ✅ **FR-1.1.1**: Can create, edit, delete targets with unique IDs
- ✅ **FR-1.6.2**: Dynamic Target List displays with real-time updates
- ✅ **FR-1.6.3**: Nomination workflow tracks from NOMINATED to ASSESSED
- ✅ **FR-1.6.6**: Target status updates correctly across all views
- ✅ **FR-1.8.3**: BDA assessment can be submitted with status
- ✅ **FR-1.9.1**: ROE checks display current rules
- ✅ **FR-1.9.5**: Audit trail logs all classified data access
- ✅ **FR-1.10.1**: Multiple users can access concurrently
- ✅ **FR-1.10.2**: RBAC enforces role permissions

#### Non-Functional Requirements
- ✅ **NFR-2.1.1**: Target records load in <2 seconds
- ✅ **NFR-2.1.6**: Geospatial layers render in <3 seconds (if implemented)
- ✅ **NFR-2.2.1**: System operates at SECRET//NOFORN classification
- ✅ **NFR-2.2.3**: Automated classification marking on all products
- ✅ **NFR-2.2.9**: Audit logs retained for minimum 7 years
- ✅ **NFR-2.4.1**: Intuitive UI requiring <8 hours training
- ✅ **NFR-2.4.4**: Dark mode optimized for ops centers

#### Technical Acceptance
- ✅ **Zero linter errors** (Rust: clippy, Frontend: ESLint)
- ✅ **All Playwright E2E tests pass** (local testing per user requirement)
- ✅ **100% workflow coverage** (nomination → approval → engagement → BDA)
- ✅ **Database migrations reversible** (up/down scripts)
- ✅ **API documentation complete** (OpenAPI/Swagger)
- ✅ **Classification enforcement verified** (clearance-based filtering)
- ✅ **Docker images run on Mac M2** (user requirement)

#### User Acceptance
- ✅ **Targeting cell can nominate target end-to-end** (<10 minutes)
- ✅ **JTB can review and approve targets** (<5 minutes per target)
- ✅ **BDA can be submitted and displayed** (<3 minutes)
- ✅ **Decision gates accurately reflect GO/NO-GO status**
- ✅ **No classification spillage** (user sees only cleared data)
- ✅ **90% user satisfaction** (post-demo survey)

#### Operational Metrics (Target)
- ✅ **Target nomination to JTB approval**: <2 hours (non-TST)
- ✅ **TST approval time**: <30 minutes
- ✅ **BDA submission time**: <1 hour post-strike
- ✅ **Decision gate refresh rate**: <30 seconds
- ✅ **System uptime**: 99% during testing phase

---

## Conclusion & Recommendations

### Summary of Findings

1. **Current State**: 12.5% of full NATO COPD requirements implemented
2. **Gap**: 87.5% requires new development across 10 functional domains
3. **Complexity**: 100+ requirements span intelligence, weaponeering, geospatial, legal domains
4. **Timeline**: Full implementation would require 48+ weeks (Phase 1-4)

### Recommended Approach

**Phase 1 MVP (12 weeks)** - APPROVE THIS FIRST
- Focus on core targeting operations
- Target management, DTL, JTB, BDA, ROE, CDE
- No external integrations
- No advanced AI/ML features
- No geospatial (coordinates only, no maps)
- Get to functional targeting workbench fast

**Defer to Future Phases** - EVALUATE AFTER MVP
- Intelligence integration (Phase 2)
- Weaponeering automation (Phase 3)
- NATO system interfaces (Phase 4)
- Advanced analytics (Phase 5+)

### Decision Points

**Approve Phase 1 Scope?**
- [ ] YES - Proceed with 12-week MVP implementation
- [ ] NO - Revise scope (specify changes)

**Accept "What NOT to Do" List?**
- [ ] YES - Boundaries are clear and acceptable
- [ ] NO - Need to discuss specific inclusions

**Agree on Success Criteria?**
- [ ] YES - Phase 1 acceptance criteria approved
- [ ] NO - Need to adjust metrics/requirements

---

## Appendices

### Appendix A: Full Requirements Traceability Matrix
(To be developed during Phase 1 implementation - maps each FR to specific code modules)

### Appendix B: NATO Standards Reference
- COPD (Comprehensive Operations Planning Directive)
- STANAG 2014 (Formats for Orders and Designations)
- STANAG 2022 (Intelligence Reports)
- STANAG 2096 (Orders for Land Fires)
- ADatP-3 (NATO Message Text Formatting System)

### Appendix C: Test Plan Summary
- Unit tests: Backend Rust modules
- Integration tests: API endpoints
- E2E tests: Playwright workflows
- Security tests: Classification enforcement
- Performance tests: Load testing (100+ targets)

### Appendix D: Risk Register
(To be maintained throughout implementation)

---

**Document Status**: DRAFT FOR APPROVAL  
**Next Action**: Stakeholder review and approval  
**Decision Required By**: 2026-01-28  
**Implementation Start**: Upon approval  

**Classification**: UNCLASSIFIED  
**Last Updated**: 2026-01-21  
**Version**: 1.0
