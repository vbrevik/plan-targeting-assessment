# Role-Specific Dashboards - UX Design Concept

## Design Philosophy

**"Same place, different lens"** - Every role sees the operation through their functional lens, but all critical elements stay in consistent locations to reduce cognitive load and enable rapid context switching.

---

## Universal Layout Structure

### Grid System (1920x1080 baseline)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (80px) - Identity • Time • Operation • Phase • Alerts                  │
├───────┬─────────────────────────────────────────────────────────────┬───────────┤
│       │                                                             │           │
│ LEFT  │                                                             │  RIGHT    │
│ RAIL  │              MAIN CONTENT AREA                              │  RAIL     │
│       │              (Role-Specific)                                │           │
│ 240px │              1280px                                         │  400px    │
│       │                                                             │           │
│ Quick │                                                             │  Always:  │
│ Nav   │                                                             │  - Map    │
│ Menu  │                                                             │  - Battle │
│       │                                                             │    Rhythm │
│ Role  │                                                             │  - Recent │
│ Tools │                                                             │    Feed   │
│       │                                                             │           │
│       │                                                             │           │
└───────┴─────────────────────────────────────────────────────────────┴───────────┘
```

---

## Right Rail (ALWAYS CONSISTENT - 400px)

**This is the anchor point. Every role has identical right rail structure.**

```
┌─ RIGHT RAIL (400px) ──────────────────┐
│                                       │
│ ┌─ SITUATION MAP ─────────────────┐  │
│ │                                 │  │
│ │   [Tactical Map View]           │  │
│ │   • Friendly forces (blue)      │  │
│ │   • Enemy forces (red)          │  │
│ │   • Key terrain                 │  │
│ │   • Current operation area      │  │
│ │                                 │  │
│ │   Role-specific overlays:       │  │
│ │   - J2: Intel collection areas  │  │
│ │   - J3: Unit positions          │  │
│ │   - Targeting: Target zones     │  │
│ │   - J4: Supply routes           │  │
│ │                                 │  │
│ │   [Zoom] [Layer Toggle]         │  │
│ └─────────────────────────────────┘  │
│                                       │
│ ┌─ TODAY'S BATTLE RHYTHM ─────────┐  │
│ │ 📅 Wednesday, Jan 22             │  │
│ │                                 │  │
│ │ 0630 ✅ Morning Brief (complete)│  │
│ │ 0800   CAB                      │  │
│ │ 1000 ▶ J-Staff Sync (NOW)      │  │
│ │ 1200   Lunch Briefing           │  │
│ │ 1400   DRB                      │  │
│ │ 1730   Evening Brief            │  │
│ │                                 │  │
│ │ Next: J-Staff Sync (12 min)    │  │
│ └─────────────────────────────────┘  │
│                                       │
│ ┌─ CURRENT PHASE ─────────────────┐  │
│ │ OPERATION RESOLUTE SHIELD       │  │
│ │ Phase 2: Stabilization          │  │
│ │ D+14 | 12 days remaining        │  │
│ │                                 │  │
│ │ [▮▮▮▮▮▮▮▮░░░░] 67%              │  │
│ │                                 │  │
│ │ Phase End: Feb 3, 2024          │  │
│ └─────────────────────────────────┘  │
│                                       │
│ ┌─ RECENT ACTIVITY ───────────────┐  │
│ │ 🔴 2m  Strike T-1002 flagged    │  │
│ │        ROE required             │  │
│ │                                 │  │
│ │ 🔵 5m  1 MECH BDE repositioned  │  │
│ │        to Sector Beta           │  │
│ │                                 │  │
│ │ 🟡 12m CCIR-045 triggered       │  │
│ │        Enemy reinforcements     │  │
│ │                                 │  │
│ │ ⚪ 18m DRB agenda updated       │  │
│ │        3 items for approval     │  │
│ │                                 │  │
│ │ 🟢 25m Intel report published   │  │
│ │        J2-INTREP-0122          │  │
│ │                                 │  │
│ │ [VIEW ALL ACTIVITY] ────────────→│  │
│ └─────────────────────────────────┘  │
│                                       │
│ ┌─ QUICK COMMS ───────────────────┐  │
│ │ 💬 3 unread messages            │  │
│ │ 📞 Call watch floor             │  │
│ │ 📢 Announce to all staff        │  │
│ └─────────────────────────────────┘  │
│                                       │
└───────────────────────────────────────┘
```

**Why right rail?**
- Peripheral vision monitoring (map always visible)
- Consistent location reduces "where is it?" cognitive load
- Battle rhythm visible at all times
- Context (phase, operation) always present
- Activity feed provides ambient awareness

---

## Top Bar (ALWAYS CONSISTENT - 80px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] SmartOps          OPERATION RESOLUTE SHIELD | Phase 2: Stabilization │
│                                                                              │
│ 👤 MAJ John Smith (J3 Operations Officer)    ⏰ 22 JAN 2026 • 10:14:32 Z   │
│                                                                              │
│ 🔴 2 CRITICAL ALERTS  🟡 5 WARNINGS  🔵 12 UPDATES    [🔔] [⚙️] [👤]      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Top bar elements (left to right):**
1. **Logo/Home** - Return to role dashboard
2. **Operation/Phase** - Current operational context (center, prominent)
3. **User Identity** - Name, rank, role
4. **Time** - Zulu time (always)
5. **Alert Summary** - Critical/Warning/Info counts (clickable)
6. **Utilities** - Notifications, Settings, Profile

---

## Left Rail (CONSISTENT STRUCTURE, ROLE-SPECIFIC CONTENT - 240px)

```
┌─ LEFT RAIL (240px) ───────────┐
│                               │
│ ┌─ NAVIGATION ─────────────┐ │
│ │ 🏠 My Dashboard          │ │
│ │ 📊 Full COP              │ │
│ │ 🎯 Decisions             │ │
│ │ 📋 My Tasks              │ │
│ │ 📅 Meetings              │ │
│ │ 🗂️  Documents            │ │
│ └──────────────────────────┘ │
│                               │
│ ┌─ ROLE QUICK ACTIONS ─────┐ │
│ │ [Role-specific actions]  │ │
│ │ (See below for each role)│ │
│ └──────────────────────────┘ │
│                               │
│ ┌─ MY WORKLOAD ────────────┐ │
│ │ 🔴 3 Critical             │ │
│ │ 🟡 8 This Week            │ │
│ │ 🟢 12 Future              │ │
│ │                           │ │
│ │ [VIEW ALL TASKS] ────────→│ │
│ └──────────────────────────┘ │
│                               │
│ ┌─ ROLE DASHBOARDS ────────┐ │
│ │ Commander                │ │
│ │ ▶ J3 Operations (You)    │ │
│ │ J2 Intelligence          │ │
│ │ J5 Plans                 │ │
│ │ J4 Logistics             │ │
│ │ Targeting Cell           │ │
│ │ LEGAD                    │ │
│ │ Analyst                  │ │
│ └──────────────────────────┘ │
│                               │
│ ┌─ RESOURCES ──────────────┐ │
│ │ 📖 SOPs                  │ │
│ │ 🔗 References            │ │
│ │ 🎓 Training              │ │
│ └──────────────────────────┘ │
│                               │
└───────────────────────────────┘
```

---

## Main Content Area (ROLE-SPECIFIC - 1280px)

**This is where roles differ. Each role gets workspace optimized for their function.**

### Design Zones in Main Content:

```
┌─ MAIN CONTENT (1280px) ───────────────────────────────────────────┐
│                                                                    │
│ ┌─ PRIMARY WORKSPACE (60% height) ────────────────────────────┐  │
│ │ Role's main functional area                                 │  │
│ │ (e.g., J3: Current operations status)                       │  │
│ │ (e.g., J2: Intelligence picture)                            │  │
│ │ (e.g., Targeting: Target list and status)                   │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ SECONDARY PANELS (40% height) ─────────────────────────────┐  │
│ │ ┌─ Panel 1 ─────────┐ ┌─ Panel 2 ─────────┐ ┌─ Panel 3 ──┐ │  │
│ │ │ Role-specific     │ │ Role-specific     │ │ Role-      │ │  │
│ │ │ supporting info   │ │ supporting info   │ │ specific   │ │  │
│ │ └───────────────────┘ └───────────────────┘ └────────────┘ │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Role-Specific Dashboard Designs

