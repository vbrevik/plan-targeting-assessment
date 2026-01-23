# Targeting Cell Dashboard - NATO COPD Implementation Plan

## Executive Summary

This document outlines the implementation plan for a comprehensive Targeting Cell Dashboard based on NATO Comprehensive Operations Planning Directive (COPD) and Alternative Analysis Principles. This expands the existing targeting cell dashboard with 8 core operational components designed for dynamic targeting operations in 24/7 operations centers.

## Current State

### Existing Features (35% Complete)
- **SecurityBadge Component**: Classification markings (UNCLASS, CUI, SECRET, TS, TS/SCI)
- **DecisionGatesBar Component**: 4 GO/NO-GO gates (ROE, CDE, Weather, Deconfliction)
- **Basic Dashboard**: Key metrics, priority targets, JTB sessions, strike assessments
- **Role-Based Access**: Targeting Cell role with dedicated navigation
- **Database**: User clearances, classification audit log, decision gates status tables

### Technology Stack
- **Backend**: Rust/Axum on port 3000, SQLite database
- **Frontend**: React TypeScript, TanStack Router, Tailwind CSS
- **Testing**: Playwright E2E tests (local only)

## 8 Core Components to Implement

### 1. Mission Command Overview Panel ✅ (Partially Complete)
**Purpose**: Display commander's intent, targeting guidance, and operational tempo

**Status**: DecisionGatesBar provides some of this functionality

**Additional Requirements**:
- Commander's Intent Tracker with current phase, priority effects, endstate metrics
- Targeting Guidance Status with ROE summary (already have), collateral damage thresholds
- Decision Authority Matrix showing delegation authorities and approval chains
- Operational Tempo Gauge with mission timeline and critical decision points

### 2. Target Nomination & Prioritization Board ⬜ (To Build)
**Purpose**: Manage the Dynamic Target List (DTL) with F3EAD cycle integration

**Requirements**:
- Dynamic Target List status with aging indicators (time since nomination)
- Target Priority Matrix (heat map showing priority vs. feasibility)
- Nomination Pipeline funnel visualization (Find → Fix → Finish → Exploit → Analyze → Disseminate)
- Target Approval Status workflow (nominated → validated → approved → engaged → assessed)
- Critical Time-Sensitive Targets (TST) with countdown timers

### 3. Intelligence Integration Panel ⬜ (To Build)
**Purpose**: Real-time ISR integration and multi-INT fusion

**Requirements**:
- Pattern of Life Analytics for High Payoff Targets (HPTs)
- ISR Collection Status (platform positions, sensor coverage gaps, loiter time)
- Predictive Targeting Cues (AI/ML probability windows for HVT appearance)
- Multi-INT Fusion Display (SIGINT, IMINT, HUMINT, GEOINT convergence)
- Alternative Analysis Alerts (red team findings, assumption challenges, bias warnings)

### 4. Effects Assessment Dashboard ⬜ (To Build)
**Purpose**: Post-strike Battle Damage Assessment (BDA) and effects tracking

**Requirements**:
- BDA Tracker (immediate post-strike status per target)
- Desired Effects vs. Achieved gap analysis with re-engagement recommendations
- Collateral Damage Tracking (actual vs. estimated CDE)
- Tactical Effects Cascade (how completed strikes affect operational objectives)
- Re-attack Recommendations (automated flagging based on BDA and intel updates)

### 5. Asset & Capability Management ⬜ (To Build)
**Purpose**: Strike platform availability and munitions-to-target pairing

**Requirements**:
- Strike Platform Availability (munitions inventory, sortie availability, platform status)
- Weather & Environmental Factors (impact on sensors, munitions, timing windows)
- Deconfliction Status (airspace coordination, blue force tracking, no-strike list updates)
- Munitions-to-Target Pairing (automated recommendations based on target type, desired effects, availability)

### 6. Risk & Constraints Monitor ⬜ (To Build)
**Purpose**: Fratricide prevention and political sensitivity tracking

**Requirements**:
- Fratricide Risk Indicator (proximity of friendly forces to target areas)
- Political Sensitivity Index (targets near protected sites, civilian infrastructure, cultural landmarks)
- Legal Review Status (JAG approval pipeline, proportionality assessments)
- Second and Third Order Effects (predictive impact on civilian populations, infrastructure, adversary behavior)

