# Command Dashboard Guide (`/smartops`)

**Purpose:** The Command Dashboard serves as the **central command and control hub** for military operations, providing real-time situational awareness and highlighting critical decisions that require immediate attention.

---

## 🎯 What Is The Dashboard For?

The Command Dashboard is designed for **senior officers and operational commanders** (J3 Ops, Battalion/Brigade Commanders, etc.) to:

1. **Monitor Current Operations** - View real-time operational status at a glance
2. **Identify Critical Threats** - Surface intelligence insights requiring immediate action
3. **Track Campaign Progress** - Assess whether operational objectives are on track or at risk
4. **Make Time-Sensitive Decisions** - Highlight pending decisions with operational impact
5. **Maintain Situational Awareness** - Understand force readiness, tactical positions, and environmental factors

Think of it as a **military commander's cockpit** - everything critical is visible in one place.

---

## 📊 Current Dashboard Sections

### 1. **Operational Context Bar** (Top)
**What It Shows:**
- **Current Operation:** "Operation Rolling Thunder"
- **Phase:** Current operational phase (e.g., "Deterrence")
- **Timeline:** Days since operation start (D+04)
- **DEFCON Level:** Defense readiness condition (4 = Normal peacetime readiness)
- **Alert Level:** RED-ALPHA (Highest threat level)

**Actionable Info:**
- ⚠️ **RED-ALPHA Alert** = Critical threat detected - requires immediate command attention
- Phase transitions may require commander approval

---

### 2. **Live Intel Insights** (Left Panel) 🔴 5 NEW

**What It Shows:**
Real-time intelligence updates categorized by source and urgency.

**Current Alerts:**
1. **False CivCas Report** 
   - Category: DISINFO / Social Media
   - Status: NEW
   - **Action Required:** Review for information operations response

2. **Presidential Ultimatum**
   - Category: POLITICAL / Head of State
   - Status: ACTIVE
   - **Action Required:** Strategic-level decision may be needed

3. **Flash Floods in Sector North**
   - Category: ENV / Flood
   - Location: Sector North
   - **Action Required:** May impact logistics/mobility - assess operational impact

**What To Do:**
- Click on each insight to get detailed information
- Assess whether intelligence requires:
  - COA (Course of Action) adjustment
  - Warning Order
  - Staff coordination
  - Higher HQ notification
- Mark as "Reviewed" or escalate to **Decision Board**

---

### 3. **Force Readiness & Targeting Metrics** (Bottom Left)

**What It Shows:**
```
Force Readiness: 87% (+2.1% ↑)
Targeting Efficacy: 64% (Phase II Baseline)
```

**Actionable Info:**
- **87% Force Readiness** = Good operational capacity
- **+2.1% increase** = Positive trend (units recovering/reinforcing)
- **64% Targeting Efficacy** = Need to improve strike effectiveness or intelligence fusion

**What To Do:**
- If readiness drops below 75% → Check **Logistics** and **Personnel** modules
- If targeting efficacy is below target → Review **Targeting Board** or **BDA Workbench**

---

### 4. **Tactical COP (Common Operating Picture)** (Center)

**What It Shows:**
- **FLOT/FEBA:** Forward Line of Own Troops / Forward Edge of Battle Area
- **Friendly Units:** 1-64 MECH (BDE) - Brigade-level mechanized unit
- **Hostile Forces:** OPFOR REGT - Opposing force regiment
- **Critical Area:** AO VULCAN (Area of Operations)
- **Geographic Position:** Grid coordinates and lat/lon

**Actionable Info:**
- Visualizes current tactical situation
- Shows unit positions and combat engagement zones
- Critical alerts: "CRITICAL: AO VULCAN" indicates a high-priority area

**What To Do:**
- Click on tactical map to get detailed unit status
- Use for situational briefings
- Cross-reference with **RAP/RSP/RGP** modules for detailed asset positions

---

### 5. **Semantic Graph** (Right Panel)

**What It Shows:**
A knowledge graph showing operational relationships:
- **C2 NODE:** Command and Control relationships (HQ NORTH)
- **KINETIC OBJ:** Kinetic objectives (OBJ ALPHA)
- **Units:** 1-64 MECH
- **Locations:** AO VULCAN
- **Plans:** SHIELD II

**Actionable Info:**
- Visual representation of how command, units, objectives, and plans interconnect
- Helps identify dependencies and critical nodes

**What To Do:**
- Click nodes to explore relationships
- Use to understand operational complexity
- Identify single points of failure in the operational plan

---

### 6. **Campaign LOOs (Lines of Operation)** (Bottom) ⚠️ DRIFT DETECTED

**What It Shows:**
Timeline view of campaign objectives across three Lines of Operation:

**SECURITY (Blue):**
- ✅ Local Sec Established (2026-03-02) - ACHIEVED
- ⚠️ **Hostile Neutralized (2026-03-06) - AT RISK / DRIFT** 🔴
- Borders Sealed (2026-03-10) - PENDING

**STABILITY (Green):**
- Essential Svc Restored (2026-03-15) - PENDING

**INFLUENCE (Purple):**
- Info Dominance (2026-03-04) - PENDING

**Critical Insight:**
- **"Hostile Neutralized" objective is DRIFTING** = Behind schedule or at risk of failure
- Current time is **D+04** (shown as red vertical line at TIME-NOW)

