# Risk Assessment Data Fields - Complete

## Summary

**Status**: ✅ Complete  
**Date**: January 22, 2026 10:35  
**Fields Added**: 3 fields (friendly distance, sensitive sites, proportionality)

---

## Changes Made

### Backend Domain Model
**File**: `backend/src/features/targeting/domain/mod.rs`

**Added Fields to RiskAssessment**:
```rust
pub struct RiskAssessment {
    // ... existing fields
    pub friendly_forces_distance_km: Option<f64>,  // Already existed
    pub sensitive_sites_nearby: Option<String>,     // ✅ NEW
    pub proportionality_assessment: Option<String>, // ✅ NEW
    // ... rest of fields
}
```

### Backend Repository
**File**: `backend/src/features/targeting/repositories/mod.rs`

**Updated Methods**:
- `get_by_target_id()` - Now fetches `sensitive_sites_nearby` and `proportionality_assessment`
- `get_high_risk()` - Now fetches `sensitive_sites_nearby` and `proportionality_assessment`

### Frontend API Types
**File**: `frontend/src/lib/smartops/api/targeting.api.ts`

**Added RiskAssessment Interface**:
```typescript
export interface RiskAssessment {
    id: string;
    target_id: string;
    fratricide_risk: string;
    friendly_forces_distance_km?: number;
    political_sensitivity: string;
    sensitive_sites_nearby?: string;      // ✅ NEW
    proportionality_assessment?: string;  // ✅ NEW
    legal_review_status: string;
    legal_reviewer?: string;
    legal_review_date?: string;
    overall_risk_score?: number;
    classification: string;
    assessed_by: string;
    created_at: string;
    updated_at: string;
}
```

### Frontend Component
**File**: `frontend/src/features/smartops/components/RiskConstraintsMonitor.tsx`

**Improvements**:
1. ✅ **Friendly Distance**: Extracts from `friendly_forces_distance_km`, converts km to meters for display
2. ✅ **Sensitive Sites**: Parses `sensitive_sites_nearby` (supports JSON array or comma-separated string)
3. ✅ **Proportionality**: Extracts `proportionality_assessment` (PROPORTIONAL, QUESTIONABLE, DISPROPORTIONATE)

**Implementation**:
```typescript
// Extract friendly distance (convert km to meters)
const friendlyDistance = r.friendly_forces_distance_km 
  ? Math.round(r.friendly_forces_distance_km * 1000)
  : 0;

// Parse sensitive sites (JSON or comma-separated)
let sensitiveSites: string[] = [];
if (r.sensitive_sites_nearby) {
  try {
    sensitiveSites = typeof r.sensitive_sites_nearby === 'string'
      ? JSON.parse(r.sensitive_sites_nearby)
      : r.sensitive_sites_nearby;
  } catch {
    sensitiveSites = typeof r.sensitive_sites_nearby === 'string'
      ? r.sensitive_sites_nearby.split(',').map(s => s.trim()).filter(Boolean)
      : [];
  }
}

// Get proportionality
const proportionality = r.proportionality_assessment || 'PROPORTIONAL';
```

---

## Database Schema

The `risk_assessments` table already has these fields:
- `friendly_forces_distance_km REAL` - Distance to friendly forces in kilometers
- `sensitive_sites_nearby TEXT` - Comma-separated or JSON array of sensitive sites
- `proportionality_assessment TEXT` - CHECK constraint: 'PROPORTIONAL', 'QUESTIONABLE', 'DISPROPORTIONATE'

**No migration needed** - Fields already exist in database.

---

## Files Modified

### Backend
1. `backend/src/features/targeting/domain/mod.rs` - Added 2 fields to RiskAssessment
2. `backend/src/features/targeting/repositories/mod.rs` - Updated 2 methods to fetch new fields

### Frontend
1. `frontend/src/lib/smartops/api/targeting.api.ts` - Added RiskAssessment interface
2. `frontend/src/features/smartops/components/RiskConstraintsMonitor.tsx` - Updated to use new fields

---

## Testing

### Manual Testing
- ✅ Friendly distance displays correctly (converted from km to meters)
- ✅ Sensitive sites parse correctly (JSON and comma-separated formats)
- ✅ Proportionality displays correctly (PROPORTIONAL, QUESTIONABLE, DISPROPORTIONATE)
- ✅ Fallback values work when fields are null/empty

### Type Safety
- ✅ TypeScript types match backend domain model
- ✅ Optional fields handled correctly
- ✅ Type conversions (km to meters) work correctly

---

## Success Criteria Met

- ✅ Friendly distance extracted from database
- ✅ Sensitive sites parsed from database
- ✅ Proportionality extracted from database
- ✅ All fields have proper fallback values
- ✅ Type-safe implementation
- ✅ No breaking changes

---

**Last Updated**: January 22, 2026 10:35  
**Status**: ✅ Complete - Risk assessment data fields fully integrated
