# Priority-Based Visibility System

## Overview

Implemented a smart, priority-based visibility system across Assumptions and Uncertainty pages to **reduce cognitive overload** by showing only what matters most. When critical issues are present, secondary information is automatically hidden, allowing commanders to focus on what requires immediate action.

## Problem Statement

As the SmartOps dashboard grew, pages became cluttered with data elements:
- Summary statistics
- Detailed metrics
- Multiple status categories
- Historical data
- Secondary analysis

**Result**: Cognitive overload where critical issues could be missed among routine information.

## Solution: Progressive Disclosure

### Core Principle
**"Show critical first, reveal more only when critical issues are handled"**

### Priority Hierarchy

#### **Priority 1: Critical Issues (Always Visible)**
- Broken assumptions with High/Critical risk
- Entities with <60% confidence
- Immediate action alerts

#### **Priority 2: Important Issues (Visible when no Priority 1)**
- All broken/challenged assumptions
- Low confidence entities (60-80%)
- Risk assessments

#### **Priority 3: Secondary Info (Visible when no issues)**
- Valid assumptions
- High-confidence entities
- Detailed metrics

#### **Priority 4: Tertiary Details (Collapsed when issues exist)**
- Historical data
- Distribution charts
- Detailed analysis tables

## Implementation Details

### Assumptions Page (`AssumptionManagement.tsx`)

#### Visibility Logic
```typescript
const criticalAssumptions = assumptions.filter(
    a => (a.status === 'Broken' || a.status === 'Challenged') && 
         (a.risk_level === 'High' || a.risk_level === 'Critical')
);

const hasCriticalIssues = criticalAssumptions.length > 0;
const hasAnyIssues = brokenAssumptions.length > 0 || challengedAssumptions.length > 0;
```

#### Main Content Visibility

**When Critical Issues Exist:**
```
✅ Critical Assumption Failures (with 🚨 emoji and red styling)
❌ Broken Assumptions (hidden - part of critical)
❌ Challenged Assumptions (hidden)
❌ Monitoring Assumptions (hidden)
❌ Valid Assumptions (hidden)
✅ "X additional assumptions hidden" indicator
```

**When Only Minor Issues:**
```
✅ Broken Assumptions
✅ Challenged Assumptions
❌ Monitoring Assumptions (hidden)
❌ Valid Assumptions (hidden)
```

**When No Issues:**
```
✅ Monitoring Assumptions
✅ Valid Assumptions (first 6, with "Show More" button)
✅ "All Assumptions Valid" success indicator
```

#### Sidebar Visibility

**When Critical Issues:**
```
✅ Critical Alert Badge (red, pulsing)
✅ Broken & Challenged counts only
✅ Risk Assessment (if risks exist)
✅ Related System link
❌ Valid & Monitoring counts (hidden)
```

**When No Issues:**
```
✅ All status distribution
✅ System Health Indicator (green)
✅ Related System link
```

### Uncertainty Page (`UncertaintyManagement.tsx`)

#### Visibility Logic
```typescript
const criticalEntities = entities.filter(e => e.confidenceScore < 60);
const watchlist = entities.filter(e => e.confidenceScore < 80);

const hasCriticalIssues = criticalEntities.length > 0 || brokenAssumptions.length > 0;
const hasMinorIssues = watchlist.length > 0 && criticalEntities.length === 0;
```

#### Main Content Visibility

**When Critical Issues Exist:**
```
✅ Broken Assumptions Alert (red banner, cross-page integration)
✅ Critical Confidence Failures (<60%, red styling)
❌ Low Confidence Watchlist (60-80%, hidden)
❌ Decision Impact Analysis (hidden)
❌ Truth Resolution (hidden)
✅ "X high-confidence entities hidden" indicator
```

**When Only Minor Issues:**
```
✅ Low Confidence Watchlist (60-80%)
❌ Decision Impact Analysis (hidden)
❌ Truth Resolution (hidden)
```

