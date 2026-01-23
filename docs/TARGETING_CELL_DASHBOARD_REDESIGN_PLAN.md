# Targeting Cell Dashboard Redesign - Implementation Plan

## Executive Summary

Complete UX redesign of the Targeting Cell Dashboard based on operational targeting best practices and military UX patterns. Implements security classification badges on all information elements per intelligence handling requirements.

**Status**: APPROVED  
**Timeline**: 4 Phases  
**Priority**: HIGH - Operational Effectiveness

---

## Security Classification Framework

### Classification Levels
All dashboard elements will display appropriate classification badges:

| Level | Badge Color | Text | Usage |
|-------|-------------|------|-------|
| **UNCLASS** | Green | `U` | Public information, weather, general status |
| **CUI** | Yellow | `CUI` | Controlled Unclassified Info, operational plans |
| **SECRET** | Orange | `S` | Target locations, ROE details, nominations |
| **TOP SECRET** | Red | `TS` | High-value targets, sensitive intelligence |
| **TS/SCI** | Red + Special | `TS/SCI` | Compartmented intelligence, sources/methods |

### Classification Display Rules
1. **Panel-Level**: Classification badge in panel header (highest classification of content)
2. **Item-Level**: Individual targets, nominations show their specific classification
3. **Aggregate Data**: Displays highest classification level of underlying data
4. **User Access**: Elements auto-hide if user lacks clearance
5. **Visual Hierarchy**: Classification badge always visible, never hidden by scroll

### Security Badge Component
```typescript
<SecurityBadge 
  level="SECRET" 
  size="sm" | "md" | "lg"
  showFullText={boolean}  // "S" vs "SECRET"
  caveat="NOFORN" | "REL TO USA, GBR" | etc
/>
```

---

## Phase 1: Core Layout & Security Infrastructure

### 1.1 Security Badge System
**Files**: `frontend/src/components/SecurityBadge.tsx`

**Component Features**:
- Classification level rendering with correct colors
- Size variants (sm/md/lg)
- Caveat/handling markings
- Tooltip with full classification guidance
- Accessibility compliance

**Classification Levels**:
```typescript
type ClassificationLevel = 'UNCLASS' | 'CUI' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI';
type Caveat = 'NOFORN' | 'REL_TO' | 'ORCON' | 'PROPIN' | 'FISA';

interface SecurityBadgeProps {
  level: ClassificationLevel;
  caveats?: Caveat[];
  size?: 'sm' | 'md' | 'lg';
  showFullText?: boolean;
  releasability?: string[]; // ['USA', 'GBR', 'AUS']
}
```

### 1.2 Decision Gates Bar (Top)
**Files**: `frontend/src/features/smartops/components/DecisionGatesBar.tsx`

**Components**:
- `<ROEStatusGate />` - Classification: **SECRET**
- `<CDEStatusGate />` - Classification: **SECRET**
- `<WeatherGate />` - Classification: **UNCLASS**
- `<DeconflictionGate />` - Classification: **SECRET**

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ [S] 🛡️ ROE: WEAPON FREE (3) │ [S] 🎯 CDE: 2 PENDING      │
│ [U] ☁️ WEATHER: GREEN        │ [S] 🚨 DECON: 1 CONFLICT   │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Red/Yellow/Green status indicators
- One-click drill-down to details
- Real-time status updates
- Security classification per gate

### 1.3 New Two-Column Layout
**Files**: `frontend/src/routes/smartops/targeting-cell-dashboard.tsx`

**Structure**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left Column - Action & Temporal */}
  <div className="space-y-6">
    <ActionRequiredPanel />
    <TodayJTBPanel />
    <QuickStatsPanel />
  </div>
  
  {/* Right Column - Context & Reference */}
  <div className="space-y-6">
    <ROEQuickReference />
    <MissionContext />
    <RecentBDA />
  </div>
