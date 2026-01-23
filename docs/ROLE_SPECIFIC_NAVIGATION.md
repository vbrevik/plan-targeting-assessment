# Role-Specific Navigation & Dashboards

## Overview

Each role in the SmartOps system has its own dedicated dashboard and tailored sidebar navigation. When users log in or switch roles, they are automatically directed to their role-specific dashboard with relevant navigation options.

---

## Auto-Routing on Login/Role Switch

### How It Works

1. **User logs in or switches role** → Role stored in `localStorage` via `RoleContext`
2. **SmartOps index route** (`/smartops/`) detects the current role
3. **Automatic redirect** to role-specific dashboard
4. **Sidebar navigation** updates to show role-relevant items

### Routing Map

| Role | Dashboard Route | Dashboard Name |
|------|----------------|----------------|
| **Commander** | `/smartops/cop-summary` | Command Dashboard |
| **J2 Intel** | `/smartops/j2-dashboard` | J2 Intelligence Operations Center |
| **J3 Ops** | `/smartops/j3-dashboard` | J3 Operations Center |
| **J5 Plans** | `/smartops/j5-dashboard` | J5 Strategic Plans Center |
| **J4 Log** | `/smartops/j4-dashboard` | J4 Logistics Center |
| **LEGAD** | `/smartops/legad-dashboard` | Legal Advisory Center |
| **Targeting Cell** | `/smartops/targeting-cell-dashboard` | Targeting Dashboard |
| **Analyst** | `/smartops/analyst-dashboard` | Analyst Workspace |

---

## Role-Specific Sidebars

### Commander (CDR) 🔴

**Default Dashboard**: Command Dashboard (`/smartops/cop-summary`)

**Sidebar Navigation**:

```
📁 Command Suite
   ├─ Command Dashboard
   ├─ Cognitive Readiness
   ├─ Decision Board
   ├─ Strategic Direction
   └─ CCIR Manager

📁 Operations & Targeting
   ├─ Battle Rhythm
   ├─ Targeting Board
   ├─ ROE
   └─ BDA Workbench

📁 Planning & Intelligence
   ├─ OPLAN Manager
   ├─ Planning Assumptions
   ├─ Uncertainty
   └─ Overview Picture
```

**Focus**: High-level command overview, decision authority, approval workflows

---

### J2 Intelligence Officer 🔵

**Default Dashboard**: J2 Operations Center (`/smartops/j2-dashboard`)

**Sidebar Navigation**:

```
📁 J2 Dashboard
   └─ J2 Operations Center ⭐

📁 Intelligence Management
   ├─ Uncertainty Analysis
   ├─ RXP Overview
   ├─ Social Domain
   ├─ Digital Twin
   ├─ Sensor Triage
   └─ ORBAT

📁 Support & Coordination
   ├─ RFI Management
   ├─ COP Summary
   ├─ Battle Rhythm
   └─ Environment
```

**Focus**: Intelligence collection, analysis, uncertainty management, intel fusion

**Key Capabilities**: 
- ✅ Edit intelligence assessments
- ✅ Submit RFIs
- ✅ Update uncertainty data

---

### J3 Operations Officer 🟢

**Default Dashboard**: J3 Operations Center (`/smartops/j3-dashboard`)

**Sidebar Navigation**:

```
📁 J3 Dashboard
   └─ J3 Operations Center ⭐

📁 Current Operations
   ├─ Battle Rhythm
   ├─ Proposals
   ├─ RFI Management
   ├─ Combat Net Radio
   └─ Targeting Board

📁 Situational Awareness
   ├─ COP Summary
   ├─ ORBAT
   ├─ RXP Overview
   └─ Environment
```

**Focus**: Current operations execution, battle rhythm management, tactical coordination

**Key Capabilities**:
- ✅ Edit operations
- ✅ Submit proposals
- ✅ Request supplies
- ✅ Update battle rhythm

---

### J5 Plans Officer 🟣

**Default Dashboard**: J5 Strategic Plans Center (`/smartops/j5-dashboard`)

**Sidebar Navigation**:

```
📁 J5 Dashboard
   └─ J5 Plans Center ⭐

📁 Strategic Planning
   ├─ OPLAN Manager
   ├─ Planning Assumptions ⭐⭐
   ├─ Campaign Design
   ├─ CONOPS Builder
   ├─ CoA Wargamer
   └─ COG Analysis

📁 Coordination & Intel
   ├─ Uncertainty
   ├─ RXP Overview
   ├─ COP Summary
   └─ Battle Rhythm
```

**Focus**: Long-term planning, OPLAN development, assumption management, campaign design

**Key Capabilities**:
- ✅ Edit OPLANs
- ✅ **Manage Planning Assumptions** (Primary Authority)
- ✅ Edit campaigns and CONOPS
- ✅ Submit proposals

**Special Note**: J5 is the PRIMARY role for managing Planning Assumptions!

---

### J4 Logistics Officer 🟠

**Default Dashboard**: J4 Logistics Center (`/smartops/j4-dashboard`)

**Sidebar Navigation**:

