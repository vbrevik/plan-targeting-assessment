# Dashboard Redesign: What NOT To Do

## Purpose

This document explicitly lists anti-patterns, bad practices, and approaches to AVOID when working with the situation awareness cockpit. This ensures team alignment on what we DON'T want to do.

---

## 1. Information Management

### ❌ DON'T Add More Information
**Why:** Information overload is the enemy of decision-making

**Instead:**
- Remove something when adding something new
- Use progressive disclosure (summary → details on click)
- Hide non-critical information

**Example:**
```
❌ Bad: Add another metric card because "it might be useful"
✅ Good: Replace an existing low-value metric with a high-value one
```

### ❌ DON'T Use Equal Visual Weight
**Why:** If everything is important, nothing is important

**Instead:**
- Use the 3-tier hierarchy: Critical > Active > Planning
- Reserve high contrast for truly urgent items
- Use size, color, and position to signal importance

**Example:**
```
❌ Bad: All cards same size, same border, same color
✅ Good: Critical cards larger, red borders, top position
```

### ❌ DON'T Show Everything at Once
**Why:** Cognitive overload reduces decision quality

**Instead:**
- Show summary/count, hide details until clicked
- Use badges ("3 NEW") instead of listing all items
- Collapse low-priority sections

**Example:**
```
❌ Bad: List all 15 intel insights on dashboard
✅ Good: Show "15 NEW Intel Insights" with top 3, link to "View All"
```

---

## 2. Visual Design

### ❌ DON'T Auto-Rotate or Carousel Content
**Why:** Users lose context and spatial memory

**Instead:**
- Keep information in fixed positions
- Let users navigate intentionally
- Use static hierarchy

**Example:**
```
❌ Bad: Rotate through 5 different metric views every 10 seconds
✅ Good: Show 2 most important metrics, link to "View All Metrics"
```

### ❌ DON'T Hide Critical Information in Tabs
**Why:** Critical info must be immediately visible

**Instead:**
- Keep urgent items always visible
- Use tabs only for deep-dive analysis, not primary data
- Reserve tabs for specialized modules, not dashboard

**Example:**
```
❌ Bad: "Critical Decisions" tab that user must click
✅ Good: "Critical Decisions" section always visible at top-left
```

### ❌ DON'T Use Similar Colors for Different Statuses
**Why:** Confusion leads to misinterpretation and errors

**Instead:**
- Use distinctly different colors: Red, Amber, Blue, Green
- Test with colorblind users
- Don't rely on color alone (use icons, text, patterns)

**Example:**
```
❌ Bad: Red for critical, Pink for high, Crimson for urgent
✅ Good: Red for critical, Amber for high, Blue for normal
```

### ❌ DON'T Animate Everything
**Why:** Animation should signal importance, not decorate

**Instead:**
- Reserve pulse/blink for NEW or CRITICAL items
- Use steady glow for active but stable
- Keep most content static

**Example:**
```
❌ Bad: Every card pulses, sparkles, or bounces
✅ Good: Only RED-ALPHA alert pulses, rest is static
```

### ❌ DON'T Use Small Fonts for Critical Data
**Why:** Legibility matters in high-stress, time-pressured situations

**Instead:**
- Use large fonts (24-36px) for critical numbers
- Use medium fonts (14-16px) for section headers
- Reserve small fonts (10-12px) for metadata

**Example:**
```
❌ Bad: "87%" readiness in 10px font
✅ Good: "87%" readiness in 30px font with large % symbol
```

---

## 3. Interaction & Navigation

### ❌ DON'T Make Users Hunt for Actions
**Why:** Every extra click increases decision latency

**Instead:**
- Primary actions should be one click away
- Use "View Details" links directly on cards
- Avoid nested menus for critical workflows

**Example:**
```
❌ Bad: Dashboard → Menu → Decisions → Board → Item → Approve (5 clicks)
✅ Good: Dashboard → Item → Approve (2 clicks)
```

### ❌ DON'T Require Multiple Steps for Simple Actions
**Why:** Friction reduces urgency response

**Instead:**
- Inline actions where possible
- Reduce confirmation dialogs (use undo instead)
- Pre-fill forms with defaults

**Example:**
```
❌ Bad: Click "Approve" → Confirm dialog → Enter reason → Confirm reason → Final OK
✅ Good: Click "Approve" (optional reason field appears inline)
```

### ❌ DON'T Break User's Mental Model
**Why:** Spatial memory helps navigation in crisis

**Instead:**
- Keep critical items in consistent positions
- Don't reorganize layout based on data changes
- Preserve hierarchy even when data updates

**Example:**
```
❌ Bad: Critical actions move to bottom when new data arrives
✅ Good: Critical actions always in top-left, content updates in place
```

---

## 4. Data & Content

### ❌ DON'T Overload with Historical Data
**Why:** Commanders need present and near future, not past

**Instead:**
- Focus on current status and next 30 days
- Use sparklines for historical trends (micro-charts)
- Link to specialized assessment modules for deep history

