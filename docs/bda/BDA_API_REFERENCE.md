# BDA Workbench API Reference
## Backend API Documentation

**Base URL:** `http://localhost:3000/api/bda`  
**Authentication:** Bearer JWT token (required for all endpoints)  
**CSRF:** Required for POST/PUT/DELETE endpoints  
**Last Updated:** 2026-01-21

---

## 🔐 Authentication

All BDA endpoints require authentication via JWT Bearer token:

```bash
# Get token via login
POST /api/auth/login
{
  "identifier": "username",
  "password": "password"
}

# Response
{
  "access_token": "eyJ0eXAi...",
  "expires_in": 3600
}

# Use token in requests
Authorization: Bearer eyJ0eXAi...
```

---

## 📊 BDA Reports Endpoints

### Create BDA Report

```http
POST /api/bda/reports
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "target_id": "string (required)",
  "strike_id": "string (optional)",
  "assessment_type": "initial|interim|final (required)",
  
  "physical_damage": "ND|SD|MD|SVD|D (required)",
  "physical_damage_percentage": 0-100 (optional),
  "damage_description": "string (optional)",
  
  "functional_damage": "FMC|PMC|NMC (required)",
  "estimated_repair_time_hours": integer (optional),
  "pre_strike_capability_baseline": "string (optional)",
  
  "desired_effect": "string (required)",
  "achieved_effect": "string (required)",
  "effect_level": "first_order|second_order|third_order (optional)",
  "unintended_effects": "string (optional)",
  
  "confidence_level": 0.0-1.0 (required),
  "assessment_quality": "high|medium|low (optional)",
  "limiting_factors": "string (optional)",
  
  "recommendation": "effect_achieved|monitor|re_attack|re_weaponeer (required)",
  "re_attack_priority": 1-5 (optional),
  "re_attack_rationale": "string (optional)",
  "alternative_munitions": "string (optional)",
  
  "collateral_damage_detected": boolean (required),
  "civcas_credibility": "no_credibility|possible|credible|confirmed (optional)",
  "civilian_casualties_estimate": integer (optional)",
  "protected_structures_damaged": "string (optional)",
  "cde_vs_actual_comparison": "string (optional)",
  
  "weapon_performance_vs_predicted": "exceeded|met|below|failed (optional)",
  "munition_reliability": "string (optional)",
  "circular_error_probable_meters": float (optional),
  "penetration_depth_meters": float (optional)",
  
  "classification_level": "string (required, default: SECRET)",
  "handling_caveats": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "target_id": "string",
  "status": "draft",
  "physical_damage": "MD",
  "functional_damage": "PMC",
  "recommendation": "monitor",
  "created_at": "2026-01-21T14:00:00Z",
  ...all fields...
}
```

---

### List BDA Reports

```http
GET /api/bda/reports?status={status}&target_id={target_id}
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status (draft, submitted, reviewed, approved, rejected)
- `target_id` (optional): Filter by target ID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "target_id": "string",
    "assessment_date": "2026-01-21T14:00:00Z",
    "physical_damage": "SVD",
    "functional_damage": "PMC",
    "recommendation": "monitor",
    "status": "approved",
    ...
  }
]
```

---

### Get Single BDA Report

```http
GET /api/bda/reports/{id}
Authorization: Bearer {token}
```

**Response:** `200 OK` (single report) or `404 Not Found`

---

### Update BDA Report

```http
PUT /api/bda/reports/{id}
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request Body:** (all fields optional)
```json
{
  "physical_damage": "D",
  "functional_damage": "NMC",
  "confidence_level": 0.95,
  "recommendation": "re_attack",
  "re_attack_priority": 1,
  "notes": "Additional analysis completed"
}
```

**Response:** `200 OK` (updated report)

---

### Delete BDA Report

```http
DELETE /api/bda/reports/{id}
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Response:** `204 No Content`

---

### Submit BDA Report for Review

