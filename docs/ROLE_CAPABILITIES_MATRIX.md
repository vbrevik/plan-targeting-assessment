# Role Capabilities Matrix

## Overview

This document defines the read/write capabilities for each role in the SmartOps system. Capabilities determine which actions users can perform and how UI elements are displayed.

---

## Visual Indicators

### Badge Styles

**Edit Access** (roles with write permissions):
```
🟢 [Edit3 Icon] Edit Access / Operations Manager / Planning Authority
- Green/Purple border and background
- Displayed in dashboard header
```

**Read Only** (roles without write permissions):
```
⚫ [Lock Icon] Read Only / Monitor Only / View Only
- Gray border and background
- Displayed in dashboard header
```

### Action Button Styles

**Editable Actions** (write permissions):
```
┌──────────────────────────────────────┐
│ [Green Icon] Submit Assessment  [✏️] │  ← Green border, edit icon
└──────────────────────────────────────┘
```

**Read-Only Actions** (view permissions):
```
┌──────────────────────────────────────┐
│ [Blue Icon] View Assessment          │  ← Gray border, no edit icon
└──────────────────────────────────────┘
```

---

## Capabilities Matrix

| Capability | CDR | J2 | J3 | J5 | J4 | LEGAD | TC | ANLY |
|-----------|-----|----|----|----|----|-------|----|----|
| **Intelligence** |
| View Intel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Intel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Operations** |
| View Operations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Operations | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Planning** |
| View Plans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Plans | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Assumptions | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Targeting** |
| View Targets | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Edit Targets | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Approve Targets | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Logistics** |
| View Logistics | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Edit Logistics | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Request Supply | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Legal** |
| View Legal | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Edit Legal | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve ROE | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **General** |
| Approve Decisions | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Submit Proposals | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## Role Descriptions

### Commander (CDR) - Full Authority
**Badge**: 🔴 Edit Access  
**Capabilities**: All permissions except direct legal editing

**Can Do**:
- Approve all decisions and targets
- Edit operations, intel, plans
- Approve ROE changes
- Submit proposals
- Request supplies

**Cannot Do**:
- Direct legal document editing (LEGAD handles this)

---

### J2 Intelligence Officer - Intel Manager
**Badge**: 🔵 Edit Access  
**Capabilities**: Full intelligence management

**Can Do**:
- ✅ Edit and update intelligence assessments
- ✅ Submit new intel reports
- ✅ Update RFIs
- ✅ Manage uncertainty data
- ✅ Submit proposals

**Cannot Do**:
- ❌ Edit operations or plans
- ❌ Approve targets
- ❌ Edit logistics or legal

**UI Indicators**:
- "Submit Assessment" button (green, editable)
- "Update Intelligence" button (green, editable)
- Other actions remain view-only (gray)

---

### J3 Operations Officer - Ops Manager
**Badge**: 🟢 Operations Manager  
**Capabilities**: Current operations management

**Can Do**:
- ✅ Edit active operations
- ✅ Update battle rhythm
- ✅ Submit proposals
- ✅ Create RFIs
- ✅ Request supplies

**Cannot Do**:
- ❌ Edit intelligence assessments
- ❌ Edit plans or assumptions
- ❌ Edit or approve targets

**UI Indicators**:
- "Submit Proposal" button (green, editable)
- "Update Battle Rhythm" button (green, editable)
- Intel and planning views are read-only

---

### J5 Plans Officer - Planning Authority
**Badge**: 🟣 Planning Authority  
**Capabilities**: Strategic planning and assumptions

**Can Do**:
- ✅ Edit OPLANs
- ✅ **Manage Planning Assumptions** (Create, Edit, Update Status)
- ✅ Update campaign plans
- ✅ Edit CONOPS
- ✅ Submit proposals

**Cannot Do**:
- ❌ Edit intelligence or operations
- ❌ Edit or approve targets
- ❌ Edit logistics

**UI Indicators**:
- "Manage Assumptions" button (purple, editable) - **KEY FEATURE**
- "Edit OPLANs" button (purple, editable)
- "Update Campaign" button (purple, editable)
- Intel and ops views are read-only

