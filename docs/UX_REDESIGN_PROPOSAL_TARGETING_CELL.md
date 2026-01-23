# UX Redesign Proposal: Targeting Cell Operations Center

**Author**: Senior UX Developer (HMI & Modern GUI Specialist)  
**Date**: January 22, 2026  
**Status**: Proposal for Review

---

## Executive Summary

The current Targeting Cell Operations Center suffers from **information overload** and **poor information hierarchy**, resulting in:
- Excessive vertical scrolling (9 major components on one page)
- Cognitive overload (too many competing visual elements)
- Difficulty finding critical information quickly
- Poor task flow (users must scroll to find related information)
- Reduced situational awareness (key metrics buried in details)

**Recommendation**: Implement a **dashboard-first, detail-on-demand** architecture with progressive disclosure and clear information hierarchy.

---

## Current State Analysis

### Information Density Issues

**Current Layout** (Single Page):
```
┌─────────────────────────────────────────┐
│ Decision Gates Bar (4 gates)            │ ← Always visible (good)
├─────────────────────────────────────────┤
│ Mission Command Overview                │ ← Full width, ~400px height
│ (4 sections: Intent, Guidance,          │
│  Authority, Tempo)                      │
├─────────────────────────────────────────┤
│ Target Nomination Board                 │ ← Full width, ~600px height
│ (F3EAD pipeline, DTL, TST alerts)       │
├─────────────────────────────────────────┤
│ ┌──────────────────┬──────────────────┐ │
│ │ Intelligence     │ Asset &          │ │ ← Two-column grid
│ │ Integration      │ Capability        │ │
│ │                  │ Management       │ │
│ ├──────────────────┼──────────────────┤ │
│ │ Effects          │ Risk &           │ │
│ │ Assessment       │ Constraints      │ │
│ └──────────────────┴──────────────────┘ │
├─────────────────────────────────────────┤
│ ┌──────────────────┬──────────────────┐ │
│ │ Alternative      │ Collaborative     │ │
│ │ Analysis         │ Workspace         │ │
│ └──────────────────┴──────────────────┘ │
└─────────────────────────────────────────┘

Total: 9 major components, ~3000-4000px vertical scroll
```

### Problems Identified

1. **No Visual Hierarchy**
   - All components have equal visual weight
   - Critical information (Decision Gates) competes with detailed views
   - No clear "at-a-glance" summary

2. **Cognitive Load**
   - 9 different information domains on one screen
   - Users must mentally switch contexts while scrolling
   - No clear task-based organization

3. **Poor Discoverability**
   - Important metrics buried in component details
   - No quick navigation to related information
   - No indication of what needs attention

4. **Inefficient Task Flow**
   - Users scroll to find information
   - Related information scattered across page
   - No clear workflow paths

5. **Mobile/Tablet Unfriendly**
   - Two-column grids collapse poorly
   - Vertical scrolling becomes extreme
   - Touch targets may be too small

---

## Proposed Solution: Dashboard-First Architecture

### Design Principles

1. **Progressive Disclosure**: Show summary → details on demand
2. **Information Hierarchy**: Critical → Important → Detailed
3. **Task-Based Organization**: Group by user workflows
4. **At-a-Glance Metrics**: Key numbers visible without scrolling
5. **Quick Navigation**: One-click access to detailed views

