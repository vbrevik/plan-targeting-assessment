# Decision System: How to Start Implementation

## Quick Start Summary

**Goal:** Integrate decision support system with your headquarters' meeting structure and battle rhythm.

**Time to first working version:** 2 weeks

**What you'll build:**
1. Meeting venues (CAB, DRB, etc.) in database
2. Decision routing (auto-assign decisions to meetings)
3. Meeting agenda view
4. "Scheduled for" indicator on decisions

---

## Prerequisites

✅ Frontend decision components (already built)  
✅ Frontend dashboard (SituationAwarenessCockpit)  
⬜ Backend decision API (you'll build this)  
⬜ PostgreSQL database (already have)

---

## Week 1: Foundation

### Day 1-2: Define Your HQ's Meeting Structure

**Step 1: Document your actual meeting schedule**

Create a file: `/docs/YOUR_HQ_BATTLE_RHYTHM.md`

```markdown
# [Your HQ Name] Battle Rhythm

## Daily Meetings
- **0630-0700:** Morning Update Brief
  - Attendees: Commander, Deputies, J2/J3 Directors
  - Purpose: Overnight summary, critical decisions
  - Authority: Commander

- **1730-1800:** Evening Update Brief
  - Attendees: Watch Officer, J3 Ops, J2 on-call
  - Purpose: Day summary, night watch handover
  - Authority: Watch Officer

## Weekly Meetings
- **Monday 0800-0900:** Campaign Assessment Board (CAB)
  - Attendees: Commander, full staff
  - Purpose: Strategic decisions, campaign progress
  - Authority: Commander

- **Wednesday 1400-1600:** Decision Review Board (DRB)
  - Attendees: Commander, Deputies, Section Chiefs
  - Purpose: Operational decisions, resource allocation
  - Authority: Commander

- **Friday 1500-1600:** Week-in-Review
  - Attendees: COS, Section Chiefs
  - Purpose: Track decision outcomes, lessons learned
  - Authority: COS

[Add any other meetings specific to your HQ]
```

**Step 2: Create database schema**

File: `/backend/migrations/YYYYMMDD_create_meeting_structure.sql`

```sql
-- Meeting venues (where decisions are made)
CREATE TABLE meeting_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,          -- 'Campaign Assessment Board'
    short_name VARCHAR(20) NOT NULL,     -- 'CAB'
    schedule VARCHAR(100),                -- 'Monday 0800-0900'
    recurrence VARCHAR(20),               -- 'weekly', 'daily'
    authority_level VARCHAR(20),          -- 'strategic', 'operational', 'tactical'
    default_approver VARCHAR(50),         -- 'commander', 'deputy', 'cos'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Meeting instances (actual scheduled meetings)
CREATE TABLE meeting_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES meeting_venues(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',  -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Decision routing (which meeting will handle which decision)
CREATE TABLE decision_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id),
    venue_id UUID REFERENCES meeting_venues(id),
    meeting_instance_id UUID REFERENCES meeting_instances(id),
    agenda_order INT,                     -- Position in agenda (1, 2, 3...)
    presenter VARCHAR(100),               -- Who will present (e.g., "J3 Director")
    estimated_duration INT,               -- Minutes
    routing_reason TEXT,                  -- Why routed to this meeting
    routed_at TIMESTAMP DEFAULT NOW(),
    presented_at TIMESTAMP,
    decided_at TIMESTAMP
);

-- Staff section coordination on decisions
CREATE TABLE staff_coordination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id),
    section VARCHAR(10) NOT NULL,         -- 'J2', 'J3', 'J4', 'J5', 'J6', 'J1', 'J8'
    coordinator_user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'non_concur'
    comments TEXT,
    priority VARCHAR(20),                 -- 'blocking', 'informational'
    coordinated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

**Step 3: Seed with your meetings**

File: `/backend/seeds/meeting_venues.sql`

```sql
-- Insert your HQ's actual meetings
INSERT INTO meeting_venues (name, short_name, schedule, recurrence, authority_level, default_approver) VALUES
('Campaign Assessment Board', 'CAB', 'Monday 0800-0900', 'weekly', 'strategic', 'commander'),
('Decision Review Board', 'DRB', 'Wednesday 1400-1600', 'weekly', 'operational', 'commander'),
('Resource Allocation Board', 'RAB', 'Friday 0900-1000', 'weekly', 'tactical', 'deputy'),
('Morning Update Brief', 'Morning Brief', 'Daily 0630-0700', 'daily', 'tactical', 'commander'),
('Evening Update Brief', 'Evening Brief', 'Daily 1730-1800', 'daily', 'tactical', 'watch');

-- Generate meeting instances for next 4 weeks
-- (You can automate this later, but start with manual inserts)
```

---

### Day 3-4: Backend - Decision Routing Logic

**Step 1: Create routing service**

File: `/backend/src/features/decisions/services/routing.rs`

```rust
use chrono::{Datelike, Duration, NaiveTime, Utc, Weekday};
use uuid::Uuid;

pub struct DecisionRouter {
    // Will load meeting venues from database
}

#[derive(Debug, Clone)]
pub struct RoutingPlan {
    pub venue_id: Uuid,
    pub venue_name: String,
    pub meeting_date: chrono::NaiveDate,
    pub meeting_time: NaiveTime,
    pub routing_reason: String,
    pub urgency_override: bool,  // If true, notify immediately
}

impl DecisionRouter {
    pub fn new() -> Self {
        Self {}
    }

    /// Route a decision to the appropriate meeting
    pub fn route_decision(&self, decision: &Decision) -> RoutingPlan {
        // Get hours until deadline
        let hours_to_deadline = self.calculate_hours_to_deadline(decision);

        // Route based on urgency and timeline
        match decision.urgency {
            Urgency::Critical if hours_to_deadline < 6 => {
                // IMMEDIATE - Ad-hoc, notify commander now
                self.route_immediate(decision)
            },
            Urgency::High if hours_to_deadline < 48 => {
                // TACTICAL - Next daily brief (morning or evening)
                self.route_to_next_brief(decision)
            },
            Urgency::Medium | Urgency::High if hours_to_deadline < 168 => {
                // OPERATIONAL - Next DRB (Wednesday)
                self.route_to_drb(decision)
            },
            _ => {
                // STRATEGIC - Next CAB (Monday)
                self.route_to_cab(decision)
            }
        }
    }

    fn route_immediate(&self, decision: &Decision) -> RoutingPlan {
        let now = Utc::now();
        
        RoutingPlan {
            venue_id: Uuid::nil(), // Ad-hoc, no venue
            venue_name: "Ad-hoc (Immediate)".to_string(),
            meeting_date: now.date_naive(),
            meeting_time: now.time(),
            routing_reason: format!(
                "Critical decision with {}h deadline requires immediate attention",
                self.calculate_hours_to_deadline(decision)
            ),
            urgency_override: true,  // Notify commander immediately
        }
    }

    fn route_to_next_brief(&self, decision: &Decision) -> RoutingPlan {
        let now = Utc::now();
        let current_time = now.time();
        
        // Morning brief at 0630, Evening brief at 1730
        let morning_brief = NaiveTime::from_hms_opt(6, 30, 0).unwrap();
        let evening_brief = NaiveTime::from_hms_opt(17, 30, 0).unwrap();

        let (next_brief_date, next_brief_time, venue_name) = 
            if current_time < morning_brief {
                // Before morning brief - use today's morning brief
                (now.date_naive(), morning_brief, "Morning Brief")
            } else if current_time < evening_brief {
                // Between briefs - use today's evening brief
                (now.date_naive(), evening_brief, "Evening Brief")
            } else {
                // After evening brief - use tomorrow's morning brief
                (now.date_naive() + Duration::days(1), morning_brief, "Morning Brief")
            };

        RoutingPlan {
            venue_id: Uuid::nil(), // TODO: Look up from database
            venue_name: venue_name.to_string(),
            meeting_date: next_brief_date,
            meeting_time: next_brief_time,
            routing_reason: format!(
                "High urgency decision routed to next scheduled brief ({})",
                venue_name
            ),
            urgency_override: false,
        }
    }

    fn route_to_drb(&self, decision: &Decision) -> RoutingPlan {
        // DRB is Wednesday 1400
        let now = Utc::now();
        let current_weekday = now.weekday();
        
        let days_until_wednesday = match current_weekday {
            Weekday::Wed if now.time() < NaiveTime::from_hms_opt(14, 0, 0).unwrap() => 0,
            Weekday::Wed => 7,  // After Wednesday DRB, go to next week
            Weekday::Thu => 6,
            Weekday::Fri => 5,
            Weekday::Sat => 4,
            Weekday::Sun => 3,
            Weekday::Mon => 2,
            Weekday::Tue => 1,
        };

        let next_drb_date = now.date_naive() + Duration::days(days_until_wednesday);
        let drb_time = NaiveTime::from_hms_opt(14, 0, 0).unwrap();

        RoutingPlan {
            venue_id: Uuid::nil(), // TODO: Look up from database
            venue_name: "Decision Review Board".to_string(),
            meeting_date: next_drb_date,
            meeting_time: drb_time,
            routing_reason: format!(
                "Operational decision requiring Commander approval, routed to next DRB"
            ),
            urgency_override: false,
        }
    }

    fn route_to_cab(&self, decision: &Decision) -> RoutingPlan {
        // CAB is Monday 0800
        let now = Utc::now();
        let current_weekday = now.weekday();
        
        let days_until_monday = match current_weekday {
            Weekday::Mon if now.time() < NaiveTime::from_hms_opt(8, 0, 0).unwrap() => 0,
            Weekday::Mon => 7,  // After Monday CAB, go to next week
            Weekday::Tue => 6,
            Weekday::Wed => 5,
            Weekday::Thu => 4,
            Weekday::Fri => 3,
            Weekday::Sat => 2,
            Weekday::Sun => 1,
        };

        let next_cab_date = now.date_naive() + Duration::days(days_until_monday);
        let cab_time = NaiveTime::from_hms_opt(8, 0, 0).unwrap();

        RoutingPlan {
            venue_id: Uuid::nil(), // TODO: Look up from database
            venue_name: "Campaign Assessment Board".to_string(),
            meeting_date: next_cab_date,
            meeting_time: cab_time,
            routing_reason: format!(
                "Strategic decision affecting campaign, routed to next CAB"
            ),
            urgency_override: false,
        }
    }

    fn calculate_hours_to_deadline(&self, decision: &Decision) -> i64 {
        if let Some(deadline) = &decision.deadline {
            let now = Utc::now();
            let deadline_dt = deadline.parse::<chrono::DateTime<Utc>>().unwrap();
            let duration = deadline_dt - now;
            duration.num_hours()
        } else {
            9999  // No deadline = low urgency
        }
    }
}
```

**Step 2: Add routing to decision creation**

File: `/backend/src/features/decisions/handlers.rs`

```rust
// When a decision is created, automatically route it
pub async fn create_decision(
    State(state): State<AppState>,
    Json(payload): Json<CreateDecisionRequest>
) -> Result<Json<Decision>, StatusCode> {
    
    // 1. Create the decision
    let decision = state.decision_service
        .create_decision(payload)
        .await?;

    // 2. Route the decision
    let router = DecisionRouter::new();
    let routing_plan = router.route_decision(&decision);
    
    // 3. Save routing to database
    state.decision_service
        .save_routing(&decision.id, &routing_plan)
        .await?;

    // 4. If urgent, send notification
    if routing_plan.urgency_override {
        state.notification_service
            .notify_commander(&decision)
            .await?;
    }

    Ok(Json(decision))
}
```

---

### Day 5-6: Frontend - Display Routing Info

**Step 1: Update Decision type**

File: `/frontend/src/lib/smartops/types.ts`

```typescript
// Add to existing Decision interface
export interface Decision {
    // ... existing fields ...
    
    // NEW: Routing information
    routing?: {
        venue_id: string;
        venue_name: string;
        meeting_date: string;  // ISO date
        meeting_time: string;  // "14:00"
        routing_reason: string;
        urgency_override: boolean;
    };
}
```

**Step 2: Update DecisionCard to show routing**

File: `/frontend/src/features/smartops/components/decisions/DecisionCard.tsx`

```typescript
// Add after the deadline display
{decision.routing && (
    <div className="mt-2 flex items-center gap-2 text-[9px]">
        <Calendar size={10} className="text-blue-400" />
        <span className="text-slate-400">Scheduled:</span>
        <span className="text-blue-400 font-bold">
            {decision.routing.venue_name}
        </span>
        <span className="text-slate-500">
            {formatDate(decision.routing.meeting_date)} {decision.routing.meeting_time}
        </span>
    </div>
)}
```

---

### Day 7-8: Meeting Agenda View (Basic)

**Step 1: Create backend endpoint**

File: `/backend/src/features/decisions/handlers.rs`

```rust
/// GET /api/meetings/:venue/agenda?date=2026-01-21
pub async fn get_meeting_agenda(
    State(state): State<AppState>,
    Path(venue): Path<String>,
    Query(params): Query<AgendaQuery>
) -> Result<Json<MeetingAgenda>, StatusCode> {
    
    let date = params.date.unwrap_or_else(|| {
        // Default to next occurrence of this meeting
        find_next_meeting_date(&venue)
    });

    // Get all decisions routed to this meeting
    let decisions = state.decision_service
        .get_decisions_for_meeting(&venue, &date)
        .await?;

    let agenda = MeetingAgenda {
        venue_name: venue.clone(),
        date: date.clone(),
        items: decisions.into_iter().map(|d| AgendaItem {
            decision,
            order: d.routing.agenda_order,
            presenter: d.routing.presenter,
            estimated_duration: d.routing.estimated_duration,
        }).collect(),
    };

    Ok(Json(agenda))
}
```

**Step 2: Create frontend component**

File: `/frontend/src/features/smartops/components/meetings/MeetingAgenda.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import type { Decision } from '@/lib/smartops/types';

interface AgendaItem {
    decision: Decision;
    order: number;
    presenter: string;
    estimated_duration: number;
}

interface MeetingAgendaProps {
    venue: string;  // 'DRB', 'CAB', etc.
    date?: string;  // ISO date, defaults to next meeting
}

export function MeetingAgenda({ venue, date }: MeetingAgendaProps) {
    const [agenda, setAgenda] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = date ? `?date=${date}` : '';
        fetch(`/api/meetings/${venue}/agenda${params}`)
            .then(res => res.json())
            .then(data => {
                setAgenda(data.items);
                setLoading(false);
            });
    }, [venue, date]);

    if (loading) return <div>Loading agenda...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase">
                    {venue} Agenda
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar size={16} />
                    {date || 'Next scheduled meeting'}
                </div>
            </div>

            <div className="space-y-3">
                {agenda.map((item, idx) => (
                    <div
                        key={item.decision.id}
                        className="p-4 bg-slate-900/60 border border-slate-700 rounded-lg"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-blue-400">
                                    {idx + 1}
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        {item.decision.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {item.decision.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock size={12} />
                                    {item.estimated_duration} min
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <User size={12} />
                                    {item.presenter}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={() => window.location.href = `/smartops/decisions/${item.decision.id}`}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                            >
                                View Analysis
                            </button>
                            <span className="text-xs text-slate-500">
                                {item.decision.options?.length || 0} options prepared
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {agenda.length === 0 && (
                <div className="p-8 text-center text-slate-500 italic">
                    No decisions scheduled for this meeting yet
                </div>
            )}
        </div>
    );
}
```

**Step 3: Add route**

File: `/frontend/src/routes/smartops/meetings/$venue.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { MeetingAgenda } from '@/features/smartops/components/meetings/MeetingAgenda';

export const Route = createFileRoute('/smartops/meetings/$venue')({
    component: MeetingAgendaPage,
});

function MeetingAgendaPage() {
    const { venue } = Route.useParams();

    return (
        <div className="p-8">
            <MeetingAgenda venue={venue} />
        </div>
    );
}
```

---

### Day 9-10: Test and Refine

**Test Scenario 1: Immediate Decision**

1. Create decision with `urgency: "critical"`, deadline 3 hours
2. Should route to "Ad-hoc (Immediate)"
3. Should show `urgency_override: true`
4. Should trigger notification (when you build that)

**Test Scenario 2: Tactical Decision**

1. Create decision with `urgency: "high"`, deadline 24 hours
2. Should route to next brief (morning or evening)
3. Should appear in brief agenda
4. DecisionCard should show "Scheduled: Morning Brief..."

**Test Scenario 3: Operational Decision**

1. Create decision with `urgency: "medium"`, deadline 5 days
2. Should route to next Wednesday DRB
3. Should appear in DRB agenda at `/smartops/meetings/DRB`
4. Staff should see it in advance for coordination

**Acceptance Criteria:**
- ✅ All 3 scenarios route correctly
- ✅ Meeting agenda displays decisions
- ✅ DecisionCard shows "Scheduled for..."
- ✅ Can click to view full analysis
- ✅ No console errors

---

## Week 2: Refinement & Demo

### Day 11-12: Polish & Edge Cases

**Handle edge cases:**

1. **Decision created after meeting already happened today**
   - Should route to next occurrence
   - Test: Create DRB decision on Wednesday at 1700 (after 1400 meeting)
   - Expected: Routes to next Wednesday

2. **Decision deadline before next meeting**
   - Should escalate to more urgent venue
   - Test: Create operational decision on Tuesday with Thursday deadline
   - Expected: Should escalate to daily brief, not wait for Wednesday DRB

3. **No deadline specified**
   - Should default to lowest urgency routing
   - Expected: Routes to next CAB (strategic)

**Add validation:**

```rust
// In routing service
fn validate_routing(&self, decision: &Decision, plan: &RoutingPlan) -> Result<(), RoutingError> {
    // Check if meeting date is before deadline
    if let Some(deadline) = &decision.deadline {
        let deadline_dt = deadline.parse::<chrono::DateTime<Utc>>()?;
        let meeting_dt = combine_date_time(&plan.meeting_date, &plan.meeting_time);
        
        if meeting_dt > deadline_dt {
            return Err(RoutingError::MeetingAfterDeadline {
                meeting: meeting_dt,
                deadline: deadline_dt,
            });
        }
    }
    
    Ok(())
}
```

### Day 13-14: Prepare Demo

**Create demo data:**

File: `/backend/seeds/demo_decisions.sql`

```sql
-- Demo decision for immediate action
INSERT INTO decisions (title, urgency, deadline, description) VALUES
('Emergency Medevac Authorization', 'critical', NOW() + INTERVAL '2 hours',
 'Critical patient requires immediate air evacuation');

-- Demo decision for DRB
INSERT INTO decisions (title, urgency, deadline, description) VALUES
('Move 1 MECH BDE to Sector Beta', 'medium', NOW() + INTERVAL '5 days',
 'Reposition brigade to strengthen defensive posture');

-- Demo decision for CAB
INSERT INTO decisions (title, urgency, deadline, description) VALUES
('Campaign Objective 3 Timeline Adjustment', 'low', NOW() + INTERVAL '14 days',
 'Assess options for getting Objective 3 back on track');
```

**Demo script:**

```markdown
# Decision System Demo - Week 2

## Scenario: Normal Operations Day

### 1. Morning Brief (0630)
**Navigate to:** Dashboard → Critical Actions

**Show:**
- 1 immediate decision (Medevac)
- Routed to "Ad-hoc (Immediate)"
- Click to view options (2 options, recommend approve)

**Commander decides:** Approve medevac
System logs decision, marks as executed

### 2. Staff Work (Morning)
**Navigate to:** /smartops/meetings/DRB

**Show:**
- DRB agenda for Wednesday
- 3 decisions listed:
  1. Move 1 MECH BDE (J3 presenting, 30min)
  2. Intel Collection Priority (J2 presenting, 20min)
  3. Budget Override Request (J4 presenting, 15min)

**Click:** Move 1 MECH BDE → View Analysis
Shows 3 options, recommended option, risk factors

**Action:** J3 staff adds coordination comment
"J4 confirms helicopter availability, no conflicts"

### 3. DRB Meeting (Wednesday 1400)
**Navigate to:** /smartops/meetings/DRB/present

**Show:** Large-screen presentation mode
- Item 1: Move 1 MECH BDE
- Full analysis displayed
- Options comparison visible
- Risk factors highlighted

**Commander:** Asks questions, selects Option 2
System logs decision with justification

### 4. Week-in-Review (Friday 1500)
**Navigate to:** Dashboard → Decision Tracking

**Show:**
- Medevac (Monday): Complete ✅, 95% accuracy
- Move 1 MECH BDE (Wednesday): Executing ⏳, on track

**Metrics:**
- 3 decisions made this week
- 88% average accuracy
- All on schedule
```

**Demo audience:** Commander, COS, J3, J5, IT Lead

**Duration:** 30 minutes

---

## Week 3+: Expand Features

Once core routing works, add:

**Week 3:** Staff coordination tracking  
**Week 4:** Meeting presentation mode (large screen)  
**Week 5:** Outcome tracking by meeting  
**Week 6:** Integration with existing systems  

---

## Common Issues & Solutions

### Issue 1: "Decisions not showing in agenda"

**Check:**
- Is decision routed? Query `decision_routing` table
- Is meeting instance created? Query `meeting_instances`
- Is venue_id correct? Compare with `meeting_venues`

**Fix:**
```sql
-- Check routing
SELECT d.title, dr.venue_id, mv.name
FROM decisions d
LEFT JOIN decision_routing dr ON d.id = dr.decision_id
LEFT JOIN meeting_venues mv ON dr.venue_id = mv.id
WHERE d.id = 'your-decision-id';
```

### Issue 2: "Wrong meeting selected"

**Check:**
- Urgency level correct?
- Deadline hours calculated correctly?
- Meeting schedule matches your HQ?

**Debug:**
```rust
// Add logging to routing function
println!("Decision urgency: {:?}", decision.urgency);
println!("Hours to deadline: {}", hours_to_deadline);
println!("Selected venue: {}", routing_plan.venue_name);
```

### Issue 3: "Meeting agenda empty"

**Check:**
- Are there decisions routed to this meeting?
- Is meeting date correct?
- Is API endpoint working?

**Test:**
```bash
# Test API endpoint
curl http://localhost:3000/api/meetings/DRB/agenda?date=2026-01-22

# Should return JSON with decisions
```

---

## Success Checklist

After Week 1-2, you should have:

- [ ] Meeting venues defined in database
- [ ] Decision routing logic working
- [ ] Decisions auto-route on creation
- [ ] DecisionCard shows "Scheduled for..."
- [ ] Meeting agenda page displays routed decisions
- [ ] Can navigate from agenda to decision analysis
- [ ] Tested with 3 urgency levels
- [ ] Demo ready for stakeholders

---

## Next Steps After Week 2

**Immediate (Week 3):**
- Get stakeholder feedback from demo
- Refine based on your HQ's actual processes
- Add staff coordination tracking

**Short-term (Week 4-6):**
- Build meeting presentation mode
- Add outcome tracking
- Connect to existing systems

**Long-term (Week 8+):**
- Train ML models for prediction
- Add mobile interface for Commander
- Integrate with mission planning tools

---

## Support & Resources

**Code Examples:**
- Full routing service: See Day 3-4 above
- Meeting agenda component: See Day 7-8 above
- All code is in `/backend` and `/frontend` folders

**Documentation:**
- Architecture: `/docs/DECISION_SYSTEM_ARCHITECTURE.md`
- Battle rhythm integration: `/docs/DECISION_SYSTEM_WITH_BATTLE_RHYTHM.md`
- This guide: `/docs/DECISION_SYSTEM_START_GUIDE.md`

**Contact:**
- Technical questions: Check code comments
- Process questions: Review battle rhythm doc
- UX questions: Check dashboard redesign docs

---

**Good luck with implementation! Start with Week 1, Day 1-2 (defining your meeting structure) and work through sequentially.**

_Version: 1.0_  
_Date: 2026-01-21_  
_Status: Ready to start_
