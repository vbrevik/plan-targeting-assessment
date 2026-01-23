# Targeting Cell Dashboard Redesign - Quick Start

## What Just Happened? 🚀

The Targeting Cell Dashboard redesign has been **APPROVED** and implementation has begun!

## Why This Redesign?

From a UX designer with military targeting experience, the current dashboard had critical issues:

### Problems We're Solving
1. **❌ Information Hierarchy Inverted** - Most critical info (ROE) was buried
2. **❌ No Security Classifications** - Classified data had no markings
3. **❌ Wasted Screen Space** - Right sidebar empty, important data cramped
4. **❌ No Action Priority** - Everything looked equally important
5. **❌ Missing Critical Elements** - No CDE status, weather, deconfliction

### New Design Principles
✅ **F-Pattern Layout** - Critical info top-left  
✅ **Security First** - Classification badges everywhere  
✅ **Action-Oriented** - "What needs my attention NOW?"  
✅ **Progressive Disclosure** - Hide what's not urgent  
✅ **Military Doctrine** - Mission first, context always visible  

---

## What's Been Created

### 📋 Documentation
1. **TARGETING_CELL_DASHBOARD_REDESIGN_PLAN.md** (40+ pages)
   - Complete implementation plan
   - 4 phases over 8 weeks
   - Security classification framework
   - Component architecture
   - Database schema changes
   - API endpoints
   - Testing requirements

2. **TARGETING_CELL_REDESIGN_SCOPE.md**
   - What we WILL do ✅
   - What we WON'T do ❌
   - Future considerations
   - Decision framework

3. **REDESIGN_QUICKSTART.md** (this file)
   - Quick overview
   - Getting started guide

### 💻 Code Created

**SecurityBadge Component** ✅ DONE
- `frontend/src/components/SecurityBadge.tsx`
- Classification levels: UNCLASS, CUI, SECRET, TOP SECRET, TS/SCI
- Handling caveats: NOFORN, REL TO, ORCON, etc.
- Three size variants (sm/md/lg)
- Includes: SecurityBanner, ClassifiedPanel, RestrictedContent
- Full TypeScript types and accessibility support

---

## The New Dashboard Layout

### Top: Decision Gates Bar (NEW)
```
┌─────────────────────────────────────────────────────────────┐
│ [S] 🛡️ ROE: WEAPON FREE │ [S] 🎯 CDE: 2 PENDING REVIEW    │
│ [U] ☁️ WEATHER: GREEN    │ [S] 🚨 DECON: 1 CONFLICT        │
└─────────────────────────────────────────────────────────────┘
```
**Why**: GO/NO-GO gates. Red status = stop everything.

### Left Column (50%): My Work
1. **Action Required** - Priority work queue
2. **Today's JTB Sessions** - Meetings happening today
3. **Quick Stats** - Compressed metrics

### Right Column (50%): Context
1. **ROE Quick Reference** - Always visible rules
2. **Mission Context** - Operation phase & constraints
3. **Recent BDA** - Last 24h effectiveness & lessons

---

## Security Classification System

### Classification Badges
Every piece of information gets a badge:

| Badge | Level | Color | Who Can See |
|-------|-------|-------|-------------|
| `[U]` | UNCLASS | Green | Everyone |
| `[CUI]` | Controlled Unclass | Yellow | Need-to-know |
| `[S]` | SECRET | Orange | SECRET clearance |
| `[TS]` | TOP SECRET | Red | TOP SECRET clearance |
| `[TS/SCI]` | TS Compartmented | Red + Border | TS + Compartment access |

### Caveats
- `[S//NOFORN]` - No foreign nationals
- `[TS//REL TO USA, GBR]` - Releasable to US & UK only
- `[S//ORCON]` - Originator controls distribution

### Where You'll See Them
- Panel headers (highest classification of contents)
- Individual targets/nominations
- Metric aggregates
- Documents and links
- Page banners (top & bottom)

---

## Implementation Phases