### 7. Alternative Analysis Integration ⬜ (To Build)
**Purpose**: Critical thinking safeguards and cognitive bias detection

**Requirements**:
- Assumption Challenge Board (key assumptions with confidence levels and alternative hypotheses)
- Red Team Perspectives (continuously updated adversary COA predictions)
- Cognitive Bias Alerts (confirmation bias, anchoring, groupthink detection)
- Devil's Advocate Questions (automated prompts for critical thinking)
- Scenario Planning Widget (quick access to branch plans if primary targeting fails)

### 8. Collaborative Workspace ⬜ (To Build)
**Purpose**: Multi-domain integration and decision logging

**Requirements**:
- Multi-Domain Integration View (land, air, maritime, cyber, space, information operations)
- Chat & Annotation Tools (secure collaboration on target packages)
- Decision Log (timestamped record of all targeting decisions with rationale)
- Shift Handover Summary (automated brief generation for personnel turnover)

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2) - Backend Core
**Objective**: Database schema and API foundation for all 8 components

**Tasks**:
1. Design comprehensive database schema
2. Create Rust feature modules for each component
3. Implement REST API endpoints
4. Add authentication/authorization for targeting operations
5. Create migration scripts

**Deliverables**:
- `backend/src/features/targeting/` module structure
- Database tables for targets, nominations, ISR, BDA, assets, risks, analysis, collaboration
- API documentation

### Phase 2: Mission Command & Target Board (Weeks 3-4) - Components 1-2
**Objective**: Implement mission command overview and target nomination/prioritization

**Tasks**:
1. Build Commander's Intent Tracker component
2. Create Target Priority Matrix heat map
3. Implement F3EAD funnel visualization
4. Build TST countdown timers
5. Integrate with DecisionGatesBar

**Deliverables**:
- MissionCommandPanel component
- TargetNominationBoard component
- Dynamic Target List with aging indicators
- Approval workflow UI

### Phase 3: Intelligence & Effects (Weeks 5-6) - Components 3-4
**Objective**: Implement intelligence integration and effects assessment

**Tasks**:
1. Build Pattern of Life analytics display
2. Create Multi-INT fusion visualization
3. Implement BDA tracking system
4. Build Effects Cascade visualization
5. Create Alternative Analysis alerts

**Deliverables**:
- IntelligenceIntegrationPanel component
- EffectsAssessmentDashboard component
- Multi-INT data fusion engine
- BDA tracking system

### Phase 4: Assets & Risk Management (Weeks 7-8) - Components 5-6
**Objective**: Implement asset management and risk monitoring

**Tasks**:
1. Build Strike Platform Availability tracker
2. Create Munitions-to-Target pairing engine
3. Implement Fratricide Risk calculator
4. Build Political Sensitivity Index
5. Create Legal Review pipeline

**Deliverables**:
- AssetCapabilityPanel component
- RiskConstraintsMonitor component
- Munitions recommendation engine
- Risk scoring algorithms

### Phase 5: Analysis & Collaboration (Weeks 9-10) - Components 7-8
**Objective**: Implement alternative analysis and collaborative workspace

**Tasks**:
1. Build Assumption Challenge Board
2. Create Red Team Perspectives display
3. Implement Cognitive Bias detection
4. Build Collaborative Chat & Annotations
5. Create Decision Log system
6. Build Shift Handover generator

**Deliverables**:
- AlternativeAnalysisPanel component
- CollaborativeWorkspace component
- Decision logging system
- Shift handover automation

### Phase 6: Integration & Testing (Weeks 11-12)
**Objective**: Full system integration and E2E testing

**Tasks**:
1. Integrate all 8 components into dashboard
2. Create comprehensive Playwright tests
3. Performance optimization (<30s refresh rate)
4. Mobile/tablet compatibility testing
5. Documentation and user guides

**Deliverables**:
- Fully integrated dashboard
- Complete Playwright test suite
- Performance benchmarks
- User documentation

## Database Schema Design

### Core Tables