**What To Do:**
1. **IMMEDIATE ACTION REQUIRED** on the "Hostile Neutralized" objective:
   - Navigate to **Decision Board** to review COA options
   - Check **Targeting Board** for strike plan effectiveness
   - Review **COG Analysis** to assess enemy center of gravity
   - Consider requesting additional resources via **RFI Management**

2. For other objectives:
   - Monitor timeline progress
   - Allocate resources to stay on schedule
   - Adjust campaign plan if necessary via **Campaign Design** module

---

## 🚨 Pending Decisions & Actionable Items

Based on the current dashboard state:

### CRITICAL (Red) - Immediate Action Required
1. ⚠️ **RED-ALPHA Alert Level**
   - What: Highest threat level activated
   - Action: Review intel insights and assess threat → Click **Decision Board**

2. ⚠️ **"Hostile Neutralized" Objective at Risk**
   - What: Key campaign objective behind schedule
   - Action: Review COAs, adjust targeting, request support
   - Navigate to: **Decision Board**, **Targeting Board**, **Campaign Design**

### HIGH (Orange) - Within 24-48 Hours
3. 📋 **Presidential Ultimatum (ACTIVE)**
   - What: Political constraint on operations
   - Action: Review ROE implications, coordinate POLAD/LEGAD
   - Navigate to: **Strategic Direction**, **ROE**, **Advisory Queue**

4. 🌊 **Flash Floods in Sector North**
   - What: Environmental impact on operations
   - Action: Assess mobility corridors, adjust logistics routes
   - Navigate to: **Logistics**, **Environment**, **Supply Network**

### MEDIUM (Yellow) - Monitoring Required
5. 📊 **64% Targeting Efficacy**
   - What: Strike effectiveness below optimal
   - Action: Review BDA, improve intelligence fusion
   - Navigate to: **BDA Workbench**, **Targeting Board**, **Assessment**

6. 🗣️ **False CivCas Report (DISINFO)**
   - What: Disinformation campaign
   - Action: Coordinate information operations response
   - Navigate to: **Social Domain**, **Advisory Queue**

---

## 🎮 How to Use the Dashboard

### Daily Commander's Workflow:
1. **Morning Brief (0600):**
   - Check **Live Intel Insights** for overnight developments
   - Review **Force Readiness** trend
   - Assess **Campaign LOOs** for drift

2. **Throughout the Day:**
   - Monitor **Alert Level** changes
   - Click on NEW intelligence items as they appear
   - Track tactical situation on **COP**

3. **Decision Points:**
   - Use dashboard to identify issues requiring commander's decision
   - Navigate to specialized modules for detailed analysis
   - Return to dashboard after decisions to see updated status

4. **Evening Assessment (1800):**
   - Review day's progress on **Campaign LOOs**
   - Check **Targeting Efficacy** and **Force Readiness** trends
   - Prepare for next day's operations

---

## 🔗 Navigation from Dashboard

The dashboard is a **starting point** that surfaces critical info. For detailed work:

| Dashboard Alert | Navigate To Module | Purpose |
|----------------|-------------------|---------|
| Intel Insights | **Advisory Queue** | Review and task intelligence |
| Campaign Drift | **Campaign Design** | Adjust operational plan |
| Targeting Issues | **Targeting Board** | Review strike plans |
| Force Readiness | **Personnel**, **Logistics** | Address readiness gaps |
| Political Constraints | **Strategic Direction**, **ROE** | Review political guidance |
| Environmental Issues | **Environment**, **Logistics** | Assess operational impact |
| Decision Needed | **Decision Board** | Formal decision-making process |

---

## 📝 What NOT To Use Dashboard For

The dashboard is **NOT** for:
- ❌ Detailed planning (use **Campaign Design**, **OPLAN Manager**)
- ❌ Tactical execution (use **Battle Rhythm**, **Combat Net Radio**)
- ❌ Intelligence analysis (use **Overview Picture**, **Digital Twin**)
- ❌ Targeting deconfliction (use **Targeting Board**)
- ❌ Assessment creation (use **Assessment**, **BDA Workbench**)

**Think of it as:** The dashboard shows the "what" and "why it matters" - you go to specialized modules for the "how to fix it."

---

## 🎯 Summary: What Makes Information "Actionable"?

Information on the dashboard is actionable if it requires:
1. **Commander's Decision** - Political, strategic, or operational-level choices
2. **Resource Allocation** - Shifting units, assets, or priorities
3. **Plan Adjustment** - Changing campaign timeline, objectives, or COAs
4. **Risk Assessment** - Evaluating threats to mission success
5. **Coordination** - Cross-staff or inter-agency action

**Current Actionable Items:** 6 (2 Critical, 2 High, 2 Medium)

---

## 💡 Next Steps

1. Review each **Live Intel Insight** (click to open details)
2. Address the **Campaign LOO drift** on "Hostile Neutralized" objective
3. Navigate to **Decision Board** to see formal decision requests
4. Check **Advisory Queue** for staff recommendations
5. Review **Targeting Board** to improve targeting efficacy

**Remember:** The dashboard is your "early warning system" - it tells you where to focus your attention, then you use the specialized modules to take action.