```http
POST /api/bda/reports/{id}/submit
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Response:** `200 OK` (report with status="submitted")

---

### Approve BDA Report

```http
POST /api/bda/reports/{id}/approve
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "comments": "string (optional)"
}
```

**Response:** `200 OK` (report with status="approved", approved_by set)

---

### Reject BDA Report

```http
POST /api/bda/reports/{id}/reject
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "comments": "string (required)"
}
```

**Response:** `200 OK` (report with status="rejected")

---

## 📋 Queue & Statistics Endpoints

### Get Assessment Queue

```http
GET /api/bda/queue
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "target_id": "string",
    "status": "submitted",
    "assessment_date": "2026-01-21T14:00:00Z",
    ...
  }
]
```

Returns all reports with status in (draft, submitted, reviewed)

---

### Get BDA Statistics

```http
GET /api/bda/statistics
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "total_reports": 42,
  "by_status": {
    "draft": 3,
    "submitted": 5,
    "reviewed": 2,
    "approved": 30,
    "rejected": 2
  },
  "by_recommendation": {
    "effect_achieved": 25,
    "monitor": 10,
    "re_attack": 5,
    "re_weaponeer": 2
  },
  "by_physical_damage": {
    "nd": 2,
    "sd": 8,
    "md": 15,
    "svd": 12,
    "d": 5
  },
  "average_confidence": 0.78,
  "collateral_damage_incidents": 3
}
```

---

## 📷 Imagery Endpoints

### Upload Imagery

```http
POST /api/bda/imagery
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "bda_report_id": "string (required)",
  "collection_date": "2026-01-21T14:30:00Z (required)",
  "collection_platform": "string (optional)",
  "sensor_type": "SAR|EO|IR|FMV|Commercial|Other (optional)",
  "ground_sample_distance_cm": float (optional),
  "cloud_cover_percentage": 0-100 (optional)",
  "collection_angle_degrees": float (optional)",
  "azimuth_degrees": float (optional)",
  "quality_score": 0.0-1.0 (optional)",
  "time_post_strike_hours": float (optional)",
  "is_pre_strike_baseline": boolean (default: false),
  "image_url": "string (required)",
  "thumbnail_url": "string (optional)",
  "image_format": "string (optional)",
  "file_size_bytes": integer (optional),
  "classification_level": "string (required)",
  "handling_caveats": "string (optional)"
}
```

**Response:** `201 Created`

---

### Get Imagery by ID

```http
GET /api/bda/imagery/{id}
Authorization: Bearer {token}
```

**Response:** `200 OK` or `404 Not Found`

---

### Get All Imagery for Report

```http
GET /api/bda/reports/{report_id}/imagery
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "bda_report_id": "uuid",
    "collection_date": "2026-01-21T14:30:00Z",
    "sensor_type": "EO",
    "quality_score": 0.85,
    "image_url": "/imagery/post_strike.tif",
    ...
  }
]
```

---

### Delete Imagery

```http
DELETE /api/bda/imagery/{id}
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Response:** `204 No Content`

---

## 💥 Strike Correlation Endpoints

### Create Strike Correlation

```http
POST /api/bda/strikes
Content-Type: application/json
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Request Body:**
```json
{
  "bda_report_id": "string (required)",
  "strike_mission_id": "string (optional)",
  "weapon_system": "string (required, e.g. F-16C)",
  "munition_type": "string (required, e.g. GBU-31 JDAM)",
  "munition_quantity": integer (required)",
  "time_on_target": "2026-01-21T12:00:00Z (required)",
  "impact_coordinates": "string (required, lat/lon or MGRS)",
  "impact_coordinates_json": "string (optional, JSON)",
  "dmpi_coordinates": "string (optional)",
  "offset_from_dmpi_meters": float (optional)",
  "successful_detonation": boolean (optional)",
  "fuzing_as_designed": boolean (optional)",
  "guidance_system_performance": "nominal|degraded|failed (optional)",
  "circular_error_probable_meters": float (optional)",
  "blast_radius_meters": float (optional)",
  "weather_conditions": "string (optional)",
  "malfunction_detected": boolean (required)",
  "classification_level": "string (required)"
}
```

**Response:** `201 Created`

---

### Get Strike Correlation by ID

```http
GET /api/bda/strikes/{id}
Authorization: Bearer {token}
```

**Response:** `200 OK` or `404 Not Found`

---

### Get All Strikes for Report

```http
GET /api/bda/reports/{report_id}/strikes
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "bda_report_id": "uuid",
    "weapon_system": "F-16C",
    "munition_type": "GBU-31 JDAM",
    "time_on_target": "2026-01-21T12:00:00Z",
    "circular_error_probable_meters": 8.5,
    "successful_detonation": true,
    ...
  }
]
```

---

### Get Weapon Performance Summary

```http
GET /api/bda/weapon-performance
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "weapon_system": "F-16C",
    "munition_type": "GBU-31 JDAM",
    "total_strikes": 15,
    "successful_detonations": 14,
    "avg_cep_meters": 7.2,
    "avg_blast_radius_meters": 145.0,
    "malfunctions": 1,
    "reliability_percentage": 93.33
  }
]
```

---

### Delete Strike Correlation

```http
DELETE /api/bda/strikes/{id}
Authorization: Bearer {token}
X-CSRF-Token: {csrf_token}
```

**Response:** `204 No Content`

---

## 📋 Data Models

### Physical Damage Categories (JP 3-60)

```typescript
type PhysicalDamage = 
  | 'ND'   // No Damage (0% capability loss)
  | 'SD'   // Slight Damage (<10% capability loss)
  | 'MD'   // Moderate Damage (10-50% capability loss)
  | 'SVD'  // Severe Damage (50-90% capability loss)
  | 'D';   // Destroyed (>90% capability loss)
```

### Functional Damage Categories (JP 3-60)

```typescript
type FunctionalDamage = 
  | 'FMC'  // Fully Mission Capable
  | 'PMC'  // Partially Mission Capable
  | 'NMC'; // Not Mission Capable
```

### Assessment Types

```typescript
type AssessmentType = 
  | 'initial'  // Within 24h of strike
  | 'interim'  // 24-72h post-strike
  | 'final';   // 72h+ or complete
