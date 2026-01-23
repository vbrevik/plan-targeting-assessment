# NATO COPD Targeting Cell Dashboard - Integration Testing Guide

## Status: ✅ Ready for Testing

**Date**: 2026-01-21  
**Backend**: Running on port 3000  
**Frontend**: Running on port 5173  

---

## Quick Test Access

### Frontend Dashboard
- **URL**: http://localhost:5173/smartops/targeting-cell-dashboard
- **Authentication**: Handled automatically by frontend (login required)
- **Test User**: Create via registration or use existing credentials

### Backend API
- **Base URL**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **Authentication**: JWT Bearer token required for protected endpoints

---

## Manual Testing Steps

### 1. Frontend Browser Testing

1. **Open Dashboard**
   ```
   http://localhost:5173/smartops/targeting-cell-dashboard
   ```

2. **Login** (if not already logged in)
   - Register new user OR
   - Use existing credentials

3. **Verify Components**
   - ✅ Mission Command Overview Panel
   - ✅ Target Nomination & Prioritization Board
   - ✅ Intelligence Integration Panel
   - ✅ Effects Assessment Dashboard
   - ✅ Asset & Capability Management
   - ✅ Risk & Constraints Monitor
   - ✅ Alternative Analysis Integration
   - ✅ Collaborative Workspace

4. **Check Data Loading**
   - All components should fetch data from backend APIs
   - Fallback mock data displays if API fails
   - Loading indicators show during data fetch

### 2. Playwright GUI Testing

```bash
cd frontend
npx playwright test targeting-nato-copd.spec.ts --ui
```

**Test Coverage**:
- All 8 NATO COPD components presence
- Decision Gates Bar functionality
- F3EAD pipeline visualization
- TST countdown timers
- Multi-INT fusion display
- BDA tracking
- Risk assessments
- Alternative analysis alerts
- Collaborative features

### 3. API Endpoint Testing (with Authentication)

**Prerequisites**: 
- Create test user first (see below)
- Get JWT token from login endpoint

**Test Script**: `./test_integration.sh`

**Manual API Tests**:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"targeting_cell@test.mil","password":"TargetingCell2026!"}' \
  | jq -r '.access_token')

# 2. Test Decision Gates
curl -X GET http://localhost:3000/api/targeting/decision-gates \
  -H "Authorization: Bearer $TOKEN"

# 3. Test Mission Command
curl -X GET http://localhost:3000/api/targeting/mission/intent \
  -H "Authorization: Bearer $TOKEN"

# 4. Test Targets
curl -X GET "http://localhost:3000/api/targeting/targets?limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 5. Test DTL
curl -X GET "http://localhost:3000/api/targeting/dtl?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Creating Test User

### Option 1: Register via API
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "targeting_cell_test",
    "email": "targeting_cell@test.mil",
    "password": "TargetingCell2026!"
  }'
```

### Option 2: Use SQL Script
```bash
cd backend
sqlite3 data/app.db < scripts/create_targeting_test_user.sql
```

### Option 3: Use Rust Script (if configured)
```bash
cd backend
# Add bin target to Cargo.toml first, then:
cargo run --bin create_test_user
```

---

## API Endpoints to Test

### Decision Gates (1 endpoint)
- `GET /api/targeting/decision-gates` - Returns ROE, CDE, Weather, Deconfliction status

### Mission Command (5 endpoints)
- `GET /api/targeting/mission/intent` - Commander's intent
- `PUT /api/targeting/mission/intent` - Update intent
- `GET /api/targeting/mission/guidance` - Targeting guidance
- `GET /api/targeting/mission/authority-matrix` - Decision authority
- `GET /api/targeting/mission/tempo` - Operational tempo

### Targets (8 endpoints)
- `GET /api/targeting/targets` - List targets
- `POST /api/targeting/targets` - Create target
- `GET /api/targeting/targets/:id` - Get target
- `GET /api/targeting/targets/:id/timeline` - Target timeline
- `PUT /api/targeting/targets/:id/advance-stage` - Advance F3EAD stage

### DTL (4 endpoints)
- `GET /api/targeting/dtl` - List DTL entries
- `POST /api/targeting/dtl` - Create DTL entry
- `PUT /api/targeting/dtl/:id/priority` - Update priority
- `GET /api/targeting/dtl/tst` - Get active TSTs

### ISR & Intelligence (7 endpoints)
- `GET /api/targeting/isr/platforms` - List ISR platforms
- `GET /api/targeting/isr/coverage` - ISR coverage analysis
- `GET /api/targeting/isr/pattern-of-life` - Pattern of life reports
- `GET /api/targeting/intel/reports` - Intelligence reports
- `GET /api/targeting/intel/fusion/:target_id` - Multi-INT fusion

### Assets & Risk (7 endpoints)
- `GET /api/targeting/assets/platforms` - Strike platforms
- `GET /api/targeting/assets/munitions` - Munitions inventory
- `POST /api/targeting/assets/pair` - Munitions pairing
- `GET /api/targeting/risk/:target_id` - Risk assessment
- `GET /api/targeting/risk/high` - High-risk targets

### Alternative Analysis (3 endpoints)
- `GET /api/targeting/analysis/assumptions` - Assumption challenges
- `GET /api/targeting/analysis/bias-alerts` - Cognitive bias alerts

### Collaboration (6 endpoints)
- `GET /api/targeting/decisions` - Decision log
- `POST /api/targeting/decisions` - Create decision
- `GET /api/targeting/handovers` - Shift handovers
- `GET /api/targeting/annotations/:target_id` - Target annotations

---

## Expected Test Results

### ✅ Success Criteria

1. **Backend Health**: `{"status":"OK","version":"0.1.1"}`
2. **Frontend Loads**: Dashboard page renders without errors
3. **Components Display**: All 8 NATO COPD components visible
4. **API Calls**: Components fetch data from backend (check browser Network tab)
5. **Authentication**: Protected endpoints require valid JWT token
6. **Fallback Data**: Mock data displays if API fails (graceful degradation)

### ⚠️ Known Issues

- Test user may need to be created manually
- Some endpoints return empty arrays if no data exists (expected)
- Docker migration checksum issue (use local dev for now)

---

## Troubleshooting

### Backend Not Running
```bash
cd backend
cargo run
```

### Frontend Not Running
```bash
cd frontend
npm run dev
```

### Authentication Fails
- Verify test user exists in database
- Check password matches (TargetingCell2026!)
- Verify JWT secret is configured

### API Returns 401
- Token may be expired
- Re-login to get new token
- Check Authorization header format: `Bearer <token>`

### Components Show Mock Data
- Check browser console for API errors
- Verify backend is running and accessible
- Check CORS settings if calling from different origin

---

## Next Steps

1. ✅ **Complete**: Backend and frontend running
2. ✅ **Complete**: All components integrated with APIs
3. ⏳ **In Progress**: Manual browser testing
4. ⏳ **Pending**: Playwright E2E test execution
5. ⏳ **Pending**: Performance testing (<30s refresh requirement)
6. ⏳ **Pending**: Load testing (500+ targets simultaneously)

---

**Last Updated**: 2026-01-21  
**Test Status**: Ready for manual and automated testing