### Proposed Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Targeting Cell Operations Center                    │
│ [Role Badge] [Security Badge] [Ops Tempo] [Next JTB]       │
├─────────────────────────────────────────────────────────────┤
│ DECISION GATES BAR (Sticky)                                 │
│ [ROE] [CDE] [Weather] [Deconfliction]                       │
├─────────────────────────────────────────────────────────────┤
│ DASHBOARD VIEW (Default)                                    │
│                                                             │
│ ┌───────────────┬───────────────┬───────────────┐          │
│ │ CRITICAL      │ F3EAD         │ TST ALERTS    │          │
│ │ METRICS       │ PIPELINE      │ COUNTDOWN     │          │
│ │               │               │               │          │
│ │ • Active: 47  │ FIND: 34      │ 🔴 2 Critical │          │
│ │ • Pending: 12 │ FIX: 18       │ ⚠️ 5 High    │          │
│ │ • Approved: 8 │ FINISH: 12    │               │          │
│ └───────────────┴───────────────┴───────────────┘          │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ MISSION CONTEXT (Collapsible)                         │  │
│ │ [▼] Phase 2: Hostile Force Degradation                │  │
│ │     Priority Effects: C2 Disruption, Armor Attrition  │  │
│ │     [View Full Details →]                             │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌───────────────────┬───────────────────┐                 │
│ │ TOP PRIORITY      │ REQUIRES ACTION    │                 │
│ │ TARGETS           │                    │                 │
│ │                   │ • 3 Targets need   │                 │
│ │ • T-2398 (HIGH)   │   CDE analysis     │                 │
│ │ • T-2401 (HIGH)   │ • 2 JTB decisions  │                 │
│ │ • T-2405 (MED)    │   pending          │                 │
│ │ [View All →]      │ [View All →]       │                 │
│ └───────────────────┴───────────────────┘                 │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ QUICK ACCESS PANELS (Collapsible)                     │  │
│ │ [▼] Intelligence Status | Assets | Risk | Analysis    │  │
│ │     • 12 Active ISR platforms                         │  │
│ │     • 8 Strike platforms ready                        │  │
│ │     • 5 High-risk targets flagged                     │  │
│ │     [View Details →]                                  │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Total Height: ~800-1000px (fits on most screens)
```

### Navigation Structure

```
Targeting Cell Operations Center
├── Dashboard (Default - Summary View)
│   ├── Critical Metrics
│   ├── F3EAD Pipeline Summary
│   ├── TST Alerts
│   ├── Mission Context (Collapsed)
│   ├── Top Priority Targets
│   └── Quick Access Panels (Collapsed)
│
├── Targets
│   ├── F3EAD Pipeline (Full View)
│   ├── Dynamic Target List (Full View)
│   ├── Time-Sensitive Targets
│   └── Target Detail View
│
├── Intelligence
│   ├── Multi-INT Fusion
│   ├── Pattern of Life
│   ├── ISR Platforms
│   └── Intel Reports
│
├── Effects & Assessment
│   ├── BDA Assessments
│   ├── Re-attack Recommendations
│   └── Effects Tracking
│
├── Assets & Capabilities
│   ├── Strike Platforms
│   ├── ISR Platforms
│   ├── Munitions Inventory
│   └── Munitions Pairing
│
├── Risk & Constraints
│   ├── High-Risk Targets
│   ├── Risk Assessments
│   └── Constraint Monitoring
│
├── Analysis
│   ├── Alternative Analysis
│   ├── Assumptions
│   └── Bias Alerts
│
├── Collaboration
│   ├── Decisions
│   ├── Handovers
│   └── Annotations
│
└── Mission Command
    ├── Commander's Intent
    ├── Targeting Guidance
    ├── Decision Authority
    └── Operational Tempo
