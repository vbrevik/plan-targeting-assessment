# Week 1 Implementation Plan: Decision System + Battle Rhythm

## Goal
By end of week 1, you will have:
- ✅ Meeting structure defined in database
- ✅ Decisions automatically route to appropriate meetings
- ✅ Dashboard shows "Scheduled for: DRB (Wed Jan 22)"
- ✅ Basic meeting agenda view working

---

## Monday: Define Meeting Structure

### Task 1.1: Create Migration File (30 minutes)

Create file: `/backend/migrations/YYYYMMDD_HHMMSS_create_meeting_structure.sql`

(Replace YYYYMMDD_HHMMSS with actual timestamp, e.g., `20260121_140000`)

```sql
-- Meeting structure for battle rhythm integration
-- Version: 1.0
-- Date: 2026-01-21

-- Meeting venues (CAB, DRB, RAB, Daily Briefs)
CREATE TABLE meeting_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20) NOT NULL UNIQUE,
    schedule VARCHAR(100),
    recurrence VARCHAR(20) CHECK (recurrence IN ('daily', 'weekly', 'monthly')),
    authority_level VARCHAR(20) CHECK (authority_level IN ('strategic', 'operational', 'tactical', 'immediate')),
    default_approver VARCHAR(50),
    requires_staff_coordination BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Actual scheduled meeting instances
CREATE TABLE meeting_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES meeting_venues(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    attendees TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(venue_id, scheduled_date)
);

-- Route decisions to meetings
CREATE TABLE decision_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id),
    venue_id UUID REFERENCES meeting_venues(id),
    meeting_instance_id UUID REFERENCES meeting_instances(id),
    agenda_order INT,
    presenter VARCHAR(100),
    estimated_duration INT DEFAULT 15,
    routing_reason TEXT,
    routed_at TIMESTAMP DEFAULT NOW(),
    presented_at TIMESTAMP,
    decided_at TIMESTAMP
);

-- Staff section coordination
CREATE TABLE staff_coordination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id),
    section VARCHAR(10) NOT NULL CHECK (section IN ('J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J8')),
    coordinator_user_id UUID,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'non_concur')),
    comments TEXT,
    priority VARCHAR(20) CHECK (priority IN ('blocking', 'informational')),
    coordinated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Seed standard meeting venues
INSERT INTO meeting_venues (name, short_name, schedule, recurrence, authority_level, default_approver, requires_staff_coordination) VALUES
('Campaign Assessment Board', 'CAB', 'Monday 0800-0900', 'weekly', 'strategic', 'commander', true),
('Decision Review Board', 'DRB', 'Wednesday 1400-1600', 'weekly', 'operational', 'commander', true),
('Resource Allocation Board', 'RAB', 'Friday 0900-1000', 'weekly', 'tactical', 'deputy', false),
('Morning Update Brief', 'Morning Brief', 'Daily 0630-0700', 'daily', 'tactical', 'commander', false),
('Evening Update Brief', 'Evening Brief', 'Daily 1730-1800', 'daily', 'tactical', 'watch', false);

-- Add ROE status to decisions table (if not already present)
ALTER TABLE decisions 
ADD COLUMN IF NOT EXISTS roe_status VARCHAR(30) 
    CHECK (roe_status IN (
        'within_approved_roe', 
        'requires_roe_release', 
        'roe_pending_approval',
        'roe_approved',
        'roe_rejected'
    )),
ADD COLUMN IF NOT EXISTS roe_notes TEXT,
ADD COLUMN IF NOT EXISTS roe_request_id UUID;

-- Create ROE requests tracking table
CREATE TABLE IF NOT EXISTS roe_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id),
    requested_by UUID,
    requested_at TIMESTAMP DEFAULT NOW(),
    approval_authority VARCHAR(100),
    request_justification TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    roe_reference VARCHAR(100),
    expiration_date TIMESTAMP,
    conditions TEXT
);

-- Create indexes for ROE tracking
CREATE INDEX IF NOT EXISTS idx_decisions_roe_status ON decisions(roe_status);
CREATE INDEX IF NOT EXISTS idx_roe_requests_decision ON roe_requests(decision_id);
CREATE INDEX IF NOT EXISTS idx_roe_requests_status ON roe_requests(status);

-- Create indexes for common queries
CREATE INDEX idx_decision_routing_decision ON decision_routing(decision_id);
CREATE INDEX idx_decision_routing_venue ON decision_routing(venue_id);
CREATE INDEX idx_decision_routing_meeting ON decision_routing(meeting_instance_id);
CREATE INDEX idx_meeting_instances_venue_date ON meeting_instances(venue_id, scheduled_date);
CREATE INDEX idx_staff_coordination_decision ON staff_coordination(decision_id);
CREATE INDEX idx_staff_coordination_section ON staff_coordination(section);
```