---

## 1. COMMANDER Dashboard

**Primary Focus:** Executive overview, critical decisions, command authority

### Left Rail - Quick Actions
```
┌─ COMMANDER ACTIONS ───────────┐
│ ⚡ Approve Decision           │
│ 📝 Issue Commander's Guidance │
│ 🎯 Set Priority               │
│ 📢 Broadcast Message          │
│ 🚨 Declare CCIR Met           │
│ 📊 Request Brief              │
└───────────────────────────────┘
```

### Main Content
```
┌─ COMMANDER DASHBOARD ──────────────────────────────────────────────┐
│                                                                    │
│ ┌─ COMMAND OVERVIEW ─────────────────────────────────────────┐   │
│ │                                                            │   │
│ │  ⚡ DECISIONS REQUIRING MY AUTHORITY (2)                   │   │
│ │  ┌────────────────────────────────────────────────────┐   │   │
│ │  │ 🔴 CRITICAL: Strike T-1002 (6h deadline)           │   │   │
│ │  │ 🔴 ROE REQUIRED • 4 options • DRB Wed            │   │   │
│ │  │ [VIEW] [APPROVE] [DEFER] ───────────────────────→ │   │   │
│ │  └────────────────────────────────────────────────────┘   │   │
│ │  ┌────────────────────────────────────────────────────┐   │   │
│ │  │ 🟡 HIGH: Move 1 MECH BDE (5d deadline)            │   │   │
│ │  │ ✅ WITHIN ROE • 3 options • DRB Wed              │   │   │
│ │  │ [VIEW] [APPROVE] [DEFER] ───────────────────────→ │   │   │
│ │  └────────────────────────────────────────────────────┘   │   │
│ │                                                            │   │
│ │  🎯 CCIR STATUS (2 triggered, 8 active)                    │   │
│ │  🔴 CCIR-045: Enemy reinforcements detected (12m ago)      │   │
│ │  🟡 CCIR-023: Civilian movement spike in Sector C         │   │
│ │                                                            │   │
│ │  📊 OPERATION HEALTH                                       │   │
│ │  ┌──────────┬──────────┬──────────┬──────────┐           │   │
│ │  │ Forces   │ Readiness│ Logistics│ Intel    │           │   │
│ │  │ 🟢 Good  │ 🟡 Fair  │ 🟢 Good  │ 🟢 Good  │           │   │
│ │  │ 87%      │ 73%      │ 91%      │ 85%      │           │   │
│ │  └──────────┴──────────┴──────────┴──────────┘           │   │
│ │                                                            │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ ┌─ STAFF READINESS ─────┐ ┌─ UPCOMING ──────┐ ┌─ PRIORITIES ─┐ │
│ │ J2: 🟢 Current         │ │ 1000 J-Staff    │ │ 1. Decisive   │ │
│ │ J3: 🟢 Current         │ │ 1400 DRB (12)   │ │    Operations │ │
│ │ J4: 🟡 Update pending  │ │ 1730 Brief      │ │ 2. Force Prot │ │
│ │ J5: 🟢 Current         │ │                 │ │ 3. Logistics  │ │
│ │ J6: 🟢 Current         │ │ Tomorrow:       │ │               │ │
│ │                        │ │ 0800 CAB (5)    │ │ [EDIT] ──────→│ │
│ └────────────────────────┘ └─────────────────┘ └───────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Commander-specific elements:**
- Decisions requiring command authority (top priority)
- CCIR status (commander's critical information)
- Operation health dashboard
- Staff readiness indicators
- Meeting schedule (commander's time is most constrained)
- Current priorities (commander's intent)

---

## 2. J3 OPERATIONS Dashboard

**Primary Focus:** Current operations execution, unit status, immediate tactical decisions

### Left Rail - Quick Actions
```
┌─ J3 OPERATIONS ACTIONS ───────┐
│ 🎯 Create Operation Order     │
│ 📍 Update Unit Position       │
│ ⚡ Report Contact              │
│ 🚨 Submit SPOTREP             │
│ 📊 Update SITREP              │
│ 🔄 Modify Scheme of Maneuver  │
└───────────────────────────────┘
```

### Main Content
```
┌─ J3 OPERATIONS DASHBOARD ──────────────────────────────────────────┐
│                                                                    │
│ ┌─ CURRENT OPERATIONS STATUS ─────────────────────────────────┐  │
│ │                                                              │  │
│ │  🟢 ALPHA TF: Sector A - Defensive | 87% strength          │  │
│ │  ├─ 1 MECH BDE: Grid 1234 5678 | Mission: Hold Phase Line  │  │
│ │  ├─ 2 INF BN: Grid 1235 5680 | Mission: Screen east flank │  │
│ │  └─ Last update: 5m ago                                     │  │
│ │                                                              │  │
│ │  🟡 BRAVO TF: Sector B - Repositioning | 92% strength      │  │
│ │  ├─ 3 MECH BDE: Moving to Grid 1250 5690 | ETA: 2h         │  │
│ │  ├─ Status: 🔴 Decision pending - Move authorization       │  │
│ │  └─ Last update: 2m ago                                     │  │
│ │                                                              │  │
│ │  🟢 CHARLIE TF: Reserve - Ready | 95% strength             │  │
│ │  └─ 4 ARM BDE: Assembly area | Mission: Be prepared to...  │  │
│ │                                                              │  │
│ │  📊 OVERALL COMBAT POWER: 91% | TEMPO: MODERATE             │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ ACTIVE OPERATIONS ───┐ ┌─ PENDING DECISIONS ┐ ┌─ CONTACTS ─┐ │
│ │ OP ANVIL (ongoing)    │ │ 🔴 Strike T-1002   │ │ 🔴 Enemy C2 │ │
│ │ D+14 | Phase 2        │ │    (6h deadline)   │ │    3km NW   │ │
│ │ LOA: PL BLUE          │ │ [VIEW ANALYSIS]───→│ │             │ │
│ │ Next: PL RED (D+2)    │ │                    │ │ 🟡 Patrol   │ │
│ │                       │ │ 🟡 Move MECH BDE   │ │    contact  │ │
│ │ SUPPORTING OPS:       │ │    (5d deadline)   │ │    5km NE   │ │
│ │ • Air interdiction    │ │ [VIEW ANALYSIS]───→│ │             │ │
│ │ • Intel collection    │ │                    │ │ 12 contacts │ │
│ │ • Logistics convoy    │ │ 3 decisions for    │ │ last 24h    │ │
│ │                       │ │ J3 review          │ │             │ │
│ │ [VIEW OPORD] ────────→│ │                    │ │ [VIEW ALL]─→│ │
│ └───────────────────────┘ └────────────────────┘ └─────────────┘ │
│                                                                    │
│ ┌─ EXECUTION TIMELINE (Next 24 Hours) ────────────────────────┐  │
│ │ NOW ─────────────────────────────────────────── D+14 + 24h  │  │
│ │  │                                                           │  │
│ │  ├─ 1100: BRAVO TF repositioning complete                   │  │
│ │  ├─ 1400: DRB (decision: Strike T-1002)                     │  │
│ │  ├─ 1800: Logistics convoy departs                          │  │
│ │  ├─ 2200: Night operations begin                            │  │
│ │  ├─ 0200: Relief in place (ALPHA-CHARLIE)                   │  │
│ │  └─ 0600: Morning brief (tomorrow)                          │  │
│ │                                                              │  │
│ │  [Zoom] [Full Timeline] ─────────────────────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**J3-specific elements:**
- Current unit status and locations (real-time ops picture)
- Mission status for each task force
- Active operations summary
- Pending operational decisions
- Enemy contact log
- Execution timeline (next 24-48h)
- Quick access to operation orders

