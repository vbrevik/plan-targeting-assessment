# E2E Testing Plan - Full Coverage Strategy
## Targeting Workbench NATO COPD Components

**Last Updated**: 2026-01-23  
**Status**: 🎯 Ready for Implementation  
**Timeline**: 2 weeks (10 business days)  
**Coverage Goal**: 100% of critical user workflows

---

## 🎯 Executive Summary

This plan provides comprehensive E2E test coverage for all 9 NATO COPD components using Playwright. The focus is on **critical user workflows** rather than UI polish, ensuring the targeting cell can perform its mission effectively.

### Success Criteria
- ✅ All 9 NATO COPD components have critical workflow coverage
- ✅ Target nomination → engagement lifecycle fully tested
- ✅ API integration verified for all components
- ✅ Error handling and edge cases covered
- ✅ Performance benchmarks established (<2s load, <30s refresh)

---

## 📊 Current State Analysis

### ✅ Existing Tests (14 files)
```
frontend/tests/
├── targeting-workbench-integration.spec.ts    (29 tests - API integration)
├── target-management-e2e.spec.ts              (15 tests - CRUD workflows)
├── roe-e2e.spec.ts                             (8 tests - ROE status)
├── bda-workbench-phase1.spec.ts               (12 tests - BDA workflow)
├── targeting-nato-copd.spec.ts                (18 tests - NATO components)
├── mission-command-api.spec.ts               (6 tests - API validation)
├── targeting-frontend-integration.spec.ts     (24 tests - Frontend integration)
├── bda-phase4-reporting.spec.ts               (10 tests - Reporting)
├── targeting-cell-role.spec.ts                (8 tests - Role-based access)
├── assumptions.spec.ts                        (5 tests - Assumption management)
├── e2e-auth.spec.ts                           (4 tests - Authentication)
├── copd-drilldown-navigation.spec.ts          (7 tests - Navigation)
├── change-password.spec.ts                    (3 tests - Security)
└── bda-workbench.spec.ts                      (16 tests - BDA features)
```

**Total Existing Tests**: 165 tests across 14 files

### 🟡 Coverage Gaps Identified
1. **Cross-component workflows** (tests span multiple components)
2. **Error handling scenarios** (API failures, network issues)
3. **Performance benchmarks** (load times, refresh rates)
4. **Data consistency** (real-time updates across components)
5. **Edge cases** (empty states, large datasets, concurrent users)

---

## 🏗️ Testing Architecture

### Test Organization Strategy

```
E2E Tests Structure:
├── 01-critical-workflows/          # Mission-critical paths (P0)
│   ├── target-lifecycle.spec.ts
│   ├── jtb-decision.spec.ts
│   └── bda-reporting.spec.ts
├── 02-component-integration/       # Individual component testing (P1)
│   ├── decision-gates.spec.ts
│   ├── mission-command.spec.ts
│   └── intelligence-fusion.spec.ts
├── 03-cross-cutting/              # System-wide concerns (P1)
│   ├── authentication.spec.ts
│   ├── data-refresh.spec.ts
│   └── error-handling.spec.ts
├── 04-performance/                # Performance and load (P2)
│   ├── load-times.spec.ts
│   ├── concurrent-users.spec.ts
│   └── large-datasets.spec.ts
└── 05-edge-cases/                 # Edge scenarios (P2)
    ├── empty-states.spec.ts
    ├── network-failures.spec.ts
    └── data-corruption.spec.ts
```

### Test Data Strategy

```typescript
// Test fixtures for consistent data
interface TestFixtures {
  // Target data
  standardTarget: Target;
  tstTarget: Target;
  hvtTarget: Target;
  
  // Mission data
  missionIntent: MissionIntent;
  targetingGuidance: TargetingGuidance;
  
  // User roles
  commander: User;
  targeteer: User;
  j2_officer: User;
  j3_officer: User;
}
```

---

## 📋 2-Week Implementation Plan

### Week 1: Critical Workflows & Component Integration

#### Day 1-2: Target Lifecycle (P0)
**File**: `01-critical-workflows/target-lifecycle.spec.ts`

