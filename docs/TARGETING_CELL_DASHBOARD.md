# Targeting Cell Dashboard

## Overview

The Targeting Cell Dashboard is a specialized operational command center designed specifically for targeting cell operators. It provides a focused, role-based interface that displays only the most critical information for targeting operations.

## Features

### Key Metrics (Top Row - 5 Cards)
- **Active Targets**: Current number of active targets being tracked (23)
- **Pending Nominations**: Targets awaiting JTB approval (7)
- **Strikes This Week**: Recent strike activity count (12)
- **Target Efficacy**: Overall effectiveness percentage (87%)
- **ROE Status**: Current Rules of Engagement summary showing:
  - 3 ENGAGE (green)
  - 2 RESTRICTED (amber)
  - 1 PROHIBITED (red)

### Priority Targets Panel
Displays high-value targets with detailed information:
- Target ID (e.g., T-2401)
- Target name and description
- Geographic coordinates
- Priority level (CRITICAL, HIGH, MEDIUM)
- Current status (APPROVED, PENDING JTB, IN PLANNING)
- Intelligence confidence level
- Next JTB session date/time

### Recent Strike Assessments
Battle Damage Assessment (BDA) summary showing:
- Strike ID and associated target
- Target name
- Time since strike
- BDA status (DESTROYED, DAMAGED)
- Strike effectiveness percentage

### JTB Sessions (with Tabs)
Joint Targeting Board meeting schedule with four time-based views:
- **Today**: Current day's JTB sessions
- **This Week**: All sessions scheduled for the current week
- **This Month**: Monthly overview grouped by week
- **This Operation**: Full operation phases with aggregate target counts

Each session displays:
- Session date/time (or phase summary)
- Number of targets to be discussed
- Session chair
- Status (SCHEDULED, DRAFT)

### Quick Actions (in Sidebar)
Specialized targeting workflows accessible from the sidebar navigation:
- **Emergency Nomination** - Fast-track urgent target nomination workflow
- **My Pending Targets** - Filtered view showing only user's nominated targets
- **Today's Strike Briefing** - Current day's strike package and briefing materials
- **Generate Target Package** - Export target data and documentation
- **Request CDE Analysis** - Submit Collateral Damage Estimation request

These quick action links appear in a dedicated "Quick Actions" section in the sidebar, only visible to targeting cell users.

## Access

### Automatic Redirection
Users with the `targeting_cell` role are automatically redirected to this dashboard when accessing `/smartops/`.

### Manual Navigation
Targeting cell users can return to this dashboard via the sidebar item:
- **Command Suite → Targeting Cell HQ**

### Required Permissions
- `targeting.view` - View targeting operations

## User Experience Design

### Visual Hierarchy
The dashboard uses a three-column layout:
1. **Left Column (2/3 width)**: JTB Sessions (with tabs), Priority targets, and strike assessments
2. **Right Column (1/3 width)**: Reserved for future content

### Color Coding
- **Blue**: Active/scheduled items
- **Amber**: Pending/draft items
- **Green**: Completed/authorized items
- **Red**: Critical/prohibited items
- **Cyan**: Performance metrics

### Dark Theme
Optimized for 24/7 operations centers with:
- Dark slate background (reduces eye strain)
- High contrast text
- Color-coded status indicators
- Subtle borders and shadows

## Data Sources

Currently displaying mock data. In production, this dashboard would integrate with:
- Target nomination system
- JTB scheduling system
- BDA assessment database
- ROE management system
- Strike planning tools

## Navigation

Targeting cell users have access to a filtered sidebar showing only:
- Targeting Cell HQ (dashboard)
- COP Summary
- Decision Board
- Targeting Board
- Strike Optimizer
- BDA Workbench
- ROE
- Assessment

All other navigation items are hidden to reduce clutter and focus on targeting operations.

## Test Credentials

```
Username/Email: targeting_cell@test.mil
Password: TargetingCell2026!
```

## Technical Implementation

### Frontend Route
- Path: `/smartops/targeting-cell-dashboard`
- Component: `TargetingCellDashboard`
- File: `frontend/src/routes/smartops/targeting-cell-dashboard.tsx`

### Role Detection
- Checks `user.roles` for `targeting_cell` role name
- Automatic redirect implemented in `/smartops/index.tsx`
- Sidebar filtering in `SmartOpsLayout.tsx`

### Components
- `MetricCard`: KPI display cards
- `TargetCard`: Priority target information
- `StrikeAssessmentCard`: BDA summary
- `JTBSessionCard`: Meeting schedule
- `ROEItem`: Rules of engagement status
- `QuickActionButton`: Navigation shortcuts

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live target status
2. **Map Integration**: Geographic visualization of targets
3. **Collaborative Features**: Chat and annotations
4. **Historical Analytics**: Trend analysis and reporting
5. **Mobile Optimization**: Responsive design for tablets
6. **Notification System**: Alerts for critical events
7. **Export Capabilities**: Generate reports and briefings
8. **Integration with Planning Tools**: Direct links to strike planning