</div>
```

---

## Phase 2: Left Column - Action Priority

### 2.1 Action Required Panel
**Files**: `frontend/src/features/smartops/components/ActionRequiredPanel.tsx`

**Classification**: **SECRET** (panel level)

**Features**:
- Priority-sorted action items
- Time-sensitive indicators (countdown timers)
- Assignment badges ("YOUR NOMINATION")
- Individual item classification badges
- Direct action buttons (Edit, Submit, Review)
- Filtering by action type

**Data Structure**:
```typescript
interface ActionItem {
  id: string;
  type: 'target' | 'nomination' | 'review' | 'approval';
  title: string;
  classification: ClassificationLevel;
  caveats?: Caveat[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  dueTime?: Date;
  assignedToCurrentUser: boolean;
  blockers?: string[];
  quickActions: ActionButton[];
}
```

**Mock Data Classifications**:
- T-2398 SAM Battery: **SECRET//NOFORN**
- T-2401 Command Post: **TOP SECRET//NOFORN**
- NOM-441 Logistics Hub: **SECRET**

### 2.2 Today's JTB Sessions Panel
**Files**: `frontend/src/features/smartops/components/TodayJTBPanel.tsx`

**Classification**: **SECRET** (panel level)

**Features**:
- Today-only by default
- Expandable "This Week" / "This Month"
- Countdown to next session
- Highlight user's targets in session
- Individual target classification
- Session chair & participants
- Pre-read documents with classification

**Structure**:
```tsx
<JTBSession classification="SECRET">
  <SessionTime>14:00Z (in 2hrs)</SessionTime>
  <TargetList>
    <Target 
      id="T-2398" 
      classification="SECRET"
      yourNomination={true}
    />
    <Target 
      id="T-2401" 
      classification="TOP_SECRET"
      status="APPROVED"
    />
  </TargetList>
  <PreReadDocs classification="SECRET" count={3} />
</JTBSession>
```

### 2.3 Quick Stats Panel
**Files**: `frontend/src/features/smartops/components/QuickStatsPanel.tsx`

**Classification**: **SECRET** (aggregate data)

**Features**:
- Compressed, scannable format
- Trend indicators (↑ ↓)
- Click to drill down
- No individual classifications (aggregate only)

---

## Phase 3: Right Column - Context & Reference

### 3.1 ROE Quick Reference Panel
**Files**: `frontend/src/features/smartops/components/ROEQuickReferencePanel.tsx`

**Classification**: **SECRET**

**Features**:
- Current ROE matrix
- Color-coded engagement levels
- Prohibited target types
- Quick reference bullet points
- Link to full ROE card
- Last updated timestamp
- Authority issuing ROE

**Structure**:
```tsx
<ROEPanel classification="SECRET" caveat="NOFORN">
  <ROELevel level="WEAPON_FREE" active={true}>
    <Rules>
      - Self-defense authorized
      - Attack approved targets
      - No additional clearance
    </Rules>
  </ROELevel>
  <ROELevel level="RESTRICTED" active={false}>
    <Rules>
      - Command approval required
    </Rules>
  </ROELevel>
  <ProhibitedTargets classification="SECRET">
    - Cultural sites
    - Medical facilities
  </ProhibitedTargets>
  <FullROELink>Full ROE Card →</FullROELink>
</ROEPanel>
```

### 3.2 Mission Context Panel
**Files**: `frontend/src/features/smartops/components/MissionContextPanel.tsx`

**Classification**: **SECRET** (panel), **CUI** (some elements)

**Features**:
- Current operation phase
- Priority target categories (classified)
- Mission constraints (CDE limits, time windows) - **SECRET**
- Operational objectives - **CUI**
- Commander's intent summary - **CUI**

**Mixed Classification Example**:
```tsx
<MissionContextPanel classification="SECRET">
  <OperationPhase classification="CUI">
    DECISIVE OPS
  </OperationPhase>
  
  <PriorityTargets classification="SECRET">
    1. Enemy C2 nodes
    2. A2/AD systems
  </PriorityTargets>
  
