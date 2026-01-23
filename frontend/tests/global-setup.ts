// Global setup for E2E tests
// Runs once before all test suites

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Global Setup');
  
  // Set up test database if needed
  console.log('📊 Setting up test database...');
  
  // Verify backend is running
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Check if backend API is accessible
    const response = await page.request.get('http://localhost:5173/api/health');
    if (response.ok()) {
      console.log('✅ Backend API is accessible');
    } else {
      console.log('⚠️ Backend API not accessible, some tests may fail');
    }
  } catch (error) {
    console.log('⚠️ Could not connect to backend:', error.message);
  }
  
  await browser.close();
  console.log('✅ Global setup complete');
}

export default globalSetup;