```

### Recommendations

```typescript
type Recommendation = 
  | 'effect_achieved'  // Desired effect achieved
  | 'monitor'          // Continue monitoring
  | 're_attack'        // Re-attack with same approach
  | 're_weaponeer';    // Re-attack with different munitions
```

### BDA Status (Workflow)

```typescript
type BdaStatus = 
  | 'draft'      // Being prepared
  | 'submitted'  // Submitted for review
  | 'reviewed'   // Under review
  | 'approved'   // Approved by supervisor
  | 'rejected';  // Rejected, needs rework
```

### CIVCAS Credibility (CJCSI 3160.01)

```typescript
type CivcasCredibility = 
  | 'no_credibility'  // No evidence
  | 'possible'        // Unconfirmed allegation
  | 'credible'        // Evidence suggests likely
  | 'confirmed';      // Definitive proof
```

---

## 🔍 Example Usage

### Complete BDA Report Creation Workflow

```javascript
// Step 1: Create BDA report
const createResponse = await fetch('http://localhost:3000/api/bda/reports', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    target_id: 'target-123',
    assessment_type: 'initial',
    physical_damage: 'SVD',
    physical_damage_percentage: 75,
    functional_damage: 'PMC',
    estimated_repair_time_hours: 48,
    desired_effect: 'Destroy radar capability',
    achieved_effect: 'Radar disabled but salvageable',
    confidence_level: 0.85,
    recommendation: 'monitor',
    collateral_damage_detected: false,
    classification_level: 'SECRET',
  }),
});

const report = await createResponse.json();
console.log('Created report:', report.id);

// Step 2: Upload imagery
const imageryResponse = await fetch('http://localhost:3000/api/bda/imagery', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    bda_report_id: report.id,
    collection_date: new Date().toISOString(),
    sensor_type: 'EO',
    quality_score: 0.9,
    is_pre_strike_baseline: false,
    image_url: '/imagery/post_strike_001.tif',
    classification_level: 'SECRET',
  }),
});

// Step 3: Add strike correlation
const strikeResponse = await fetch('http://localhost:3000/api/bda/strikes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    bda_report_id: report.id,
    weapon_system: 'F-16C',
    munition_type: 'GBU-31 JDAM',
    munition_quantity: 2,
    time_on_target: '2026-01-21T12:00:00Z',
    impact_coordinates: '35.123, -117.456',
    successful_detonation: true,
    circular_error_probable_meters: 7.5,
    malfunction_detected: false,
    classification_level: 'SECRET',
  }),
});

// Step 4: Submit for review
await fetch(`http://localhost:3000/api/bda/reports/${report.id}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken,
  },
});

// Step 5: Approve (as supervisor)
await fetch(`http://localhost:3000/api/bda/reports/${report.id}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    comments: 'Assessment validated. Effect achieved per desired outcome.',
  }),
});

console.log('BDA report workflow complete');
```

---

## 🎯 Frontend Integration Guide

### TanStack React Query Example

```typescript
// hooks/useBdaStatistics.ts
import { useQuery } from '@tanstack/react-query';

export function useBdaStatistics() {
  return useQuery({
    queryKey: ['bda', 'statistics'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/bda/statistics', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      return response.json();
    },
  });
}

// Component usage
function BDADashboard() {
  const { data: stats, isLoading } = useBdaStatistics();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>BDA Statistics</h2>
      <p>Total Reports: {stats.total_reports}</p>
      <p>Approved: {stats.by_status.approved}</p>
      <p>Re-attack Required: {stats.by_recommendation.re_attack}</p>
    </div>
  );
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid auth token
- `403 Forbidden` - Missing CSRF token or insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Error message string"
}
```

Or plain text for some errors:
```
Failed to create BDA report
BDA report not found
Invalid credentials
```

---

## 🔒 Security

### Classification Levels

All BDA data supports classification markings:
- `UNCLASS`
- `CUI`
- `SECRET`
- `TOP SECRET` (Phase 12+)
- `TS/SCI` (Phase 12+)

### Handling Caveats

Supported caveats (optional):
- `NOFORN`
- `REL TO [country codes]`
- `ORCON`
- `PROPIN`
- `FISA`

### Audit Logging

Phase 0 includes classification_level field. Phase 1 will add audit logging for all classified data access.

---

## 📚 Related Documentation

- **[BDA_WORKBENCH_SUMMARY.md](./BDA_WORKBENCH_SUMMARY.md)** - Overview and status
- **[BDA_PHASE0_COMPLETION_REPORT.md](./BDA_PHASE0_COMPLETION_REPORT.md)** - Detailed completion report
- **[BDA_WORKBENCH_IMPLEMENTATION_PLAN.md](./BDA_WORKBENCH_IMPLEMENTATION_PLAN.md)** - Complete roadmap

---

**Last Updated:** 2026-01-21  
**Version:** Phase 0 (Backend Foundation)  
**Status:** ✅ All endpoints functional and tested
