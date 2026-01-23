# Decision Options Integration - Quick Summary

## What This Solves

Based on the scenarios (especially Scenario 3: Cognitive Load), commanders need to see:
1. **Multiple options** for every decision (not just approve/reject)
2. **Immediate consequences** of each option
3. **Secondary/cascading consequences** (24-72h timeframe)
4. **Trade-off analysis** across balanced scorecard dimensions
5. **Risk factors** that should influence the choice

## How It Works in the Dashboard

### 1. In the Critical Actions Zone (Tier 1)

Decision appears as a compact card:

```
┌─────────────────────────────────────────┐
│ 🎯 DECISION REQUIRED                     │
│                                          │
│ Strike T-1002 Authorization             │
│ High-value enemy command post           │
│                                          │
│ 🔴 4 options available                   │  ← User knows choices exist
│ ⚠️  4 risk factors detected              │  ← Warns of complexity
│ ⏰ Deadline: 6 hours                     │  ← Urgency clear
│                                          │
│ [VIEW OPTIONS & ANALYSIS] ─────────────→ │  ← One click to analysis
└─────────────────────────────────────────┘
```

### 2. Full-Screen Analysis Panel

When clicked, shows all options with structured consequence analysis:

**For Each Option:**
- ✅ Positive consequences (what you gain)
- ❌ Negative consequences (what you lose)
- ⚠️ Secondary consequences (what happens next)
- 📊 Trade-off analysis (impact on all dimensions)
- ⏰ Timeline (when consequences manifest)
- 💼 Resources required
- 🎯 Overall score
- 🤖 System recommendation

## Example: Strike Authorization Decision

### Option 1: Approve Strike (As Planned)
**Immediate:**
- ✅ Target neutralized (+40 Operational)
- ❌ Civilian casualties likely (-30 Political)

**Secondary (24-72h):**
- ⚠️ Presidential Ultimatum compromised → Ministerial intervention (-40 Political)
- ⚠️ Campaign objective "Info Dominance" at risk → Extended operation (+2 weeks)

**Trade-Offs:**
- Operational: 87% → 92% 🟢
- Political: 75% → 50% 🔴 BREACHES threshold
- Legal: 100% → 100% 🟢

**Score:** +10 (Positive but risky)  
**Recommendation:** ❌ NOT RECOMMENDED

---

### Option 2: Defer 24H + Coordinate (RECOMMENDED)
**Immediate:**
- ✅ Political coordination achieved (+15 Political)
- ❌ Target may relocate 20% probability (-15 Operational if relocates)

**Secondary (24-72h):**
- ⚠️ Modified strike with lower civilian risk → Higher morale (+5% Personnel)
- ⚠️ Political support maintained → Continued resource support

**Trade-Offs:**
- Operational: 87% → 85% 🟢
- Political: 75% → 82% 🟢
- Legal: 100% → 100% 🟢

**Score:** +25 (Positive, balanced)  
**Recommendation:** ✅ RECOMMENDED

---

### Option 3: Modify Strike & Approve
**Immediate:**
- ✅ Target neutralized within 12 hours (+35 Operational)
- ❌ Precision munition cost +$500K (-0.5% Budget)

**Secondary (24-72h):**
- ⚠️ Political support maintained (expedited coordination)
- ⚠️ If target alerted: May require re-strike (+$1M, +48h)

**Trade-Offs:**
- Operational: 87% → 90% 🟢
- Political: 75% → 73% 🟢
- Budget: 95% → 94.5% 🟢

**Score:** +18 (Positive, compromise)  
**Recommendation:** ⚠️ ACCEPTABLE ALTERNATIVE

---

### Option 4: Reject Strike
**Immediate:**
- ✅ No civilian casualty risk (+0 Political)
- ❌ Target remains operational (-40 Operational)

**Secondary (24-72h):**
- ⚠️ Alternative targeting required → Extended cycle (+3-5 days)
- ⚠️ Target may harden defenses → More difficult later (+$2M)

**Trade-Offs:**
- Operational: 87% → 75% 🟡 Near threshold
- Political: 75% → 75% 🟢
- Personnel: 83% → 80% 🟢

**Score:** -25 (Negative, risk-averse)  
**Recommendation:** ❌ NOT RECOMMENDED

## Key Features

### 1. Consequence Cascading
Shows how one consequence leads to another:
```
Political fallout (-30)
  └─→ Ministerial intervention required (-40)
      └─→ Budget scrutiny increased (-15)
          └─→ Approval delays (+2 weeks)
```

### 2. Trade-Off Visualization
Clear visual showing impact across ALL accountability dimensions:
```
Operational:   87% → 92% (+5%)  🟢 Above threshold
Political:     75% → 50% (-25%) 🔴 BREACHES threshold (60%)
Personnel:     83% → 80% (-3%)  🟢 Above threshold
Environmental: 88% → 88% (0%)   🟢 Maintained
Legal:         100% → 100% (0%) 🟢 Compliant
Budget:        95% → 95% (0%)   🟢 Maintained
```

### 3. Risk Factor Detection
System automatically detects risks:
- 🔴 CRITICAL: Conflicts with Presidential Ultimatum guidance
- 🟠 HIGH: 200m from civilian hospital
- 🟡 MEDIUM: Target assessment 48h old (may be outdated)