### Task 1.2: Run Migration (5 minutes)

```bash
cd backend

# If using sqlx
sqlx migrate run

# Or manually
psql -U your_user -d your_database -f migrations/YYYYMMDD_HHMMSS_create_meeting_structure.sql
```

### Task 1.3: Verify (5 minutes)

```sql
-- Check venues were created
SELECT * FROM meeting_venues;

-- Should show 5 venues: CAB, DRB, RAB, Morning Brief, Evening Brief
```

---

## Tuesday: Backend Routing Logic

### Task 2.1: Create Routing Module (2 hours)

Create file: `/backend/src/features/decisions/routing.rs`

```rust
use chrono::{Datelike, Duration, NaiveDate, NaiveTime, Utc, Weekday};
use sqlx::PgPool;
use uuid::Uuid;

use super::models::{Decision, Urgency};

#[derive(Debug, Clone)]
pub struct RoutingPlan {
    pub venue_id: Option<Uuid>,
    pub venue_name: String,
    pub meeting_date: NaiveDate,
    pub meeting_time: NaiveTime,
    pub routing_reason: String,
    pub urgency_override: bool,
}

pub struct DecisionRouter {
    pool: PgPool,
}

impl DecisionRouter {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Route decision to appropriate meeting based on urgency and timeline
    pub async fn route_decision(&self, decision: &Decision) -> Result<RoutingPlan, sqlx::Error> {
        let hours_to_deadline = self.calculate_hours_to_deadline(decision);

        let plan = match decision.urgency {
            Urgency::Critical if hours_to_deadline < 6 => {
                self.route_immediate(decision)
            },
            Urgency::High if hours_to_deadline < 48 => {
                self.route_to_next_brief(decision).await?
            },
            Urgency::Medium | Urgency::High if hours_to_deadline < 168 => {
                self.route_to_drb(decision).await?
            },
            _ => {
                self.route_to_cab(decision).await?
            }
        };

        Ok(plan)
    }

    fn route_immediate(&self, decision: &Decision) -> RoutingPlan {
        let now = Utc::now();
        
        RoutingPlan {
            venue_id: None,
            venue_name: "Ad-hoc (Immediate)".to_string(),
            meeting_date: now.date_naive(),
            meeting_time: now.time(),
            routing_reason: format!(
                "Critical decision with {}h deadline requires immediate Commander attention",
                self.calculate_hours_to_deadline(decision)
            ),
            urgency_override: true,
        }
    }

    async fn route_to_next_brief(&self, decision: &Decision) -> Result<RoutingPlan, sqlx::Error> {
        let now = Utc::now();
        let current_time = now.time();
        
        let morning_brief = NaiveTime::from_hms_opt(6, 30, 0).unwrap();
        let evening_brief = NaiveTime::from_hms_opt(17, 30, 0).unwrap();

        let (next_date, next_time, venue_short_name) = 
            if current_time < morning_brief {
                (now.date_naive(), morning_brief, "Morning Brief")
            } else if current_time < evening_brief {
                (now.date_naive(), evening_brief, "Evening Brief")
            } else {
                (now.date_naive() + Duration::days(1), morning_brief, "Morning Brief")
            };

        // Look up venue from database
        let venue = sqlx::query!(
            "SELECT id, name FROM meeting_venues WHERE short_name = $1",
            venue_short_name
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(RoutingPlan {
            venue_id: Some(venue.id),
            venue_name: venue.name,
            meeting_date: next_date,
            meeting_time: next_time,
            routing_reason: format!(
                "High urgency decision routed to next daily brief"
            ),
            urgency_override: false,
        })
    }

    async fn route_to_drb(&self, decision: &Decision) -> Result<RoutingPlan, sqlx::Error> {
        let next_wednesday = self.find_next_weekday(Weekday::Wed, NaiveTime::from_hms_opt(14, 0, 0).unwrap());
        
        let venue = sqlx::query!(
            "SELECT id, name FROM meeting_venues WHERE short_name = 'DRB'"
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(RoutingPlan {
            venue_id: Some(venue.id),
            venue_name: venue.name,
            meeting_date: next_wednesday.0,
            meeting_time: next_wednesday.1,
            routing_reason: "Operational decision requiring Commander approval at DRB".to_string(),
            urgency_override: false,
        })
    }

    async fn route_to_cab(&self, decision: &Decision) -> Result<RoutingPlan, sqlx::Error> {
        let next_monday = self.find_next_weekday(Weekday::Mon, NaiveTime::from_hms_opt(8, 0, 0).unwrap());
        
        let venue = sqlx::query!(
            "SELECT id, name FROM meeting_venues WHERE short_name = 'CAB'"
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(RoutingPlan {
            venue_id: Some(venue.id),
            venue_name: venue.name,
            meeting_date: next_monday.0,
            meeting_time: next_monday.1,
            routing_reason: "Strategic decision affecting campaign, routed to CAB".to_string(),
            urgency_override: false,
        })
    }

    fn find_next_weekday(&self, target: Weekday, time: NaiveTime) -> (NaiveDate, NaiveTime) {
        let now = Utc::now();
        let current_weekday = now.weekday();
        
        let days_until = if current_weekday == target && now.time() < time {
            0  // Today, meeting hasn't happened yet
        } else {
            let current = current_weekday.num_days_from_monday();
            let target = target.num_days_from_monday();
            
            if target > current {
                target - current
            } else {
                7 - (current - target)
            }
        };

        let date = now.date_naive() + Duration::days(days_until as i64);
        (date, time)
    }

    fn calculate_hours_to_deadline(&self, decision: &Decision) -> i64 {
        if let Some(deadline) = &decision.deadline {
            let now = Utc::now();
            // Assuming deadline is stored as ISO string
            if let Ok(deadline_dt) = deadline.parse::<chrono::DateTime<Utc>>() {
                let duration = deadline_dt - now;
                return duration.num_hours().max(0);
            }
        }
        9999  // No deadline or parse error = low urgency
    }

    /// Save routing plan to database
    pub async fn save_routing(
        &self,
        decision_id: &Uuid,
        plan: &RoutingPlan
    ) -> Result<(), sqlx::Error> {
        
        // Get or create meeting instance
        let meeting_instance_id = if let Some(venue_id) = plan.venue_id {
            let instance = sqlx::query!(
                r#"
                INSERT INTO meeting_instances (venue_id, scheduled_date, scheduled_time)
                VALUES ($1, $2, $3)
                ON CONFLICT (venue_id, scheduled_date) DO UPDATE SET venue_id = $1
                RETURNING id
                "#,
                venue_id,
                plan.meeting_date,
                plan.meeting_time
            )
            .fetch_one(&self.pool)
            .await?;
            
            Some(instance.id)
        } else {
            None
        };

        // Save routing
        sqlx::query!(
            r#"
            INSERT INTO decision_routing 
            (decision_id, venue_id, meeting_instance_id, routing_reason, routed_at)
            VALUES ($1, $2, $3, $4, NOW())
            "#,
            decision_id,
            plan.venue_id,
            meeting_instance_id,
            plan.routing_reason
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
```