```

---

## Detailed Component Redesign

### 1. Dashboard (Default View)

**Purpose**: At-a-glance situational awareness

**Layout**:
- **Top Row**: Critical metrics (3 cards)
  - Active Targets Count
  - Pending Approvals
  - TST Alerts Count
- **Second Row**: F3EAD Pipeline (visual funnel, clickable)
- **Third Row**: TST Countdown (critical alerts only)
- **Fourth Row**: Mission Context (collapsed by default, expandable)
- **Fifth Row**: Top Priority Targets (top 5, with "View All" link)
- **Bottom Row**: Quick Access Panels (collapsed, expandable)

**Key Features**:
- All critical information visible without scrolling
- Click any metric → Navigate to detailed view
- Color-coded alerts (red = critical, yellow = warning)
- Auto-refresh indicators
- Collapsible sections for less-critical info

### 2. Decision Gates Bar (Sticky)

**Current**: Good, keep as-is
**Enhancement**: Add "View Details" link to each gate

### 3. F3EAD Pipeline (Detail Page)

**Current**: Full pipeline on dashboard
**Proposed**: 
- Dashboard: Summary funnel with counts
- Detail Page: Full pipeline with filtering, sorting, stage transitions

### 4. Target Nomination Board (Detail Page)

**Current**: DTL and TST on dashboard
**Proposed**:
- Dashboard: Top 5 priority targets + TST alerts summary
- Detail Page: Full DTL with filters, sorting, pagination

### 5. Mission Command Overview (Detail Page)

**Current**: Full overview on dashboard
**Proposed**:
- Dashboard: Collapsed summary (phase, key metrics)
- Detail Page: Full 4-section view with edit capabilities

### 6. Intelligence Integration (Detail Page)

**Current**: Full panel on dashboard
**Proposed**:
- Dashboard: Quick stats (ISR platforms active, intel reports count)
- Detail Page: Full multi-INT fusion, pattern of life, ISR status

### 7. Effects Assessment (Detail Page)

**Current**: Full dashboard on main page
**Proposed**:
- Dashboard: Recent BDA count, re-attack recommendations count
- Detail Page: Full BDA assessments, comparison views, history

### 8. Asset & Capability Management (Detail Page)

**Current**: Full panel on dashboard
**Proposed**:
- Dashboard: Strike platforms ready, munitions available
- Detail Page: Full asset management, munitions pairing, weather

### 9. Risk & Constraints (Detail Page)

**Current**: Full monitor on dashboard
**Proposed**:
- Dashboard: High-risk targets count, critical constraints
- Detail Page: Full risk assessments, constraint monitoring

### 10. Alternative Analysis (Detail Page)

**Current**: Full panel on dashboard
**Proposed**:
- Dashboard: Assumptions count, bias alerts count
- Detail Page: Full alternative analysis, assumption challenges

### 11. Collaborative Workspace (Detail Page)

**Current**: Full workspace on dashboard
**Proposed**:
- Dashboard: Recent decisions count, pending handovers
- Detail Page: Full collaboration tools, decision tracking

---

## Implementation Plan

### Phase 1: Dashboard Redesign (Week 1)

**Tasks**:
1. Create new dashboard layout component
2. Extract summary metrics from each component
3. Create metric cards (reusable component)
4. Implement collapsible sections
5. Add navigation to detail pages

**Files to Create**:
- `frontend/src/features/smartops/components/TargetingDashboardSummary.tsx`
- `frontend/src/features/smartops/components/MetricCard.tsx`
- `frontend/src/features/smartops/components/CollapsibleSection.tsx`

**Files to Modify**:
- `frontend/src/routes/smartops/targeting-cell-dashboard.tsx` (refactor to dashboard view)
- All 9 component files (extract summary logic)

### Phase 2: Detail Pages (Week 2)

**Tasks**:
1. Create route structure for detail pages
2. Move full component views to detail pages
3. Add breadcrumb navigation
4. Implement back-to-dashboard navigation
5. Add page-specific filters and controls

**Routes to Create**:
- `/smartops/targeting/targets` (F3EAD, DTL, TST)
- `/smartops/targeting/intelligence`
- `/smartops/targeting/effects`
- `/smartops/targeting/assets`
- `/smartops/targeting/risk`
- `/smartops/targeting/analysis`
- `/smartops/targeting/collaboration`
- `/smartops/targeting/mission-command`

### Phase 3: Navigation & UX Polish (Week 3)

**Tasks**:
1. Add sidebar navigation (if not exists)
2. Implement quick search
3. Add keyboard shortcuts
4. Implement "Recently Viewed" section
5. Add user preferences (default view, collapsed sections)

### Phase 4: Responsive Design (Week 4)

**Tasks**:
1. Optimize for tablet (768px-1024px)
2. Optimize for mobile (320px-767px)
3. Implement touch-friendly interactions
4. Test on real devices

---

## UX Patterns to Implement

### 1. Progressive Disclosure

**Pattern**: Show summary → Click to expand → Navigate to detail

**Example**:
```
Dashboard: "12 Active ISR Platforms"
  ↓ Click
