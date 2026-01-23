# Role Dashboard Layout - Visual Reference

## Universal Grid System

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ TOP BAR (80px, ALWAYS SAME)                                                     ┃
┃ [LOGO] SmartOps    OPERATION RESOLUTE SHIELD | Phase 2    MAJ Smith    10:14 Z ┃
┃ 🔴 2 CRITICAL  🟡 5 WARNINGS  🔵 12 UPDATES                  [🔔] [⚙️] [👤]   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┓
┃         ┃                                                           ┃           ┃
┃  LEFT   ┃                MAIN CONTENT                               ┃   RIGHT   ┃
┃  RAIL   ┃             (Role-Specific)                               ┃   RAIL    ┃
┃         ┃                                                           ┃           ┃
┃  240px  ┃                 1280px                                    ┃   400px   ┃
┃         ┃                                                           ┃           ┃
┃ ┌─────┐ ┃  ┌──────────────────────────────────────────────────┐   ┃ ┌───────┐ ┃
┃ │ Nav │ ┃  │                                                  │   ┃ │  MAP  │ ┃
┃ │     │ ┃  │         PRIMARY WORKSPACE                        │   ┃ │       │ ┃
┃ │ My  │ ┃  │                                                  │   ┃ │ [Tac  │ ┃
┃ │ Dash│ ┃  │        (Role's main view)                        │   ┃ │  Map] │ ┃
┃ │ COP │ ┃  │                                                  │   ┃ │       │ ┃
┃ │ Decs│ ┃  │         60% of height                            │   ┃ │       │ ┃
┃ │ Task│ ┃  │                                                  │   ┃ └───────┘ ┃
┃ │ Meet│ ┃  │                                                  │   ┃           ┃
┃ │ Docs│ ┃  └──────────────────────────────────────────────────┘   ┃ ┌───────┐ ┃
┃ └─────┘ ┃                                                           ┃ │BATTLE │ ┃
┃         ┃  ┌────────────┐ ┌────────────┐ ┌──────────────────┐     ┃ │RHYTHM │ ┃
┃ ┌─────┐ ┃  │            │ │            │ │                  │     ┃ │       │ ┃
┃ │Quick│ ┃  │  Panel 1   │ │  Panel 2   │ │    Panel 3       │     ┃ │0630 ✅│ ┃
┃ │Actns│ ┃  │            │ │            │ │                  │     ┃ │0800   │ ┃
┃ │     │ ┃  │  (Role-    │ │  (Role-    │ │   (Role-         │     ┃ │1000 ▶ │ ┃
┃ │(Role│ ┃  │  specific) │ │  specific) │ │   specific)      │     ┃ │1400   │ ┃
┃ │Spec)│ ┃  │            │ │            │ │                  │     ┃ └───────┘ ┃
┃ │     │ ┃  │            │ │            │ │                  │     ┃           ┃
┃ │     │ ┃  └────────────┘ └────────────┘ └──────────────────┘     ┃ ┌───────┐ ┃
┃ └─────┘ ┃                                                           ┃ │PHASE  │ ┃
┃         ┃         SECONDARY PANELS (40% height)                     ┃ │Phase 2│ ┃
┃ ┌─────┐ ┃                                                           ┃ │D+14   │ ┃
┃ │Work │ ┃                                                           ┃ │[████░]│ ┃
┃ │Load │ ┃                                                           ┃ └───────┘ ┃
┃ │     │ ┃                                                           ┃           ┃
┃ │🔴 3 │ ┃                                                           ┃ ┌───────┐ ┃
┃ │🟡 8 │ ┃                                                           ┃ │RECENT │ ┃
┃ │🟢 12│ ┃                                                           ┃ │FEED   │ ┃
┃ └─────┘ ┃                                                           ┃ │       │ ┃
┃         ┃                                                           ┃ │🔴 2m  │ ┃
┃ ┌─────┐ ┃                                                           ┃ │🔵 5m  │ ┃
┃ │Other│ ┃                                                           ┃ │🟡 12m │ ┃
┃ │Roles│ ┃                                                           ┃ │⚪ 18m │ ┃
┃ │     │ ┃                                                           ┃ │🟢 25m │ ┃
┃ │  ▶J3│ ┃                                                           ┃ └───────┘ ┃
┃ │  J2 │ ┃                                                           ┃           ┃
┃ │  J5 │ ┃                                                           ┃ ┌───────┐ ┃
┃ └─────┘ ┃                                                           ┃ │COMMS  │ ┃
┃         ┃                                                           ┃ │💬 3   │ ┃
┗━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━┛
```

---

## The Anchor Points (NEVER MOVE)

### 1. Right Rail - The Operational Anchor

**Why right side?**
- Peripheral vision monitoring while working in main area
- Natural eye movement (left to right, then periphery)
- Consistent location reduces search time

**What's always there:**
```
┌─ RIGHT RAIL (400px) ──────┐
│                           │
│  🗺️  MAP                  │  ← Situation at a glance
│     (Role overlays vary) │
│                           │
│  📅 BATTLE RHYTHM         │  ← What's happening today
│     • Current meeting     │
│     • Next event          │
│                           │
│  📊 CURRENT PHASE         │  ← Where we are
│     • Operation name      │
│     • Phase progress      │
│                           │
│  🔔 ACTIVITY FEED         │  ← What just happened
│     • Recent events       │
│     • Real-time updates   │
│                           │
│  💬 QUICK COMMS           │  ← Fast communication
│                           │
└───────────────────────────┘
```

### 2. Top Bar - Identity & Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [LOGO] SmartOps          OPERATION RESOLUTE SHIELD | Phase 2            │
│                                                                          │
│ 👤 MAJ Smith (J3 Operations)                    ⏰ 22 JAN 2026 10:14 Z │
│                                                                          │
│ 🔴 2 CRITICAL  🟡 5 WARNINGS  🔵 12 UPDATES           [🔔] [⚙️] [👤]  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Elements (left to right):**
1. Logo/Home
2. **Operation & Phase (CENTER)** ← Most important context
3. User identity (name, rank, role)
4. Time (Zulu)
5. Alert summary
6. Utilities

### 3. Left Rail - Navigation & Actions

```
┌─ LEFT RAIL (240px) ───┐
│                       │
│  🏠 My Dashboard      │  ← Navigation
│  📊 Full COP          │     (consistent)
│  🎯 Decisions         │
│  📋 My Tasks          │
│  📅 Meetings          │
│  🗂️  Documents        │
│                       │
│  ──────────────────── │
│                       │
│  ⚡ Role Actions      │  ← Quick actions
│  (Role-specific)      │     (varies by role)
│                       │
│  ──────────────────── │
│                       │
│  🔴 3 Critical        │  ← Workload summary
│  🟡 8 This Week       │     (consistent)
│  🟢 12 Future         │
│                       │
│  ──────────────────── │
│                       │
│  Other Dashboards     │  ← Role switcher
│  Commander            │     (consistent)
│  ▶ J3 Operations      │
│  J2 Intelligence      │
│  ...                  │
│                       │
└───────────────────────┘
```

---

## Visual Hierarchy

### Priority Levels

**1. CRITICAL (Top of main content)**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔴 CRITICAL: Decision requiring immediate    ┃
┃    action (6h deadline)                      ┃
┃    [APPROVE] [REVIEW] [DEFER] ───────────────→┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
- Red border (2px)
- Prominent heading
- Clear CTAs
- Always at top of workspace

**2. HIGH (Primary workspace)**
```
┌─────────────────────────────────────────────┐
│ 🟡 HIGH: Important but not immediate        │
│    (24h deadline)                           │
│    [VIEW] [ACTION] ──────────────────────────→│
└─────────────────────────────────────────────┘
```
- Amber/yellow accents
- Visible but not screaming
- Still in primary workspace

**3. MEDIUM (Secondary panels)**
```
┌─────────────────────────────┐
│ 🟢 Status: Good             │
│    Routine monitoring       │
│    [Details] ───────────────→│
└─────────────────────────────┘
```
- Green/blue for positive status
- Secondary panels at bottom
- Progressive disclosure

**4. LOW (Collapsed/hidden)**
```
[Show 12 more items] ──────────→
```
- Collapsed by default
- Click to expand
- Prevents overwhelm

---

## Color Psychology & Meaning

### Status Colors

| Color | Hex | Meaning | Usage |
|-------|-----|---------|-------|
| 🔴 Red | #ef4444 | **Critical/Urgent** | Immediate action, danger, deadline |
| 🟡 Amber | #f59e0b | **Warning/Caution** | Attention needed, approaching threshold |
| 🟢 Green | #22c55e | **Good/Safe** | On track, compliant, no issues |
| 🔵 Blue | #3b82f6 | **Info/Neutral** | For awareness, procedural, routine |
| ⚪ Gray | #94a3b8 | **Inactive/Future** | Not applicable, scheduled, pending |

### Background Hierarchy

```
┌─ Slate-950 (#020617) ─────────────────────────────────────┐
│ Base background (darkest)                                 │
│                                                            │
│  ┌─ Slate-900 (#0f172a) ─────────────────────────────┐   │
│  │ Panels and cards (lighter)                        │   │
│  │                                                    │   │
│  │  ┌─ Slate-800 (#1e293b) ──────────────────────┐  │   │
│  │  │ Nested elements (lightest)                 │  │   │
│  │  │                                            │  │   │
│  │  │  White text (#ffffff)                      │  │   │
│  │  │  Slate-300 body text (#cbd5e1)             │  │   │
│  │  │  Slate-500 labels (#64748b)                │  │   │
│  │  │                                            │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Role-Specific Map Overlays

**Same map component, different layers enabled**

### Commander View
```
┌─ MAP ─────────────────┐
│ 🔵 All friendly units │
│ 🔴 All enemy units    │
│ 🎯 Key objectives     │
│ 📍 Decision points    │
│                       │
│ Layers:               │
│ ✅ Blue forces        │
│ ✅ Red forces         │
│ ✅ Objectives         │
│ ✅ Phase lines        │
│ ⚪ Intel collection   │
│ ⚪ Supply routes      │
│ ⚪ Target zones       │
└───────────────────────┘
```

### J3 Operations View
```
┌─ MAP ─────────────────┐
│ 🔵 Unit positions     │
│ 🔴 Enemy contact      │
│ 📍 Current operations │
│ ➡️  Movement routes   │
│                       │
│ Layers:               │
│ ✅ Blue forces        │
│ ✅ Red forces         │
│ ✅ Maneuver graphics  │
│ ✅ Control measures   │
│ ⚪ Intel collection   │
│ ⚪ Supply routes      │
│ ⚪ Target zones       │
└───────────────────────┘
```

### J2 Intelligence View
```
┌─ MAP ─────────────────┐
│ 🔴 Enemy locations    │
│ 📡 ISR coverage       │
│ 🎯 Named areas        │
│ 🔍 Collection zones   │
│                       │
│ Layers:               │
│ ✅ Red forces         │
│ ✅ Intel overlays     │
│ ✅ ISR coverage       │
│ ✅ Collection areas   │
│ ⚪ Blue forces        │
│ ⚪ Supply routes      │
│ ✅ Target zones       │
└───────────────────────┘
```

### Targeting Cell View
```
┌─ MAP ─────────────────┐
│ 🎯 Target locations   │
│ 🔴 Enemy assets       │
│ 💥 Strike zones       │
│ ⚠️  No-strike areas   │
│                       │
│ Layers:               │
│ ✅ Target locations   │
│ ✅ Strike zones       │
│ ✅ Red forces         │
│ ✅ No-strike zones    │
│ ⚪ Blue forces        │
│ ⚪ Intel collection   │
│ ⚪ Supply routes      │
└───────────────────────┘
```

### J4 Logistics View
```
┌─ MAP ─────────────────┐
│ 🚚 Supply routes      │
│ 📦 Supply points      │
│ 🔵 Unit locations     │
│ ⛽ Fuel points        │
│                       │
│ Layers:               │
│ ✅ Blue forces        │
│ ✅ Supply routes      │
│ ✅ Supply points      │
│ ✅ Convoy locations   │
│ ⚪ Red forces         │
│ ⚪ Intel collection   │
│ ⚪ Target zones       │
└───────────────────────┘
```

---

## Responsive Design Strategy

### Breakpoints

**1920x1080+ (Optimal)**
```
┌──────┬────────────────────┬─────┐
│ 240px│      1280px        │400px│
│ Full │                    │ Full│
└──────┴────────────────────┴─────┘
```

**1680x1050 (Standard)**
```
┌───┬────────────────────┬─────┐
│60 │      1220px        │400px│
│Ico│                    │ Full│
└───┴────────────────────┴─────┘
```

**1366x768 (Minimum)**
```
┌───┬──────────────┬─────┐
│60 │    906px     │400px│
│Ico│  Simplified  │ Abbr│
└───┴──────────────┴─────┘
```

**< 1366 (Not recommended)**
```
Warning: This dashboard requires
minimum 1366x768 resolution
```

### Collapse Behavior

**Left Rail Collapse:**
```
Full (240px)          Icon (60px)
┌─────────────┐       ┌───┐
│ 🏠 Dashboard│  →    │ 🏠│
│ 📊 COP      │       │ 📊│
│ 🎯 Decisions│       │ 🎯│
│ ──────────  │       │───│
│ ⚡ Actions  │       │ ⚡│
└─────────────┘       └───┘
     (hover to expand)
```

**Right Rail Abbreviate:**
```
Full (400px)          Abbreviated (400px)
┌──────────────┐      ┌──────────┐
│ [Tall map]   │  →   │ [Smaller │
│              │      │  map]    │
│              │      │          │
│              │      ├──────────┤
├──────────────┤      │ Battle   │
│ Battle Rhythm│      │ (compact)│
│ • 0630 ✅    │      ├──────────┤
│ • 0800       │      │ Phase    │
│ • 1000 ▶     │      │ (brief)  │
│ • 1400       │      ├──────────┤
│ • 1730       │      │ Recent   │
├──────────────┤      │ (3 items)│
│ Current Phase│      └──────────┘
│ Phase 2      │
│ D+14         │
│ [████░] 67%  │
├──────────────┤
│ Recent (10)  │
└──────────────┘
```

---

## Typography Scale

```
H1: 3xl (30px)  - Dashboard title
H2: 2xl (24px)  - Section headings
H3: xl  (20px)  - Subsection headings
H4: lg  (18px)  - Panel titles
Body: base (14px) - Main content
Small: sm (12px)  - Supporting text
Tiny: xs (10px)   - Metadata, labels
Micro: [9px]      - Badges, timestamps
```

**Font weights:**
- Black (900): Critical headings, alerts
- Bold (700): Headings, labels, emphasis
- Semibold (600): Subheadings
- Medium (500): Body text
- Regular (400): Secondary text

---

## Spacing System

**Base unit: 4px (0.25rem)**

```
2px   - Borders, dividers
4px   - Micro spacing (icon margins)
8px   - Tight spacing (within components)
12px  - Standard spacing (between related items)
16px  - Medium spacing (between sections)
24px  - Large spacing (between major sections)
32px  - Extra large spacing (page sections)
48px  - Huge spacing (major page divisions)
```

---

## Icon System

**Size hierarchy:**
```
10px - Tiny icons (in badges, timestamps)
12px - Small icons (in buttons, labels)
16px - Standard icons (navigation, actions)
20px - Medium icons (section headers)
24px - Large icons (primary actions)
32px - Hero icons (dashboard headers)
```

**Common icons by function:**

| Function | Icon | Usage |
|----------|------|-------|
| Navigate | 🏠 | Home, dashboard |
| View | 👁️ | View details |
| Edit | ✏️ | Edit/modify |
| Approve | ✅ | Approve decision |
| Reject | ❌ | Reject/deny |
| Alert | 🚨 | Critical alert |
| Warning | ⚠️ | Warning message |
| Info | ℹ️ | Information |
| Time | ⏰ | Timestamp, deadline |
| Location | 📍 | Map location |
| User | 👤 | User profile |
| Settings | ⚙️ | Configuration |
| Message | 💬 | Communication |
| Document | 📄 | File, report |

---

## Animation & Transitions

**Principles:**
- Subtle, not distracting
- Purposeful (guide attention)
- Fast (120-200ms)
- Respect user preferences (prefers-reduced-motion)

**Common transitions:**
```css
/* Panel expansion */
transition: all 200ms ease-in-out;

/* Hover states */
transition: background-color 150ms ease;

/* Color changes (status updates) */
transition: color 300ms ease;

/* Opacity (fade in/out) */
transition: opacity 200ms ease;
```

**No animations on:**
- Critical alerts (instant appearance)
- Real-time data updates (instant change)
- Loading critical information

---

## Accessibility Checklist

### Visual
- [ ] High contrast (WCAG AAA where possible)
- [ ] Color + icon/pattern (never color alone)
- [ ] Minimum 12px font size for all text
- [ ] Clear focus indicators (2px outline)

### Interaction
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order (left to right, top to bottom)
- [ ] Escape key closes modals/overlays
- [ ] Enter key activates primary actions

### Semantic
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] ARIA labels on all controls
- [ ] Alt text on all images/icons
- [ ] Landmark roles (navigation, main, complementary)

### Screen Reader
- [ ] Descriptive button text ("Approve Strike T-1002" not "Approve")
- [ ] Status announcements (aria-live regions)
- [ ] Skip navigation links
- [ ] Table headers and captions

---

## Performance Targets

**Load time:**
- Initial render: < 1 second
- Time to interactive: < 2 seconds
- Data refresh: < 500ms

**Responsiveness:**
- Input lag: < 100ms
- Animation: 60fps (no jank)
- Scroll: Smooth, no stutter

**Data efficiency:**
- Only fetch visible data
- Lazy load secondary panels
- Websocket for real-time updates (not polling)
- Cache static data (maps, reference data)

---

## Implementation Priority

### Phase 1: Core Structure (Week 1)
1. Top Bar (shared component)
2. Left Rail template (navigation + structure)
3. Right Rail (map + battle rhythm + feed)
4. Grid layout system

### Phase 2: First Role (Week 2)
5. J3 Operations dashboard (reference implementation)
6. Test with actual data
7. Refine based on feedback

### Phase 3: Roll Out (Weeks 3-6)
8. Commander dashboard
9. J2 Intelligence dashboard
10. Targeting Cell dashboard
11. Remaining roles

### Phase 4: Polish (Week 7+)
12. Animations and transitions
13. Responsive refinements
14. Accessibility audit
15. Performance optimization

---

## Quick Reference Card

**For developers implementing role dashboards:**

```typescript
// Standard layout template
<RoleDashboard>
  <TopBar />  {/* Shared, no changes */}
  
  <div className="grid grid-cols-[240px_1fr_400px]">
    <LeftRail>
      <Navigation />  {/* Shared */}
      <QuickActions role={role} />  {/* Role-specific */}
      <Workload />  {/* Shared */}
    </LeftRail>
    
    <MainContent>
      <PrimaryWorkspace role={role}>
        {/* Role-specific content */}
      </PrimaryWorkspace>
      
      <SecondaryPanels role={role}>
        {/* Role-specific panels */}
      </SecondaryPanels>
    </MainContent>
    
    <RightRail>
      <Map role={role} />  {/* Shared component, role overlay */}
      <BattleRhythm />  {/* Shared, no changes */}
      <Phase />  {/* Shared, no changes */}
      <ActivityFeed />  {/* Shared, no changes */}
    </RightRail>
  </div>
</RoleDashboard>
```

**Checklist for new role dashboard:**
- [ ] Define role-specific quick actions
- [ ] Design primary workspace layout
- [ ] Design secondary panels
- [ ] Define map overlay layers
- [ ] Create role-specific data hooks
- [ ] Test with role SME (subject matter expert)

---

**Remember: Same place, different lens.**

_Version: 1.0_  
_Date: 2026-01-22_
