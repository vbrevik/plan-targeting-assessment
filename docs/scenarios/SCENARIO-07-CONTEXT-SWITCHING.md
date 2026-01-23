# Scenario 7: Context Switching & Memory
## "Where Was I? The Cost of Constant Interruptions"

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Status:** Detailed Design Phase  
**Priority:** P1 (Should Have - High Value)  
**Estimated Timeline:** 8-12 months  
**Innovation Level:** ⭐⭐⭐⭐ High (Novel application of commercial patterns)

---

## Executive Summary

Military command operations are inherently interrupt-driven. A commander managing a complex operational campaign can be interrupted 40-60 times per shift for:
- Phone calls from higher headquarters
- Urgent intelligence updates
- Staff briefings
- Emergency decision requests  
- Video conferences
- Unscheduled visitors

Research demonstrates that **context switching costs humans 23 minutes per interruption** to fully return to the previous mental state. For commanders dealing with complex strategic problems (campaign planning, resource allocation, risk assessment), constant interruptions create a **"cognitive fragmentation" problem**: they never achieve deep focus on any single issue.

**The Impact:**
- Important strategic work never gets completed (always interrupted)
- Decisions are made with incomplete analysis
- Critical details are forgotten between interruptions
- Mental fatigue increases exponentially with switch frequency
- Staff time wasted re-briefing information already provided

Current C2 systems provide **zero support** for context preservation. When interrupted, commanders must rely entirely on human memory to recall:
- What they were working on
- What analysis they'd completed
- What decisions were pending
- What questions they needed answered

This scenario addresses context switching through **intelligent memory augmentation** - the system maintains perfect recall of the user's workflow, automatically capturing context and seamlessly restoring it after interruptions.

**Core Innovation:** The system acts as a "second brain" that remembers everything, allowing commanders to handle interruptions without losing productivity.

---

## Problem Statement

### The Fragmented Commander

**Typical Day Structure:**
```
0800: Begin reviewing Campaign LOO analysis (strategic, requires deep thought)
0815: PHONE CALL - Higher HQ wants update on incident (15 min)
0830: Return to LOO analysis... "Wait, where was I?"
0845: Staff brief on logistics constraints (30 min)
0915: Return to LOO analysis... "What was my conclusion before?"
0930: URGENT - Decision needed on Strike T-1002 (20 min)
0950: Video conference with Allied partners (45 min)
1035: Return to LOO analysis... "I've completely lost my train of thought"
1050: Lunch + meetings (60 min)
1150: Attempt LOO analysis again... give up, move to simpler tasks
```

**Result:** Complex strategic work (LOO analysis) is abandoned after 4 interruptions spanning 4 hours, despite attempting 15-minute analysis segments. Analysis never completed. Decision deferred.

**Consequence:**
- Strategic issues remain unresolved (tactical firefighting takes priority)
- Decisions made without proper analysis (rushed or deferred)
- Staff time wasted repeating briefings ("Where did we leave off?")
- Commander frustration and stress increase
- Quality of strategic thinking degrades

### The Cost of Context Loss

**Cognitive Research Findings:**
- **23 minutes average** to return to full productivity after interruption (UC Irvine study)
- **40% of time** spent recovering context after switch (Microsoft Research)
- **2x error rate** in decisions made immediately after interruption
- **Exponential fatigue** with switch frequency (3 switches = manageable, 20 = exhausting)

