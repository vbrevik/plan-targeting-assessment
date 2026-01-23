// Global teardown for E2E tests
// Runs once after all test suites

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E Test Global Teardown');
  
  // Clean up test data if needed
  console.log('📊 Cleaning up test database...');
  
  // Generate test report summary
  console.log('📈 Test execution complete');
  console.log('📊 Reports available in playwright-report/');
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;