```typescript
test.describe('Target Lifecycle - Nomination to Assessment', () => {
  test('Complete target workflow: Nominated → Validated → Approved → Engaged → Assessed', async ({ page }) => {
    // Step 1: Nominate target
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.click('[data-testid="nominate-target-button"]');
    await page.fill('[data-testid="target-name"]', 'TEST-TARGET-001');
    await page.selectOption('[data-testid="target-type"]', 'HVT');
    await page.fill('[data-testid="target-coordinates"]', '31.7683N, 35.2137E');
    await page.click('[data-testid="submit-nomination"]');
    
    // Step 2: Validate target (J2 workflow)
    await expect(page.locator('[data-testid="target-status"]')).toHaveText('NOMINATED');
    await page.click('[data-testid="validate-target-button"]');
    await expect(page.locator('[data-testid="target-status"]')).toHaveText('VALIDATED');
    
    // Step 3: Approve target (JTB workflow)
    await page.goto('/smartops/jtb-session');
    await page.click('[data-testid="approve-target-button"]');
    await page.fill('[data-testid="approval-rationale"]', 'Target meets all criteria');
    await page.click('[data-testid="confirm-approval"]');
    await expect(page.locator('[data-testid="target-status"]')).toHaveText('APPROVED');
    
    // Step 4: Engage target (Weapons release)
    await page.goto('/smartops/weapons-control');
    await page.click('[data-testid="engage-target-button"]');
    await expect(page.locator('[data-testid="target-status"]')).toHaveText('ENGAGED');
    
    // Step 5: Assess BDA
    await page.goto('/smartops/bda-workbench');
    await page.click('[data-testid="create-bda-button"]');
    await page.uploadFile('[data-testid="bda-image"]', 'test-assets/post-strike-image.jpg');
    await page.selectOption('[data-testid="bda-effectiveness"]', 'HIGH');
    await page.click('[data-testid="submit-bda"]');
    await expect(page.locator('[data-testid="target-status"]')).toHaveText('ASSESSED');
  });
});
```

#### Day 3-4: JTB Decision Workflows (P0)
**File**: `01-critical-workflows/jtb-decision.spec.ts`

```typescript
test.describe('Joint Targeting Board - Decision Workflows', () => {
  test('TST (Time-Sensitive Target) approval workflow', async ({ page }) => {
    // Create TST scenario
    await createTSTScenario(page);
    
    // Verify TST alert appears
    await expect(page.locator('[data-testid="tst-alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="tst-countdown"]')).toBeVisible();
    
    // Rapid approval process (<30 minutes)
    const startTime = Date.now();
    await page.click('[data-testid="tst-approve-button"]');
    await page.fill('[data-testid="tst-rationale"]', 'Imminent threat, requires immediate engagement');
    await page.click('[data-testid="tst-confirm-approval"]');
    
    const approvalTime = (Date.now() - startTime) / 1000;
    expect(approvalTime).toBeLessThan(30); // Must be under 30 seconds for UI test
  });
});
```

#### Day 5: Decision Gates Integration (P1)
**File**: `02-component-integration/decision-gates.spec.ts`

### Week 2: Cross-Cutting Concerns & Performance

#### Day 6-7: Data Refresh & Real-time Updates (P1)
**File**: `03-cross-cutting/data-refresh.spec.ts`

```typescript
test.describe('Real-time Data Refresh', () => {
  test('Decision gates refresh every 30 seconds', async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    
    // Get initial gate status
    const initialStatus = await getGateStatus(page, 'ROE');
    
    // Wait for refresh (30 seconds + 5 second buffer)
    await page.waitForTimeout(35000);
    
    // Verify data was refreshed (check for API call)
    const refreshedStatus = await getGateStatus(page, 'ROE');
    
    // Verify refresh indicator appeared
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
  });
});
```

#### Day 8-9: Error Handling & Edge Cases (P1)
**File**: `03-cross-cutting/error-handling.spec.ts`

#### Day 10: Performance Benchmarks (P2)
**File**: `04-performance/load-times.spec.ts`

---

## 🎯 Detailed Test Coverage Matrix

### NATO COPD Components Coverage

| Component | Critical Workflows | API Integration | Error Handling | Performance | Total Tests |
|-----------|-------------------|----------------|----------------|-------------|-------------|
| **Decision Gates Bar** | ✅ 4 tests | ✅ 3 tests | ✅ 2 tests | ✅ 1 test | **10 tests** |
| **Target Nomination Board** | ✅ 6 tests | ✅ 4 tests | ✅ 3 tests | ✅ 2 tests | **15 tests** |
| **Mission Command Overview** | ✅ 5 tests | ✅ 3 tests | ✅ 2 tests | ✅ 1 test | **11 tests** |
| **Intelligence Integration Panel** | ✅ 4 tests | ✅ 3 tests | ✅ 2 tests | ✅ 1 test | **10 tests** |
| **Alternative Analysis Panel** | ✅ 3 tests | ✅ 2 tests | ✅ 2 tests | ✅ 1 test | **8 tests** |
| **Risk Constraints Monitor** | ✅ 4 tests | ✅ 3 tests | ✅ 2 tests | ✅ 1 test | **10 tests** |
| **Effects Assessment Dashboard** | ✅ 5 tests | ✅ 3 tests | ✅ 2 tests | ✅ 1 test | **11 tests** |
| **Asset Capability Management** | ✅ 4 tests | ✅ 3 tests | ✅ 2 tests | ✅ 1 test | **10 tests** |
| **Collaborative Workspace** | ✅ 3 tests | ✅ 2 tests | ✅ 2 tests | ✅ 1 test | **8 tests** |

**Total New Tests**: 93 tests across 9 components

### Cross-Component Workflow Coverage