---

## 3. J2 INTELLIGENCE Dashboard

**Primary Focus:** Intelligence picture, CCIR, collection management, threat assessment

### Left Rail - Quick Actions
```
┌─ J2 INTELLIGENCE ACTIONS ─────┐
│ 📊 Publish INTREP             │
│ 🎯 Nominate Target            │
│ 📡 Task Collection Asset      │
│ 🚨 Trigger CCIR               │
│ 📝 Update IPB                 │
│ 🔍 Request ISR Support        │
└───────────────────────────────┘
```

### Main Content
```
┌─ J2 INTELLIGENCE DASHBOARD ────────────────────────────────────────┐
│                                                                    │
│ ┌─ INTELLIGENCE PICTURE ──────────────────────────────────────┐  │
│ │                                                              │  │
│ │  🔴 THREAT LEVEL: HIGH | CHANGE: ↑ Increased (last 6h)     │  │
│ │                                                              │  │
│ │  ENEMY FORCES:                                               │  │
│ │  ├─ 2x Mechanized BTG (Battalion Tactical Groups)           │  │
│ │  │  Location: 5km north of FLOT | Activity: Defensive prep  │  │
│ │  │  Confidence: HIGH (80%) | Last update: 15m ago           │  │
│ │  │                                                           │  │
│ │  ├─ 1x Artillery Battalion                                   │  │
│ │  │  Location: 12km northeast | Activity: Repositioning      │  │
│ │  │  Confidence: MEDIUM (65%) | Last update: 45m ago         │  │
│ │  │  🚨 CCIR-045 TRIGGERED: Reinforcement pattern detected   │  │
│ │  │                                                           │  │
│ │  └─ Enemy logistics convoy (spotted)                         │  │
│ │     Location: Highway 7 | Activity: Moving south            │  │
│ │     Confidence: HIGH (85%) | Last update: 8m ago            │  │
│ │     ⚡ TARGET NOMINATION: T-1045 (pending)                  │  │
│ │                                                              │  │
│ │  ENEMY MOST LIKELY COA: Defensive operations with           │  │
│ │  counterattack capability from reserve forces               │  │
│ │                                                              │  │
│ │  ENEMY MOST DANGEROUS COA: Spoiling attack targeting        │  │
│ │  friendly logistics nodes                                    │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ CCIR STATUS ─────┐ ┌─ COLLECTION ────┐ ┌─ RECENT REPORTS ──┐ │
│ │ 🔴 2 Triggered     │ │ 📡 12 Active    │ │ 🔴 INTREP 0122   │ │
│ │ 🟡 3 Near trigger  │ │ 🟢 8 On station │ │    Enemy reinf   │ │
│ │ 🟢 8 Active        │ │ 🟡 4 Tasking    │ │    (12m ago)     │ │
│ │                    │ │                 │ │                  │ │
│ │ CCIR-045:          │ │ ISR Assets:     │ │ 🟢 HUMINT 0119   │ │
│ │ Enemy reinforc.    │ │ • 2 UAVs        │ │    Local source  │ │
│ │ ⚡ MET (12m ago)   │ │ • 1 SIGINT      │ │    (45m ago)     │ │
│ │ [BRIEF CDR]───────→│ │ • 3 HUMINT      │ │                  │ │
│ │                    │ │                 │ │ 🔵 BDA 0115      │ │
│ │ CCIR-023:          │ │ Next available: │ │    Target assess │ │
│ │ Civilian movement  │ │ UAV (2h)        │ │    (2h ago)      │ │
│ │ 🟡 Near (85%)      │ │                 │ │                  │ │
│ │ [MONITOR] ────────→│ │ [TASK ISR]────→ │ │ [VIEW ALL]─────→ │ │
│ └────────────────────┘ └─────────────────┘ └────────────────────┘ │
│                                                                    │
│ ┌─ TARGET NOMINATIONS ────────────────────────────────────────┐  │
│ │ T-1002: Enemy C2 facility | Status: 🔴 Decision pending     │  │
│ │ T-1045: Logistics convoy  | Status: 🟡 Under development    │  │
│ │ T-1067: Artillery position| Status: 🟢 Approved (J3)        │  │
│ │                                                              │  │
│ │ [NEW TARGET] [TRACK TARGETS] ────────────────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**J2-specific elements:**
- Current intelligence picture (enemy forces, locations, activities)
- Threat level assessment with trend
- CCIR status (triggered, near-trigger, active)
- Collection asset status and tasking
- Recent intelligence reports (INTREP, HUMINT, BDA)
- Target nominations tracking
- Enemy COA (most likely, most dangerous)

---

## 4. J5 PLANS Dashboard

**Primary Focus:** Future operations planning, COA development, phase transitions

### Left Rail - Quick Actions
```
┌─ J5 PLANS ACTIONS ────────────┐
│ 📋 Create New COA             │
│ 🗓️  Plan Phase Transition     │
│ 📊 Update Planning Estimate   │
│ 🎯 Develop Branch/Sequel      │
│ 📝 Draft OPLAN/OPORD          │
│ 🔄 Refine Concept             │
└───────────────────────────────┘
```

### Main Content
```
┌─ J5 PLANS DASHBOARD ───────────────────────────────────────────────┐
│                                                                    │
│ ┌─ PLANNING HORIZON ──────────────────────────────────────────┐  │
│ │                                                              │  │
│ │  CURRENT: Phase 2 - Stabilization (D+14, 12 days remaining) │  │
│ │  ┌─────────────────────────────────────────────────────┐    │  │
│ │  │ Phase 1    │ ▶ Phase 2 (Current)  │ Phase 3         │    │  │
│ │  │ Shaping    │ Stabilization        │ Decisive Ops    │    │  │
│ │  │ D+0 to D+7 │ D+7 to D+21 (NOW)    │ D+21 to D+35    │    │  │
│ │  │ ✅ Complete│ 🟢 67% complete       │ 🟡 Planning     │    │  │
│ │  └─────────────────────────────────────────────────────┘    │  │
│ │                                                              │  │
│ │  PHASE 3 TRANSITION CRITERIA:                                │  │
│ │  ✅ Friendly forces postured (complete)                      │  │
│ │  🟡 Enemy isolated (in progress - 75%)                       │  │
│ │  🟡 Logistics stockpile complete (in progress - 82%)         │  │
│ │  ⚪ Commander approval (not started)                          │  │
│ │                                                              │  │
│ │  DECISION POINT 3: Transition to Phase 3 (D+18-21)          │  │
│ │  Status: 🟡 On track | Review: DRB (D+17, 4 days)           │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ ACTIVE COAs ─────────────┐ ┌─ PLANNING PRODUCTS ─────────┐   │
│ │ COA 1: MAIN EFFORT WEST   │ │ 📄 OPLAN 24-03 (current)    │   │
│ │ ✅ Approved | Executing   │ │    Status: Executing        │   │
│ │ • Main: Attack west       │ │    Last update: D+7         │   │
│ │ • Support: Fix enemy east │ │    [VIEW PLAN] ────────────→│   │
│ │ • Reserve: Be prepared... │ │                             │   │
│ │                            │ │ 📄 OPORD 24-12 (Phase 3)    │   │
│ │ COA 2: BRANCH PLAN EAST   │ │    Status: 🟡 Draft (65%)   │   │
│ │ 🟡 Development (if enemy  │ │    Review: CAB (Mon)        │   │
│ │    reinforces east)       │ │    [EDIT DRAFT] ───────────→│   │
│ │ • Main: Attack east       │ │                             │   │
│ │ • Support: Economy west   │ │ 📊 Planning Estimate        │   │
│ │ [REFINE COA] ─────────────→│ │    Status: Current          │   │
│ │                            │ │    Last update: Yesterday   │   │
│ │ COA 3: SEQUEL - EXPLOIT   │ │    [UPDATE] ───────────────→│   │
│ │ 🟡 Planning (if decisive  │ │                             │   │
│ │    success Phase 3)       │ │ 🗓️  Synchronization Matrix  │   │
│ │ • Rapid exploitation      │ │    Phase 2 | Current        │   │
│ │ • Pursue enemy            │ │    Phase 3 | In work        │   │
│ │ [DEVELOP COA] ────────────→│ │    [VIEW SYNC] ────────────→│   │
│ └────────────────────────────┘ └─────────────────────────────┘   │
│                                                                    │
│ ┌─ DECISION POINTS & BRANCHES ────────────────────────────────┐  │
│ │ DP1: Continue Phase 2 (D+14) ✅ Met → Continue current ops  │  │
│ │ DP2: Enemy counterattack (D+15-18) ⚪ Monitoring             │  │
│ │      → If yes: Execute Branch Plan EAST                      │  │
│ │      → If no: Continue main COA                              │  │
│ │ DP3: Transition Phase 3 (D+18-21) 🟡 Approaching            │  │
│ │      → Review criteria, brief CDR, decide transition         │  │
│ │                                                              │  │
│ │ [ADD DECISION POINT] [VIEW TIMELINE] ─────────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**J5-specific elements:**
- Current phase and planning horizon
- Phase transition criteria and status
- Active COAs (approved, branches, sequels)
- Planning products (OPLANs, OPORDs, estimates)
- Decision points and trigger events
- Synchronization matrix
- Future operations timeline