### Task 2.2: Integrate with Decision Service (30 minutes)

File: `/backend/src/features/decisions/services.rs` (or wherever your decision service is)

```rust
use super::routing::DecisionRouter;

pub struct DecisionService {
    pool: PgPool,
    router: DecisionRouter,
}

impl DecisionService {
    pub fn new(pool: PgPool) -> Self {
        let router = DecisionRouter::new(pool.clone());
        Self { pool, router }
    }

    /// Create a new decision and auto-route it
    pub async fn create_decision(&self, request: CreateDecisionRequest) -> Result<Decision, Error> {
        // 1. Create decision in database
        let decision = sqlx::query_as!(
            Decision,
            r#"
            INSERT INTO decisions (title, description, urgency, complexity, deadline, category, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            "#,
            request.title,
            request.description,
            request.urgency,
            request.complexity,
            request.deadline,
            request.category,
            request.created_by
        )
        .fetch_one(&self.pool)
        .await?;

        // 2. Auto-route the decision
        let routing_plan = self.router.route_decision(&decision).await?;
        self.router.save_routing(&decision.id, &routing_plan).await?;

        // 3. If urgent, send notification (TODO: implement notification service)
        if routing_plan.urgency_override {
            log::warn!("URGENT DECISION: {} requires immediate Commander attention", decision.title);
            // TODO: Send SMS/mobile notification
        }

        Ok(decision)
    }

    /// Get decision with routing information
    pub async fn get_decision_with_routing(&self, id: &Uuid) -> Result<DecisionWithRouting, Error> {
        let decision = self.get_decision(id).await?;
        
        let routing = sqlx::query!(
            r#"
            SELECT 
                dr.venue_id,
                mv.name as venue_name,
                mv.short_name,
                mi.scheduled_date,
                mi.scheduled_time,
                dr.routing_reason,
                dr.presenter,
                dr.estimated_duration
            FROM decision_routing dr
            LEFT JOIN meeting_venues mv ON dr.venue_id = mv.id
            LEFT JOIN meeting_instances mi ON dr.meeting_instance_id = mi.id
            WHERE dr.decision_id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(DecisionWithRouting {
            decision,
            routing: routing.map(|r| RoutingInfo {
                venue_id: r.venue_id,
                venue_name: r.venue_name.unwrap_or_else(|| "Ad-hoc".to_string()),
                meeting_date: r.scheduled_date,
                meeting_time: r.scheduled_time,
                routing_reason: r.routing_reason,
                presenter: r.presenter,
                estimated_duration: r.estimated_duration,
            }),
        })
    }
}
```

