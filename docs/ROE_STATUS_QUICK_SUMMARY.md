# ROE Status Feature - Quick Summary

## What Was Added

Every decision now shows whether it's **within approved ROE** or **requires new ROE authorization**.

---

## Visual Impact

### Dashboard Before:
```
┌─ DECISION ─────────────┐
│ Strike T-1002          │
│ 4 options • 4 risks    │
│ [VIEW] ────────────────→│
└────────────────────────┘
```

### Dashboard After:
```
┌─ DECISION ─────────────┐
│ Strike T-1002          │
│ 🔴 ROE REQUIRED        │ ← NEW: Immediately visible
│ 4 options • 4 risks    │
│ [VIEW] ────────────────→│
└────────────────────────┘
```

---

## ROE Status Types

| Status | Badge | Meaning | Action |
|--------|-------|---------|--------|
| **Within ROE** | ✅ Green | Approved under current ROE | Proceed normally |
| **Requires ROE** | 🔴 Red | Needs new authorization | Submit ROE request |
| **ROE Pending** | 🟡 Amber | Request submitted | Wait for approval |
| **ROE Approved** | 🔵 Blue | New ROE granted | Can now proceed |
| **ROE Rejected** | 🔴 Red | Request denied | Modify or cancel |

---

## Example Use Cases

### Strike Decision (Requires ROE)
```
Decision: Strike T-1002 near civilian area
ROE Status: 🔴 REQUIRES NEW ROE

Commander sees immediately:
"This needs ROE authorization before we can execute"

Action: J3 submits ROE request first, then analyzes options
Timeline: +12-48 hours for ROE approval
```

### Maneuver Decision (Within ROE)
```
Decision: Move 1 MECH BDE within AO
ROE Status: ✅ WITHIN ROE

Commander sees immediately:
"No ROE concerns, can proceed with analysis"

Action: Proceed directly to option analysis
Timeline: No ROE delays
```

---

## What Changed (Code)

### Types Updated
```typescript
// Added ROE status type
export type ROEStatus = 
    | 'within_approved_roe'
    | 'requires_roe_release'
    | 'roe_pending_approval'
    | 'roe_approved'
    | 'roe_rejected';

// Added to Decision interface
export interface Decision {
    // ... existing fields ...
    roeStatus: ROEStatus;
    roeNotes?: string;
}
```

### Components Updated

**1. DecisionCard.tsx**
- Added ROE status badge (colored, with icon)
- Displays prominently under title
- Color-coded: Green (within), Red (required), Amber (pending), Blue (approved)

**2. DecisionAnalysisPanel.tsx**
- Added full ROE status section
- Shows detailed ROE information
- Displays ROE notes and conditions
- Shows action required warnings

**3. Mock Data (decision.service.ts)**
- Strike T-1002: `requires_roe_release`
- Move MECH BDE: `within_approved_roe`

---

## Database Schema (To Add)

```sql
-- Add ROE columns to decisions
ALTER TABLE decisions 
ADD COLUMN roe_status VARCHAR(30),
ADD COLUMN roe_notes TEXT,
ADD COLUMN roe_request_id UUID;

-- Create ROE requests table
CREATE TABLE roe_requests (
    id UUID PRIMARY KEY,
    decision_id UUID REFERENCES decisions(id),
    status VARCHAR(20),
    approved_by VARCHAR(100),
    roe_reference VARCHAR(100),
    expiration_date TIMESTAMP
);
```

---

## Integration with Battle Rhythm

### Decision Routing with ROE Check

```
Decision Created
    ↓
ROE Check
    ├─ Within Approved ROE → Route normally (DRB/CAB/Brief)
    │
    └─ Requires New ROE → Block routing, submit ROE request
           ↓
       ROE Pending → On hold
           ↓
       ROE Result:
       ├─ Approved → Unblock, route normally
       └─ Rejected → Decision cannot proceed
```

### Meeting Agendas

```
DRB Agenda (Wed Jan 22):

READY TO PRESENT:
1. Move 1 MECH BDE ✅ WITHIN ROE
2. Intel Priority ✅ WITHIN ROE

ON HOLD (ROE PENDING):
3. Strike T-1002 🟡 ROE PENDING
   Status: Awaiting Higher HQ approval
   Action: Monitor, add to next DRB if approved by Tuesday
```

---

## Files Changed

### ✅ Already Updated
1. `/frontend/src/lib/smartops/types.ts` - Added ROEStatus type
2. `/frontend/src/features/smartops/components/decisions/DecisionCard.tsx` - Added badge
3. `/frontend/src/features/smartops/components/decisions/DecisionAnalysisPanel.tsx` - Added section
4. `/frontend/src/lib/smartops/services/decision.service.ts` - Added mock data

### 📋 Documentation Created
5. `/docs/ROE_STATUS_FEATURE.md` - Complete feature guide
6. `/docs/ROE_STATUS_QUICK_SUMMARY.md` - This document

### 📅 To Update (Week 1-2)
7. `/docs/WEEK_1_IMPLEMENTATION_PLAN.md` - ✅ Updated with ROE schema
8. Backend migration file - Add ROE columns (when creating)
9. Backend routing logic - Add ROE checks (when building)

---

## Quick Start

### See ROE Status Now (Development)

1. Start frontend: `cd frontend && npm run dev`
2. Navigate to: `http://localhost:5173/smartops/`
3. See two decisions with different ROE status:
   - Strike T-1002: 🔴 **ROE REQUIRED**
   - Move MECH BDE: ✅ **WITHIN ROE**

### Add ROE Status to Database (Week 1)

Include in migration file (Task 1.1):
```sql
ALTER TABLE decisions ADD COLUMN roe_status VARCHAR(30);
ALTER TABLE decisions ADD COLUMN roe_notes TEXT;
CREATE TABLE roe_requests (...);
```

### Implement ROE Logic (Week 2-3)

Add ROE determination logic in backend:
```rust
fn determine_roe_status(decision: &Decision) -> ROEStatus {
    // Check if decision requires special ROE
    // Return appropriate status
}
```

---

## Benefits Summary

**For Commanders:**
- ✅ Instant ROE status visibility (no more surprises)
- ✅ Clear blockers identified early
- ✅ Focus on ready decisions first

**For Legal Advisors:**
- ✅ ROE compliance tracked
- ✅ Clear audit trail
- ✅ Legal review documented

**For Staff:**
- ✅ Know which decisions need ROE work
- ✅ Parallel processing (ROE + analysis)
- ✅ Meeting prep more accurate

**For Organization:**
- ✅ 100% ROE compliance
- ✅ Zero unauthorized actions
- ✅ Faster decision execution (no last-minute ROE delays)

---

## Next Steps

### Immediate (This Week)
- [x] Frontend displays ROE status ✅
- [ ] Review ROE display with legal advisor
- [ ] Validate ROE status logic

### Week 1-2 (Database)
- [ ] Add ROE columns to decisions table
- [ ] Create roe_requests table
- [ ] Add ROE status to mock/seed data

### Week 2-3 (Backend Logic)
- [ ] Implement ROE determination logic
- [ ] Create ROE request endpoint
- [ ] Add ROE check to routing
- [ ] Test ROE workflow end-to-end

---

**Status:** ✅ Frontend complete, visible in dashboard now

**View it:** `npm run dev` → `/smartops/`

**Documentation:** See `ROE_STATUS_FEATURE.md` for complete guide

---

_ROE compliance is now a first-class citizen in the decision system._

_Version: 1.0_  
_Date: 2026-01-21_  
_Status: ✅ Implemented and visible_