---

## 5. J4 LOGISTICS Dashboard

**Primary Focus:** Supply status, sustainment, resource allocation, logistics operations

### Left Rail - Quick Actions
```
┌─ J4 LOGISTICS ACTIONS ────────┐
│ 📦 Order Supplies             │
│ 🚚 Track Convoy               │
│ ⛽ Update Fuel Status         │
│ 🔧 Report Maintenance Issue   │
│ 📊 Submit Logistics SITREP    │
│ 🏥 Medical Evacuation Request │
└───────────────────────────────┘
```

### Main Content
```
┌─ J4 LOGISTICS DASHBOARD ───────────────────────────────────────────┐
│                                                                    │
│ ┌─ SUPPLY STATUS ─────────────────────────────────────────────┐  │
│ │                                                              │  │
│ │  📊 OVERALL SUPPLY LEVEL: 🟢 GOOD (87%)                     │  │
│ │                                                              │  │
│ │  ⛽ FUEL (Class III)                                         │  │
│ │  ├─ Stock: 345,000 gal | DOS: 8.2 days | Status: 🟢 Good   │  │
│ │  ├─ Consumption: 42,000 gal/day (actual vs 40k planned)     │  │
│ │  ├─ Next resupply: Convoy ETA 1800 today (+120k gal)        │  │
│ │  └─ Trend: 🟡 Slightly above planned consumption            │  │
│ │                                                              │  │
│ │  🔫 AMMUNITION (Class V)                                     │  │
│ │  ├─ Stock: 🟢 Good (12.5 DOS) | 🔴 Critical: 155mm (4 DOS) │  │
│ │  ├─ 5.56mm: 🟢 Good (18 DOS)                                │  │
│ │  ├─ 155mm artillery: 🔴 Low (4 DOS) ⚠️ Below threshold      │  │
│ │  │  🚨 EXPEDITE RESUPPLY REQUIRED                           │  │
│ │  ├─ Precision munitions: 🟡 Fair (6 DOS)                    │  │
│ │  └─ Next resupply: 155mm convoy inbound (ETA: D+16)         │  │
│ │                                                              │  │
│ │  🍽️  FOOD (Class I)                                          │  │
│ │  └─ Stock: 🟢 Good (14 DOS) | Routine resupply scheduled    │  │
│ │                                                              │  │
│ │  🔧 MAINTENANCE (Class IX)                                   │  │
│ │  ├─ Parts stock: 🟡 Fair (7 DOS)                            │  │
│ │  ├─ Critical shortage: Track pads (2 units affected)        │  │
│ │  └─ On order: ETA 3 days                                    │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ ACTIVE CONVOYS ──┐ ┌─ EQUIPMENT STATUS ┐ ┌─ MEDICAL ──────┐  │
│ │ 🚚 LOG-012        │ │ 🟢 Operational: 87%│ │ 🏥 Casualties:  │  │
│ │    En route       │ │ 🟡 Degraded: 9%    │ │    2 urgent     │  │
│ │    ETA: 1800      │ │ 🔴 Non-op: 4%      │ │    5 priority   │  │
│ │    Fuel + Ammo    │ │                    │ │    12 routine   │  │
│ │    Grid: 1240     │ │ Critical items:    │ │                 │  │
│ │    [TRACK]───────→│ │ • 2 tanks NMC     │ │ Bed capacity:   │  │
│ │                   │ │ • 1 howitzer down │ │ • Role 2: 78%   │  │
│ │ 🚚 LOG-013        │ │ • 4 vehicles maint│ │ • Role 3: 45%   │  │
│ │    Preparing      │ │                    │ │                 │  │
│ │    Depart: 2200   │ │ Readiness impact:  │ │ MEDEVAC ready:  │  │
│ │    155mm priority │ │ 🟡 Moderate (maint)│ │ 🟢 2 available  │  │
│ │    [TRACK]───────→│ │                    │ │                 │  │
│ │                   │ │ [VIEW DETAILS]────→│ │ [VIEW]─────────→│  │
│ └───────────────────┘ └────────────────────┘ └─────────────────┘  │
│                                                                    │
│ ┌─ LOGISTICS OPERATIONS TIMELINE ─────────────────────────────┐  │
│ │ NOW ────────────────────────────────────────── Next 48h      │  │
│ │  │                                                           │  │
│ │  ├─ 1800: LOG-012 arrives (fuel + ammo)                     │  │
│ │  ├─ 2200: LOG-013 departs (155mm priority)                  │  │
│ │  ├─ 0600: Routine supply point opens (tomorrow)             │  │
│ │  ├─ 1200: LOG-013 arrives (tomorrow)                        │  │
│ │  ├─ 1400: Maintenance complete (2 tanks, tomorrow)          │  │
│ │  └─ 1800: Next fuel convoy departs (D+16)                   │  │
│ │                                                              │  │
│ │  🔴 CRITICAL: 155mm ammo below threshold - expedite resupply│  │
│ │                                                              │  │
│ │  [View Full Schedule] [Create Convoy] ───────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**J4-specific elements:**
- Supply status by class (fuel, ammo, food, parts)
- Days of Supply (DOS) calculations
- Critical shortages highlighted
- Active convoy tracking
- Equipment operational readiness
- Medical/casualty status
- Logistics timeline
- Consumption trends vs. plan

---

## 6. TARGETING CELL Dashboard

**Primary Focus:** Target development, targeting cycle, strike coordination, BDA

### Left Rail - Quick Actions
```
┌─ TARGETING ACTIONS ───────────┐
│ 🎯 Nominate New Target        │
│ 📊 Update Target Folder       │
│ ⚡ Request Strike              │
│ 📸 Request BDA                │
│ 🔄 Update Target Priority     │
│ ✅ Mark Target Engaged        │
└───────────────────────────────┘
```

### Main Content
```
┌─ TARGETING CELL DASHBOARD ─────────────────────────────────────────┐
│                                                                    │
│ ┌─ TARGET LIST ───────────────────────────────────────────────┐  │
│ │                                                              │  │
│ │  🎯 HIGH-VALUE TARGETS (HPTs/HVTs)                          │  │
│ │                                                              │  │
│ │  T-1002: Enemy C2 Facility                                   │  │
│ │  ├─ Priority: 🔴 1 (HPT) | Status: 🔴 Decision pending      │  │
│ │  ├─ Location: Grid 1245 5692 (confirmed, 2h ago)            │  │
│ │  ├─ Description: Battalion-level command post, hardened     │  │
│ │  ├─ Collateral concerns: 200m from civilian area            │  │
│ │  ├─ ROE Status: 🔴 Requires new ROE authorization           │  │
│ │  ├─ Weaponeering: 2x F-35 + precision munitions             │  │
│ │  ├─ Decision: DRB Wed 1400 (Strike authorization)           │  │
│ │  └─ [VIEW FOLDER] [REQUEST STRIKE] [UPDATE] ───────────────→│  │
│ │                                                              │  │
│ │  T-1045: Logistics Convoy                                    │  │
│ │  ├─ Priority: 🟡 2 (HPT) | Status: 🟡 Development           │  │
│ │  ├─ Location: Highway 7, moving south (last seen 8m ago)    │  │
│ │  ├─ Description: 12 vehicles, fuel + supplies               │  │
│ │  ├─ ROE Status: ✅ Within approved ROE (mobile target)      │  │
│ │  ├─ Weaponeering: Attack aviation or tactical air           │  │
│ │  ├─ Window: Next 4 hours (before reaches cover)             │  │
│ │  └─ [DEVELOP TARGET] [TRACK] ──────────────────────────────→│  │
│ │                                                              │  │
│ │  T-1067: Artillery Position                                  │  │
│ │  ├─ Priority: 🟢 3 (Scheduled) | Status: ✅ Approved        │  │
│ │  ├─ Location: Grid 1252 5701 (confirmed, 30m ago)           │  │
│ │  ├─ Strike window: Tonight 2200-0200                        │  │
│ │  ├─ Asset: 155mm counter-battery                            │  │
│ │  └─ [VIEW PLAN] [TRACK EXECUTION] ─────────────────────────→│  │
│ │                                                              │  │
│ │  📊 TOTAL: 23 targets | 🔴 3 Critical | 🟡 8 Active | ✅ 12│  │
│ │  [VIEW ALL TARGETS] [PRIORITIZE] ───────────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ TARGETING CYCLE ┐ ┌─ STRIKE STATUS ──┐ ┌─ BDA PENDING ────┐  │
│ │ D2 (Find/Fix)     │ │ ⚡ 2 Planned      │ │ T-0998: Artillery │  │
│ │ ▶ CURRENT PHASE   │ │ 🟡 1 In progress │ │ Struck: D+13 2130│  │
│ │                   │ │ ✅ 4 Complete     │ │ BDA: 🟡 Partial  │  │
│ │ Targets in D2:    │ │                  │ │ Damage: Unknown  │  │
│ │ • T-1002 (ready)  │ │ T-1067:          │ │ [REQUEST ISR]───→│  │
│ │ • T-1045 (dev)    │ │ Artillery strike │ │                  │  │
│ │ • T-1051 (dev)    │ │ Tonight 2200     │ │ T-0989: Logistics│  │
│ │                   │ │ Asset: 155mm CB  │ │ Struck: D+12 1430│  │
│ │ Next: D3 (Finish) │ │ [MONITOR]───────→│ │ BDA: 🟢 Complete │  │
│ │ Transition: DRB   │ │                  │ │ Damage: Destroyed│  │
│ │                   │ │ T-1002:          │ │ [VIEW REPORT]───→│  │
│ │ F2T2EA Cycle:     │ │ C2 strike        │ │                  │  │
│ │ [████░░] 67%      │ │ Decision pending │ │ 3 strikes need   │  │
│ │                   │ │ DRB Wed 1400     │ │ BDA assessment   │  │
│ │ [VIEW CYCLE]─────→│ │ [TRACK]─────────→│ │                  │  │
│ └───────────────────┘ └──────────────────┘ └──────────────────┘  │
│                                                                    │
│ ┌─ TARGETING BOARD SCHEDULE ──────────────────────────────────┐  │
│ │ Next Targeting Working Group: Tomorrow 0900                  │  │
│ │ Agenda: 5 new targets, 3 updates, BDA review                │  │
│ │                                                              │  │
│ │ Next Decision Review Board: Wed 1400                         │  │
│ │ Agenda: T-1002 strike authorization, T-1051 approval         │  │
│ │                                                              │  │
│ │ [PREP BRIEF] [VIEW AGENDA] ──────────────────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Targeting-specific elements:**
- Target list with priority, status, ROE
- Target details (location, description, collateral)
- Targeting cycle status (F2T2EA)
- Strike status tracking
- BDA (Battle Damage Assessment) tracking
- Targeting board schedule
- Weaponeering recommendations

