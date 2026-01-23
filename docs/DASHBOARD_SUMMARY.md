# Command Dashboard Summary

## 🎯 Quick Answer: What Is The Dashboard For?

The **Command Dashboard** (`/smartops`) is your **operational cockpit** - a real-time C2 hub that surfaces **critical decisions** and **at-risk objectives** requiring immediate command attention.

Think of it as: **"Show me what's breaking and what needs my decision right now"**

---

## 📊 Current Actionable Items (Based on Your Live Data)

### 🚨 CRITICAL - Requires Immediate Action

**1. RED-ALPHA Alert Level**
- **What:** Highest threat condition activated
- **Where to act:** Click on intel insights OR go to **Decision Board**
- **Why urgent:** Indicates critical threat to operations

**2. Campaign Objective at DRIFT**
- **What:** "Hostile Neutralized" objective is behind schedule (D+06 target, currently D+04)
- **Impact:** Key security line of operation at risk
- **Where to act:** 
  - **Decision Board** - Review COA options
  - **Targeting Board** - Adjust strike plans
  - **Campaign Design** - Revise timeline

---

### ⚠️ HIGH PRIORITY - Within 24-48 Hours

**3. Presidential Ultimatum (ACTIVE)**
- **Category:** POLITICAL / Head of State
- **Content:** "Public statement regarding border integrity"
- **Where to act:** 
  - **Strategic Direction** - Understand political constraints
  - **ROE** - Check rules of engagement implications
  - **Advisory Queue** - Coordinate with LEGAD/POLAD

**4. Flash Floods in Sector North**
- **Category:** ENV / Flood
- **Impact:** Mobility and logistics constraints
- **Where to act:**
  - **Logistics** - Adjust supply routes
  - **Environment** - Monitor conditions
  - **Tactical COP** - Check affected units (4th LOG BN visible in AO)

---

### 📋 PENDING FORMAL DECISIONS (Decision Board)

**5. Strike T-1002 Authorization**
- **Type:** Kinetic strike authorization
- **Decision:** APPROVE ✅ or REJECT ❌
- **Context:** Cross-referenced with Brief B-TRAINING-01
- **Attendees:** LEGAD-North, Chief of Staff, J2 Director authenticated
- **Status:** Awaiting commander decision

**6. Move 1 MECH BDE to Sector Beta**
- **Type:** Unit maneuver authorization
- **Decision:** APPROVE ✅ or REJECT ❌
- **Context:** Cross-referenced with Brief B-TRAINING-01
- **Impact:** Repositions 1-64 MECH Brigade
- **Status:** Awaiting commander decision

---

### 📈 METRICS REQUIRING MONITORING

**7. Targeting Efficacy: 64%**
- **Status:** Below optimal (Phase II Baseline)
- **Trend:** Not improving
- **Where to act:** 
  - **BDA Workbench** - Review battle damage assessment
  - **Targeting Board** - Improve target selection
  - **Assessment** - Analyze effectiveness gaps

**8. Force Readiness: 87% (+2.1%)**
- **Status:** Good (above 75% threshold)
- **Trend:** Improving ↑
- **Action:** Continue monitoring

---

## 🎮 Your Immediate Workflow

### Step 1: Review Intel Insights (2 minutes)
```
Dashboard → Click each NEW insight → Assess impact → Mark reviewed or escalate
```
- ✅ False CivCas Report (DISINFO)
- ⚠️ Presidential Ultimatum (POLITICAL)
- ⚠️ Flash Floods Sector North (ENV)

### Step 2: Address Decision Board Items (10 minutes)
```
Dashboard → Decision Board → Review 2 pending decisions → APPROVE or REJECT
```
- Decision 1: Strike T-1002 Authorization
- Decision 2: Move 1 MECH BDE to Sector Beta

### Step 3: Address Campaign Drift (30 minutes)
```
Dashboard → Campaign Design OR Targeting Board → Adjust plan for "Hostile Neutralized" objective
```
- Current: D+04, Target: D+06 (2 days remaining)
- Risk: Security line of operation behind schedule