### Task 2.3: Add to Module (10 minutes)

File: `/backend/src/features/decisions/mod.rs`

```rust
pub mod routing;

pub use routing::{DecisionRouter, RoutingPlan};
```

---

## Wednesday: Frontend Integration

### Task 3.1: Update Types (15 minutes)

File: `/frontend/src/lib/smartops/types.ts`

```typescript
// Add to Decision interface (around line 1140)
export interface Decision {
    id: UUID;
    title: string;
    description: string;
    urgency: DecisionUrgency;
    complexity: DecisionComplexity;
    deadline?: string;
    context: DecisionContext;
    options: DecisionOption[];
    riskFactors: RiskFactor[];
    requiredApprovers: string[];
    status: DecisionStatus;
    createdAt: string;
    createdBy: string;
    
    // NEW: Routing information
    routing?: DecisionRouting;
}

// NEW: Routing types
export interface DecisionRouting {
    venue_id?: string;
    venue_name: string;
    meeting_date?: string;  // ISO date
    meeting_time?: string;  // "14:00"
    routing_reason: string;
    presenter?: string;
    estimated_duration?: number;
    urgency_override: boolean;
}

export interface MeetingVenue {
    id: UUID;
    name: string;
    short_name: string;
    schedule: string;
    recurrence: 'daily' | 'weekly' | 'monthly';
    authority_level: 'strategic' | 'operational' | 'tactical' | 'immediate';
    default_approver: string;
    requires_staff_coordination: boolean;
}

export interface AgendaItem {
    decision: Decision;
    order: number;
    presenter: string;
    estimated_duration: number;
}

export interface MeetingAgenda {
    venue_name: string;
    venue_short_name: string;
    date: string;
    time: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    items: AgendaItem[];
    total_duration: number;
    coordination_status?: {
        all_complete: boolean;
        blocking_issues: number;
    };
}
```