**Example:**
```
❌ Bad: Show last 6 months of readiness data on dashboard
✅ Good: Show current readiness + 7-day trend arrow
```

### ❌ DON'T Remove Operational Context
**Why:** Users need constant orientation

**Instead:**
- Always show: Operation name, Timeline (D+XX), Alert level, Time (Zulu)
- Keep operational context bar always visible
- Include breadcrumbs for deep navigation

**Example:**
```
❌ Bad: Clean minimal UI with no context indicators
✅ Good: Persistent header with Operation, D+04, 19:14Z, RED-ALPHA
```

### ❌ DON'T Show Stale Data Without Warning
**Why:** Wrong decisions based on old data can be catastrophic

**Instead:**
- Show "Last Updated" timestamp on all dynamic data
- Warn if data is > 5 minutes old
- Use visual indicators for real-time vs cached

**Example:**
```
❌ Bad: Display "87% readiness" with no timestamp
✅ Good: Display "87% readiness (Updated: 19:14:23Z)"
```

### ❌ DON'T Mix Precision Levels
**Why:** Creates uncertainty about data quality

**Instead:**
- Be consistent: Either show all percentages to 1 decimal or none
- Round appropriately for the use case
- Indicate precision in metadata if needed

**Example:**
```
❌ Bad: "87.234% readiness" and "64% efficacy" side-by-side
✅ Good: "87% readiness" and "64% efficacy" (consistent rounding)
```

---

## 5. Workflow & Process

### ❌ DON'T Interrupt User's Flow with Modals
**Why:** Modal dialogs break concentration and context

**Instead:**
- Use inline editing where possible
- Slide-in panels for details (not blocking)
- Toast notifications for confirmations

**Example:**
```
❌ Bad: Clicking metric opens modal that blocks entire screen
✅ Good: Clicking metric expands card inline or opens side panel
```

### ❌ DON'T Force Sequential Workflows
**Why:** Commanders may need to act out of order

**Instead:**
- Allow non-linear navigation
- Don't disable actions based on arbitrary rules
- Provide warnings, not blockers

**Example:**
```
❌ Bad: "You must review Intel before approving Decision"
✅ Good: "Warning: Intel not reviewed. Proceed anyway?"
```

### ❌ DON'T Require Redundant Confirmations
**Why:** Confirmation fatigue leads to clicking through without reading

**Instead:**
- Use destructive action warnings (delete, reject)
- Skip confirmations for reversible actions (use undo)
- Make consequences clear before action

**Example:**
```
❌ Bad: "Are you sure?" for every button click
✅ Good: "Approve Strike T-1002?" with clear consequences shown
```

---

## 6. Technical Implementation

### ❌ DON'T Sacrifice Performance for Visual Flair
**Why:** Slow dashboards reduce trust and usability

**Instead:**
- Target < 1 second initial load
- Lazy load non-critical components
- Optimize animations (use CSS transforms, not layout changes)

**Example:**
```
❌ Bad: 5 second load with fancy 3D animations
✅ Good: < 1 second load with subtle 2D transitions
```

### ❌ DON'T Auto-Refresh Without Control
**Why:** Users may be mid-action when data updates

**Instead:**
- Show "New data available" indicator
- Let user refresh manually (or auto-refresh at safe times)
- Preserve user's scroll position and focus

**Example:**
```
❌ Bad: Page reloads every 30 seconds, losing user's place
✅ Good: "3 new items" badge, click to update (or auto-update footer only)
```

### ❌ DON'T Ignore Mobile/Tablet Users
**Why:** Commanders may use tablets in tactical environments

**Instead:**
- Ensure responsive design works at 1024px+ (tablets)
- Test touch interactions (larger hit areas)
- Consider portrait mode for critical data

**Example:**
```
❌ Bad: Desktop-only layout that breaks on iPad
✅ Good: Responsive grid that adapts to tablet screens
```

### ❌ DON'T Hard-Code Thresholds
**Why:** Every operation has different criteria

**Instead:**
- Make thresholds configurable (per operation or user)
- Store in config or backend
- Allow operational adjustments without code changes

**Example:**
```
❌ Bad: if (targetingEfficacy < 70) showWarning() // Hard-coded
✅ Good: if (targetingEfficacy < config.efficacyThreshold) showWarning()
```

---

## 7. Accessibility & Usability

### ❌ DON'T Rely on Color Alone
**Why:** Colorblind users (8% of men) can't distinguish

**Instead:**
- Use color + icon + text
- Test with colorblind simulators
- Ensure WCAG 2.1 AA compliance

**Example:**
```
❌ Bad: Red card = critical (no other indicator)
✅ Good: Red card + AlertTriangle icon + "CRITICAL" text
```

### ❌ DON'T Ignore Keyboard Navigation
**Why:** Some users prefer/require keyboard

**Instead:**
- Ensure all actions accessible via keyboard
- Show focus indicators clearly
- Support common shortcuts (Tab, Enter, Esc)

**Example:**
```
❌ Bad: Cards clickable only with mouse
✅ Good: Cards focusable with Tab, clickable with Enter
```