---

## 7. LEGAD (Legal Advisor) Dashboard

**Primary Focus:** Legal compliance, ROE monitoring, law of war, decision review

### Left Rail - Quick Actions
```
┌─ LEGAD ACTIONS ───────────────┐
│ ⚖️  Review Decision (Legal)   │
│ 📋 Update ROE Guidance        │
│ 🚨 Flag Legal Concern         │
│ 📄 Generate Legal Opinion     │
│ ✅ Certify Compliance         │
│ 📊 ROE Training Status        │
└───────────────────────────────┘
```

### Main Content
```
┌─ LEGAD DASHBOARD ──────────────────────────────────────────────────┐
│                                                                    │
│ ┌─ LEGAL REVIEW QUEUE ────────────────────────────────────────┐  │
│ │                                                              │  │
│ │  🔴 URGENT REVIEW REQUIRED (2)                               │  │
│ │                                                              │  │
│ │  Decision: Strike T-1002 Authorization                       │  │
│ │  ├─ Status: 🔴 Requires legal review (6h deadline)          │  │
│ │  ├─ ROE: 🔴 Requires new ROE (civilian proximity)           │  │
│ │  ├─ Issues:                                                  │  │
│ │  │  • Target 200m from civilian infrastructure              │  │
│ │  │  • Proportionality assessment needed                     │  │
│ │  │  • Precautionary measures required                       │  │
│ │  ├─ Recommendation: ⚠️ CONDITIONAL APPROVAL                 │  │
│ │  │  • Require civilian warning (30 min prior)               │  │
│ │  │  • Use precision munitions only                          │  │
│ │  │  • BDA mandatory within 2h                               │  │
│ │  ├─ Law of War: ✅ Compliant (with conditions)              │  │
│ │  ├─ Decision meeting: DRB Wed 1400                          │  │
│ │  └─ [REVIEW] [APPROVE] [FLAG CONCERN] ──────────────────────→│  │
│ │                                                              │  │
│ │  Decision: Detention of 3 Captured Personnel                │  │
│ │  ├─ Status: 🔴 Requires legal review (12h deadline)         │  │
│ │  ├─ ROE: ✅ Within approved ROE                             │  │
│ │  ├─ Issues:                                                  │  │
│ │  │  • Geneva Convention compliance verification             │  │
│ │  │  • Proper documentation required                         │  │
│ │  │  • ICRC notification within 24h                          │  │
│ │  ├─ Recommendation: ✅ APPROVE (with documentation req)     │  │
│ │  └─ [REVIEW] [APPROVE] ─────────────────────────────────────→│  │
│ │                                                              │  │
│ │  🟡 STANDARD REVIEW (5 items)                                │  │
│ │  [VIEW ALL REVIEWS] ─────────────────────────────────────────→│  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ ROE STATUS ──────┐ ┌─ COMPLIANCE ─────┐ ┌─ LEGAL ISSUES ──┐  │
│ │ Current ROE:      │ │ 📊 Overall: 🟢   │ │ 🔴 1 Critical   │  │
│ │ ROE-2024-03       │ │    98% compliant │ │ 🟡 3 Review     │  │
│ │ Effective: D+0    │ │                  │ │ 🟢 12 Closed    │  │
│ │ Updated: D+7      │ │ Recent:          │ │                 │  │
│ │                   │ │ ✅ All strikes   │ │ CRITICAL:       │  │
│ │ Pending changes:  │ │    compliant     │ │ T-1002 strike   │  │
│ │ 🟡 2 ROE requests │ │ ✅ Detention     │ │ requires ROE    │  │
│ │                   │ │    procedures    │ │ release         │  │
│ │ • T-1002 strike   │ │ ✅ Intel collect │ │                 │  │
│ │   (submitted 8h)  │ │                  │ │ REVIEW:         │  │
│ │ • Cross-border    │ │ Issues YTD:      │ │ • Detention doc │  │
│ │   ISR (pending)   │ │ 🔴 0 violations  │ │ • Border ops    │  │
│ │                   │ │ 🟡 2 near-misses │ │ • Civilian warn │  │
│ │ [VIEW ROE]───────→│ │ ✅ 156 reviews   │ │                 │  │
│ │                   │ │                  │ │ [VIEW ALL]─────→│  │
│ │ Training status:  │ │ [VIEW REPORT]───→│ │                 │  │
│ │ 🟢 95% complete   │ │                  │ │                 │  │
│ └───────────────────┘ └──────────────────┘ └─────────────────┘  │
│                                                                    │
│ ┌─ UPCOMING DECISIONS REQUIRING LEGAL INPUT ──────────────────┐  │
│ │ DRB (Wed 1400): 2 decisions need legal review               │  │
│ │ • T-1002 strike (urgent) 🔴                                  │  │
│ │ • Border reconnaissance (standard) 🟢                        │  │
│ │                                                              │  │
│ │ CAB (Mon 0800): 1 decision needs legal review               │  │
│ │ • Phase 3 transition OPORD (planning)                       │  │
│ │                                                              │  │
│ │ [PREP FOR DRB] [PREP FOR CAB] ───────────────────────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**LEGAD-specific elements:**
- Legal review queue (urgent, standard)
- ROE compliance status
- Law of war assessment
- Legal issues tracking (critical, review, closed)
- ROE status and pending changes
- Compliance metrics
- Upcoming decisions requiring legal input

---

## 8. ANALYST Dashboard

**Primary Focus:** Metrics, trends, performance analysis, insights

### Left Rail - Quick Actions
```
┌─ ANALYST ACTIONS ─────────────┐
│ 📊 Generate Report            │
│ 📈 Create Visualization       │
│ 🔍 Run Analysis               │
│ 📉 Compare Metrics            │
│ 💾 Export Data                │
│ 🎯 Build Dashboard Widget     │
└───────────────────────────────┘
```

### Main Content
```
┌─ ANALYST DASHBOARD ────────────────────────────────────────────────┐
│                                                                    │
│ ┌─ KEY METRICS ───────────────────────────────────────────────┐  │
│ │                                                              │  │
│ │  OPERATIONAL TEMPO                                           │  │
│ │  ┌─────────────────────────────────────────────────────┐    │  │
│ │  │         [Line chart: Operations per day]            │    │  │
│ │  │    20 ┤        ╭╮                                    │    │  │
│ │  │    15 ┤     ╭──╯╰─╮     Current: 14 ops/day         │    │  │
│ │  │    10 ┤  ╭──╯     ╰──╮                               │    │  │
│ │  │     5 ┤──╯           ╰─                              │    │  │
│ │  │     0 ┴──────────────────────────                    │    │  │
│ │  │       D+7  D+10  D+13  D+16 (forecast)              │    │  │
│ │  │                                                       │    │  │
│ │  │  Trend: 🟡 Decreasing (planned transition to Phase 3)│    │  │
│ │  │  Forecast: Spike at D+21 (Phase 3 start)            │    │  │
│ │  └─────────────────────────────────────────────────────┘    │  │
│ │                                                              │  │
│ │  COMBAT EFFECTIVENESS                                        │  │
│ │  ├─ Blue Force Readiness: 87% (🟢 +2% vs yesterday)         │  │
│ │  ├─ Red Force Degradation: 34% (🟢 +5% vs D+7)              │  │
│ │  ├─ Mission Success Rate: 92% (23/25 missions)              │  │
│ │  └─ Objective Progress: 67% Phase 2 complete                │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ DECISION ANALYSIS ┐ ┌─ RESOURCE TRENDS ┐ ┌─ INTEL QUALITY ─┐ │
│ │ 📊 This Week:       │ │ ⛽ Fuel: Stable  │ │ 🎯 Timeliness:  │ │
│ │ • 12 decisions made │ │ 📈 Trending +3%  │ │    87% on time  │ │
│ │ • 8 approved        │ │                  │ │                 │ │
│ │ • 2 deferred        │ │ 🔫 Ammo: Concern │ │ 🎯 Accuracy:    │ │
│ │ • 2 pending         │ │ 📉 155mm low     │ │    92% reliable │ │
│ │                     │ │ 🔴 Need resupply │ │                 │ │
│ │ Avg time: 2.3 days  │ │                  │ │ 🎯 Completeness:│ │
│ │ ROE delays: 1 (8%)  │ │ 🔧 Maint: Good   │ │    78% (🟡 low) │ │
│ │                     │ │ 📈 Readiness up  │ │                 │ │
│ │ Complexity:         │ │                  │ │ Gaps detected:  │ │
│ │ • High: 4 (33%)     │ │ [DEEP DIVE]─────→│ │ • Border area   │ │
│ │ • Med: 6 (50%)      │ │                  │ │ • Enemy reserve │ │
│ │ • Low: 2 (17%)      │ │                  │ │                 │ │
│ │                     │ │                  │ │ [ANALYSIS]─────→│ │
│ │ [FULL REPORT]──────→│ │                  │ │                 │ │
│ └─────────────────────┘ └──────────────────┘ └─────────────────┘ │
│                                                                    │
│ ┌─ TREND ANALYSIS ────────────────────────────────────────────┐  │
│ │                                                              │  │
│ │  🔴 ALERT: 155mm ammunition trending toward critical        │  │
│ │  Current: 4 DOS | Threshold: 5 DOS | Consumption: +5%       │  │
│ │  Recommendation: Expedite resupply (already in progress)    │  │
│ │                                                              │  │
│ │  🟡 WATCH: Intelligence completeness declining              │  │
│ │  Current: 78% | Target: 85% | Trend: -7% last 5 days        │  │
│ │  Recommendation: Task additional ISR assets to border area  │  │
│ │                                                              │  │
│ │  🟢 POSITIVE: Combat effectiveness improving                │  │
│ │  Readiness: +2% | Enemy degradation: +5% | On track Phase 3 │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─ CUSTOM REPORTS ────────────────────────────────────────────┐  │
│ │ 📄 Daily Operations Summary (auto-generated 0700)           │  │
│ │ 📄 Weekly Logistics Analysis (auto-generated Mon 0900)      │  │
│ │ 📄 Phase Assessment (on-demand)                             │  │
│ │                                                              │  │
│ │ [CREATE REPORT] [SCHEDULE REPORT] [EXPORT DATA] ────────────→│  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Analyst-specific elements:**
- Key metrics with visualizations
- Trend analysis and forecasting
- Decision analytics
- Resource consumption trends
- Intelligence quality metrics
- Alerts and recommendations
- Custom report generation

