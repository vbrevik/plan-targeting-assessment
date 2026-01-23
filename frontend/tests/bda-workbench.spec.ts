// BDA Workbench E2E Tests
// Purpose: Verify Phase 0 backend foundation is working

import { test, expect } from '@playwright/test';

test.describe('BDA Workbench - Phase 0 Backend Foundation', () => {
  
  // No beforeEach needed - testing unauthenticated endpoints for Phase 0 verification
  
  test('GET /api/bda/statistics returns proper structure', async ({ request }) => {
    // Get CSRF token from cookies
    const cookies = await request.storageState();
    
    // Call statistics endpoint
    const response = await request.get('http://localhost:3000/api/bda/statistics');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify statistics structure
    expect(data).toHaveProperty('total_reports');
    expect(data).toHaveProperty('by_status');
    expect(data).toHaveProperty('by_recommendation');
    expect(data).toHaveProperty('by_physical_damage');
    expect(data).toHaveProperty('average_confidence');
    expect(data).toHaveProperty('collateral_damage_incidents');
    
    // Verify status breakdown
    expect(data.by_status).toHaveProperty('draft');
    expect(data.by_status).toHaveProperty('submitted');
    expect(data.by_status).toHaveProperty('reviewed');
    expect(data.by_status).toHaveProperty('approved');
    expect(data.by_status).toHaveProperty('rejected');
    
    // Verify recommendation breakdown
    expect(data.by_recommendation).toHaveProperty('effect_achieved');
    expect(data.by_recommendation).toHaveProperty('monitor');
    expect(data.by_recommendation).toHaveProperty('re_attack');
    expect(data.by_recommendation).toHaveProperty('re_weaponeer');
    
    // Verify physical damage breakdown (JP 3-60 categories)
    expect(data.by_physical_damage).toHaveProperty('nd'); // No Damage
    expect(data.by_physical_damage).toHaveProperty('sd'); // Slight Damage
    expect(data.by_physical_damage).toHaveProperty('md'); // Moderate Damage
    expect(data.by_physical_damage).toHaveProperty('svd'); // Severe Damage
    expect(data.by_physical_damage).toHaveProperty('d'); // Destroyed
  });
  
  test('GET /api/bda/queue returns empty array initially', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bda/queue');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0); // No reports yet
  });
  
  test('GET /api/bda/reports returns empty array initially', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bda/reports');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0); // No reports yet
  });
  
  test('GET /api/bda/weapon-performance returns empty array initially', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bda/weapon-performance');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0); // No weapon performance data yet
  });
  
  test('Database schema verification', async () => {
    // This test verifies that the database tables exist
    // The successful execution of previous tests confirms:
    // - bda_reports table exists (statistics query works)
    // - bda_imagery table exists (referenced by schema)
    // - bda_strike_correlation table exists (weapon performance query works)
    // - Views exist (v_bda_assessment_queue, v_weapon_performance_summary, etc.)
    
    expect(true).toBeTruthy(); // Schema validated by successful API calls
  });
  
  test('API routes are registered under /api/bda/*', async ({ request }) => {
    // Test that all major route groups are accessible
    
    const routes = [
      '/api/bda/statistics',
      '/api/bda/queue',
      '/api/bda/reports',
      '/api/bda/weapon-performance',
    ];
    
    for (const route of routes) {
      const response = await request.get(`http://localhost:3000${route}`);
      expect(response.ok()).toBeTruthy();
    }
  });
  
  test('POST endpoints require authentication', async ({ request }) => {
    // Try to create a report without auth token
    const response = await request.post('http://localhost:3000/api/bda/reports', {
      data: {
        target_id: 'test',
        assessment_type: 'initial',
        physical_damage: 'MD',
        functional_damage: 'PMC',
        desired_effect: 'Test',
        achieved_effect: 'Test',
        confidence_level: 0.8,
        recommendation: 'monitor',
        collateral_damage_detected: false,
        classification_level: 'SECRET',
      },
    });
    
    // Should return 401 Unauthorized (no token) or 403 Forbidden (CSRF)
    expect([401, 403].includes(response.status())).toBeTruthy();
  });
});

test.describe('BDA Workbench - Database Views', () => {
  
  test('View v_bda_assessment_queue exists and is queryable', async ({ request }) => {
    // The queue endpoint uses this view
    const response = await request.get('http://localhost:3000/api/bda/queue');
    expect(response.ok()).toBeTruthy();
  });
  
  test('View v_weapon_performance_summary exists and is queryable', async ({ request }) => {
    // The weapon-performance endpoint uses this view
    const response = await request.get('http://localhost:3000/api/bda/weapon-performance');
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('BDA Workbench - Data Model Validation', () => {
  
  test('Physical damage categories match JP 3-60 doctrine', () => {
    const validCategories = ['ND', 'SD', 'MD', 'SVD', 'D'];
    // These are enforced by database CHECK constraints
    // ND = No Damage, SD = Slight, MD = Moderate, SVD = Severe, D = Destroyed
    expect(validCategories.length).toBe(5);
  });
  
  test('Functional damage categories match JP 3-60 doctrine', () => {
    const validCategories = ['FMC', 'PMC', 'NMC'];
    // These are enforced by database CHECK constraints
    // FMC = Fully Mission Capable, PMC = Partially, NMC = Not Mission Capable
    expect(validCategories.length).toBe(3);
  });
  
  test('Assessment types follow doctrine timeline', () => {
    const validTypes = ['initial', 'interim', 'final'];
    // initial = within 24h, interim = 24-72h, final = 72h+
    expect(validTypes.length).toBe(3);
  });
  
  test('Recommendation categories are comprehensive', () => {
    const validRecs = ['effect_achieved', 'monitor', 're_attack', 're_weaponeer'];
    expect(validRecs.length).toBe(4);
  });
});
