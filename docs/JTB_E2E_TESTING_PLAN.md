# JTB Decision Workflow E2E Tests

## 📋 Test Coverage Analysis & Plan

### Current JTB Coverage Status
**Current Tests**: 2 JTB-related tests in target-lifecycle.spec.ts
- ✅ Basic target approval
- ✅ TST rapid approval

**Missing Coverage**:
- ❌ Session creation/management
- ❌ Multi-target approval
- ❌ Decision recording
- ❌ Session archiving
- ❌ Concurrent approvals
- ❌ Error handling

---

## 🎯 **JTB Test Expansion Plan**

### **Phase 1: Core JTB Functionality (Day 2)**

#### 1. JTB Session Management
```typescript
// tests/01-critical-workflows/jtb-decision.spec.ts
test.describe('JTB Session Management', () => {
  test('should create JTB session with all required fields', async ({ page }) => {
    // Create session with chairman, date, time
    // Verify session created successfully
    // Verify session appears in list
  });

  test('should add multiple targets to session', async ({ page }) => {
    // Create session
    // Add 3 targets to session
    // Verify all targets appear in session
  });

  test('should archive completed session', async ({ page }) => {
    // Complete session
    // Archive session
    // Verify session no longer in active list
    // Verify session in archive
  });

  test('should retrieve and display session history', async ({ page }) => {
    // Create multiple sessions
    // View session history
    // Verify all sessions displayed
  });
});
```

#### 2. Multi-Target Approval Workflow
```typescript
// tests/01-critical-workflows/jtb-decision.spec.ts
test.describe('Multi-Target Approval', () => {
  test('should approve multiple targets in single session', async ({ page }) => {
    // Create session with 3 targets
    // Approve all targets
    // Verify all statuses updated to APPROVED
  });

  test('should handle mixed approvals (approve/reject)', async ({ page }) => {
    // Create session with 3 targets
    // Approve 2, reject 1
    // Verify correct statuses
  });

  test('should maintain approval order and timestamps', async ({ page }) => {
    // Approve targets in sequence
    // Verify timestamps in order
    // Verify approval sequence recorded
  });
});
```

### **Phase 2: Advanced JTB Scenarios (Day 3)**

#### 3. Decision Recording & Rationale
```typescript
// tests/02-component-integration/decision-gates.spec.ts
test.describe('Decision Recording', () => {
  test('should record approval rationale for each target', async ({ page }) => {
    // Approve target with rationale
    // Verify rationale stored
    // Verify rationale displayed in timeline
  });

  test('should record rejection rationale with details', async ({ page }) => {
    // Reject target with rationale
    // Verify rationale stored
    // Verify rejection details recorded
  });

  test('should allow rationale editing before finalization', async ({ page }) => {
    // Create approval with rationale
    // Edit rationale
    // Verify changes saved
  });
});
```

#### 4. Concurrent Approval Scenarios
```typescript
// tests/03-cross-cutting/data-refresh.spec.ts
test.describe('Concurrent JTB Operations', () => {
  test('should handle concurrent target additions', async ({ page }) => {
    // Add targets concurrently
    // Verify all targets appear
    // Verify no duplicates
  });

  test('should prevent duplicate approvals', async ({ page }) => {
    // Attempt to approve same target twice
    // Verify second attempt blocked
    // Verify error message displayed
  });

  test('should handle session conflicts gracefully', async ({ page }) => {
    // Create overlapping sessions
    // Verify conflict resolution
    // Verify targets not double-assigned
  });
});
```

### **Phase 3: Error Handling & Edge Cases (Day 4)**

#### 5. Error Handling
```typescript
// tests/05-edge-cases/jtb-errors.spec.ts
test.describe('JTB Error Handling', () => {
  test('should handle API failures during approval', async ({ page }) => {
    // Mock API failure
    // Attempt approval
    // Verify error handling
    // Verify retry option
  });

  test('should handle network timeouts', async ({ page }) => {
    // Mock network timeout
    // Attempt approval
    // Verify timeout handling
  });

  test('should handle invalid session data', async ({ page }) => {
    // Create session with invalid data
    // Verify validation errors
    // Verify form prevents submission
  });
});
```

#### 6. Edge Cases
```typescript
// tests/05-edge-cases/jtb-edge-cases.spec.ts
test.describe('JTB Edge Cases', () => {
  test('should handle empty session (no targets)', async ({ page }) => {
    // Create session with no targets
    // Verify appropriate messaging
    // Verify cannot complete session
  });

  test('should handle large session (50+ targets)', async ({ page }) => {
    // Create session with 50 targets
    // Verify performance acceptable
    // Verify all targets displayed
  });

  test('should handle session timeouts', async ({ page }) => {
    // Create session that expires
    // Verify timeout handling
    // Verify session marked as expired
  });
});
```