| Workflow | Components Involved | Test Priority | Test Count |
|----------|-------------------|---------------|------------|
| **Target Nomination → JTB Approval** | Target Board, JTB, Decision Gates | P0 | 5 tests |
| **Intelligence → Target Validation** | Intel Panel, Target Board, Risk Monitor | P0 | 4 tests |
| **Weapons Release → BDA Assessment** | Asset Mgmt, Effects Dashboard, BDA Workbench | P0 | 4 tests |
| **Mission Planning → Execution** | Mission Command, All Components | P1 | 3 tests |
| **Real-time Updates Across Dashboard** | All Components | P1 | 2 tests |

**Total Cross-Component Tests**: 18 tests

---

## 🔧 Implementation Guidelines

### Test Writing Standards

```typescript
// 1. Use data-testid selectors (avoid CSS classes)
await page.click('[data-testid="submit-button"]');

// 2. Include explicit waits for API calls
await page.waitForResponse('**/api/targeting/targets');

// 3. Add performance assertions
const loadTime = await measureLoadTime(page);
expect(loadTime).toBeLessThan(2000);

// 4. Include accessibility checks
await expect(page.locator('main')).toBeAccessible();

// 5. Use custom fixtures for consistent test data
await createTestTarget(page, { type: 'HVT', priority: 'CRITICAL' });
```

### Test Data Management

```typescript
// fixtures/testData.ts
export const testTargets = {
  hvt: {
    name: 'HVT-TEST-001',
    type: 'HVT',
    priority: 'CRITICAL',
    coordinates: '31.7683N, 35.2137E',
    status: 'NOMINATED'
  },
  tst: {
    name: 'TST-TEST-002',
    type: 'TST',
    priority: 'TIME_CRITICAL',
    coordinates: '31.7500N, 35.2000E',
    tst_deadline: new Date(Date.now() + 25 * 60 * 1000) // 25 minutes
  }
};
```

### Configuration Updates

```typescript
// playwright.config.ts enhancements
export default defineConfig({
  testDir: './tests',
  timeout: 60_000, // Increased for complex workflows
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 📊 Success Metrics & Reporting

### Coverage Targets

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| **Component Coverage** | 100% (9/9) | 85% (12/14 files) | 2 components |
| **Critical Workflow Coverage** | 100% | 70% | 6 workflows |
| **API Integration Coverage** | 100% | 80% | 8 endpoints |
| **Error Handling Coverage** | 90% | 40% | 15 scenarios |
| **Performance Test Coverage** | 100% | 10% | 9 benchmarks |

### Daily Progress Tracking

```typescript
// Daily test execution report
interface DailyReport {
  date: string;
  testsAdded: number;
  testsPassing: number;
  testsFailing: number;
  coverageIncrease: number;
  blockages: string[];
}
```

### Weekly Milestones

- **Week 1 End**: All critical workflows (P0) passing
- **Week 2 End**: Full coverage achieved, performance benchmarks met

---

## 🚀 Execution Strategy

### Prerequisites

1. **Environment Setup**
   ```bash
   # Install dependencies
   npm install -D @playwright/test
   
   # Install browsers
   npx playwright install
   
   # Verify setup
   npx playwright test --dry-run
   ```

2. **Test Data Setup**
   ```bash
   # Seed test database
   npm run test:seed-data
   
   # Verify API endpoints
   npm run test:api-health
   ```

3. **CI/CD Integration**
   ```yaml
   # .github/workflows/e2e-tests.yml
   name: E2E Tests
   on: [push, pull_request]
   jobs:
     e2e:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run test:e2e
   ```

### Execution Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- 01-critical-workflows

# Run with coverage
npm run test:e2e -- --coverage

# Run performance tests
npm run test:e2e -- --project=performance

# Generate report
npm run test:e2e-report
```

---

## 🎯 Expected Outcomes

### After 2 Weeks

✅ **93 new E2E tests** covering all NATO COPD components  
✅ **18 cross-component workflow tests**  
✅ **Performance benchmarks** established (<2s load, <30s refresh)  
✅ **Error handling scenarios** documented and tested  
✅ **CI/CD integration** for automated test execution  

### Long-term Benefits

- **Regression Prevention**: Catch breaking changes before deployment
- **Performance Monitoring**: Continuous performance tracking
- **Documentation**: Living documentation of system behavior
- **Quality Assurance**: Confidence in system reliability for mission-critical operations

---

## 📞 Support & Resources

### Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| **Test flakiness** | Add explicit waits, use data-testid selectors |
| **Slow tests** | Use test fixtures, parallel execution |
| **API failures** | Mock external dependencies, check test data |
| **Browser issues** | Update playwright, clear browser cache |

### Documentation Links

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Organization Patterns](https://playwright.dev/docs/test-organization)
- [Performance Testing Guide](https://playwright.dev/docs/performance-testing)

---

**Ready to begin implementation on Day 1 with target lifecycle workflows!**