### 4. Decision Safety Checks
If commander is fatigued (12h+ on duty), system warns:
```
⚠️  COGNITIVE LOAD WARNING
• You've been on duty 12h 18m (High Fatigue Zone)
• Consider consulting Deputy Commander (available now)
• Or defer decision 2h + take 20min break (improves quality 25%)
```

### 5. Precedent Matching
Shows similar past decisions:
```
📊 SIMILAR PAST DECISIONS (3 precedents found)
• Strike AUTH-445 (2025-11): Deferred 24h → Success, zero casualties
• Strike AUTH-318 (2025-09): Approved modified → Partial success
• Strike AUTH-201 (2025-06): Approved as-is → Political fallout
```

## Integration Points

### In Dashboard (Compact View)
- Critical Actions Zone (Tier 1)
- Shows count of options and risk factors
- One-click to full analysis

### Full Analysis Panel (Expanded View)
- Full-screen modal overlay
- Detailed option breakdown
- Interactive consequence exploration
- Trade-off visualization
- Consultation options

### After Decision Made
- Decision logged with chosen option
- Predicted consequences tracked
- Actual consequences compared to predicted
- ML models improved over time

## Data Flow

```
1. Decision Created (J3 Ops creates strike authorization)
   ↓
2. System Analyzes (AI predicts consequences for each option)
   ↓
3. Dashboard Displays (Commander sees in Critical Zone)
   ↓
4. Commander Expands (Full analysis panel opens)
   ↓
5. Reviews Options (Compares consequences and trade-offs)
   ↓
6. Makes Choice (Selects option, documents justification)
   ↓
7. Decision Logged (Stored for precedent matching)
   ↓
8. Consequences Tracked (System monitors actual outcomes)
   ↓
9. ML Models Updated (Improve prediction accuracy)
```

## Implementation Files

### Backend (Rust)
- `/backend/src/features/decisions/mod.rs` - Decision engine
- `/backend/src/features/decisions/consequence_predictor.rs` - ML-based prediction
- `/backend/src/features/decisions/trade_off_analyzer.rs` - Balanced scorecard analysis
- `/backend/src/features/decisions/risk_detector.rs` - Risk factor detection

### Frontend (React/TypeScript)
- `/frontend/src/features/decisions/components/DecisionCard.tsx` - Compact card
- `/frontend/src/features/decisions/components/DecisionAnalysisPanel.tsx` - Full panel
- `/frontend/src/features/decisions/components/OptionCard.tsx` - Option breakdown
- `/frontend/src/features/decisions/components/ConsequenceVisualization.tsx` - Cascades
- `/frontend/src/features/decisions/components/TradeOffChart.tsx` - Trade-off viz

### Documentation
- `/docs/DECISION_OPTIONS_IMPLEMENTATION.md` - Full implementation guide (THIS FILE)
- `/docs/scenarios/SCENARIO-03-COGNITIVE-LOAD.md` - Reference scenario
- `/docs/scenarios/SCENARIO-08-BALANCED-ACCOUNTABILITY.md` - Trade-off reference

## Key Design Principles

### 1. Progressive Disclosure
- Compact view in dashboard (glanceable)
- Full detail on demand (expandable)
- Cascading consequences can be toggled

### 2. Visual Hierarchy
- Recommended option highlighted (blue border, ✅ badge)
- Risk factors prominently displayed (top of panel)
- Threshold breaches clearly marked (🔴 red indicators)

### 3. Cognitive Load Management
- Not all options have equal weight (system recommends)
- Confidence scoring (AI transparency)
- Fatigue warnings (decision safety checks)
- Consultation prompts (when appropriate)

### 4. Actionable Information
- Every consequence has impact score (-100 to +100)
- Every option has timeline (when consequences manifest)
- Every resource has availability status (available vs. constrained)
- Every risk has mitigation strategy

## Success Criteria

### User Experience
- ✅ Commander can understand all options in < 2 minutes
- ✅ Risk factors are acknowledged 90%+ of time
- ✅ System recommendation adopted 60%+ of time
- ✅ User satisfaction rating > 85%

### System Performance
- ✅ Analysis generates in < 3 seconds
- ✅ Consequence prediction accuracy > 70%
- ✅ Threshold breach detection 100% accurate
- ✅ ML confidence scoring improves over time

### Operational Impact
- ✅ Decision quality: 30% reduction in reversals
- ✅ Decision time: 50% reduction (from baseline)
- ✅ Risk awareness: 90% of risks acknowledged
- ✅ Consultation rate: 40% increase

## Next Steps

1. **Review** this implementation guide with stakeholders
2. **Prioritize** which decision types to implement first (strikes, maneuvers, resources?)
3. **Prototype** one decision type end-to-end
4. **User test** with 5 operators
5. **Iterate** based on feedback
6. **Expand** to other decision types
7. **Train** ML models with historical data

---

**Ready to implement:** All specifications complete, data models defined, component architecture planned.

**Estimated timeline:** 16 weeks (4 phases × 4 weeks)

**Priority:** P0 (Critical capability for situation awareness cockpit)