**Special Note**: J5 is the PRIMARY role for managing Planning Assumptions

---

### J4 Logistics Officer - Logistics Manager
**Badge**: 🟠 Edit Access  
**Capabilities**: Supply chain management

**Can Do**:
- ✅ Edit logistics data
- ✅ Request supplies
- ✅ Update infrastructure status
- ✅ Submit proposals

**Cannot Do**:
- ❌ View targeting (security restriction)
- ❌ View legal documents
- ❌ Edit operations or plans

**UI Indicators**:
- "Request Resupply" button (amber, editable)
- "Update Status" button (amber, editable)

---

### LEGAD (Legal Advisor) - Legal Authority
**Badge**: ⚫ Legal Authority  
**Capabilities**: Legal reviews and ROE

**Can Do**:
- ✅ Edit legal reviews
- ✅ Approve ROE changes
- ✅ Approve command decisions
- ✅ Review targeting for legal compliance

**Cannot Do**:
- ❌ Submit proposals
- ❌ Edit operations, intel, or plans
- ❌ View logistics (not relevant)

**UI Indicators**:
- "Submit Legal Opinion" button (slate, editable)
- "Approve ROE" button (slate, editable)
- All other views are read-only

---

### Targeting Cell (TC) - Targeting Manager
**Badge**: 🟠 Edit Access  
**Capabilities**: Target management

**Can Do**:
- ✅ Edit targets (nominate, update, withdraw)
- ✅ Submit proposals
- ✅ Update BDA

**Cannot Do**:
- ❌ Approve targets (CDR only)
- ❌ Edit intelligence, operations, or plans
- ❌ Edit logistics

**UI Indicators**:
- "Nominate Target" button (orange, editable)
- "Update Target" button (orange, editable)
- Approval actions disabled (view only)

---

### Intelligence Analyst (ANLY) - Read-Only
**Badge**: 🔵 Read Only  
**Capabilities**: Limited access, task-focused

**Read-Only Notice Banner**:
```
ℹ️ Analyst Access Level
Limited to assigned tasks and read-only views • Contact J2 for additional access
[🔒 Read Only]
```

**Can Do**:
- ✅ View assigned tasks
- ✅ View COP and ORBAT (read-only)
- ✅ View weather data

**Cannot Do**:
- ❌ Edit anything
- ❌ Submit proposals
- ❌ View logistics, legal, or targeting details
- ❌ Access planning or operations management

**UI Indicators**:
- Blue information banner at top of dashboard
- All action buttons are view-only (no edit icon)
- Lock icon prominent in header badge

---

## Implementation Details

### Checking Capabilities in Code

```typescript
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';

function MyComponent() {
    const { currentRole } = useRoleContext();
    const canEdit = currentRole.capabilities.canEditIntel;
    const canApprove = currentRole.capabilities.canApproveDecisions;
    
    return (
        <>
            {canEdit && <EditButton />}
            {!canEdit && <ViewOnlyNotice />}
            {canApprove && <ApproveButton />}
        </>
    );
}
```

### Header Badge Display

```typescript
{canEdit ? (
    <span className="flex items-center gap-1 px-3 py-1 bg-green-950/30 border border-green-800 rounded-full text-xs font-bold text-green-400 uppercase">
        <Edit3 size={12} />
        Edit Access
    </span>
) : (
    <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase">
        <Lock size={12} />
        Read Only
    </span>
)}
```

### Action Button Styling