```sql
-- Target Management
CREATE TABLE targets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL, -- HPT, HVT, TST
  priority TEXT NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  status TEXT NOT NULL, -- NOMINATED, VALIDATED, APPROVED, ENGAGED, ASSESSED
  coordinates TEXT NOT NULL, -- JSON: {lat, lon, altitude}
  intelligence_confidence INTEGER, -- 0-100%
  classification TEXT NOT NULL,
  caveats TEXT, -- JSON array
  nominated_by TEXT NOT NULL,
  nominated_at TIMESTAMP NOT NULL,
  f3ead_stage TEXT NOT NULL, -- FIND, FIX, FINISH, EXPLOIT, ANALYZE, DISSEMINATE
  time_window_start TIMESTAMP,
  time_window_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Target List
CREATE TABLE dtl_entries (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL REFERENCES targets(id),
  priority_score REAL NOT NULL, -- 0.0-1.0
  feasibility_score REAL NOT NULL, -- 0.0-1.0
  aging_hours INTEGER NOT NULL,
  tst_deadline TIMESTAMP,
  approval_chain TEXT, -- JSON array of approvers
  current_approver TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Battle Damage Assessment
CREATE TABLE bda_assessments (
  id TEXT PRIMARY KEY,
  strike_id TEXT NOT NULL,
  target_id TEXT NOT NULL REFERENCES targets(id),
  strike_time TIMESTAMP NOT NULL,
  assessment_time TIMESTAMP NOT NULL,
  bda_status TEXT NOT NULL, -- DESTROYED, DAMAGED, INTACT, UNKNOWN
  effectiveness_percentage INTEGER, -- 0-100%
  desired_effects TEXT, -- JSON array
  achieved_effects TEXT, -- JSON array
  collateral_damage_actual TEXT, -- JSON
  collateral_damage_estimated TEXT, -- JSON
  re_attack_recommended BOOLEAN DEFAULT FALSE,
  re_attack_reason TEXT,
  classification TEXT NOT NULL,
  assessed_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISR Collection Management
CREATE TABLE isr_platforms (
  id TEXT PRIMARY KEY,
  platform_type TEXT NOT NULL, -- UAV, Satellite, Aircraft
  platform_name TEXT NOT NULL,
  current_position TEXT, -- JSON: {lat, lon, altitude}
  sensor_type TEXT NOT NULL, -- EO, IR, SAR, SIGINT
  coverage_area TEXT, -- JSON polygon
  loiter_time_remaining INTEGER, -- minutes
  status TEXT NOT NULL, -- ACTIVE, RTB, MAINTENANCE, OFFLINE
  tasking_priority TEXT,
  classification TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-INT Fusion
CREATE TABLE intelligence_reports (
  id TEXT PRIMARY KEY,
  target_id TEXT REFERENCES targets(id),
  int_type TEXT NOT NULL, -- SIGINT, IMINT, HUMINT, GEOINT
  report_content TEXT NOT NULL,
  confidence_level INTEGER NOT NULL, -- 0-100%
  source_reliability TEXT NOT NULL, -- A, B, C, D, E, F
  collection_time TIMESTAMP NOT NULL,
  fusion_score REAL, -- 0.0-1.0 for multi-INT convergence
  pattern_of_life_indicator BOOLEAN DEFAULT FALSE,
  classification TEXT NOT NULL,
  caveats TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Strike Assets & Capabilities
CREATE TABLE strike_platforms (
  id TEXT PRIMARY KEY,
  platform_type TEXT NOT NULL, -- Fighter, Bomber, Artillery, Missile
  platform_name TEXT NOT NULL,
  munitions_available TEXT, -- JSON: [{type, count, range, effects}]
  sortie_availability INTEGER, -- count
  platform_status TEXT NOT NULL, -- READY, TASKED, MAINTENANCE, UNAVAILABLE
  location TEXT, -- JSON: {lat, lon}
  classification TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk & Constraints
CREATE TABLE risk_assessments (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL REFERENCES targets(id),
  fratricide_risk TEXT NOT NULL, -- NONE, LOW, MEDIUM, HIGH, CRITICAL
  friendly_distance_km REAL,
  political_sensitivity TEXT NOT NULL, -- NONE, LOW, MEDIUM, HIGH, CRITICAL
  sensitive_sites_nearby TEXT, -- JSON array
  legal_review_status TEXT NOT NULL, -- NOT_REQUIRED, PENDING, APPROVED, REJECTED
  legal_reviewer TEXT,
  legal_review_notes TEXT,
  proportionality_assessment TEXT,
  second_order_effects TEXT, -- JSON predictions
  classification TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alternative Analysis
CREATE TABLE assumption_challenges (
  id TEXT PRIMARY KEY,
  assumption_text TEXT NOT NULL,
  confidence_level INTEGER NOT NULL, -- 0-100%
  alternative_hypothesis TEXT,
  evidence_supporting TEXT, -- JSON array
  evidence_contradicting TEXT, -- JSON array
  red_team_perspective TEXT,
  bias_type TEXT, -- CONFIRMATION, ANCHORING, GROUPTHINK, AVAILABILITY
  challenge_status TEXT NOT NULL, -- VALID, MONITORING, CHALLENGED
  reviewed_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collaborative Workspace
CREATE TABLE decision_log (
  id TEXT PRIMARY KEY,
  decision_type TEXT NOT NULL,
  decision_text TEXT NOT NULL,
  rationale TEXT NOT NULL,
  decision_maker TEXT NOT NULL,
  decision_maker_role TEXT NOT NULL,
  authority_level TEXT NOT NULL, -- TACTICAL, OPERATIONAL, STRATEGIC
  related_targets TEXT, -- JSON array of target IDs
  approval_chain TEXT, -- JSON array
  decision_time TIMESTAMP NOT NULL,
  classification TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shift_handovers (
  id TEXT PRIMARY KEY,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- DAY, NIGHT
  outgoing_watch_officer TEXT NOT NULL,
  incoming_watch_officer TEXT NOT NULL,
  active_targets_summary TEXT NOT NULL,
  pending_decisions TEXT NOT NULL,
  critical_issues TEXT,
  recommendations TEXT,
  classification TEXT NOT NULL,
  handover_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE targeting_annotations (
  id TEXT PRIMARY KEY,
  target_id TEXT REFERENCES targets(id),
  user_id TEXT NOT NULL,
  annotation_text TEXT NOT NULL,
  annotation_type TEXT NOT NULL, -- COMMENT, QUESTION, WARNING, APPROVAL
  parent_annotation_id TEXT REFERENCES targeting_annotations(id),
  classification TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Design

### Target Management
```
GET    /api/targeting/targets                    # List all targets with filters
POST   /api/targeting/targets                    # Create new target nomination
GET    /api/targeting/targets/:id                # Get target details
PUT    /api/targeting/targets/:id                # Update target
DELETE /api/targeting/targets/:id                # Remove target
GET    /api/targeting/targets/:id/timeline       # Get F3EAD timeline
PUT    /api/targeting/targets/:id/advance-stage  # Advance F3EAD stage
```

### Dynamic Target List
```
GET    /api/targeting/dtl                        # Get DTL with priority matrix
POST   /api/targeting/dtl                        # Add to DTL
PUT    /api/targeting/dtl/:id/priority           # Update priority score
GET    /api/targeting/dtl/tst                    # Get TSTs with countdown
```

### Battle Damage Assessment
```
GET    /api/targeting/bda                        # List all BDA assessments
POST   /api/targeting/bda                        # Create BDA assessment
GET    /api/targeting/bda/:id                    # Get BDA details
PUT    /api/targeting/bda/:id                    # Update BDA
GET    /api/targeting/bda/re-attack              # Get re-attack recommendations
```

### ISR Management
```
GET    /api/targeting/isr/platforms              # List ISR platforms
GET    /api/targeting/isr/coverage               # Get coverage gaps map
GET    /api/targeting/isr/pattern-of-life        # Get pattern of life analytics
GET    /api/targeting/isr/predictive-cues        # Get AI/ML targeting windows
```

### Intelligence Fusion
```
GET    /api/targeting/intel/reports              # List intelligence reports
POST   /api/targeting/intel/reports              # Submit intelligence report
GET    /api/targeting/intel/fusion/:target_id    # Get multi-INT fusion for target
GET    /api/targeting/intel/convergence          # Get convergence indicators
```

### Strike Assets
```
GET    /api/targeting/assets/platforms           # List strike platforms
GET    /api/targeting/assets/munitions           # Get munitions inventory
POST   /api/targeting/assets/pair                # Get munitions-to-target pairing
GET    /api/targeting/assets/availability        # Get sortie availability
```

### Risk Assessment
```
GET    /api/targeting/risk/:target_id            # Get risk assessment
POST   /api/targeting/risk                       # Create risk assessment
PUT    /api/targeting/risk/:id                   # Update risk assessment
GET    /api/targeting/risk/fratricide            # Get fratricide risk map
GET    /api/targeting/risk/political             # Get political sensitivity index
GET    /api/targeting/risk/legal-review          # Get legal review pipeline
```

### Alternative Analysis
```
GET    /api/targeting/analysis/assumptions       # Get assumption challenge board
POST   /api/targeting/analysis/assumptions       # Challenge assumption
GET    /api/targeting/analysis/red-team          # Get red team perspectives
GET    /api/targeting/analysis/bias-alerts       # Get cognitive bias alerts
GET    /api/targeting/analysis/devil-advocate    # Get devil's advocate questions
```

### Collaboration
```
GET    /api/targeting/decisions                  # Get decision log
POST   /api/targeting/decisions                  # Log decision
GET    /api/targeting/handovers                  # Get shift handovers
POST   /api/targeting/handovers/generate         # Generate handover summary
GET    /api/targeting/annotations/:target_id     # Get target annotations
POST   /api/targeting/annotations                # Add annotation
```

### Mission Command
```
GET    /api/targeting/mission/intent             # Get commander's intent
PUT    /api/targeting/mission/intent             # Update commander's intent
GET    /api/targeting/mission/guidance           # Get targeting guidance
GET    /api/targeting/mission/authority-matrix   # Get decision authority matrix
GET    /api/targeting/mission/tempo              # Get operational tempo gauge
```

## Frontend Component Architecture

### Layout Structure
```
/smartops/targeting-cell-dashboard
├── Header
│   ├── Mission Phase Indicator
│   ├── Alert Level Badge
│   └── Classification Banner
├── DecisionGatesBar (existing)
├── Main Grid (2-column responsive)
│   ├── Left Column (60%)
│   │   ├── MissionCommandOverview
│   │   ├── TargetNominationBoard
│   │   ├── IntelligenceIntegrationPanel
│   │   └── EffectsAssessmentDashboard
│   └── Right Column (40%)
│       ├── AssetCapabilityManagement
│       ├── RiskConstraintsMonitor
│       ├── AlternativeAnalysisPanel
│       └── CollaborativeWorkspace
└── Footer
    └── Shift Handover Quick Access