### Task 3.2: Update DecisionCard (30 minutes)

File: `/frontend/src/features/smartops/components/decisions/DecisionCard.tsx`

Add after the deadline display (around line 80):

```typescript
import { Calendar } from 'lucide-react';

// ... in the render section, after deadline ...

{/* Routing Information */}
{decision.routing && (
    <div className="mt-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2 text-[9px]">
            <Calendar size={10} className="text-blue-400" />
            <span className="text-slate-500">Scheduled:</span>
            <span className="text-blue-400 font-bold uppercase">
                {decision.routing.venue_name}
            </span>
            {decision.routing.meeting_date && (
                <span className="text-slate-500">
                    {new Date(decision.routing.meeting_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    })}
                    {' '}
                    {decision.routing.meeting_time}
                </span>
            )}
        </div>
        {decision.routing.urgency_override && (
            <div className="mt-1 flex items-center gap-1 text-[8px] text-red-400 font-bold">
                <AlertTriangle size={8} />
                IMMEDIATE ATTENTION REQUIRED
            </div>
        )}
    </div>
)}
```

Don't forget to add import:
```typescript
import { Calendar, AlertTriangle } from 'lucide-react'; // Add Calendar
```

### Task 3.3: Update Mock Service (20 minutes)

File: `/frontend/src/lib/smartops/services/decision.service.ts`

Update mock decisions to include routing:

```typescript
const MOCK_DECISIONS: Decision[] = [
    {
        id: 'decision-strike-t1002',
        title: 'Strike T-1002 Authorization',
        description: 'High-value enemy command post, time-sensitive target',
        urgency: 'critical',
        complexity: 'high',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        // ... other fields ...
        
        // NEW: Add routing info
        routing: {
            venue_name: 'Ad-hoc (Immediate)',
            routing_reason: 'Critical decision with 6h deadline requires immediate attention',
            urgency_override: true
        }
    },
    {
        id: 'decision-move-mech',
        title: 'Move 1 MECH BDE to Sector Beta',
        description: 'Strengthen defensive posture',
        urgency: 'medium',
        complexity: 'medium',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
        // ... other fields ...
        
        // NEW: Add routing info
        routing: {
            venue_name: 'Decision Review Board',
            meeting_date: '2026-01-22', // Next Wednesday
            meeting_time: '14:00',
            routing_reason: 'Operational decision requiring Commander approval',
            presenter: 'J3 Director (Col Anderson)',
            estimated_duration: 30,
            urgency_override: false
        }
    }
];
```

---

## Thursday: Meeting Agenda Component

### Task 4.1: Create MeetingService (30 minutes)

File: `/frontend/src/lib/smartops/services/meeting.service.ts`