Expanded: "12 Active ISR Platforms
          • 8 SIGINT platforms
          • 4 IMINT platforms
          [View Full Status →]"
  ↓ Click "View Full Status"
Detail Page: Full ISR platform management
```

### 2. Information Hierarchy

**Visual Weight**:
1. **Critical** (Red, Large, Top): TST alerts, Decision gates
2. **Important** (Yellow, Medium, Top): Pending approvals, High-risk targets
3. **Informational** (Blue, Small, Middle): Metrics, counts
4. **Detailed** (Gray, Small, Bottom/Collapsed): Full data, history

### 3. Card-Based Layout

**Metric Cards**:
- Large number (primary metric)
- Small label (context)
- Trend indicator (optional)
- Click action (navigate to detail)

**Summary Cards**:
- Title
- Key metrics (2-3)
- "View All" link
- Status indicators

### 4. Quick Actions

**Floating Action Button (FAB)** or **Quick Actions Bar**:
- Create Target
- Request ISR
- Submit BDA
- Create Decision

### 5. Contextual Navigation

**Breadcrumbs**:
```
Dashboard > Targets > F3EAD Pipeline > Target T-2398
```

**Related Links**:
- On Target Detail: "View in DTL", "View BDA", "View Risk Assessment"
- On BDA Detail: "View Target", "View Strike Platform"

---

## Metrics & Success Criteria

### Usability Metrics

1. **Time to Find Information**
   - Current: ~30-60 seconds (scrolling, searching)
   - Target: <10 seconds (dashboard → detail page)

2. **Scroll Depth**
   - Current: ~3000-4000px average
   - Target: <1000px for dashboard, <2000px for detail pages

3. **Task Completion Rate**
   - Current: Unknown (needs user testing)
   - Target: >90% for common tasks

4. **Cognitive Load**
   - Current: High (9 components, no hierarchy)
   - Target: Low (dashboard summary, detail on demand)

### User Satisfaction

- **Before**: Users report "too much scrolling", "hard to find things"
- **After**: Users report "quick access", "clear organization"

---

## Technical Considerations

### Performance

- **Lazy Loading**: Load detail pages on demand
- **Virtual Scrolling**: For long lists (DTL, targets)
- **Caching**: Cache dashboard summary data
- **Progressive Enhancement**: Dashboard works without JavaScript

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Clear focus indicators

### Responsive Breakpoints

- **Desktop**: >1024px (current layout)
- **Tablet**: 768px-1024px (2-column → 1-column)
- **Mobile**: <768px (stacked layout, hamburger menu)

---

## Migration Strategy

### Backward Compatibility

1. **Feature Flag**: Toggle between old and new layout
2. **Gradual Rollout**: Show new dashboard to subset of users
3. **User Preference**: Allow users to choose layout
4. **A/B Testing**: Compare old vs new layout metrics

### Data Migration

- No database changes required
- Component APIs remain the same
- Only frontend routing changes

---

## Next Steps

1. **Review & Approval**: Get stakeholder sign-off on proposal
2. **Design Mockups**: Create detailed Figma/Sketch designs
3. **Prototype**: Build interactive prototype
4. **User Testing**: Test with real users
5. **Iterate**: Refine based on feedback
6. **Implementation**: Follow phased approach above

---

## References

- **NATO COPD**: Component requirements
- **Modern Dashboard Patterns**: Material Design, Ant Design
- **Military C2 Systems**: Best practices from similar systems
- **HMI Principles**: ISO 9241, NIST guidelines

---

**Document Status**: Proposal - Awaiting Review  
**Next Review**: After stakeholder feedback