```

### Component Hierarchy

**MissionCommandOverview**
- CommanderIntentTracker
- TargetingGuidanceStatus
- DecisionAuthorityMatrix
- OperationalTempoGauge

**TargetNominationBoard**
- DynamicTargetListStatus
- TargetPriorityMatrix (heat map)
- F3EADPipelineFunnel
- TargetApprovalWorkflow
- TSTAlertSection (with countdown)

**IntelligenceIntegrationPanel**
- PatternOfLifeAnalytics
- ISRCollectionStatus
- PredictiveTargetingCues
- MultiINTFusionDisplay
- AlternativeAnalysisAlerts

**EffectsAssessmentDashboard**
- BDATracker
- DesiredVsAchievedGapAnalysis
- CollateralDamageTracking
- TacticalEffectsCascade
- ReAttackRecommendations

**AssetCapabilityManagement**
- StrikePlatformAvailability
- WeatherEnvironmentalFactors
- DeconflictionStatus
- MunitionsToTargetPairing

**RiskConstraintsMonitor**
- FratricideRiskIndicator
- PoliticalSensitivityIndex
- LegalReviewStatus
- SecondThirdOrderEffects

**AlternativeAnalysisPanel**
- AssumptionChallengeBoard
- RedTeamPerspectives
- CognitiveBiasAlerts
- DevilsAdvocateQuestions
- ScenarioPlanningWidget

**CollaborativeWorkspace**
- MultiDomainIntegrationView
- ChatAnnotationTools
- DecisionLog
- ShiftHandoverSummary

## Visual Design Principles

### Color System
- **Dark Mode Default**: `slate-950` background, `slate-100` text
- **Status Colors**:
  - Green: Approved, Ready, Valid (`emerald-500`)
  - Amber: Pending, Monitoring, Caution (`amber-500`)
  - Red: Critical, Prohibited, Alert (`red-500`)
  - Blue: Intelligence, Information (`blue-500`)
  - Cyan: Performance metrics (`cyan-500`)
  - Purple: Analysis, Planning (`purple-500`)

### Typography
- **Headers**: `font-mono uppercase tracking-wider` (tactical aesthetic)
- **Body**: `font-sans` (readability)
- **Metrics**: `text-3xl font-bold` (glanceable)
- **Labels**: `text-xs uppercase` (compact)

### Spacing & Layout
- **Grid**: 12-column responsive grid
- **Gaps**: Consistent `gap-4` between elements
- **Padding**: `p-4` for panels, `p-2` for cards
- **Borders**: `border-slate-700` for separation

### Interactive Elements
- **Drill-Down**: Click any metric to expand detailed view
- **Real-Time Updates**: 30-second refresh intervals
- **Notifications**: Toast alerts for critical events
- **Geospatial**: Embedded map overlays (future phase)

## UX Features

### Glanceable Metrics
- Large numerals for critical counts
- Progress rings for completion percentages
- Color-coded status indicators
- Trend arrows (↑ improving, ↓ degrading)

### Data Visualization
- **Sankey Diagrams**: Target flow through F3EAD cycle
- **Network Graphs**: Target systems and dependencies
- **Gantt Charts**: Timeline view of planned strikes vs. collection windows
- **Heat Maps**: Geographic density of targets, threat systems, civilian populations

### Mobile Access
- Responsive design (tablet/laptop compatibility)
- Touch-friendly controls
- Optimized for 1024x768 minimum resolution

## Alternative Analysis Safeguards

### Mandatory Pause Points
- System-enforced 30-second "think" period before TST approval
- Require confirmation checkboxes for critical decisions
- Display alternative options before committing

### Diversity Prompts
- Require input from at least 3 different INT disciplines
- Flag targets with only single-source intelligence
- Warn if all analysts agree (possible groupthink)

### Historical Pattern Warnings
- Alert if current targeting resembles past errors
- Display lessons learned from similar situations
- Show precedent cases with outcomes

### Assumption Expiration
- Flag intelligence older than established confidence thresholds
- Auto-downgrade confidence for aging intelligence
- Require revalidation for targets >72 hours old

## Critical Success Factors

### Performance
- **Latency**: <30-second refresh rate for dynamic data
- **Scalability**: Handle 500+ targets simultaneously across theater
- **Responsiveness**: UI interactions <200ms response time

### Security
- **Classification**: Appropriate marking on all data
- **RBAC**: Role-based access control (targeting_cell, commander, analyst)
- **Audit**: Log all classified information access
- **Clearance**: Auto-filter data based on user clearance level

### Integration (Future)
- DCGS (Distributed Common Ground System)
- TBMCS (Theater Battle Management Core Systems)
- AOC (Air Operations Center) systems
- National-level intelligence databases

### Resilience
- Degraded operations capability if network connectivity drops
- Local caching for critical data
- Offline mode for read-only access

## What NOT to Do

### Scope Boundaries

❌ **DO NOT**:
1. **Build a full mission planning system** - This is a dashboard/visualization tool, not a planning tool
2. **Implement real weapon system interfaces** - Mock data only; actual C2 integration is Phase 2+
3. **Create a GIS/mapping system from scratch** - Use third-party libraries if needed (future phase)
4. **Build a chat application** - Simple annotations only; full chat is out of scope for MVP
5. **Implement ML/AI models** - Use mock predictive data; actual ML is Phase 3+
6. **Create a document management system** - Links only; external DMS integration later
7. **Build a video streaming system for ISR feeds** - Not in scope for dashboard
8. **Implement cryptographic communications** - Use standard HTTPS; dedicated crypto is external
9. **Create a personnel management system** - Use existing auth; HR integration is separate
10. **Build a weather forecasting system** - Consume external weather APIs only

### Technical Constraints

❌ **DO NOT**:
1. **Use WebSockets for everything** - Only where real-time is critical (TST countdown, alerts)
2. **Create custom charting libraries** - Use Recharts or similar established libraries
3. **Build a custom state management system** - React hooks + context is sufficient
4. **Implement custom authentication** - Use existing JWT auth from SmartOps
5. **Create a custom CSS framework** - Use Tailwind CSS exclusively
6. **Build a custom icon library** - Use Lucide React icons
7. **Implement custom date/time handling** - Use date-fns or similar
8. **Create a custom validation library** - Use Zod or similar
9. **Build a custom HTTP client** - Use fetch API or existing client
10. **Implement custom logging** - Use console or existing logger

### UX/UI Constraints

❌ **DO NOT**:
1. **Create animated 3D visualizations** - Keep it 2D, focused, operational
2. **Add sound effects or audio alerts** - Visual alerts only for MVP
3. **Build a mobile-first design** - Desktop/tablet first, mobile later
4. **Create custom fonts** - Use system fonts or Google Fonts
5. **Add gamification elements** - This is a serious operational tool
6. **Build a customizable dashboard** - Fixed layout for consistency
7. **Implement user themes** - Dark mode only for 24/7 ops centers
8. **Create tutorial/onboarding flows** - Assume trained operators
9. **Add social sharing features** - Classified environment, no sharing
10. **Build a feedback/rating system** - Not needed for command tool

### Data Constraints

❌ **DO NOT**:
1. **Store actual classified data in development** - Mock data only
2. **Create real-time database replication** - Standard database is sufficient
3. **Build a data warehouse** - Operational data only, not historical analysis
4. **Implement blockchain/distributed ledger** - Not needed for command tool
5. **Create custom encryption schemes** - Use standard TLS/HTTPS
6. **Build a backup/restore system** - Use database backups
7. **Implement data versioning** - Standard audit log is sufficient
8. **Create a data migration tool** - Manual migration scripts are fine
9. **Build an ETL pipeline** - Direct database queries are sufficient
10. **Implement real-time analytics** - Pre-computed metrics are fine for MVP

## Testing Strategy

### Unit Tests (Rust Backend)
```bash
cd backend
cargo test --features targeting
```

### Component Tests (React Frontend)
```bash
cd frontend
npm test
```

### E2E Tests (Playwright)
Create comprehensive E2E tests covering:
1. **Target Nomination Workflow**: Create → Validate → Approve → Engage → Assess
2. **TST Countdown**: Verify time-sensitive target alerts and countdown
3. **Decision Gates**: Check ROE, CDE, Weather, Deconfliction status
4. **BDA Tracking**: Submit BDA and verify effects assessment
5. **Risk Assessment**: Calculate and display fratricide risk
6. **Alternative Analysis**: Challenge assumptions and show bias alerts
7. **Decision Logging**: Log decision and verify audit trail
8. **Shift Handover**: Generate and verify handover summary
9. **Classification**: Verify proper classification markings
10. **Role-Based Access**: Verify targeting cell role permissions

Example test structure:
```typescript
// tests/targeting-cell-nato-copd.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Targeting Cell Dashboard - NATO COPD', () => {
  test('should display all 8 core components', async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    
    // Verify all panels are present
    await expect(page.getByText('Mission Command Overview')).toBeVisible();
    await expect(page.getByText('Target Nomination & Prioritization')).toBeVisible();
    await expect(page.getByText('Intelligence Integration')).toBeVisible();
    await expect(page.getByText('Effects Assessment')).toBeVisible();
    await expect(page.getByText('Asset & Capability Management')).toBeVisible();
    await expect(page.getByText('Risk & Constraints Monitor')).toBeVisible();
    await expect(page.getByText('Alternative Analysis')).toBeVisible();
    await expect(page.getByText('Collaborative Workspace')).toBeVisible();
  });

  test('should handle TST nomination workflow', async ({ page }) => {
    await page.goto('/smartops/targeting/emergency');
    
    // Fill TST nomination form
    await page.fill('[name="targetId"]', 'T-TST-001');
    await page.fill('[name="targetName"]', 'Enemy Command Post');
    await page.fill('[name="coordinates"]', '42.3601,-71.0589');
    await page.selectOption('[name="priority"]', 'CRITICAL');
    await page.fill('[name="timeWindow"]', '120'); // 2 hours
    
    // Submit nomination
    await page.click('button:has-text("Nominate TST")');
    
    // Verify TST appears in dashboard with countdown
    await page.goto('/smartops/targeting-cell-dashboard');
    await expect(page.getByText('T-TST-001')).toBeVisible();
    await expect(page.locator('.tst-countdown')).toBeVisible();
  });

  test('should display alternative analysis alerts', async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    
    // Verify assumption challenge alerts
    const analysisPanel = page.locator('[data-panel="alternative-analysis"]');
    await expect(analysisPanel.getByText('Assumption Challenges')).toBeVisible();
    await expect(analysisPanel.getByText('Cognitive Bias Alert')).toBeVisible();
    
    // Click to view details
    await analysisPanel.click();
    await expect(page.getByText('Confirmation Bias Detected')).toBeVisible();
  });

  test('should enforce mandatory pause for TST approval', async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    
    // Select TST requiring approval
    await page.click('text=T-TST-001');
    
    // Try to approve immediately (should be disabled)
    const approveButton = page.getByRole('button', { name: 'Approve Strike' });
    await expect(approveButton).toBeDisabled();
    
    // Wait for 30-second pause
    await page.waitForTimeout(30000);
    
    // Approve button should now be enabled
    await expect(approveButton).toBeEnabled();
  });
});
```

## Documentation Requirements

### User Documentation
1. **Targeting Cell Dashboard User Guide** (`docs/TARGETING_CELL_USER_GUIDE.md`)
2. **F3EAD Workflow Guide** (`docs/F3EAD_WORKFLOW.md`)
3. **Alternative Analysis Best Practices** (`docs/ALTERNATIVE_ANALYSIS_PRACTICES.md`)
4. **Decision Authority Matrix** (`docs/DECISION_AUTHORITY_MATRIX.md`)

### Technical Documentation
1. **API Reference** (`docs/TARGETING_API_REFERENCE.md`)
2. **Database Schema** (`docs/TARGETING_DATABASE_SCHEMA.md`)
3. **Component Library** (`docs/TARGETING_COMPONENTS.md`)
4. **Classification Handling** (`docs/CLASSIFICATION_GUIDELINES.md`)

### Operational Documentation
1. **Standard Operating Procedures** (`docs/TARGETING_SOP.md`)
2. **Troubleshooting Guide** (`docs/TARGETING_TROUBLESHOOTING.md`)
3. **Integration Points** (`docs/TARGETING_INTEGRATIONS.md`)

## Implementation Timeline

### Week-by-Week Breakdown

**Week 1-2: Foundation**
- Database schema design and implementation
- Backend Rust feature modules
- API endpoint structure
- Authentication/authorization

**Week 3-4: Mission Command & Target Board**
- MissionCommandOverview component
- TargetNominationBoard component
- F3EAD pipeline visualization
- TST countdown timers

**Week 5-6: Intelligence & Effects**
- IntelligenceIntegrationPanel component
- EffectsAssessmentDashboard component
- Multi-INT fusion display
- BDA tracking system

**Week 7-8: Assets & Risk**
- AssetCapabilityManagement component
- RiskConstraintsMonitor component
- Munitions-to-target pairing
- Fratricide risk calculator

**Week 9-10: Analysis & Collaboration**
- AlternativeAnalysisPanel component
- CollaborativeWorkspace component
- Decision logging system
- Shift handover generator

**Week 11-12: Integration & Testing**
- Full dashboard integration
- Playwright E2E tests
- Performance optimization
- Documentation completion

## Success Metrics

### Technical Metrics
- ✅ All 8 core components implemented
- ✅ <30s refresh rate for dynamic data
- ✅ Handle 500+ targets simultaneously
- ✅ <200ms UI response time
- ✅ 100% Playwright test coverage for workflows
- ✅ Zero linter errors
- ✅ Mobile/tablet responsive

### Operational Metrics
- ✅ Target nomination to approval <2 hours (non-TST)
- ✅ TST approval <30 minutes
- ✅ BDA assessment <1 hour post-strike
- ✅ Risk assessment <15 minutes per target
- ✅ Shift handover generation <5 minutes
- ✅ Decision log 100% accuracy
- ✅ Alternative analysis alerts for all critical decisions

### User Experience Metrics
- ✅ All data visible without scrolling (24" monitor)
- ✅ Critical information glanceable (3-second recognition)
- ✅ Classification markings on all elements
- ✅ Color-coded status instantly recognizable
- ✅ Drill-down capability on all metrics
- ✅ Real-time updates without page refresh

## Next Steps

1. **Review this implementation plan** with stakeholders
2. **Validate database schema** with targeting cell SMEs
3. **Confirm component priorities** (can we defer any to Phase 2?)
4. **Start Phase 1** - Backend foundation (Week 1-2)
5. **Create project tracking** board for task management
6. **Schedule weekly demos** to show progress

## Approval & Sign-Off

**Project Owner**: _________________  
**Technical Lead**: _________________  
**Operations SME**: _________________  
**Security Officer**: _________________  

**Date**: _________________

---

**Version**: 1.0  
**Last Updated**: 2026-01-21  
**Status**: Awaiting Approval