```typescript
function QuickActionButton({ icon: Icon, label, to, editable = false }: any) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 bg-slate-800/50 border rounded-lg hover:border-blue-600 hover:bg-blue-950/20 transition-colors group ${
                editable ? 'border-green-800/50 bg-green-950/10' : 'border-slate-700'
            }`}
        >
            <Icon className={`w-4 h-4 transition-colors ${
                editable ? 'text-green-400 group-hover:text-green-300' : 'text-slate-400 group-hover:text-blue-400'
            }`} />
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                {label}
            </span>
            {editable && <Edit3 size={12} className="ml-auto text-green-400" />}
        </Link>
    );
}
```

---

## Security Notes

### Demo Mode
⚠️ **Current implementation is CLIENT-SIDE ONLY for demo purposes**

In demo mode:
- Capabilities checked in frontend only
- No backend validation
- User can switch roles freely
- localStorage persistence

### Production Requirements

For production deployment:
1. **Backend Enforcement**:
   - Verify role capabilities server-side
   - Return 403 for unauthorized actions
   - Log all permission checks

2. **Authentication**:
   - Roles tied to user accounts
   - Group membership controls access
   - JWT tokens contain capability claims

3. **Audit Trail**:
   - Log all edit actions with user/role
   - Track permission elevation requests
   - Monitor unauthorized access attempts

4. **Fine-Grained Permissions**:
   - Object-level permissions (edit own intel vs all intel)
   - Time-based permissions (can only edit during shift)
   - Approval workflows (multi-step authorization)

---

## Use Cases

### Use Case 1: Analyst Needs Edit Access
**Scenario**: Analyst promoted to J2 position

**Current (Demo)**:
1. User clicks Role Switcher
2. Selects "J2 Intelligence Officer"
3. Dashboard reloads with edit capabilities

**Production**:
1. Admin updates user's group membership
2. User logs out and back in
3. New JWT contains J2 capabilities
4. Dashboard reflects new permissions

---

### Use Case 2: J5 Managing Broken Assumptions
**Scenario**: Strategic planner needs to update assumption status

**J5 (Has Access)**:
1. Sees "🟣 Planning Authority" badge
2. "Manage Assumptions" button is green with edit icon
3. Can create, edit, and change status of assumptions
4. Can mark assumptions as "Broken" or "Challenged"

**J3 (No Access)**:
1. Sees "🔒 Monitor Only" badge
2. "Review Assumptions" button is gray (read-only)
3. Can view assumptions but cannot edit
4. Must request J5 to make changes

---

### Use Case 3: Commander Approving ROE
**Scenario**: New ROE needs command approval

**Commander (Has Approval)**:
1. Sees "Approve ROE" button enabled
2. Can review LEGAD recommendation
3. Can approve or deny with comments

**J3 (No Approval)**:
1. Sees ROE status (read-only)
2. "Approve" button not displayed
3. Can submit request to Commander

---

## Testing

### Test Matrix

| Test Case | Role | Expected Result |
|-----------|------|----------------|
| Edit Intel Assessment | J2 | ✅ Green "Submit Assessment" button visible |
| Edit Intel Assessment | J3 | ❌ Button hidden or disabled |
| Edit Intel Assessment | ANLY | ❌ Read-only banner, no edit buttons |
| Manage Assumptions | J5 | ✅ Purple "Manage Assumptions" button with edit icon |
| Manage Assumptions | CDR | ✅ Edit access badge shown |
| Manage Assumptions | ANLY | ❌ Not accessible (no nav link) |
| Submit Proposal | J2, J3, J5 | ✅ "Submit Proposal" button visible |
| Submit Proposal | ANLY, LEGAD | ❌ Button hidden |
| Approve Target | CDR | ✅ "Approve" button enabled |
| Approve Target | TC | ❌ Can edit but not approve |
| Request Supply | J4 | ✅ Green "Request Resupply" button |
| Request Supply | J3 | ✅ Can request (operational need) |
| Request Supply | J2 | ❌ No logistics access |

---

## Summary

**8 Roles, 16 Capabilities, Clear Visual Differentiation**

- ✅ **Write Roles** (CDR, J2, J3, J5, J4, LEGAD, TC): Green/Purple badges, edit icons on buttons
- ❌ **Read-Only Role** (ANLY): Gray badges, lock icons, information banner
- 🎨 **Color-Coded**: Each role's edit buttons match their theme color
- 📝 **Clear Labels**: "Edit" vs "View", "Manage" vs "Review", "Submit" vs "Monitor"
- 🔒 **Security Ready**: Architecture supports production RBAC implementation

---

**Status**: ✅ Implemented  
**Last Updated**: January 21, 2026  
**Related Docs**: ROLE_SWITCHER.md, ROLE_DASHBOARDS_IMPLEMENTATION.md