  <Constraints classification="SECRET">
    • CDE limit: 50 casualties
    • No strikes: 22:00-06:00 local
  </Constraints>
</MissionContextPanel>
```

### 3.3 Recent BDA Panel
**Files**: `frontend/src/features/smartops/components/RecentBDAPanel.tsx`

**Classification**: **SECRET**

**Features**:
- 24-hour effectiveness summary
- Strike outcome visualization
- Pattern analysis / lessons learned
- Individual strike classification
- Link to full BDA workbench

**Individual Strike Classifications**:
- Strike location: **SECRET**
- Target ID: **SECRET**
- BDA imagery: **TOP SECRET//SCI** (if available)
- Effectiveness assessment: **SECRET**

---

## Phase 4: Advanced Features & Polish

### 4.1 Expandable Archives
**Files**: `frontend/src/features/smartops/components/ExpandableArchive.tsx`

**Features**:
- Tab interface: Priority Targets | JTB Schedule | Strike History
- Pagination & filtering
- Export with classification markings
- Search across all archives
- Respects user clearance level

### 4.2 Real-Time Updates
**Files**: Backend WebSocket integration

**Features**:
- ROE changes push to all users
- JTB schedule updates
- New action items appear immediately
- Countdown timers sync
- Classification updates propagate

### 4.3 Progressive Disclosure
**Files**: Across all components

**Features**:
- Panels collapse/expand
- "Show more" for lists
- Drill-down links to full pages
- Breadcrumb navigation
- Classification preserved in all views

### 4.4 Accessibility & Security Compliance
**Files**: Global styles, ARIA labels

**Requirements**:
- Section 508 compliance
- Screen reader support for classifications
- Keyboard navigation
- High contrast mode
- Security banner at top/bottom of page
- Session timeout warnings
- Classification-appropriate print stylesheets

---

## Component Architecture

### Component Hierarchy
```
TargetingCellDashboard
├── SecurityBanner (top/bottom)
├── DecisionGatesBar
│   ├── ROEStatusGate [S]
│   ├── CDEStatusGate [S]
│   ├── WeatherGate [U]
│   └── DeconflictionGate [S]
├── TwoColumnLayout
│   ├── LeftColumn
│   │   ├── ActionRequiredPanel [S]
│   │   │   └── ActionItem [varies by item]
│   │   ├── TodayJTBPanel [S]
│   │   │   └── JTBSession
│   │   │       └── TargetListItem [varies]
│   │   └── QuickStatsPanel [S]
│   └── RightColumn
│       ├── ROEQuickReferencePanel [S//NOFORN]
│       ├── MissionContextPanel [S] (mixed)
│       │   ├── OperationPhase [CUI]
│       │   ├── PriorityTargets [S]
│       │   └── Constraints [S]
│       └── RecentBDAPanel [S]
│           └── StrikeResultItem [varies]
└── ExpandableArchive
    ├── PriorityTargetsTab [S]
    ├── JTBScheduleTab [S]
    └── StrikeHistoryTab [S]
```

### Shared Components
- `<SecurityBadge />` - Universal classification display
- `<StatusIndicator />` - Red/Yellow/Green with accessibility
- `<CountdownTimer />` - Time-to-event display
- `<ActionButton />` - Contextual actions with security checks
- `<ClassifiedPanel />` - Wrapper with auto-classification header
- `<DrillDownLink />` - Navigation preserving security context

---

## Data Model Changes

### Backend Schema Updates

#### Add Classification to Targets
```sql
ALTER TABLE targets ADD COLUMN classification VARCHAR(20) NOT NULL DEFAULT 'SECRET';
ALTER TABLE targets ADD COLUMN caveats TEXT[]; -- Array of handling caveats
ALTER TABLE targets ADD COLUMN releasability TEXT[]; -- Array of country codes
```

#### Add Classification to Nominations
```sql
ALTER TABLE nominations ADD COLUMN classification VARCHAR(20) NOT NULL DEFAULT 'SECRET';
ALTER TABLE nominations ADD COLUMN caveats TEXT[];
```

#### Add Classification to JTB Sessions
```sql
ALTER TABLE jtb_sessions ADD COLUMN classification VARCHAR(20) NOT NULL DEFAULT 'SECRET';
ALTER TABLE jtb_sessions ADD COLUMN session_classification_guide TEXT; -- Reasoning
```

#### Add Classification to Strike Assessments
```sql
ALTER TABLE strike_assessments ADD COLUMN classification VARCHAR(20) NOT NULL DEFAULT 'SECRET';
ALTER TABLE strike_assessments ADD COLUMN imagery_classification VARCHAR(20); -- Can be higher
```

#### User Clearances
```sql
CREATE TABLE user_clearances (
    user_id UUID REFERENCES users(id),
    clearance_level VARCHAR(20) NOT NULL, -- UNCLASS, SECRET, TOP_SECRET, TS_SCI
    caveats TEXT[], -- Compartments user has access to
    granted_date TIMESTAMPTZ NOT NULL,
    expiration_date TIMESTAMPTZ,
    granting_authority VARCHAR(200),
    PRIMARY KEY (user_id)
);
```

### Backend API Endpoints

#### New Endpoints
```rust
// Get decision gates status
GET /api/targeting/decision-gates
Response: {
  roe: { status: "GREEN", level: "WEAPON_FREE", classification: "SECRET" },
  cde: { status: "YELLOW", pending: 2, classification: "SECRET" },
  weather: { status: "GREEN", classification: "UNCLASS" },
  deconfliction: { status: "RED", conflicts: 1, classification: "SECRET" }
}

// Get action required items
GET /api/targeting/action-required
Response: [
  {
    id: "uuid",
    type: "target",
    title: "T-2398 SAM Battery",
    classification: "SECRET",
    caveats: ["NOFORN"],
    priority: "CRITICAL",
    dueTime: "2026-01-21T14:00:00Z",
    assignedToCurrentUser: true,
    blockers: []
  }
]

// Get today's JTB sessions
GET /api/targeting/jtb/today
Response: [
  {
    id: "uuid",
    time: "14:00Z",
    classification: "SECRET",
    targets: [
      { id: "T-2398", classification: "SECRET", yourNomination: true },
      { id: "T-2401", classification: "TOP_SECRET" }
    ],
    chair: "COL Smith",
    preReadDocs: { count: 3, classification: "SECRET" }
  }
]

// Get mission context
GET /api/targeting/mission-context
Response: {
  phase: { name: "DECISIVE OPS", classification: "CUI" },
  priorityTargets: {
    classification: "SECRET",
    categories: ["Enemy C2", "A2/AD systems"]
  },
  constraints: {
    classification: "SECRET",
    cdeLimit: 50,
    noStrikeWindows: ["22:00-06:00 local"]
  }
}
```

#### Modified Endpoints
- All target endpoints include `classification`, `caveats`, `releasability`
- Filtering based on user clearance level
- Audit logging for classification access

---

## Security Requirements

### Classification Handling
1. **Banner Markings**: Page must display classification banner at top and bottom
2. **Portion Marking**: Every paragraph/element must be marked with classification
3. **Aggregate Classification**: Panel shows highest classification of contents
4. **Downgrade Instructions**: Include when data can be downgraded (if applicable)
5. **Originator Control**: Track who classified each piece of data

### Access Control
1. **Clearance Verification**: Verify user clearance before rendering classified data
2. **Need-to-Know**: Role-based access even within clearance level
3. **Compartments**: TS/SCI data requires specific compartment access
4. **Audit Trail**: Log all access to SECRET and above
5. **Session Security**: Re-authenticate for TS/SCI access

### Data Protection
1. **Encryption**: All classified data encrypted at rest and in transit
2. **Secure Delete**: Classified data must be securely wiped
3. **Export Controls**: Classification markings embedded in exports
4. **Print Controls**: Watermarks and tracking on printed materials
5. **Screenshot Prevention**: Optional - detect/prevent screenshots of TS data

### Compliance Standards
- **NIST 800-53**: Security controls for classified systems
- **ICD 503**: Intelligence community classification standards
- **JSIG**: Joint Special Access Program Implementation Guide
- **DoD 5200.01**: DoD Information Security Program

---

## Implementation Phases Timeline

### Phase 1: Core Layout & Security (Week 1-2)
- [ ] Create SecurityBadge component
- [ ] Implement DecisionGatesBar
- [ ] Build two-column layout structure
- [ ] Database schema updates for classifications
- [ ] User clearance table and middleware
- [ ] Backend API for decision gates

### Phase 2: Left Column - Action Priority (Week 3-4)
- [ ] ActionRequiredPanel with classification
- [ ] TodayJTBPanel with security badges
- [ ] QuickStatsPanel
- [ ] Backend APIs for action items
- [ ] Backend APIs for JTB sessions
- [ ] Real-time countdown timers

### Phase 3: Right Column - Context (Week 5-6)
- [ ] ROEQuickReferencePanel with classification
- [ ] MissionContextPanel with mixed classifications
- [ ] RecentBDAPanel with strike classifications
- [ ] Backend APIs for ROE data
- [ ] Backend APIs for mission context
- [ ] Backend APIs for BDA summary

### Phase 4: Advanced Features (Week 7-8)
- [ ] ExpandableArchive component
- [ ] WebSocket integration for real-time updates
- [ ] Progressive disclosure patterns
- [ ] Accessibility audit and fixes
- [ ] Security compliance review
- [ ] Classification handling audit
- [ ] Print stylesheets with markings
- [ ] Export functionality with classifications

---

## Testing Requirements

### Unit Tests
- SecurityBadge rendering for all classification levels
- Classification filtering based on user clearance
- Action item prioritization logic
- Countdown timer calculations

### Integration Tests
- User without clearance cannot see SECRET data
- User with SECRET sees SECRET but not TS
- Classification badges display correctly
- Aggregate classification computed correctly

### E2E Tests (Playwright)
- Login as targeting_cell user
- Verify decision gates display
- Check action required items load
- Verify JTB sessions show correctly
- Confirm ROE reference panel visible
- Test drill-down navigation
- Verify security badges present on all elements
- Test with different clearance levels

### Security Tests
- Attempt to access TS data without clearance
- Verify audit logging
- Check encryption at rest
- Verify secure session handling
- Test classification downgrade logic

---

## Migration Strategy

### From Current Dashboard
1. **Feature Flag**: `ENABLE_REDESIGNED_DASHBOARD`
2. **A/B Testing**: Random 10% of users see new dashboard
3. **Feedback Collection**: In-app feedback widget
4. **Gradual Rollout**: 10% → 50% → 100% over 2 weeks
5. **Rollback Plan**: Feature flag can disable instantly

### Data Migration
1. **Classify Existing Data**: Default all to SECRET
2. **Admin Review Required**: Flag for security officer review
3. **Bulk Update Tool**: Admin can set classifications in batch
4. **User Clearances**: Import from existing personnel system

### Training
1. **User Guide**: Classification badge meaning and usage
2. **Video Tutorial**: Dashboard walkthrough
3. **Quick Reference Card**: Classification handling rules
4. **Live Training**: 30-min session for targeting cell

---

## Success Metrics

### User Experience
- Time to find action items: < 5 seconds
- JTB prep time: Reduced by 30%
- User satisfaction: > 4.5/5
- Task completion rate: > 95%

### Security Compliance
- 100% of data elements have classification
- Zero unauthorized access to classified data
- Audit log completeness: 100%
- Security review: Pass with no major findings

### Performance
- Dashboard load time: < 2 seconds
- Real-time updates: < 1 second latency
- Classification filtering: < 100ms
- Concurrent users supported: 100+

---

## Open Questions & Decisions Needed

1. **Classification Authority**: Who can change classification levels?
2. **Default Classifications**: Should new targets default to SECRET or require explicit classification?
3. **Clearance Verification**: Integrate with existing CAC/PKI or separate system?
4. **Audit Retention**: How long to keep access logs for classified data?
5. **Mobile Access**: Do we support mobile devices for classified dashboard?
6. **Offline Mode**: Should dashboard work offline with cached classified data?
7. **Third-Party Integrations**: Can we share classified data with allied systems?

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Classification leakage | CRITICAL | LOW | Multiple security audits, penetration testing |
| User lacks clearance | HIGH | MEDIUM | Clear error messages, request clearance workflow |
| Performance degradation | MEDIUM | MEDIUM | Caching, lazy loading, CDN for static assets |
| User confusion | MEDIUM | LOW | Training, in-app guidance, user testing |
| Backend API delays | HIGH | LOW | Optimistic UI updates, loading states |
| Mobile responsive issues | LOW | MEDIUM | Responsive testing, mobile-first design |

---

## Appendix A: Classification Examples

### Target Classifications
- **UNCLASS**: Public infrastructure (power plant location from maps)
- **CUI**: Training target coordinates
- **SECRET**: Active enemy target locations
- **TOP SECRET**: High-value individual targets
- **TS/SCI**: Targets derived from SIGINT/HUMINT sources

### ROE Classifications
- **SECRET**: Standard ROE matrix
- **SECRET//NOFORN**: Restricted engagement zones
- **TOP SECRET**: ROE for specific high-value operations

### BDA Classifications
- **SECRET**: Strike location and outcome
- **TOP SECRET**: Satellite imagery of strike
- **TS/SCI**: SIGINT confirmation of target destruction

---

## Appendix B: Security Badge Visual Design

### Badge Sizes
**Small (sm)**: 16px height, used inline with text
```
[S] Target T-2398
```

**Medium (md)**: 20px height, used in panel headers
```
┌─────────────────────┐
│ [SECRET] ROE Status │
└─────────────────────┘
```

**Large (lg)**: 32px height, used in banners
```
┌────────────────────────────────────┐
│        [ SECRET//NOFORN ]          │
└────────────────────────────────────┘
```

### Color Palette
- **UNCLASS**: `bg-green-600 text-white`
- **CUI**: `bg-yellow-600 text-black`
- **SECRET**: `bg-orange-600 text-white`
- **TOP SECRET**: `bg-red-600 text-white`
- **TS/SCI**: `bg-red-800 text-white border-2 border-yellow-400`

### Caveat Display
```
[SECRET//NOFORN]
[TOP SECRET//REL TO USA, GBR]
[TS/SCI//SPECIAL ACCESS REQUIRED]
```

---

## Next Steps

1. **Approve Plan**: Stakeholder sign-off
2. **Backend Schema**: Create migration scripts
3. **Component Stubs**: Create empty components with TypeScript interfaces
4. **Security Review**: Submit to security officer for approval
5. **Begin Phase 1**: Start with SecurityBadge component

---

**Document Classification**: UNCLASSIFIED  
**Last Updated**: 2026-01-21  
**Author**: UX Team / Targeting Cell SME  
**Approvers**: TBD