```typescript
import type { MeetingAgenda, MeetingVenue } from '../types';

export const MeetingService = {
    getVenues: async (): Promise<MeetingVenue[]> => {
        // TODO: Replace with real API call
        return [
            {
                id: 'venue-cab',
                name: 'Campaign Assessment Board',
                short_name: 'CAB',
                schedule: 'Monday 0800-0900',
                recurrence: 'weekly',
                authority_level: 'strategic',
                default_approver: 'commander',
                requires_staff_coordination: true
            },
            {
                id: 'venue-drb',
                name: 'Decision Review Board',
                short_name: 'DRB',
                schedule: 'Wednesday 1400-1600',
                recurrence: 'weekly',
                authority_level: 'operational',
                default_approver: 'commander',
                requires_staff_coordination: true
            },
            {
                id: 'venue-rab',
                name: 'Resource Allocation Board',
                short_name: 'RAB',
                schedule: 'Friday 0900-1000',
                recurrence: 'weekly',
                authority_level: 'tactical',
                default_approver: 'deputy',
                requires_staff_coordination: false
            }
        ];
    },

    getAgenda: async (venue: string, date?: string): Promise<MeetingAgenda> => {
        // TODO: Replace with real API call
        // For now, return mock data
        
        const mockDecisions = await import('./decision.service').then(m => 
            m.DecisionService.getPendingDecisions()
        );
        
        // Filter decisions routed to this venue
        const routedDecisions = mockDecisions.filter(d => 
            d.routing?.venue_name.includes(venue) ||
            d.routing?.venue_name.includes(venue.toUpperCase())
        );

        return {
            venue_name: venue,
            venue_short_name: venue,
            date: date || new Date().toISOString().split('T')[0],
            time: '14:00',
            status: 'scheduled',
            items: routedDecisions.map((decision, idx) => ({
                decision,
                order: idx + 1,
                presenter: decision.routing?.presenter || 'TBD',
                estimated_duration: decision.routing?.estimated_duration || 15
            })),
            total_duration: routedDecisions.reduce((sum, d) => 
                sum + (d.routing?.estimated_duration || 15), 0
            )
        };
    }
};
```

### Task 4.2: Create Meeting Agenda Component (1 hour)

**Already created in START_GUIDE, but add these enhancements:**

File: `/frontend/src/features/smartops/components/meetings/MeetingAgenda.tsx`

Add coordination status indicator:

```typescript
{/* After agenda items, add coordination summary */}
<div className="mt-6 p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg">
    <h3 className="text-sm font-bold text-white mb-3">
        Staff Coordination Status
    </h3>
    <div className="space-y-2">
        {agenda.items.map(item => (
            <div key={item.decision.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{item.decision.title}</span>
                <span className={cn(
                    "px-2 py-1 rounded text-[9px] font-bold",
                    item.decision.coordination_complete 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-amber-500/20 text-amber-400"
                )}>
                    {item.decision.coordination_complete ? 'COORDINATED ✅' : 'PENDING ⏳'}
                </span>
            </div>
        ))}
    </div>
</div>
```

### Task 4.3: Add Route (15 minutes)

File: `/frontend/src/routes/smartops/meetings.$venue.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { MeetingAgenda } from '@/features/smartops/components/meetings/MeetingAgenda';

export const Route = createFileRoute('/smartops/meetings/$venue')({
    component: MeetingAgendaPage,
});

function MeetingAgendaPage() {
    const { venue } = Route.useParams();
    const searchParams = Route.useSearch() as { date?: string };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-5xl mx-auto">
                <MeetingAgenda venue={venue} date={searchParams.date} />
            </div>
        </div>
    );
}
```

---

## Friday: Test & Demo Prep

### Task 5.1: Create Test Scenarios (1 hour)