---

## Design Principles Applied

### 1. **Consistency**
- Right rail: ALWAYS map, battle rhythm, phase, activity feed (same place, every role)
- Top bar: ALWAYS operation, user, time, alerts
- Left rail: ALWAYS navigation, quick actions, workload

### 2. **Role-Specific Center**
- Main content area adapts to role's primary function
- Each role sees what they need most, front and center
- Supporting information in secondary panels

### 3. **Cognitive Load Management**
- Color coding: 🔴 Critical, 🟡 Warning, 🟢 Good, 🔵 Info, ⚪ Neutral
- Icons: Consistent visual language
- Progressive disclosure: Summary → Details (click to expand)
- Information hierarchy: Most critical at top

### 4. **Context Awareness**
- Operation/phase always visible (top bar)
- Battle rhythm always visible (right rail)
- Time always visible (top bar, Zulu time)
- Recent activity always visible (right rail)

### 5. **Action Orientation**
- Quick actions in left rail (role-specific)
- Primary actions on main content items
- Clear CTAs: [VIEW], [APPROVE], [EDIT]

### 6. **Situational Awareness**
- Map always visible (right rail)
- Role-specific overlays on map
- Activity feed provides ambient awareness

---

## Responsive Behavior

### At 1920x1080 (standard)
- Full 3-column layout (Left 240px, Main 1280px, Right 400px)