```
📁 J4 Dashboard
   └─ J4 Logistics Center ⭐

📁 Logistics Management
   ├─ Supply Status
   ├─ Critical Infrastructure
   └─ Supply Network

📁 Coordination
   ├─ Proposals
   ├─ Battle Rhythm
   └─ COP Summary
```

**Focus**: Supply chain management, logistics planning, infrastructure monitoring

**Key Capabilities**:
- ✅ Edit logistics data
- ✅ Request resupply
- ✅ Update infrastructure status
- ✅ Submit proposals

**Restrictions**: No access to targeting or legal (security/relevance)

---

### LEGAD (Legal Advisor) ⚫

**Default Dashboard**: Legal Advisory Center (`/smartops/legad-dashboard`)

**Sidebar Navigation**:

```
📁 LEGAD Dashboard
   └─ Legal Advisory Center ⭐

📁 Legal Reviews
   ├─ Advisory Queue
   ├─ ROE Management
   ├─ Decision Board
   └─ Targeting Review

📁 Situational Awareness
   ├─ COP Summary
   └─ Battle Rhythm
```

**Focus**: Legal review, ROE guidance, compliance oversight, targeting legality

**Key Capabilities**:
- ✅ Edit legal reviews
- ✅ Approve ROE changes
- ✅ Approve command decisions
- ✅ Review targeting for legal compliance

**Restrictions**: Cannot submit proposals or edit operations/intel/plans

---

### Targeting Cell (TC) 🟠

**Default Dashboard**: Targeting Dashboard (`/smartops/targeting-cell-dashboard`)

**Sidebar Navigation**:

```
📁 Targeting Cell HQ
   └─ Targeting Dashboard ⭐

📁 Quick Actions
   ├─ Emergency Nomination
   ├─ My Pending Targets
   ├─ Today's Strike Briefing
   ├─ Generate Target Package
   └─ Request CDE Analysis

📁 Targeting Operations
   ├─ Targeting Board
   ├─ BDA Workbench
   ├─ ROE Reference
   ├─ A2/AD Analysis
   └─ Strike Optimizer

📁 Intelligence Support
   ├─ RXP Overview
   ├─ ORBAT
   ├─ Uncertainty
   └─ COP Summary
```

**Focus**: Target nomination, strike planning, BDA, tactical targeting

**Key Capabilities**:
- ✅ Edit targets (nominate, update, withdraw)
- ✅ Submit proposals
- ✅ Update BDA
- ❌ Cannot approve targets (CDR only)

**Special Features**: Dedicated "Quick Actions" section for rapid targeting workflows

---

### Intelligence Analyst (ANLY) 🔵

**Default Dashboard**: Analyst Workspace (`/smartops/analyst-dashboard`)

**Sidebar Navigation**:

```
📁 Analyst Workspace
   └─ My Dashboard ⭐

📁 Analysis Tools (Read-Only)
   ├─ COP Summary
   ├─ RXP Overview
   ├─ ORBAT
   └─ Environment
```

**Focus**: Task-focused analysis, read-only access, limited scope

**Capabilities**:
- ✅ View assigned tasks
- ✅ View COP and ORBAT
- ❌ Cannot edit anything
- ❌ Cannot submit proposals
- ❌ No access to logistics, legal, or targeting details

**Special UI**: Blue information banner indicating read-only access level

---

## Navigation Behavior

### Active Route Highlighting

The sidebar automatically highlights the current active route:
- **Exact match**: Route exactly matches current path
- **Prefix match**: Current path starts with route + `/`
- **Special handling**: `/smartops` homepage doesn't match everything

Example:
```
Current Path: /smartops/targeting-cell-dashboard
Active Item: "Targeting Dashboard" ✅
Not Active: "/smartops/targeting" (different route)
```

### Collapsed Sidebar

When collapsed:
- Only icons visible
- Tooltips show labels on hover
- Group separators become thin dividers
- Navigation remains fully functional

---

## Implementation Details

### Role Detection & Routing

**File**: `frontend/src/routes/smartops/index.tsx`

```typescript
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';

function SmartOpsDashboardRouter() {
    const { currentRole } = useRoleContext();
    const navigate = useNavigate();

    useEffect(() => {
        const roleDashboardMap: Record<string, string> = {
            'commander': '/smartops/cop-summary',
            'targeting-cell': '/smartops/targeting-cell-dashboard',
            'j2-intel': '/smartops/j2-dashboard',
            'j3-ops': '/smartops/j3-dashboard',
            'j5-plans': '/smartops/j5-dashboard',
            'j4-log': '/smartops/j4-dashboard',
            'legad': '/smartops/legad-dashboard',
            'analyst': '/smartops/analyst-dashboard',
        };

        const dashboardPath = roleDashboardMap[currentRole.id];
        if (dashboardPath) {
            navigate({ to: dashboardPath });
        }
    }, [currentRole, navigate]);
}
```

### Dynamic Sidebar Generation

**File**: `frontend/src/features/smartops/components/SmartOpsLayout.tsx`

