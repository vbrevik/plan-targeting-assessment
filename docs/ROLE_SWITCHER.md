# Role Switcher Feature (Demo Mode)

## Overview

The Role Switcher allows users to quickly switch between different operational roles in the SmartOps interface for demonstration and testing purposes. This feature is located in the header next to the "View" (Strategic/Operational) selector.

## Demo Mode Disclaimer

⚠️ **This is a DEMO feature** - Security is intentionally simplified for testing and demonstration purposes.

**In production:**
- Roles will be tied to actual user authentication
- Group memberships will control access
- RBAC (Role-Based Access Control) will be enforced server-side
- Permission checks will be validated against the backend

**In demo mode:**
- Role switching is client-side only
- No authentication required
- Selected role persists in localStorage
- Used for testing different user perspectives

## Available Roles

### 1. **Commander (CDR)** 🔴
- **Description**: Overall operational command authority
- **Permissions**: All access (`*`)
- **Color**: Red
- **Use Case**: Testing full system access and command-level views

### 2. **J2 Intelligence Officer (J2)** 🔵
- **Description**: Intelligence analysis and assessments
- **Permissions**: 
  - Uncertainty analysis
  - Intelligence views
  - RXP (Recognized Picture)
  - Social domain
  - Digital twin
  - Sensor triage
- **Color**: Blue
- **Use Case**: Testing intelligence-focused workflows

### 3. **J3 Operations Officer (J3)** 🟢
- **Description**: Current operations management
- **Permissions**:
  - COP (Common Operational Picture)
  - Battle rhythm
  - Proposals
  - RFIs (Requests for Information)
  - Targeting
  - Combat Net Radio
- **Color**: Green
- **Use Case**: Testing operational execution views

### 4. **J5 Plans Officer (J5)** 🟣
- **Description**: Strategic planning and OPLAN development
- **Permissions**:
  - OPLAN management
  - Campaign design
  - COG (Center of Gravity) analysis
  - CoA (Course of Action) wargaming
  - CONOPS builder
  - Strategic direction
  - Assumptions management
- **Color**: Purple
- **Use Case**: Testing planning and strategy workflows

### 5. **J4 Logistics Officer (J4)** 🟠
- **Description**: Logistics and supply chain management
- **Permissions**:
  - Logistics
  - Infrastructure
  - Supply chain
- **Color**: Amber
- **Use Case**: Testing logistical support views

### 6. **Legal Advisor (LEGAD)** ⚫
- **Description**: Legal review and ROE guidance
- **Permissions**:
  - Advisory queue
  - ROE (Rules of Engagement)
  - Targeting review
  - Decision board
- **Color**: Slate
- **Use Case**: Testing legal compliance workflows

### 7. **Targeting Cell (TC)** 🟠
- **Description**: Targeting operations and strike coordination
- **Permissions**:
  - Targeting operations
  - Strike optimization
  - BDA (Battle Damage Assessment)
  - A2/AD strategic analysis
- **Color**: Orange
- **Use Case**: Testing targeting workflows

### 8. **Intelligence Analyst (ANLY)** 🔵
- **Description**: Junior analyst with limited access
- **Permissions**:
  - COP view
  - RXP view
  - ORBAT (Order of Battle)
  - Weather
- **Color**: Cyan
- **Use Case**: Testing limited-access workflows

## UI Components

### Header Location

The Role Switcher appears in the top header bar:
```
[Page Title] | [View Selector] | [Role Selector] | [DEFCON] | [Theme Toggle]
                (Strategic/Ops)   (Commander/J2/etc)
```

### Role Selector Button

Shows current role with:
- Role-specific icon (Shield for Commander, Users for staff officers)
- "Demo Role" label
- Role short name (e.g., "CDR", "J2", "J5")
- Color-coded border matching role

### Dropdown Menu

When clicked, shows:
- **Header**: "Select Demo Role" with explanation
- **Role Cards**: Each role displays:
  - Icon with color-coded background
  - Full role name and short code
  - Role description
  - First 3 permissions (with "+X more" if applicable)
  - "Active" badge for current role
- **Footer**: Warning about demo mode

### Sidebar Footer

The sidebar footer dynamically updates to show:
- **Top line**: Role short code (e.g., "CDR", "J5")
- **Bottom line**: Full role name

