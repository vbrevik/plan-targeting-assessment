# Playwright Testing - Full Test Suite

## Status: ✅ UI Launched

**Date**: 2026-01-21  
**Playwright Version**: 1.57.0  
**Test Directory**: `frontend/tests/`  
**Base URL**: http://localhost:5173

---

## Available Test Suites

### NATO COPD Targeting Cell Dashboard
- **File**: `tests/targeting-nato-copd.spec.ts`
- **Coverage**: All 8 NATO COPD components
- **Scenarios**: 53 test cases
- **Status**: ✅ Ready
- **Focus**: Primary test suite for NATO COPD dashboard verification
- **Key Tests**:
  - All 8 components display
  - Decision Gates Bar functionality
  - F3EAD pipeline stages
  - TST countdown timers
  - Multi-INT fusion
  - Pattern of Life analytics
  - ISR collection status
  - BDA assessments
  - Strike platform availability
  - Risk assessments
  - Alternative analysis alerts
  - Collaborative features

### Other Test Suites
1. `tests/mission-command-api.spec.ts` - Mission command API tests
2. `tests/assumptions.spec.ts` - Assumptions management
3. `tests/change-password.spec.ts` - Password change flow
4. `tests/targeting-cell-role.spec.ts` - Role-based access
5. `tests/targeting-workbench-integration.spec.ts` - Workbench integration
6. `tests/targeting-frontend-integration.spec.ts` - Frontend integration
7. `tests/e2e-auth.spec.ts` - Authentication E2E
8. `tests/bda-workbench-phase1.spec.ts` - BDA Phase 1
9. `tests/bda-workbench.spec.ts` - BDA full suite

---

## Running Tests

### Playwright UI (Recommended)
```bash
cd frontend
npx playwright test --ui
```

**Features**:
- Visual test execution
- Step-by-step debugging
- Screenshot comparison
- Test replay
- Time travel debugging

### Command Line
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test targeting-nato-copd.spec.ts

# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

---

## Test Configuration

**Base URL**: http://localhost:5173 (Frontend)  
**Timeout**: 30 seconds per test  
**Retries**: 0 (disabled)  
**Trace**: On first retry

---

## Prerequisites

1. ✅ Backend running on port 3000
2. ✅ Frontend running on port 5173
3. ✅ Test user created: `targeting_cell@test.mil` / `TargetingCell2026!`

---

## Expected Test Results

### NATO COPD Dashboard Tests
- ✅ All 8 components visible
- ✅ Decision Gates Bar functional
- ✅ F3EAD pipeline displays
- ✅ TST countdown timers working
- ✅ Multi-INT fusion display
- ✅ BDA tracking functional
- ✅ Risk assessments display
- ✅ Alternative analysis alerts
- ✅ Collaborative features working

---

## Troubleshooting

### Tests Fail with "Page not found"
- Verify frontend is running: `curl http://localhost:5173`
- Check baseURL in `playwright.config.ts`

### Authentication Errors
- Verify test user exists
- Check backend is running: `curl http://localhost:3000/api/health`

### Timeout Errors
- Increase timeout in `playwright.config.ts`
- Check network connectivity

---

**Last Updated**: 2026-01-21  
**Status**: Playwright UI launched and ready for test execution