```typescript
const getRoleSpecificNav = () => {
    const roleId = currentRole.id;
    
    switch (roleId) {
        case 'j5-plans':
            return [
                {
                    label: 'J5 Dashboard',
                    items: [
                        { icon: ScrollText, label: 'J5 Plans Center', to: '/smartops/j5-dashboard' },
                    ]
                },
                {
                    label: 'Strategic Planning',
                    items: [
                        { icon: ScrollText, label: 'OPLAN Manager', to: '/smartops/oplan' },
                        { icon: Shield, label: 'Planning Assumptions', to: '/smartops/assumptions' },
                        // ... more items
                    ]
                },
            ];
        // ... other roles
    }
};
```

---

## User Experience Flow

### Scenario 1: Commander Logs In

1. User logs in with commander credentials
2. `RoleContext` initializes with "Commander" role (default or last selected)
3. Navigate to `/smartops/`
4. Auto-redirect to `/smartops/cop-summary`
5. Sidebar shows Command Suite navigation
6. Dashboard displays command overview metrics

### Scenario 2: Analyst Switches to J2

1. Analyst clicks **Role Switcher** in header
2. Selects "J2 Intelligence Officer"
3. `RoleContext` updates, stores in `localStorage`
4. Navigate to `/smartops/`
5. Auto-redirect to `/smartops/j2-dashboard`
6. Sidebar updates to Intelligence Management navigation
7. Dashboard shows J2-specific metrics and actions
8. Action buttons now show edit icons (analyst → J2 = read-only → edit access)

### Scenario 3: J5 Reviews Assumptions

1. J5 user already on J5 dashboard
2. Sidebar shows "Planning Assumptions" with purple styling (editable)
3. Click "Planning Assumptions" → Navigate to `/smartops/assumptions`
4. Can create, edit, and manage assumptions (J5 capability)
5. Broken assumptions alert shows on dashboard

### Scenario 4: Targeting Cell Emergency Nomination

1. TC user on Targeting Dashboard
2. Sidebar shows "Quick Actions" section (TC-specific)
3. Click "Emergency Nomination" → Navigate to `/smartops/targeting/emergency`
4. Fast-track target nomination workflow
5. Return to "My Pending Targets" to track progress

---

## Benefits

### 1. **Focused Workflows**
- Each role sees only relevant navigation
- Reduced cognitive load
- Faster access to frequently-used features

### 2. **Role Clarity**
- Dashboard name shows current role context
- Sidebar structure reflects role responsibilities
- Visual consistency across role transitions

### 3. **Efficient Onboarding**
- New users see simplified navigation
- Role-specific tasks are immediately visible
- Reduces training time

### 4. **Scalability**
- Easy to add new roles
- Easy to modify role-specific navigation
- Centralized configuration

---

## Testing Checklist

| Test Case | Expected Result |
|-----------|-----------------|
| Log in as Commander | → Redirect to `/smartops/cop-summary` |
| Log in as J2 | → Redirect to `/smartops/j2-dashboard` |
| Log in as J5 | → Redirect to `/smartops/j5-dashboard` |
| Log in as Analyst | → Redirect to `/smartops/analyst-dashboard` |
| Switch from J2 to J3 | → Redirect to `/smartops/j3-dashboard`, sidebar updates |
| J5 sees "Planning Assumptions" | ✅ Purple styling, edit icon |
| Analyst sees "Planning Assumptions" | ❌ Not in sidebar |
| TC sees "Quick Actions" section | ✅ Visible with 5 items |
| Commander sees all major sections | ✅ Command Suite, Ops, Planning |
| Collapse sidebar | ✅ Icons remain, tooltips work |
| Navigate to assumptions from J5 dashboard alert | ✅ Sidebar highlights "Planning Assumptions" |

---

## Future Enhancements

### 1. **Dynamic Dashboard Widgets**
- Role-specific widgets on dashboard
- Customizable layouts per role
- Drag-and-drop widget configuration

### 2. **Role Switching History**
- Track role switches for audit
- "Recently viewed as" quick switch
- Switch back to previous role shortcut

### 3. **Favorites & Pinned Items**
- User can pin frequently-used items
- Favorites section in sidebar
- Cross-role favorites persistence

### 4. **Contextual Help**
- Role-specific help tooltips
- "What can I do?" guidance
- Task-based tutorials

---

## Production Considerations

### Backend Integration

In production, roles will be:
1. **Tied to user accounts**: Fetched from backend on login
2. **Group-based**: User's role determined by AD/LDAP groups
3. **JWT claims**: Role capabilities in token
4. **Server-side routing**: Backend enforces navigation restrictions

### Security

- Frontend role detection is for UX only
- Backend validates all actions server-side
- Navigation restrictions don't replace permissions
- Audit log tracks role-based access

---

## Related Documentation

- **ROLE_CAPABILITIES_MATRIX.md**: Detailed read/write capabilities for each role
- **ROLE_SWITCHER.md**: Role switcher UI component documentation
- **ROLE_DASHBOARDS_IMPLEMENTATION.md**: Technical implementation of each dashboard

---

**Status**: ✅ Implemented  
**Last Updated**: January 21, 2026  
**Version**: 1.0