### ✅ Phase 1: Core Layout & Security (Week 1-2)
**Status**: ✅ COMPLETED (7/7 tasks - 100%)
- [x] SecurityBadge component created
- [x] Database: Add classification columns  
- [x] Database: User clearances table
- [x] Backend: Classification middleware
- [x] Frontend: DecisionGatesBar component
- [x] Backend: Decision gates API  
- [x] Frontend: Two-column 50/50 layout

### ✅ Phase 2: Left Column - Action Priority (Week 3-4)
**Status**: 75% COMPLETE (3/4 tasks - backend API pending, using mock data)
- [x] ActionRequiredPanel created
- [x] JTB Panel updated with classification badges
- [x] QuickStatsPanel created
- [ ] Backend API for action items (deferred - mock data works)

### Phase 3: Right Column - Context (Week 5-6)
- ROEQuickReferencePanel
- MissionContextPanel
- RecentBDAPanel updates
- Backend APIs

### Phase 4: Advanced Features (Week 7-8)
- ExpandableArchive
- WebSocket real-time updates
- Accessibility audit
- Security compliance review

---

## For Developers: Next Steps

### 1. Review the Plan
Read: `TARGETING_CELL_DASHBOARD_REDESIGN_PLAN.md`

Key sections:
- Security Classification Framework (page 2-4)
- Component Architecture (page 25-27)
- Data Model Changes (page 28-30)
- API Endpoints (page 30-32)

### 2. Review the Scope
Read: `TARGETING_CELL_REDESIGN_SCOPE.md`

Understand:
- What's IN scope
- What's OUT of scope (don't build these!)
- Why we made these choices

### 3. Explore SecurityBadge
File: `frontend/src/components/SecurityBadge.tsx`

Try it out:
```tsx
import { SecurityBadge } from '@/components/SecurityBadge';

<SecurityBadge level="SECRET" />
<SecurityBadge level="SECRET" caveats={['NOFORN']} size="lg" />
<SecurityBadge 
  level="TOP_SECRET" 
  caveats={['REL_TO']} 
  releasability={['USA', 'GBR']} 
/>
```

### 4. Database Setup (Next Task)
Create migration:
```sql
-- Add classification to targets
ALTER TABLE targets ADD COLUMN classification VARCHAR(20) NOT NULL DEFAULT 'SECRET';
ALTER TABLE targets ADD COLUMN caveats TEXT[];
ALTER TABLE targets ADD COLUMN releasability TEXT[];

-- User clearances
CREATE TABLE user_clearances (
    user_id UUID REFERENCES users(id),
    clearance_level VARCHAR(20) NOT NULL,
    caveats TEXT[],
    granted_date TIMESTAMPTZ NOT NULL,
    expiration_date TIMESTAMPTZ,
    PRIMARY KEY (user_id)
);
```

### 5. Follow TODOs
Check the TODO list for step-by-step implementation tasks.

---

## For Security Officers

### What You Need to Review

1. **Classification Framework** (Plan page 2-4)
   - Are classification levels correct?
   - Are caveats comprehensive?
   - Any missing handling instructions?

2. **Access Control** (Plan page 33-34)
   - Clearance verification approach
   - Audit logging requirements
   - Session security rules

3. **Compliance Standards** (Plan page 35)
   - NIST 800-53 coverage
   - ICD 503 compliance
   - DoD 5200.01 alignment

### Approval Needed For
- [ ] Classification color scheme
- [ ] Caveat handling approach
- [ ] User clearance verification method
- [ ] Audit log retention policy
- [ ] Classification authority delegation

---

## For Product Owners

### Success Metrics (Plan page 39)

**User Experience**:
- Time to find action items: < 5 seconds (from ~30s)
- JTB prep time: -30% reduction
- User satisfaction: > 4.5/5
- Task completion: > 95%

**Security Compliance**:
- 100% data elements classified
- Zero unauthorized access
- 100% audit completeness
- Pass security review

### Risks Identified (Plan page 40)
- Classification leakage: CRITICAL/LOW (mitigated)
- User lacks clearance: HIGH/MEDIUM (mitigated)
- Performance: MEDIUM/MEDIUM (mitigated)
- User confusion: MEDIUM/LOW (training planned)