## Implementation Details

### Context Provider

**Location**: `frontend/src/lib/smartops/hooks/useRoleContext.tsx`

```typescript
export interface Role {
    id: string;
    name: string;
    shortName: string;
    description: string;
    permissions: string[];
    color: string;
}

// Usage
const { currentRole, setRole, availableRoles } = useRoleContext();
```

### Role Selector Component

**Location**: `frontend/src/features/smartops/components/RoleSelector.tsx`

Features:
- Color-coded styling per role
- Dropdown with all available roles
- Hover states and active indicators
- Responsive layout

### Layout Integration

**Location**: `frontend/src/features/smartops/components/SmartOpsLayout.tsx`

```tsx
<RoleProvider>
    <OperationalContextProvider>
        <SmartOpsContent />
    </OperationalContextProvider>
</RoleProvider>
```

### Persistence

Role selection persists across page refreshes using localStorage:
- **Key**: `demo-role`
- **Value**: Role ID (e.g., `"j5-plans"`)
- **Default**: Commander if no stored value

## Usage Examples

### Testing Different Workflows

1. **Planning Workflow** (J5):
   - Switch to "J5 Plans Officer"
   - Navigate to OPLAN Manager
   - Test campaign design
   - Access assumptions page

2. **Intelligence Workflow** (J2):
   - Switch to "J2 Intelligence Officer"
   - Navigate to Uncertainty page
   - Test sensor triage
   - Review digital twin

3. **Legal Review** (LEGAD):
   - Switch to "Legal Advisor"
   - Navigate to Advisory Queue
   - Review ROE compliance
   - Access decision board

4. **Limited Access** (ANLY):
   - Switch to "Intelligence Analyst"
   - Verify restricted navigation
   - Test read-only capabilities

### Demo Presentations

For stakeholder demos:
1. Start as Commander (full access)
2. Show overall system capability
3. Switch to specific role for focused workflows
4. Demonstrate role-appropriate views
5. Switch between roles to show multi-user collaboration

## Future Production Implementation

### Authentication Integration

```typescript
// Production: Load from authenticated user
const currentRole = user.roles[0]; // From JWT/session

// Demo: Load from localStorage
const currentRole = localStorage.getItem('demo-role');
```

### Permission Enforcement

**Current (Demo)**:
```typescript
// Client-side only
if (currentRole.permissions.includes('targeting.view')) {
    // Show targeting option
}
```

**Production**:
```typescript
// Server-side enforcement
const canViewTargeting = await checkPermission(
    user.id, 
    'targeting.view'
);
```

### Group Membership

Production roles will be determined by:
- Active Directory groups
- LDAP attributes
- Database role assignments
- OAuth2/SAML claims

### Audit Logging

Production will log:
- Role switches (if allowed)
- Permission checks
- Access attempts
- Role-specific actions

## Development Notes

### Adding New Roles

To add a new role, update `AVAILABLE_ROLES` in `useRoleContext.tsx`:

```typescript
{
    id: 'new-role',
    name: 'New Role Name',
    shortName: 'NRN',
    description: 'Role description',
    permissions: ['perm1.view', 'perm2.edit'],
    color: 'indigo' // Choose from: red, blue, green, purple, amber, orange, cyan, slate
}
```

### Updating Permissions

Permissions follow the pattern: `{domain}.{action}`

Examples:
- `targeting.view`
- `campaign.edit`
- `decisions.approve`
- `*` (all permissions)

### Testing Role-Based Views

```typescript
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';

function MyComponent() {
    const { currentRole } = useRoleContext();
    
    const hasTargetingAccess = currentRole.permissions.includes('targeting.view');
    
    if (!hasTargetingAccess) {
        return <AccessDenied />;
    }
    
    return <TargetingView />;
}
```

## Related Documentation

- [Authentication & Authorization](./AUTH.md) (future)
- [Permission System](./PERMISSIONS.md) (future)
- [SmartOps Layout](../frontend/src/features/smartops/components/SmartOpsLayout.tsx)

---

**Status**: ✅ Implemented (Demo Mode)  
**Production Ready**: ⚠️ No - Requires backend RBAC integration  
**Last Updated**: January 21, 2026