### ❌ DON'T Use Vague Labels
**Why:** Ambiguity leads to misinterpretation

**Instead:**
- Be explicit: "Strike T-1002 Authorization" not "Pending Item"
- Use military terminology correctly
- Avoid jargon without explanation

**Example:**
```
❌ Bad: "Review Items" (what items?)
✅ Good: "2 Pending Decisions on Decision Board"
```

---

## 8. Testing & Validation

### ❌ DON'T Skip User Testing
**Why:** Designers are not users

**Instead:**
- Test with actual operators before deployment
- Observe real usage patterns
- Iterate based on feedback

**Example:**
```
❌ Bad: Deploy to production without user testing
✅ Good: Alpha test with 5 users → Beta with 20 → Full deployment
```

### ❌ DON'T Ignore Edge Cases
**Why:** Edge cases happen in operational environments

**Instead:**
- Test with 0 items, 1 item, 100 items
- Test with missing data
- Test with slow network

**Example:**
```
❌ Bad: Assume there are always exactly 2-5 critical actions
✅ Good: Test with 0, 1, 2, 10, 50 critical actions
```

### ❌ DON'T Deploy Without Rollback Plan
**Why:** Things can go wrong

**Instead:**
- Keep old dashboard accessible
- Document rollback procedure
- Have kill switch ready

**Example:**
```
❌ Bad: Delete old dashboard code after deployment
✅ Good: Keep old dashboard at /smartops/legacy for 30 days
```

---

## 9. Data & Privacy

### ❌ DON'T Log Sensitive Operational Data
**Why:** Security and OPSEC

**Instead:**
- Log events, not content ("User approved decision X" not "Strike on Target Y")
- Encrypt logs
- Limit retention

**Example:**
```
❌ Bad: console.log("Commander approved strike on coordinates 12.34, 56.78")
✅ Good: console.log("Decision approved: decision_id=D-1234")
```

### ❌ DON'T Cache Classified Data in Browser
**Why:** Security risk

**Instead:**
- Use session storage (cleared on close)
- Don't use localStorage for sensitive data
- Implement auto-logout

**Example:**
```
❌ Bad: localStorage.setItem('strike_targets', JSON.stringify(targets))
✅ Good: sessionStorage (ephemeral) or keep in memory only
```

---

## 10. Communication & Collaboration

### ❌ DON'T Make Changes Without Consulting Operators
**Why:** They know the domain best

**Instead:**
- Involve J3 Ops in design reviews
- Get commander sign-off on major changes
- Shadow operators to understand workflow

**Example:**
```
❌ Bad: "I think this looks better" (designer opinion)
✅ Good: "Operators said they need X, so we designed Y"
```

### ❌ DON'T Ignore Feedback
**Why:** Users stop providing feedback if nothing changes

**Instead:**
- Acknowledge all feedback
- Explain why some suggestions can't be implemented
- Show what changed based on feedback

**Example:**
```
❌ Bad: Collect feedback, never respond or implement
✅ Good: "We implemented 8 of your suggestions, here's why we couldn't do the other 3"
```

---

## Summary Checklist

Before making any change to the dashboard, ask:

- [ ] Does this ADD information, or CLARIFY existing information?
- [ ] Does this use consistent visual weight with the hierarchy?
- [ ] Does this require extra clicks to access critical actions?
- [ ] Does this remove operational context?
- [ ] Does this rely on color alone?
- [ ] Does this require confirmation for a reversible action?
- [ ] Does this sacrifice performance for aesthetics?
- [ ] Have I tested this with actual users?
- [ ] Have I considered the edge cases?
- [ ] Does this follow the 3-tier hierarchy (Critical/Active/Planning)?

**If you answered YES to any of the first 7 questions, reconsider the change.**

**If you answered NO to the last 3 questions, don't implement yet.**

---

## Real-World Examples

### Case Study 1: The Blinking Dashboard
**What Happened:** Developer added pulsing animation to all metric cards to "make them look more alive"

**Result:** Operators reported headaches, distraction, and difficulty focusing on critical items

**Fix:** Removed all animations except RED-ALPHA alert. Result: Positive feedback, increased clarity

**Lesson:** Animation is a signal, not decoration

### Case Study 2: The Hidden Decision
**What Happened:** Designer put decision approval buttons in a tab to "clean up the interface"

**Result:** 40% increase in time to decision, several missed deadlines

**Fix:** Brought decision items back to main dashboard, always visible

**Lesson:** Never hide critical actions

### Case Study 3: The Information Avalanche
**What Happened:** Stakeholders requested "just add one more metric" 8 times

**Result:** Dashboard became cluttered, commanders stopped using it

**Fix:** Removed 12 metrics, kept only 2 most critical. Result: Usage increased 300%

**Lesson:** Every addition requires a removal

---

**Remember:** When in doubt, ask an operator. They use this in life-or-death situations.

---

_Document Version: 1.0_
_Last Updated: 2026-01-21_
_Next Review: Monthly or after major incidents_