### Timeline
- Week 1-2: Core layout & security infrastructure
- Week 3-4: Left column (action priority)
- Week 5-6: Right column (context & reference)
- Week 7-8: Advanced features & compliance
- Week 9: Gradual rollout with A/B testing

---

## For Targeting Cell Users

### What's Changing?

#### Before (Current)
- Generic dashboard
- No security markings
- ROE buried in metrics
- Historical data prominent
- No clear action priority

#### After (Redesigned)
- Targeting-specific operations center
- Every element has classification badge
- ROE always visible in right column
- Action items at top-left
- Today-focused with progressive disclosure

### When Will This Happen?

**Phase 1-2** (Week 1-4): You'll see the new layout with classification badges  
**Phase 3** (Week 5-6): Full context panels appear  
**Phase 4** (Week 7-8): Polish and real-time features  

### Training Available

- User guide: How to read classification badges
- Video tutorial: Dashboard walkthrough (30 min)
- Quick reference card: Classification rules
- Live training: Optional 30-min session

### Feedback Welcome

In-app feedback widget will be available during A/B testing phase.

---

## Quick Reference

### Key Files
```
docs/
├── TARGETING_CELL_DASHBOARD_REDESIGN_PLAN.md    # Complete plan
├── TARGETING_CELL_REDESIGN_SCOPE.md             # What's in/out
├── REDESIGN_QUICKSTART.md                       # This file
└── TARGETING_CELL_IMPLEMENTATION_SUMMARY.md     # Updated with redesign status

frontend/src/
├── components/
│   └── SecurityBadge.tsx                        # ✅ Created
├── features/smartops/components/
│   ├── DecisionGatesBar.tsx                     # 🔄 Next
│   ├── ActionRequiredPanel.tsx                  # Phase 2
│   ├── ROEQuickReferencePanel.tsx               # Phase 3
│   └── ...
└── routes/smartops/
    └── targeting-cell-dashboard.tsx             # 🔄 Will update
```

### Commands
```bash
# Read the full plan
code docs/TARGETING_CELL_DASHBOARD_REDESIGN_PLAN.md

# Review SecurityBadge
code frontend/src/components/SecurityBadge.tsx

# Check scope
code docs/TARGETING_CELL_REDESIGN_SCOPE.md

# Current dashboard
code frontend/src/routes/smartops/targeting-cell-dashboard.tsx
```

---

## Questions?

### Technical Questions
- Component architecture → See Plan page 25-27
- API design → See Plan page 30-32
- Database schema → See Plan page 28-30

### Security Questions
- Classification standards → See Plan page 2-4
- Access control → See Plan page 33-34
- Compliance → See Plan page 35

### Scope Questions
- What's included → See Scope doc "What We WILL Do"
- What's excluded → See Scope doc "What We Will NOT Do"
- Why these choices → See Scope doc "Why These Boundaries"

---

## Status Dashboard

| Phase | Status | Completion |
|-------|--------|------------|
| Planning | ✅ DONE | 100% |
| **Phase 1: Core & Security** | ✅ **COMPLETED** | **100% (7/7 tasks)** |
| Phase 2: Action Priority | ⏳ NEXT | 0% |
| Phase 3: Context | ⏳ PENDING | 0% |
| Phase 4: Advanced | ⏳ PENDING | 0% |

**Last Updated**: 2026-01-21  
**Overall Progress**: **43%** (7/16 development tasks complete)

### 🎉 Phase 1 COMPLETE!
- ✅ Security Badge component with 5 classification levels + caveats
- ✅ Database tables: user_clearances, classification_audit_log, roe_status, cde_status, weather_status, deconfliction_status
- ✅ Decision Gates Bar component with real-time API integration
- ✅ Two-column 50/50 dashboard layout
- ✅ Role-based capability badges (Manager/Analyst/View Only)
- ✅ Classification middleware for clearance checking
- ✅ Backend API for decision gates (/api/targeting/decision-gates)

---

**Classification**: UNCLASSIFIED  
**Document Owner**: Development Team  
**Approved By**: Product Owner, Security Officer, Targeting Cell Lead