File: `/backend/tests/decision_routing_test.rs`

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_immediate_decision_routes_to_adhoc() {
        let pool = setup_test_db().await;
        let router = DecisionRouter::new(pool);
        
        let decision = Decision {
            id: Uuid::new_v4(),
            urgency: Urgency::Critical,
            deadline: Some(chrono::Utc::now() + chrono::Duration::hours(3)),
            ..Default::default()
        };

        let plan = router.route_decision(&decision).await.unwrap();
        
        assert_eq!(plan.venue_name, "Ad-hoc (Immediate)");
        assert_eq!(plan.urgency_override, true);
    }

    #[tokio::test]
    async fn test_operational_decision_routes_to_drb() {
        let pool = setup_test_db().await;
        let router = DecisionRouter::new(pool);
        
        let decision = Decision {
            id: Uuid::new_v4(),
            urgency: Urgency::Medium,
            deadline: Some(chrono::Utc::now() + chrono::Duration::days(5)),
            ..Default::default()
        };

        let plan = router.route_decision(&decision).await.unwrap();
        
        assert_eq!(plan.venue_name, "Decision Review Board");
        assert_eq!(plan.urgency_override, false);
        // Should route to next Wednesday
        assert_eq!(plan.meeting_date.weekday(), Weekday::Wed);
    }

    #[tokio::test]
    async fn test_strategic_decision_routes_to_cab() {
        let pool = setup_test_db().await;
        let router = DecisionRouter::new(pool);
        
        let decision = Decision {
            id: Uuid::new_v4(),
            urgency: Urgency::Low,
            deadline: Some(chrono::Utc::now() + chrono::Duration::days(14)),
            ..Default::default()
        };

        let plan = router.route_decision(&decision).await.unwrap();
        
        assert_eq!(plan.venue_name, "Campaign Assessment Board");
        // Should route to next Monday
        assert_eq!(plan.meeting_date.weekday(), Weekday::Mon);
    }
}
```

### Task 5.2: Manual Testing (1 hour)

**Test Plan:**

1. **Start services**
```bash
# Terminal 1: Backend
cd backend
cargo run

# Terminal 2: Frontend
cd frontend
npm run dev
```

2. **Create test decision (API)**
```bash
curl -X POST http://localhost:3000/api/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Operational Decision",
    "description": "Testing routing to DRB",
    "urgency": "medium",
    "complexity": "medium",
    "deadline": "2026-01-27T12:00:00Z",
    "category": "operational"
  }'
```

3. **View in dashboard**
- Navigate to `http://localhost:5173/smartops/`
- Should see decision in Critical Actions
- Should show "Scheduled: Decision Review Board (Jan 22, 14:00)"

4. **View in meeting agenda**
- Navigate to `http://localhost:5173/smartops/meetings/DRB`
- Should see decision in agenda
- Click "View Analysis" → Should open DecisionAnalysisPanel

### Task 5.3: Prepare Demo (1 hour)

Create demo script: `/docs/WEEK_1_DEMO_SCRIPT.md`

```markdown
# Week 1 Demo: Decision Routing & Meeting Integration

## Duration: 20 minutes

## Attendees
- Commander
- Chief of Staff
- J3 Director
- J5 Plans
- IT Lead

## Demo Flow

### Part 1: Dashboard View (5 min)

**Narrative:** "We now automatically route decisions to appropriate meetings"

1. Show dashboard at `/smartops/`
2. Point out 2 pending decisions in Critical Actions
3. **Decision 1:** "Strike T-1002" - shows "Ad-hoc (Immediate)" because deadline is 6h
4. **Decision 2:** "Move 1 MECH BDE" - shows "Scheduled: DRB (Jan 22)"

**Key point:** System automatically determines routing based on urgency

### Part 2: Meeting Agenda (7 min)

**Narrative:** "Staff can see what's coming in upcoming meetings"

1. Navigate to `/smartops/meetings/DRB`
2. Show Wednesday DRB agenda
3. Shows 3 decisions:
   - Move 1 MECH BDE (J3 presenting, 30 min)
   - Intel Priority (J2 presenting, 20 min)
   - Budget Override (J4 presenting, 15 min)
4. Total duration: 65 minutes
5. Click "View Analysis" on Move MECH BDE
6. Opens full decision analysis panel

**Key point:** Pre-loaded agendas save meeting prep time

### Part 3: Different Urgency Levels (5 min)

**Narrative:** "Different urgency levels route to different venues"

Show comparison:
- Critical (< 6h): Ad-hoc → Commander immediately
- High (< 48h): Daily Brief → Commander at next brief
- Medium (2-7d): DRB → Commander at Wednesday
- Low (1-4w): CAB → Commander at Monday

**Key point:** Right decision goes to right forum

### Part 4: Next Steps (3 min)

**Review:**
- ✅ Core routing working
- ✅ Meeting agendas displaying
- ⬜ Next: Staff coordination (Week 3-4)
- ⬜ Next: Presentation mode (Week 5-6)

**Questions?**
```