**Military-Specific Challenges:**
- Interruptions are mission-critical (can't be ignored or batched)
- Multiple parallel operational threads (5+ active incidents)
- High complexity (each issue has deep context)
- No "focus time" protection (24/7 operations)

### What Commanders Need (But Don't Have)

1. **Perfect Recall:** "What was I working on before the phone call?"
2. **Context Restoration:** "What analysis had I completed so far?"
3. **Pending Items:** "What questions did I need answered?"
4. **Decision State:** "What options was I evaluating?"
5. **Staff Coordination:** "Who was working on related issues?"
6. **Time Recovery:** Minimize the 23-minute context switch penalty

---

## Detailed Scenario Narrative

### Act 1: The Strategic Analysis Begins (Morning)

**0800hrs - Commander's Task**
COM JFC arrives at office with intent to resolve Campaign Objective drift:
- **Objective:** "Hostile Neutralized" (security LOO)
- **Status:** D+06 target, currently D+04 (2 days behind)
- **Problem:** Multiple factors delaying progress
- **Task:** Analyze root causes and recommend timeline adjustment

Commander opens **Campaign Analysis Tool** on dashboard:
```
┌─────────────────────────────────────────────────────────────┐
│ CAMPAIGN OBJECTIVE ANALYSIS: "Hostile Neutralized"          │
├─────────────────────────────────────────────────────────────┤
│ Target: D+06 | Current: D+04 | Status: 2 DAYS DRIFT ⚠️      │
│                                                               │
│ CONTRIBUTING FACTORS (Drag and rank by impact):              │
│                                                               │
│ ⬜ Logistics capacity constraints (floods in Sector North)   │
│ ⬜ Weather conditions (storms delaying air operations)       │
│ ⬜ Political constraints (Presidential Ultimatum)            │
│ ⬜ Force readiness (maintenance cycles)                      │
│ ⬜ Intelligence gaps (target identification delays)          │
│ ⬜ Host nation coordination (approval timelines)             │
│                                                               │
│ [ADD FACTOR] [REQUEST STAFF INPUT] [VIEW HISTORICAL]        │
└─────────────────────────────────────────────────────────────┘
```

Commander begins analysis:
**0800-0815:** Reviews logistics constraints
- Flood impact: 1-64 MECH mobility -40%, 4th LOG BN -60%
- Alternate supply routes proposed by J4
- Estimated recovery: 48-72 hours
- **Mental note:** "Logistics is factor #1, but temporary"

Drags "Logistics capacity constraints" to position #1.

**0815 - INTERRUPTION: Phone Call**
```
📞 INCOMING CALL: COMD HIGHER HQ
Duration: 15 minutes
Topic: Status update on Sector North floods
```

Commander steps away from computer to take call on secure line.

**During call:** Provides update on floods, discusses contingency plans, reassures higher headquarters that situation is under control.

### Act 2: The First Context Switch (0830hrs)

**0830hrs - Commander Returns**

Commander sits back down at desk. Dashboard shows:
```
┌─────────────────────────────────────────────────────────────┐
│ SmartOps Command Dashboard                                   │
│                                                               │
│ [Standard dashboard view - no memory of previous task]      │
└─────────────────────────────────────────────────────────────┘
```

**Commander's Mental State:**
- "I was doing something important before the call..."
- "Oh right, the Campaign LOO analysis"
- "Where was I in that? Did I finish the logistics part?"
- "Did I rank logistics as #1 or was I still evaluating?"
- *Takes 5 minutes to remember and reload mental context*

**Without Context Memory:**
- 5 minutes to recall task state
- 8 minutes to review what was already analyzed
- 10 minutes to rebuild mental model
- **Total: 23 minutes lost to context switching**

**With Context Memory System (What SHOULD Happen):**

Commander returns, system immediately displays:
```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 CONTEXT RESTORED: Campaign Objective Analysis            │
│                                                               │
│ ⏰ You were interrupted 15 minutes ago by phone call         │
│                                                               │
│ 📊 YOUR PROGRESS BEFORE INTERRUPTION:                        │
│ • Reviewing logistics constraints (Sector North floods)     │
│ • Analyzed: 1-64 MECH mobility -40%, recovery 48-72h       │
│ • Conclusion: Temporary factor, not root cause              │
│ • Action taken: Ranked "Logistics" as Factor #1             │
│ • Next step: Analyze weather impact                         │
│                                                               │
│ 💡 WHAT'S CHANGED WHILE YOU WERE AWAY:                      │
│ • J4 submitted alternate supply route proposal (5 min ago)  │
│ • Weather forecast updated: storms clearing faster          │
│                                                               │
│ [RESUME ANALYSIS] [VIEW FULL HISTORY] [START OVER]         │
└─────────────────────────────────────────────────────────────┘
```

**ONE CLICK to return to exact state before interruption.**

**Time saved: 20 minutes** (3 minutes to review summary vs. 23 to rebuild mentally)

### Act 3: Multiple Interruptions Cascade (Morning Continues)

**0830-0845: Analysis Continues** (With context memory active)
Commander clicks **[RESUME ANALYSIS]**. Screen returns to exact state:
- Logistics ranked #1
- Cursor moves to "Weather conditions" factor
- Commander reviews weather impact
- **Conclusion:** Weather was factor, but improving (storms clearing)
- Ranks weather as factor #3 (not root cause)

**0845 - INTERRUPTION 2: Staff Brief**
```
👥 J3 OPERATIONS BRIEF
Duration: 30 minutes
Topic: Daily operations update + logistics discussion
```

Commander must attend (mission-critical). System automatically captures context:
```
🧠 AUTO-SAVE: Campaign analysis paused at 0845hrs
• Completed: Logistics (#1), Weather (#3)
• In progress: About to analyze Political constraints
• Pending questions: Impact of Presidential Ultimatum on timeline
```

**0915hrs - Commander Returns**
```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 CONTEXT RESTORED: Campaign Objective Analysis            │
│                                                               │
│ ⏰ Interrupted 30 minutes ago for J3 staff brief             │
│                                                               │
│ 📊 YOUR PROGRESS:                                            │
│ ✅ COMPLETED: Logistics constraints (Factor #1)             │
│ ✅ COMPLETED: Weather conditions (Factor #3)                │
│ ⏭️ NEXT: Analyze Political constraints                      │
│                                                               │
│ 🆕 UPDATES DURING BRIEF:                                     │
│ • J3 brief mentioned ultimatum expires in 72h               │
│ • POLAD assessment: Political risk decreasing               │
│                                                               │
│ [RESUME] [REVIEW PROGRESS] [EXPORT NOTES]                   │
└─────────────────────────────────────────────────────────────┘
```

Commander clicks [RESUME]. Analysis continues seamlessly.

**0915-0930: Analysis Continues**
- Reviews political constraints (Presidential Ultimatum)
- Conclusion: 72-hour constraint, then lifted
- Ranks political as factor #2 (significant but temporary)

**0930 - INTERRUPTION 3: Urgent Decision**
```
🚨 URGENT DECISION REQUIRED
Decision: Strike T-1002 Authorization
Request from: J3 Targeting
Time sensitivity: Target may relocate within 6 hours
```

Commander MUST address this immediately (time-sensitive operational decision).

**System behavior:**
```
🧠 PRIORITY SHIFT DETECTED
• Current task (Campaign Analysis) paused and saved
• Urgent decision (Strike T-1002) loaded
• Context switching to: Tactical decision mode
```

Commander spends 20 minutes reviewing strike package, ultimately defers decision (cognitive load safety check triggers, decides to consult Deputy).

**0950 - INTERRUPTION 4: Video Conference**
```
🖥️ VIDEO CONFERENCE: Allied Partners
Duration: 45 minutes (scheduled)
Topic: Coalition coordination
```

Unavoidable. Commander must attend.

### Act 4: The Fragmentation Point (Mid-Morning)

**1035hrs - Commander Returns After 4 Interruptions**

Without context memory, commander is now **cognitively fragmented:**
- "What was I working on this morning?"
- "I remember something about campaign objectives..."
- "Did I finish that analysis or not?"
- "What were my conclusions?"
- **Gives up, moves to simpler tasks**

**With context memory system:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 MULTIPLE TASKS IN PROGRESS                                │
│                                                               │
│ 📊 ACTIVE WORK SESSIONS:                                     │
│                                                               │
│ 1. ⏸️ PAUSED: Campaign Objective Analysis (65% complete)    │
│    Started: 0800hrs | Last active: 0915hrs                   │
│    Progress: 3 of 6 factors analyzed                         │
│    Next: Analyze Force readiness factor                      │
│    [RESUME]                                                   │
│                                                               │
│ 2. ⏸️ PAUSED: Strike T-1002 Decision (deferred)             │
│    Started: 0930hrs | Last active: 0950hrs                   │
│    Status: Awaiting Deputy Commander consultation            │
│    Action: Deputy notified, meeting at 1400hrs               │
│    [VIEW DETAILS]                                             │
│                                                               │
│ 3. ✅ COMPLETED: J3 Staff Brief (attended)                   │
│    Duration: 30 minutes | Ended: 0915hrs                     │
│    Key takeaways: Logistics improving, POLAD optimistic      │
│    [VIEW SUMMARY]                                             │
│                                                               │
│ 4. ✅ COMPLETED: Allied Video Conference (attended)          │
│    Duration: 45 minutes | Ended: 1035hrs                     │
│    Outcome: Coalition support confirmed                      │
│    [VIEW NOTES]                                               │
│                                                               │
│ 💡 RECOMMENDATION: Resume Campaign Analysis (highest priority)│
│    Estimated time to complete: 30 minutes                    │
│    You have 25 minutes before next scheduled meeting         │
│                                                               │
│ [RESUME CAMPAIGN ANALYSIS] [VIEW ALL TASKS] [START NEW]     │
└─────────────────────────────────────────────────────────────┘
```

**Commander clicks [RESUME CAMPAIGN ANALYSIS]**

System instantly restores:
- Exact screen state at 0915hrs
- Factors #1-3 already ranked
- "Force readiness" highlighted as next factor to analyze
- Side panel shows relevant J3 brief notes about readiness

**Time saved:** 
- **Without system:** 23 minutes to recall + likely gives up = Task abandoned
- **With system:** 1 minute to review summary + immediate resume = Task continues

### Act 5: Completing Complex Work Despite Interruptions

**1035-1100hrs: Analysis Completed**

With context memory support, commander completes remaining analysis:
- Force readiness: Factor #4 (maintenance cycles, normal)
- Intelligence gaps: Factor #5 (minor, improving)
- Host nation coordination: Factor #6 (bureaucratic, expected)

**Final Analysis:**
```
┌─────────────────────────────────────────────────────────────┐
│ CAMPAIGN OBJECTIVE ANALYSIS: "Hostile Neutralized" ✅        │
├─────────────────────────────────────────────────────────────┤
│ ROOT CAUSE RANKING:                                          │
│                                                               │
│ #1 Logistics (Sector North floods) - TEMPORARY (48-72h)     │
│ #2 Political constraints (Ultimatum) - TEMPORARY (72h)      │
│ #3 Weather conditions - TEMPORARY (clearing)                 │
│ #4 Force readiness - NORMAL (planned maintenance)            │
│ #5 Intelligence gaps - MINOR (improving)                     │
│ #6 Host nation coordination - MINOR (expected delay)         │
│                                                               │
│ 🎯 RECOMMENDATION: TIMELINE ADJUSTMENT +48 HOURS             │
│                                                               │
│ RATIONALE:                                                    │
│ • Top 3 factors are temporary and resolving                  │
│ • Logistics recovers by D+05 (48h from now)                  │
│ • Political constraint lifts at D+06 (72h from now)          │
│ • Weather improving (operations resume D+05)                 │
│ • Revised target: D+08 (realistic and achievable)            │
│                                                               │
│ CONFIDENCE: HIGH (all temporary factors with clear timelines)│
│                                                               │
│ [CREATE DECISION PACKAGE] [BRIEF STAFF] [DEFER]             │
└─────────────────────────────────────────────────────────────┘
```

Commander clicks **[CREATE DECISION PACKAGE]**.

System generates formal recommendation with complete analysis history, ready for approval and staff coordination.

**Outcome:**
- ✅ Complex strategic analysis COMPLETED despite 4 interruptions
- ✅ High-quality decision (thorough, evidence-based)
- ✅ 2 hours actual work time across 3-hour interrupted period
- ✅ Commander remains productive, not frustrated
- ✅ Analysis documented for future reference and handoff

### Act 6: Collaborative Context Sharing (Afternoon)

**1400hrs - Deputy Commander Consultation**

Commander needs to consult Deputy on Strike T-1002 (deferred from morning).

**Without context sharing:**
- Commander: "So, about that strike..."
- Deputy: "Which strike?"
- Commander: "The one from this morning, T-1002"
- Deputy: "I'm not familiar with that, brief me"
- Commander: *Spends 15 minutes verbally explaining context*
- Deputy: *Asks clarifying questions, requests documents*
- **Total:** 25 minutes just to establish shared context

**With context sharing:**

Commander clicks **[SHARE CONTEXT]** on Strike T-1002 decision.

Deputy receives notification:
```
📤 SHARED CONTEXT from COM JFC
Topic: Strike T-1002 Authorization Decision
```

Deputy clicks notification, instantly views:
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 SHARED DECISION CONTEXT: Strike T-1002                    │
├─────────────────────────────────────────────────────────────┤
│ DECISION TIMELINE:                                           │
│ 0930hrs: Decision request received from J3 Targeting         │
│ 0945hrs: Commander reviewed strike package (15 min)          │
│ 0948hrs: Cognitive load safety check triggered (CL: 78%)     │
│ 0950hrs: Commander deferred for consultation with Deputy     │
│                                                               │
│ TARGET DETAILS:                                               │
│ • T-1002: Enemy command post (high-value target)             │
│ • Time-sensitive: May relocate within 6 hours                │
│ • Civilian infrastructure: 200m from hospital                │
│ • Political sensitivity: Conflicts with Ultimatum guidance   │
│                                                               │
│ COMMANDER'S CONCERNS:                                         │
│ • High cognitive load at time of decision                    │
│ • Concern about political constraints                         │
│ • Want fresh perspective before approval                     │
│                                                               │
│ DOCUMENTS ATTACHED:                                           │
│ • Strike package (PDF)                                        │
│ • Target assessment (J2 report)                              │
│ • POLAD guidance on Presidential Ultimatum                   │
│                                                               │
│ RECOMMENDATION NEEDED:                                        │
│ • Approve strike (with modifications?)                       │
│ • Defer 24h for coordination?                                │
│ • Reject due to political risk?                              │
│                                                               │
│ [VIEW FULL DETAILS] [ADD MY ASSESSMENT] [JOIN VIDEO CALL]   │
└─────────────────────────────────────────────────────────────┘
```

**Deputy reviews context in 3 minutes.**

**1405hrs - Video Call Begins**
- Both parties have complete shared context
- Conversation goes directly to analysis and recommendation
- No time wasted re-explaining situation
- Decision made in 10 minutes (vs. 35 minutes without context sharing)

**Time saved: 25 minutes**

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION LAYER                    │
│  • Dashboard UI                                              │
│  • Context capture (automatic + manual)                      │
│  • Context restoration UI                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONTEXT MEMORY ENGINE                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Session Manager:                                      │   │
│  │ • Track active work sessions                         │   │
│  │ • Detect task switches                               │   │
│  │ • Auto-save context on interruption                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ State Capture:                                        │   │
│  │ • UI state (scroll position, selections, inputs)     │   │
│  │ • User annotations (notes, rankings, highlights)     │   │
│  │ • Documents viewed                                    │   │
│  │ • Analysis progress                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Context Reconstruction:                               │   │
│  │ • Restore exact UI state                             │   │
│  │ • Highlight "what's changed"                         │   │
│  │ • Suggest next steps                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     STORAGE LAYER                            │
│  • Session state database (PostgreSQL)                      │
│  • Document attachments (S3/MinIO)                          │
│  • User activity log (time-series DB)                       │
└─────────────────────────────────────────────────────────────┘
```

### Component 1: Session Manager

**Purpose:** Track user's work sessions and detect task switches.

**Session Definition:**
```typescript
interface WorkSession {
  session_id: string;
  user_id: string;
  task_type: 'campaign_analysis' | 'decision' | 'incident_response' | 'planning';
  task_title: string;
  started_at: Date;
  last_active_at: Date;
  paused_at?: Date;
  completed_at?: Date;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  progress_percentage: number;
  context_snapshot: ContextSnapshot;
  interruptions: Interruption[];
}

interface Interruption {
  timestamp: Date;
  duration_seconds: number;
  reason: 'phone_call' | 'meeting' | 'urgent_decision' | 'scheduled_event';
  description: string;
}

interface ContextSnapshot {
  ui_state: UIState;
  user_inputs: UserInputs;
  documents_viewed: Document[];
  analysis_progress: AnalysisProgress;
  pending_questions: string[];
  next_steps: string[];
}
```

**Session Detection Algorithm:**
```typescript
class SessionManager {
  private activeSessions: Map<string, WorkSession>;
  
  async trackUserActivity(userId: string, activity: UserActivity) {
    const currentSession = this.getCurrentSession(userId);
    
    // Detect task switch
    if (this.isTaskSwitch(activity, currentSession)) {
      await this.pauseSession(currentSession);
      await this.createNewSession(userId, activity);
    } else {
      // Continue current session
      await this.updateSession(currentSession, activity);
    }
  }
  
  private isTaskSwitch(activity: UserActivity, session: WorkSession): boolean {
    // Heuristics for detecting task switch:
    // 1. User navigates to completely different area of application
    // 2. User clicks "Start new analysis"
    // 3. Urgent notification interrupts current work
    // 4. Scheduled meeting time
    
    if (activity.route !== session.current_route_family) {
      return true;
    }
    
    if (activity.action === 'start_new_task') {
      return true;
    }
    
    if (activity.priority === 'urgent' && activity.requires_immediate_attention) {
      return true;
    }
    
    return false;
  }
  
  async pauseSession(session: WorkSession) {
    // Capture complete context snapshot
    const snapshot = await this.captureContextSnapshot(session);
    
    session.paused_at = new Date();
    session.status = 'paused';
    session.context_snapshot = snapshot;
    
    await this.saveSession(session);
    
    // Calculate context switch cost
    const switchCost = this.estimateContextSwitchCost(session);
    
    // Log for analytics
    await this.logContextSwitch({
      session_id: session.session_id,
      progress_at_pause: session.progress_percentage,
      estimated_cost_minutes: switchCost
    });
  }
  
  private async captureContextSnapshot(session: WorkSession): Promise<ContextSnapshot> {
    // Capture everything needed to restore user to exact state
    return {
      ui_state: await this.captureUIState(session),
      user_inputs: await this.captureUserInputs(session),
      documents_viewed: await this.getDocumentsViewed(session),
      analysis_progress: await this.calculateAnalysisProgress(session),
      pending_questions: await this.extractPendingQuestions(session),
      next_steps: await this.suggestNextSteps(session)
    };
  }
}
```

### Component 2: UI State Capture

**Purpose:** Capture exact state of user interface to enable pixel-perfect restoration.

**UI State Definition:**
```typescript
interface UIState {
  route: string;  // Current page/route
  scroll_position: number;
  visible_panels: string[];
  expanded_sections: string[];
  form_values: Record<string, any>;
  selections: string[];
  cursor_position?: {element: string, offset: number};
  filters_applied: Filter[];
  sort_order?: SortConfig;
  custom_view_settings: Record<string, any>;
}
```

**Capture Implementation:**
```typescript
class UIStateCapture {
  captureCurrentState(): UIState {
    return {
      route: window.location.pathname,
      scroll_position: window.scrollY,
      visible_panels: this.getVisiblePanels(),
      expanded_sections: this.getExpandedSections(),
      form_values: this.captureFormValues(),
      selections: this.captureSelections(),
      cursor_position: this.captureCursorPosition(),
      filters_applied: this.getActiveFilters(),
      sort_order: this.getCurrentSortOrder(),
      custom_view_settings: this.getCustomSettings()
    };
  }
  
  async restoreState(uiState: UIState) {
    // Navigate to correct route
    await this.navigateTo(uiState.route);
    
    // Restore view settings
    await this.applyFilters(uiState.filters_applied);
    await this.applySort(uiState.sort_order);
    await this.showPanels(uiState.visible_panels);
    await this.expandSections(uiState.expanded_sections);
    
    // Restore form values
    await this.restoreFormValues(uiState.form_values);
    
    // Restore selections
    await this.restoreSelections(uiState.selections);
    
    // Scroll to position
    await this.scrollTo(uiState.scroll_position);
    
    // Restore cursor (if applicable)
    if (uiState.cursor_position) {
      await this.restoreCursor(uiState.cursor_position);
    }
  }
}
```

### Component 3: Intelligent "What's Changed" Detection

**Purpose:** Inform user of relevant changes that occurred during interruption.

**Change Detection:**
```typescript
class ChangeDetector {
  async detectRelevantChanges(
    session: WorkSession,
    sinceTimestamp: Date
  ): Promise<RelevantChange[]> {
    const changes: RelevantChange[] = [];
    
    // 1. Check for updates to documents user was viewing
    const documentUpdates = await this.checkDocumentUpdates(
      session.context_snapshot.documents_viewed,
      sinceTimestamp
    );
    changes.push(...documentUpdates);
    
    // 2. Check for new intelligence related to task
    const intelUpdates = await this.checkIntelUpdates(
      session.task_type,
      session.related_topics,
      sinceTimestamp
    );
    changes.push(...intelUpdates);
    
    // 3. Check for decisions made by others on related topics
    const decisionUpdates = await this.checkRelatedDecisions(
      session.task_type,
      sinceTimestamp
    );
    changes.push(...decisionUpdates);
    
    // 4. Check for staff inputs requested by user
    const staffInputs = await this.checkStaffInputs(
      session.session_id,
      sinceTimestamp
    );
    changes.push(...staffInputs);
    
    // Rank by relevance
    return this.rankByRelevance(changes, session);
  }
  
  private rankByRelevance(
    changes: RelevantChange[],
    session: WorkSession
  ): RelevantChange[] {
    return changes.sort((a, b) => {
      // Prioritize:
      // 1. Direct answers to pending questions
      // 2. Updates to documents user was actively viewing
      // 3. Related decisions
      // 4. General updates
      
      const scoreA = this.calculateRelevanceScore(a, session);
      const scoreB = this.calculateRelevanceScore(b, session);
      
      return scoreB - scoreA;  // Descending order
    });
  }
}
```

### Component 4: Context Restoration UI

**Purpose:** Provide seamless return to paused work.

**Restoration Flow:**
```typescript
class ContextRestorer {
  async showRestorationPrompt(session: WorkSession) {
    const changes = await this.changeDetector.detectRelevantChanges(
      session,
      session.paused_at
    );
    
    const prompt: RestorationPrompt = {
      session_title: session.task_title,
      paused_duration: this.calculateDuration(session.paused_at, new Date()),
      interruption_reason: session.interruptions[session.interruptions.length - 1].reason,
      progress_before_pause: {
        completed: session.progress_percentage,
        summary: this.generateProgressSummary(session)
      },
      relevant_changes: changes.slice(0, 3),  // Top 3 most relevant
      next_steps: session.context_snapshot.next_steps,
      estimated_time_to_complete: this.estimateCompletionTime(session)
    };
    
    return this.renderPrompt(prompt);
  }
  
  private generateProgressSummary(session: WorkSession): string {
    // Use AI to generate human-readable summary of progress
    // Example: "You had analyzed 3 of 6 factors and were about to review Force readiness"
    
    return this.aiSummarizer.summarize({
      task_type: session.task_type,
      ui_state: session.context_snapshot.ui_state,
      user_inputs: session.context_snapshot.user_inputs,
      analysis_progress: session.context_snapshot.analysis_progress
    });
  }
  
  async restoreSession(sessionId: string) {
    const session = await this.sessionManager.getSession(sessionId);
    
    // Restore UI state
    await this.uiStateCapture.restoreState(session.context_snapshot.ui_state);
    
    // Highlight what's changed
    this.highlightChanges(session.relevant_changes);
    
    // Reactivate session tracking
    await this.sessionManager.resumeSession(sessionId);
    
    // Log restoration (for analytics)
    await this.analytics.logSessionRestoration({
      session_id: sessionId,
      time_to_restore_ms: Date.now() - startTime,
      user_clicked_resume: true
    });
  }
}
```

### Component 5: Collaborative Context Sharing

**Purpose:** Enable seamless context sharing between team members.

**Sharing Mechanism:**
```typescript
interface SharedContext {
  share_id: string;
  from_user: string;
  to_users: string[];
  session_id: string;
  task_title: string;
  context_type: 'decision' | 'analysis' | 'incident' | 'planning';
  shared_at: Date;
  expires_at?: Date;
  permissions: 'view' | 'comment' | 'edit';
  context_data: ContextSnapshot;
  message?: string;  // Optional message from sender
  attachments: Document[];
}

class ContextSharing {
  async shareContext(
    sessionId: string,
    toUsers: string[],
    message?: string
  ): Promise<SharedContext> {
    const session = await this.sessionManager.getSession(sessionId);
    
    const sharedContext: SharedContext = {
      share_id: uuid(),
      from_user: session.user_id,
      to_users: toUsers,
      session_id: sessionId,
      task_title: session.task_title,
      context_type: this.inferContextType(session),
      shared_at: new Date(),
      permissions: 'comment',  // Default: can view and comment
      context_data: session.context_snapshot,
      message: message,
      attachments: session.context_snapshot.documents_viewed
    };
    
    // Save shared context
    await this.storage.saveSharedContext(sharedContext);
    
    // Notify recipients
    await Promise.all(toUsers.map(userId => 
      this.notifier.sendNotification(userId, {
        type: 'shared_context',
        from: session.user_id,
        title: session.task_title,
        share_id: sharedContext.share_id
      })
    ));
    
    return sharedContext;
  }
  
  async viewSharedContext(shareId: string, userId: string) {
    const shared = await this.storage.getSharedContext(shareId);
    
    // Check permissions
    if (!shared.to_users.includes(userId)) {
      throw new Error('Access denied');
    }
    
    // Render context viewer (read-only view of sender's context)
    return this.renderSharedContextViewer(shared);
  }
  
  async addCommentToSharedContext(
    shareId: string,
    userId: string,
    comment: string
  ) {
    // Allow recipients to add their perspective
    await this.storage.addComment(shareId, {
      user_id: userId,
      comment: comment,
      timestamp: new Date()
    });
    
    // Notify original sender
    await this.notifier.sendNotification(shared.from_user, {
      type: 'comment_on_shared_context',
      from: userId,
      share_id: shareId
    });
  }
}
```

---

## User Flows

### Flow 1: Basic Context Restoration

```
User working on Campaign Analysis
        ↓
Phone call interrupts (automatic pause detected)
        ↓
15 minutes pass (call ends)
        ↓
User returns to dashboard
        ↓
System displays: "Context Restored: Campaign Analysis"
        ↓
User sees:
  - Progress summary (what was done)
  - What's changed (updates during call)
  - Next steps (what to do now)
        ↓
User clicks [RESUME]
        ↓
Exact UI state restored (scroll position, selections, inputs)
        ↓
User continues work seamlessly (no context rebuilding needed)
```

### Flow 2: Multiple Paused Sessions

```
User has 3 paused sessions:
  1. Campaign Analysis (65% complete)
  2. Strike Decision (awaiting consultation)
  3. Incident Response (completed)
        ↓
User returns to dashboard after interruptions
        ↓
System shows: "Multiple Tasks in Progress"
        ↓
User sees prioritized list:
  - Active tasks (in progress)
  - Paused tasks (can resume)
  - Completed tasks (for reference)
        ↓
System recommends: "Resume Campaign Analysis (highest priority)"
        ↓
User can:
  [RESUME RECOMMENDED] → Go to Campaign Analysis
  [VIEW ALL TASKS] → See full list
  [START NEW] → Begin new task
        ↓
User selects task to resume
        ↓
Context instantly restored
```

### Flow 3: Collaborative Context Sharing

```
Commander working on complex decision (Strike T-1002)
        ↓
Realizes needs Deputy's input
        ↓
Commander clicks [SHARE CONTEXT]
        ↓
System prompts:
  - Who to share with? [Deputy Commander]
  - Message? "Need your assessment on political risk"
  - Permissions? [View + Comment]
        ↓
Commander clicks [SHARE]
        ↓
Deputy receives notification
        ↓
Deputy clicks notification
        ↓
Deputy instantly sees:
  - Decision context (what, why, when)
  - Documents reviewed by Commander
  - Commander's concerns
  - Request for input
        ↓
Deputy reviews (3 minutes to get full context)
        ↓
Deputy adds comment: "Political risk is high. Recommend defer 24h."
        ↓
Commander notified of comment
        ↓
Commander sees Deputy's input in context
        ↓
Decision made with full shared context (10 min vs. 35 min)
```

---

## Technical Requirements

### Backend

1. **Session Management Service**
   - Track user work sessions
   - Detect task switches
   - Auto-save context on interruption
   - API endpoints:
     - `POST /api/sessions` - Create new session
     - `GET /api/sessions/active` - Get active sessions for user
     - `PUT /api/sessions/:id/pause` - Pause session
     - `PUT /api/sessions/:id/resume` - Resume session
     - `GET /api/sessions/:id/context` - Get context snapshot

2. **Context Storage Service**
   - Store UI state snapshots
   - Store user inputs and annotations
   - Efficient retrieval for restoration
   - Database: PostgreSQL (relational queries)
   - Object storage: S3/MinIO (documents)

3. **Change Detection Service**
   - Monitor for relevant updates
   - Filter by session context
   - Rank by relevance
   - Real-time notification delivery

4. **Context Sharing Service**
   - Share context between users
   - Permission management
   - Commenting/collaboration features
   - Expiration handling

### Frontend

1. **Context Capture Module**
   - Automatic UI state capture
   - Form auto-save (every 30 seconds)
   - Scroll position tracking
   - Selection tracking

2. **Context Restoration UI**
   - Restoration prompt component
   - Progress summary display
   - "What's changed" panel
   - One-click resume

3. **Multi-Session Manager**
   - Display all active/paused sessions
   - Priority ranking
   - Quick switch between sessions
   - Session completion tracking

4. **Collaborative Sharing UI**
   - Share context modal
   - Shared context viewer
   - Comment interface
   - Notification integration

### Data Requirements

**Session Data:**
```json
{
  "session_id": "uuid",
  "user_id": "COM_JFC",
  "task_type": "campaign_analysis",
  "task_title": "Campaign Objective: Hostile Neutralized",
  "started_at": "2026-01-21T08:00:00Z",
  "paused_at": "2026-01-21T08:15:00Z",
  "status": "paused",
  "progress_percentage": 35,
  "context_snapshot": {
    "ui_state": {
      "route": "/smartops/campaign/analysis",
      "scroll_position": 450,
      "visible_panels": ["factors", "timeline"],
      "expanded_sections": ["logistics"],
      "form_values": {
        "factor_rankings": [
          {"name": "Logistics", "rank": 1, "severity": "high"}
        ]
      },
      "selections": ["factor-logistics"]
    },
    "documents_viewed": [
      {"id": "doc-123", "title": "J4 Logistics Assessment", "viewed_at": "08:05"}
    ],
    "analysis_progress": {
      "factors_analyzed": 1,
      "total_factors": 6,
      "current_factor": "weather"
    },
    "pending_questions": [
      "What is impact of Presidential Ultimatum on timeline?"
    ],
    "next_steps": [
      "Analyze weather conditions factor",
      "Review political constraints"
    ]
  },
  "interruptions": [
    {
      "timestamp": "2026-01-21T08:15:00Z",
      "duration_seconds": 900,
      "reason": "phone_call",
      "description": "Call from COMD HIGHER HQ"
    }
  ]
}
```

---

## Success Metrics

### Primary Metrics

1. **Context Switch Cost Reduction**
   - **Baseline:** 23 minutes average to return to productivity after interruption
   - **Target:** 3 minutes average (87% reduction)
   - **Measurement:** Time from interruption end to user resuming productive work

2. **Task Completion Rate**
   - **Baseline:** 45% of complex tasks completed despite interruptions
   - **Target:** 85% completion rate
   - **Measurement:** % of started tasks that reach completion

3. **Time Savings**
   - **Target:** 30 minutes saved per shift from reduced context switching
   - **Measurement:** Track time spent rebuilding context (before vs. after)

### Secondary Metrics

4. **User Satisfaction**
   - **Target:** 8.5/10 satisfaction score
   - **Measurement:** Post-shift survey on context memory usefulness

5. **Collaboration Efficiency**
   - **Baseline:** 25 minutes average to establish shared context for consultations
   - **Target:** 5 minutes average (80% reduction)
   - **Measurement:** Time from consultation request to productive discussion

6. **Cognitive Load Reduction**
   - **Target:** 20% reduction in perceived cognitive load
   - **Measurement:** Self-reported cognitive load surveys

---

## Implementation Roadmap

### Phase 1: Core Context Capture (Weeks 1-8)

**Weeks 1-2:**
- Design session data model
- Create session tracking service
- Build basic UI state capture

**Weeks 3-4:**
- Implement automatic pause detection
- Build context snapshot capture
- Create storage infrastructure

**Weeks 5-6:**
- Build restoration UI component
- Implement basic "resume" functionality
- Test with single task type (campaign analysis)

**Weeks 7-8:**
- Expand to all task types
- Refine capture/restore algorithms
- Initial user testing

**Deliverable:** Basic context memory functional

### Phase 2: Advanced Features (Weeks 9-16)

**Weeks 9-10:**
- Build "what's changed" detection
- Implement change relevance ranking
- Create change notification UI

**Weeks 11-12:**
- Build multi-session manager
- Implement priority ranking
- Create session switcher UI

**Weeks 13-14:**
- Build progress calculation
- Implement next-step suggestions
- Create intelligent recommendations

**Weeks 15-16:**
- Polish UI/UX
- Performance optimization
- Comprehensive testing

**Deliverable:** Full context memory system

### Phase 3: Collaboration (Weeks 17-24)

**Weeks 17-18:**
- Build context sharing service
- Implement permissions system
- Create sharing UI

**Weeks 19-20:**
- Build collaborative viewing
- Implement commenting
- Create notification workflow

**Weeks 21-22:**
- Build AI-powered summaries
- Implement intelligent context packaging
- Create email/export features

**Weeks 23-24:**
- Integration testing
- User acceptance testing
- Production deployment

**Deliverable:** Collaborative context sharing active

---

## Risk Assessment

### Risk 1: Privacy Concerns
**Probability:** Medium | **Impact:** High

**Description:** Users may be uncomfortable with system "remembering everything."

**Mitigation:**
- ✅ Transparent data capture (user sees what's saved)
- ✅ User control (can disable for sensitive work)
- ✅ Data retention limits (30 days auto-delete)
- ✅ No sharing without explicit permission
- ✅ Clear privacy policy and user education

### Risk 2: Storage Costs
**Probability:** Medium | **Impact:** Medium

**Description:** Storing complete UI snapshots for every session could be expensive.

**Mitigation:**
- ✅ Efficient compression (JSON gzip reduces 80%)
- ✅ Incremental snapshots (only changes, not full state)
- ✅ Tiered storage (hot vs. cold)
- ✅ Auto-archival of completed sessions
- ✅ Estimated cost: $0.50/user/month (acceptable)

### Risk 3: Restoration Failures
**Probability:** Low | **Impact:** Medium

**Description:** UI changes between pause and resume could break restoration.

**Mitigation:**
- ✅ Version-aware restoration (graceful degradation)
- ✅ Fallback to manual navigation if exact restore fails
- ✅ User still gets progress summary (even if UI differs)
- ✅ Comprehensive error handling
- ✅ Monitoring and alerting for failures

### Risk 4: User Adoption
**Probability:** Medium | **Impact:** Medium

**Description:** Users may not understand or use context restoration features.

**Mitigation:**
- ✅ Automatic (no user action required for capture)
- ✅ Prominent restoration prompts (hard to miss)
- ✅ Training and documentation
- ✅ Success stories and testimonials
- ✅ Gradual rollout with champions

---

## Future Enhancements

### Enhancement 1: AI-Powered Work Planning
- Analyze user's session history
- Predict optimal time allocation
- Suggest: "Block 90 minutes for Campaign Analysis (typically takes 75 min uninterrupted)"
- Calendar integration

### Enhancement 2: Interruption Shielding
- "Focus Mode" that routes interruptions to deputy
- Intelligent urgency assessment
- Only break focus for truly critical issues

### Enhancement 3: Cross-Shift Context Handoff
- Automatic integration with shift handoff system
- Incoming commander sees outgoing's active sessions
- Seamless continuity across shifts

### Enhancement 4: Pattern Learning
- Learn user's working patterns
- Optimize restoration based on individual preferences
- Personalized next-step suggestions

---

## Appendix: Research Foundation

### Context Switching Research

**Gloria Mark, UC Irvine (2008):**
- 23 minutes average to return to task after interruption
- 40% of time spent recovering from interruptions
- Fragmented work decreases overall productivity by 20-30%

**Microsoft Research (2004):**
- Knowledge workers switch tasks every 3 minutes
- 40% of switches are self-interruptions (distraction)
- Complete focus periods (<30 min) are rare (11% of work time)

**Harvard Business Review (2013):**
- Senior executives interrupted 50-60 times per day
- Average focus period: 11 minutes
- Quality of decisions inversely correlated with interruption frequency

### Military Command Studies

**NATO Command & Control Research (2017):**
- Commanders handle 30-50 discrete issues per shift
- Complex strategic planning requires 60-90 minute uninterrupted blocks
- Less than 15% of shifts achieve uninterrupted strategic planning time

### Commercial Applications

**IDE Context Preservation:**
- IntelliJ IDEA "Local History" feature
- VS Code workspace restore
- Success: 95% user satisfaction, considered "must-have"

**Web Browser Tab Suspend/Restore:**
- Chrome/Firefox tab session management
- Restores exact state after browser crash
- Demonstrates feasibility of UI state capture

---

## Appendix: User Stories

**User Story 1: Interrupted Commander**
```
AS A Joint Force Commander working on complex analysis
WHEN I am interrupted by an urgent phone call
I WANT the system to remember exactly where I was
SO THAT I can resume work immediately without rebuilding mental context
```

**User Story 2: Multi-tasking Staff Officer**
```
AS A staff officer managing multiple parallel incidents
WHEN I switch between incidents throughout the day
I WANT to see all my active work sessions in one place
SO THAT I can prioritize and resume the most important work
```

**User Story 3: Collaborative Decision-Making**
```
AS A commander seeking input from my deputy
WHEN I need their assessment on a complex decision
I WANT to share my complete decision context with one click
SO THAT we can have a productive discussion without lengthy re-briefing
```

---

**End of Document**

**Next Steps:**
1. Review and approve scenario details
2. Validate technical approach with development team
3. Confirm success metrics with stakeholders
4. Prioritize alongside other scenarios (Scenario 3 and 5)
5. Begin Phase 1 implementation planning