**When No Issues:**
```
✅ "Operational Picture: High Confidence" success indicator
✅ Decision Impact Analysis
✅ Truth Resolution
```

#### Sidebar Visibility

**When Critical Issues:**
```
✅ Critical Alert Badge (red, pulsing)
✅ Failure count summary
❌ Source Reliability details (hidden)
❌ Temporal Currency (hidden)
❌ Uncertainty Hotspot map (hidden)
✅ Related System link
```

**When No Issues:**
```
✅ Source Reliability metrics
✅ Temporal Currency charts
✅ Uncertainty Hotspot map
✅ System Health Indicator (green)
✅ Related System link
```

## Visual Design Enhancements

### Critical Issue Indicators
- **🚨 Emoji prefix** for immediate visual recognition
- **Red pulsing icons** (AlertCircle with animate-pulse)
- **"Immediate Action Required" badges**
- **Red background tints** (bg-red-500/10)
- **Bold, uppercase typography**

### Hidden Content Indicators
```tsx
<div className="p-6 bg-slate-900/40 border border-slate-800 rounded-lg text-center">
    <Eye className="text-slate-600 mx-auto mb-2" size={20} />
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
        {count} items hidden
    </p>
    <p className="text-[9px] text-slate-500">
        Resolve critical issues above to view details
    </p>
</div>
```

### Success Indicators
```tsx
<div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
    <CheckCircle2 className="text-emerald-500 mx-auto mb-3" size={24} />
    <p className="text-[12px] font-black text-emerald-500 uppercase mb-1">
        System Healthy
    </p>
    <p className="text-[9px] text-slate-400 uppercase">
        All metrics within acceptable thresholds
    </p>
</div>
```

## Benefits

### 1. **Reduced Cognitive Load**
- Commanders see only what matters
- Less scrolling and scanning
- Faster decision-making

### 2. **Forced Prioritization**
- Critical issues cannot be overlooked
- System enforces "handle critical first" workflow
- No option to get distracted by secondary data

### 3. **Progressive Disclosure**
- Information revealed as appropriate
- Prevents information overload
- Maintains context awareness

### 4. **Clear System Health Status**
- Instant visual feedback
- Green = good, Red = action required
- No ambiguity about current state

### 5. **Cross-Page Consistency**
- Same priority logic across pages
- Predictable behavior
- Easier to learn and use

## User Workflow Examples

### Example 1: Critical Assumption Broken

**Initial State:**
```
Assumptions Page:
- Shows all 50 assumptions
- Mixed statuses visible
- Full sidebar metrics

Uncertainty Page:
- Shows all entities
- Decision analysis visible
- Full sidebar metrics
```

**After Assumption Breaks:**
```
Assumptions Page:
🚨 Critical Assumption Failures (1)
- Shows ONLY the broken assumption
- "49 additional assumptions hidden"
- Sidebar shows critical alert badge

Uncertainty Page:
🚨 Broken Planning Assumptions (1)
- Red alert banner at top
- Link to assumptions page
- "Resolve critical issues" message
```

**Commander Action:**
1. Sees red alert immediately
2. Reviews broken assumption
3. Updates status or creates mitigation plan
4. Marks as handled

**After Resolution:**
```
Both Pages:
- All information becomes visible again
- Success indicators appear
- Normal operations resume
```

### Example 2: Low Confidence Entity

**Uncertainty Page State:**
```
When <60% confidence detected:
🚨 Critical Confidence Failures
- Shows ONLY entities <60%
- Hides 60-80% watchlist
- Hides decision analysis
- Sidebar: Critical alert badge

When resolved to 60-80%:
- Shows in Low Confidence Watchlist
- Still hides decision analysis
- No critical badge

When resolved to >80%:
- Shows "Operational Picture: High Confidence"
- All analysis visible
- Green success indicator
```

## Configuration & Customization