### Step 4: Monitor Tactical Situation (ongoing)
```
Dashboard → Tactical COP → Check FLOT/FEBA → Monitor critical areas (AO VULCAN)
```

---

## 📖 How to Use the Dashboard Daily

### Morning Brief (0600)
1. Check **Alert Level** (currently RED-ALPHA)
2. Review **Live Intel Insights** for overnight changes
3. Assess **Force Readiness** trend
4. Check **Campaign LOOs** for new drift

### Throughout the Day
- Monitor NEW intel insights as they appear
- Click notifications for details
- Navigate to specialized modules for deep work

### Decision Points
- Use dashboard to identify what needs decision
- Go to **Decision Board** for formal approvals
- Return to dashboard to see updated status

### Evening Assessment (1800)
- Review day's progress on **Campaign LOOs**
- Check metrics: Force Readiness, Targeting Efficacy
- Prepare tomorrow's focus areas

---

## 🔗 Navigation Guide: Dashboard → Action Modules

| I See This On Dashboard | I Navigate To | To Do This |
|------------------------|---------------|------------|
| Intel Insight (NEW) | **Advisory Queue** | Review, task, or escalate intelligence |
| Campaign Objective (DRIFT) | **Campaign Design** | Adjust operational plan timeline |
| Targeting Efficacy Low | **Targeting Board** or **BDA Workbench** | Review strike effectiveness |
| Force Readiness Drop | **Personnel** or **Logistics** | Address readiness gaps |
| Political Constraint | **Strategic Direction** or **ROE** | Review guidance and constraints |
| Environmental Issue | **Environment** or **Logistics** | Assess operational impact |
| Decision Needed | **Decision Board** | Formal approve/reject decisions |
| Unit Position Update | **Tactical COP** or **RAP/RSP/RGP** | Detailed situational awareness |

---

## ❌ What Dashboard Is NOT For

- ❌ **Detailed Planning** → Use Campaign Design, OPLAN Manager
- ❌ **Tactical Execution** → Use Battle Rhythm, Combat Net Radio
- ❌ **Intelligence Analysis** → Use Overview Picture, Digital Twin
- ❌ **Target Deconfliction** → Use Targeting Board
- ❌ **Long-form Assessment** → Use Assessment module

**The dashboard shows "what" and "why it matters" - specialized modules provide the "how to fix it"**

---

## 🎯 Summary: 6 Actionable Items Right Now

| Priority | Item | Module to Use | Estimated Time |
|----------|------|---------------|----------------|
| 🔴 CRITICAL | RED-ALPHA Alert | Decision Board | 5 min |
| 🔴 CRITICAL | Campaign Objective Drift | Campaign Design, Targeting Board | 30 min |
| 🟠 HIGH | Presidential Ultimatum | Strategic Direction, ROE | 15 min |
| 🟠 HIGH | Flash Floods Sector North | Logistics, Environment | 10 min |
| 🟡 MEDIUM | Strike T-1002 Authorization | Decision Board | 5 min |
| 🟡 MEDIUM | Move 1 MECH BDE Decision | Decision Board | 5 min |

**Total time to address all items: ~70 minutes**

---

## 📸 Visual References

See screenshots in `.playwright-mcp/` folder:
- `smartops-dashboard.png` - Full dashboard overview
- `decision-board.png` - Decision Board with pending approvals

---

## 💡 Key Insight

**The dashboard is an "early warning system"** - it highlights:
1. What requires **your decision** (Decision Board)
2. What is **at risk** (Campaign drift, low metrics)
3. What is **changing** (Intel insights, alerts)
4. What needs **attention** (Environmental factors, political constraints)

It's designed for **senior officers** (Battalion/Brigade commanders, J3 Ops, Joint Force Commanders) to maintain situational awareness and prioritize actions without getting lost in operational details.

---

**Next Action:** Review the 2 decisions on the Decision Board - they're waiting for formal approval/rejection.