---

## 📊 **Test Coverage Matrix**

### **Current Coverage**
| Category | Tests | Coverage |
|----------|-------|----------|
| Session Management | 0 | 0% |
| Multi-Target Approval | 0 | 0% |
| Decision Recording | 0 | 0% |
| Concurrent Operations | 0 | 0% |
| Error Handling | 0 | 0% |
| Edge Cases | 0 | 0% |

### **Target Coverage**
| Category | Tests | Coverage |
|----------|-------|----------|
| Session Management | 4 | 100% |
| Multi-Target Approval | 3 | 100% |
| Decision Recording | 3 | 100% |
| Concurrent Operations | 3 | 100% |
| Error Handling | 3 | 100% |
| Edge Cases | 3 | 100% |

**Total Target**: 16 tests for complete JTB coverage

---

## 🚀 **Implementation Plan**

### **Day 2: Core JTB Functionality**
1. ✅ Create JTB session management tests (4 tests)
2. ✅ Create multi-target approval tests (3 tests)
3. ✅ Validate session creation workflow
4. ✅ Test multi-target scenarios

### **Day 3: Advanced Scenarios**
1. ✅ Create decision recording tests (3 tests)
2. ✅ Test concurrent operations (3 tests)
3. ✅ Validate data consistency
4. ✅ Test performance with multiple targets

### **Day 4: Error Handling**
1. ✅ Create error handling tests (3 tests)
2. ✅ Create edge case tests (3 tests)
3. ✅ Validate error recovery
4. ✅ Test boundary conditions

### **Day 5: Validation & Integration**
1. ✅ Run all JTB tests
2. ✅ Fix any failures
3. ✅ Integrate with target lifecycle tests
4. ✅ Validate end-to-end workflow

---

## 📞 **Resources & Guidelines**

### **Test Writing Best Practices**

1. **Use consistent selectors**
   ```typescript
   // Good
   await page.click('[data-testid="approve-target-button"]');
   
   // Avoid
   await page.click('.btn-primary');
   ```

2. **Include setup and teardown**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.addInitScript(() => {
       window.localStorage.setItem('user_role', 'JTB_CHAIR');
     });
   });
   ```

3. **Mock API responses when needed**
   ```typescript
   await page.route('**/api/targeting/jtb/sessions', route => {
     route.fulfill({
       status: 201,
       contentType: 'application/json',
       body: JSON.stringify({ id: 'session-001', status: 'CREATED' })
     });
   });
   ```

4. **Verify both UI and API states**
   ```typescript
   // Verify UI
   await expect(page.locator('[data-testid="session-status"]')).toHaveText('APPROVED');
   
   // Verify API
   const response = await page.request.get('/api/targeting/jtb/sessions/session-001');
   expect(response.ok()).toBeTruthy();
   ```

5. **Include performance assertions**
   ```typescript
   const startTime = Date.now();
   await page.click('[data-testid="approve-all-button"]');
   const endTime = Date.now();
   const approvalTime = endTime - startTime;
   expect(approvalTime).toBeLessThan(15000); // 15 seconds for 10 targets
   ```

---

## ✅ **Success Criteria**

### **After Day 2**
- ✅ 7 core JTB tests implemented
- ✅ Session management functional
- ✅ Multi-target approval working
- ✅ Basic validation complete

### **After Day 3**
- ✅ 10 advanced JTB tests implemented
- ✅ Decision recording functional
- ✅ Concurrent operations tested
- ✅ Performance benchmarks met

### **After Day 4**
- ✅ 16 total JTB tests implemented
- ✅ Error handling complete
- ✅ Edge cases covered
- ✅ Full JTB coverage achieved

### **Final Target**
- ✅ 16 JTB-specific tests
- ✅ 100% JTB workflow coverage
- ✅ Integration with target lifecycle
- ✅ Performance benchmarks met

---

## 📈 **Progress Tracking**

### **Day 2 Progress**
- [ ] Session management tests (4/4)
- [ ] Multi-target approval tests (3/3)
- [ ] Basic validation (1/1)

### **Day 3 Progress**
- [ ] Decision recording tests (3/3)
- [ ] Concurrent operations tests (3/3)
- [ ] Performance testing (1/1)

### **Day 4 Progress**
- [ ] Error handling tests (3/3)
- [ ] Edge case tests (3/3)
- [ ] Integration testing (1/1)

**Total**: 16 tests for complete JTB coverage

---

## 🎯 **Next Steps**

1. **Immediately**: Create JTB session management tests
2. **Today**: Create multi-target approval tests
3. **Tomorrow**: Create decision recording tests
4. **Day 4**: Create error handling and edge case tests
5. **Day 5**: Validate all JTB tests and integrate

**Target**: Complete JTB test suite with 16 tests by end of Day 4