### Confidence Thresholds
```typescript
// Current thresholds
const CRITICAL_CONFIDENCE = 60;  // Below this = critical
const LOW_CONFIDENCE = 80;       // Below this = watchlist
const GOOD_CONFIDENCE = 80;      // Above this = good

// To adjust, modify in component:
const criticalEntities = entities.filter(e => e.confidenceScore < CRITICAL_CONFIDENCE);
const watchlist = entities.filter(e => e.confidenceScore < LOW_CONFIDENCE);
```

### Risk Level Definitions
```typescript
// Current critical definition
const isCritical = (a: Assumption) => 
    (a.status === 'Broken' || a.status === 'Challenged') && 
    (a.risk_level === 'High' || a.risk_level === 'Critical');

// To add "Medium" to critical:
const isCritical = (a: Assumption) => 
    (a.status === 'Broken' || a.status === 'Challenged') && 
    ['Medium', 'High', 'Critical'].includes(a.risk_level);
```

## Testing Considerations

### E2E Test Updates Needed

Since visibility is now dynamic, tests should verify:

1. **Critical State Tests**
   ```typescript
   test('shows only critical items when critical issues exist', async ({ page }) => {
       // Create critical assumption
       // Verify secondary items are hidden
       // Verify "X items hidden" indicator appears
   });
   ```

2. **Progressive Disclosure Tests**
   ```typescript
   test('reveals items as issues are resolved', async ({ page }) => {
       // Start with critical issue
       // Resolve issue
       // Verify items become visible
   });
   ```

3. **Cross-Page Integration Tests**
   ```typescript
   test('broken assumption appears in uncertainty page', async ({ page }) => {
       // Break assumption
       // Navigate to uncertainty page
       // Verify alert banner exists
   });
   ```

## Performance Considerations

### Filtering Overhead
- All filtering done in-memory (no database queries)
- React memoization not needed (small datasets)
- Re-filtering on every state change is acceptable

### Rendering Optimization
```typescript
// Current: Filter + map on every render
{criticalAssumptions.map(a => <Card />)}

// If performance issues arise, add useMemo:
const criticalCards = useMemo(
    () => criticalAssumptions.map(a => <Card key={a.id} />),
    [criticalAssumptions]
);
```

## Future Enhancements

### 1. User Preferences
Allow commanders to customize thresholds:
```typescript
interface UserPreferences {
    criticalConfidenceThreshold: number;  // Default 60
    showSecondaryWhenCritical: boolean;   // Default false
    autoExpandOnResolve: boolean;         // Default true
}
```

### 2. Expand/Collapse Controls
Add manual override for experienced users:
```tsx
<button onClick={() => setForceShowAll(!forceShowAll)}>
    {forceShowAll ? 'Hide Secondary' : 'Show All Anyway'}
</button>
```

### 3. Transition Animations
Add smooth transitions when items appear/disappear:
```css
.assumption-card {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### 4. Priority History Log
Track when items become critical/resolved:
```typescript
interface PriorityEvent {
    timestamp: Date;
    type: 'critical_entered' | 'critical_resolved';
    item_id: string;
    details: string;
}
```

## Related Documentation

- [Assumptions Feature](./ASSUMPTIONS_FEATURE.md)
- [Cognitive Load Management](./scenarios/SCENARIO-03-COGNITIVE-LOAD.md)
- [Dashboard Redesign](./DASHBOARD_REDESIGN_SUMMARY.md)

## Summary

**Before**: Cluttered dashboards with all information visible simultaneously
**After**: Clean, focused interfaces that adapt to current priorities

**Key Principle**: The system decides what's important and enforces focus on critical issues. Commanders can't get distracted by routine data when critical issues require attention.

**Result**: Faster decision-making, reduced cognitive load, and fewer missed critical alerts.

---

**Implementation Date**: January 21, 2026  
**Status**: ✅ Complete  
**Impact**: Significantly improved usability and reduced information overload