### At 1680x1050 (smaller)
- Left rail collapses to icons (60px)
- Main content: 1220px
- Right rail: 400px (preserved!)

### At 1366x768 (laptop)
- Left rail: Icon bar (60px)
- Main content: 906px (simplified layout)
- Right rail: 400px (still visible, but abbreviated)

### At < 1366 (not recommended)
- Warning: "This dashboard is optimized for 1366x768 or larger"
- Right rail becomes collapsible overlay
- Mobile-specific layouts for critical functions

---

## Color & Visual Language

### Status Colors
- 🔴 **Red**: Critical, urgent, requires immediate action
- 🟡 **Amber**: Warning, attention needed, approaching threshold
- 🟢 **Green**: Good, on track, no issues
- 🔵 **Blue**: Information, neutral, for awareness
- ⚪ **White/Gray**: Inactive, future, not applicable

### Backgrounds
- Slate-950 (#020617): Base background (dark)
- Slate-900 (#0f172a): Panels (slightly lighter)
- Slate-800 (#1e293b): Borders, dividers

### Text
- White: Primary headings, critical info
- Slate-300: Body text, descriptions
- Slate-500: Labels, metadata
- Color-coded for status (red/amber/green/blue text)

### Borders & Depth
- 2px borders for major sections
- 1px borders for minor elements
- Subtle shadows for elevation
- Rounded corners (8px standard, 12px for cards)

---

## Accessibility

- **High contrast**: White text on dark backgrounds
- **Color + icon**: Never rely on color alone
- **Font size**: Minimum 10px (small metadata), 14px+ for body
- **Keyboard navigation**: All interactive elements tabbable
- **Screen reader**: Proper ARIA labels on all controls

---

## Implementation Notes

### Component Structure
```
RoleDashboard
├── TopBar (consistent across roles)
├── LeftRail (structure consistent, content varies)
├── MainContent (role-specific component)
│   ├── PrimaryWorkspace (60% height)
│   └── SecondaryPanels (40% height)
└── RightRail (identical across all roles)
```

### Data Flow
- Each role dashboard subscribes to role-relevant data streams
- Right rail components are shared (one implementation, used everywhere)
- Top bar is shared
- Left rail is templated (structure shared, quick actions vary)
- Main content is custom per role

---

## Next Steps

1. **Build shared components first**
   - TopBar
   - RightRail (map, battle rhythm, activity feed)
   - LeftRail template

2. **Build role dashboards in priority order**
   - Commander (executive view)
   - J3 Operations (current ops)
   - J2 Intelligence (intel picture)
   - Targeting Cell (target management)
   - J5 Plans (future ops)
   - J4 Logistics (sustainment)
   - LEGAD (legal compliance)
   - Analyst (metrics/trends)

3. **Test with users**
   - Show to actual J3, J2, etc. officers
   - Validate information hierarchy
   - Refine based on operational feedback

---

**This design ensures every role has a consistent, predictable layout while seeing the operational picture through their functional lens.**

_Version: 1.0_  
_Date: 2026-01-22_  
_Status: Design concept ready for implementation_
