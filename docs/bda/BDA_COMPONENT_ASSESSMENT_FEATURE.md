# BDA Component-Level Damage Assessment Feature
## Implementation Summary

**Date:** 2026-01-22  
**Status:** ✅ Complete  
**Feature:** Component-Level Damage Assessment

---

## Overview

Component-level damage assessment allows analysts to assess damage to individual components of a target (e.g., buildings, equipment, infrastructure), providing granular damage tracking beyond overall target assessment.

---

## Features

### ✅ Component Management
- **Create** - Add component assessments to reports
- **Read** - View all components for a report
- **Update** - Modify component assessments
- **Delete** - Remove component assessments

### ✅ Component Types
- Structure (buildings, facilities)
- Equipment (machinery, systems)
- Infrastructure (utilities, roads)
- Vehicle (transportation assets)
- Other (miscellaneous)

### ✅ Damage Assessment
- **Physical Damage** - ND/SD/MD/SVD/D categories
- **Damage Percentage** - 0-100% scale
- **Damage Description** - Detailed narrative
- **Functional Status** - FMC/PMC/NMC
- **Repair Estimates** - Time and cost
- **Replacement Tracking** - Required and availability

### ✅ Criticality Tracking
- **Critical** - Mission-critical components
- **Important** - High-value components
- **Supporting** - Supporting infrastructure
- **Non-Essential** - Low-priority components

### ✅ Business Logic
- Critical component destroyed detection
- Replacement requirement detection
- Total downtime calculation (repair + replacement)
- Pre/post-strike function comparison

---

## Database Schema

### Table: `bda_component_assessment`

```sql
CREATE TABLE bda_component_assessment (
    id TEXT PRIMARY KEY,
    bda_report_id TEXT NOT NULL,
    component_name TEXT NOT NULL,
    component_type TEXT NOT NULL,
    component_location TEXT,
    physical_damage TEXT NOT NULL,
    physical_damage_percentage INTEGER,
    damage_description TEXT,
    functional_damage TEXT NOT NULL,
    estimated_repair_time_hours INTEGER,
    repair_cost_estimate_usd REAL,
    component_criticality TEXT,
    pre_strike_function TEXT,
    post_strike_function TEXT,
    replacement_required BOOLEAN,
    replacement_availability_days INTEGER,
    assessed_by TEXT NOT NULL,
    assessed_at TIMESTAMP NOT NULL,
    confidence_level REAL,
    assessment_notes TEXT,
    classification_level TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### View: `v_bda_component_summary`

Provides aggregated statistics per report:
- Total components
- Damage counts by category
- Critical components destroyed
- Average damage percentage
- Total repair cost estimate

---

## API Endpoints

### Create Component Assessment
```
POST /api/bda/components

Request:
{
  "bda_report_id": "...",
  "component_name": "Main Building",
  "component_type": "structure",
  "physical_damage": "MD",
  "physical_damage_percentage": 45,
  "functional_damage": "PMC",
  ...
}

Response: BdaComponentAssessment
```

### Get Report Components
```
GET /api/bda/reports/:id/components

Response: BdaComponentAssessment[]
```

### Update Component
```
PUT /api/bda/components/:id

Request: Partial<BdaComponentAssessment>
Response: BdaComponentAssessment
```

### Delete Component
```
DELETE /api/bda/components/:id

Response: 204 No Content
```

---

## Frontend Component

### Usage
```tsx
<BDAComponentAssessment 
    reportId={reportId}
    readOnly={report.status === 'approved'}
/>
```

### Features
- List all components for a report
- Color-coded damage indicators
- Criticality badges
- Functional status icons
- Repair time/cost display
- Replacement tracking
- Add/Edit/Delete actions (when not read-only)

---

## Use Cases

### 1. Granular Damage Tracking
- Assess individual building sections
- Track equipment-specific damage
- Monitor infrastructure components

### 2. Critical Component Monitoring
- Identify destroyed critical components
- Track mission impact
- Prioritize repair/replacement

### 3. Cost Estimation
- Aggregate repair costs
- Plan replacement budgets
- Track resource requirements

### 4. Functional Impact Analysis
- Compare pre/post-strike functions
- Assess capability degradation
- Plan restoration timeline

---

## Business Logic

### Critical Component Destroyed
```rust
pub fn is_critical_destroyed(&self) -> bool {
    matches!(
        (self.component_criticality, self.physical_damage),
        (Some(ComponentCriticality::Critical), PhysicalDamage::D)
    )
}
```

### Needs Replacement
```rust
pub fn needs_replacement(&self) -> bool {
    self.replacement_required || 
    matches!(self.physical_damage, PhysicalDamage::D)
}
```

### Total Downtime
```rust
pub fn get_total_downtime_hours(&self) -> Option<i32> {
    // Repair time + Replacement time
}
```

---

## Files Created/Updated

### Backend
- `backend/migrations/20260122160000_add_bda_component_assessment.sql`
- `backend/src/features/bda/domain/component_assessment.rs`
- `backend/src/features/bda/repositories/component_assessment_repository.rs`
- `backend/src/features/bda/handlers/component_assessment.rs`
- `backend/src/features/bda/router.rs` (updated)
- `backend/src/features/bda/domain/mod.rs` (updated)
- `backend/src/features/bda/repositories/mod.rs` (updated)
- `backend/src/features/bda/handlers/mod.rs` (updated)

### Frontend
- `frontend/src/features/smartops/components/BDAComponentAssessment.tsx`
- `frontend/src/lib/smartops/api/bda.ts` (updated)
- `frontend/src/routes/smartops/bda/$reportId.tsx` (updated)

---

## Future Enhancements

### Planned
- [ ] Component templates (pre-defined component lists)
- [ ] Bulk component import
- [ ] Component hierarchy (parent/child relationships)
- [ ] Component imagery association
- [ ] Component repair timeline visualization

### Potential
- [ ] Component dependency tracking
- [ ] Automated criticality detection
- [ ] Component replacement recommendations
- [ ] Integration with logistics systems

---

**Status:** ✅ **COMPLETE**  
**Next:** Enhanced quality control workflow, version comparison view