---

## Week 1 Completion Checklist

By end of Friday, you should have:

### Backend
- [x] Migration file created with 4 new tables
- [x] Migration run successfully
- [x] 5 meeting venues in database (CAB, DRB, RAB, 2 Briefs)
- [x] `routing.rs` module created
- [x] DecisionRouter struct implemented
- [x] Auto-routing on decision creation
- [x] Unit tests for routing logic

### Frontend
- [x] Decision type updated with routing field
- [x] DecisionCard shows "Scheduled for..."
- [x] MeetingService created
- [x] MeetingAgenda component created
- [x] Route `/smartops/meetings/:venue` created
- [x] Mock data includes routing info

### Testing
- [x] 3 unit tests passing (immediate, operational, strategic)
- [x] Manual test: Create decision via API
- [x] Manual test: See decision in dashboard with routing
- [x] Manual test: View meeting agenda
- [x] No console errors

### Documentation
- [x] Demo script prepared
- [x] Test scenarios documented
- [x] Known issues list started

### Demo
- [x] Demo environment ready (backend + frontend running)
- [x] Test data loaded
- [x] Demo script practiced
- [x] Stakeholder meeting scheduled

---

## If You Get Stuck

### Issue: "Can't run migration"

```bash
# Check if sqlx is set up
cargo sqlx --version

# If not using sqlx, run manually
psql -U postgres -d your_db_name -f migrations/xxx_create_meeting_structure.sql
```

### Issue: "Routing not showing in frontend"

**Debug:**
1. Check backend logs: Is routing being saved?
2. Check API response: Does it include routing field?
3. Check frontend console: Any errors?

```typescript
// Add debug logging to decision service
console.log('Decision loaded:', decision);
console.log('Routing info:', decision.routing);
```

### Issue: "Wrong meeting selected"

**Debug routing logic:**

```rust
// Add to route_decision function
println!("Urgency: {:?}", decision.urgency);
println!("Deadline: {:?}", decision.deadline);
println!("Hours to deadline: {}", hours_to_deadline);
println!("Selected venue: {}", plan.venue_name);
```

---

## Week 2 Preview

**What you'll build:**
- Staff coordination tracking
- "Coordinated by J3 ✅" indicators
- Blocking vs. informational coordination
- Working Group dashboard

**When to start:** Monday of Week 2, after Week 1 demo feedback

---

## Key Files Reference

**Backend:**
- Migration: `/backend/migrations/YYYYMMDD_create_meeting_structure.sql`
- Routing logic: `/backend/src/features/decisions/routing.rs`
- Service integration: `/backend/src/features/decisions/services.rs`
- Tests: `/backend/tests/decision_routing_test.rs`

**Frontend:**
- Types: `/frontend/src/lib/smartops/types.ts` (add routing types)
- DecisionCard: `/frontend/src/features/smartops/components/decisions/DecisionCard.tsx` (add routing display)
- MeetingAgenda: `/frontend/src/features/smartops/components/meetings/MeetingAgenda.tsx` (new component)
- MeetingService: `/frontend/src/lib/smartops/services/meeting.service.ts` (new service)
- Route: `/frontend/src/routes/smartops/meetings.$venue.tsx` (new route)

---

**You're ready to start! Begin with Monday Task 1.1 (Create migration file).**

_Version: 1.0_  
_Date: 2026-01-21_  
_Status: Ready for Week 1 kickoff_
