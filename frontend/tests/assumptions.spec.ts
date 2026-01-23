import { test, expect } from '@playwright/test';

test.describe('Assumptions Management', () => {
  const baseURL = 'http://localhost:3000';
  
  test.beforeEach(async ({ request }) => {
    // Cleanup any test assumptions before each test
    await request.post(`${baseURL}/api/test/cleanup`, { 
      data: { prefix: 'e2e_assumption_' } 
    }).catch(() => {
      // Ignore if cleanup endpoint doesn't exist yet
    });
  });

  test('create assumption via API', async ({ request }) => {
    const assumptionData = {
      title: 'e2e_assumption_test_' + Date.now(),
      description: 'Enemy will not deploy armor to Sector 4 during Phase 1',
      category: 'Enemy',
      confidence_score: 75,
    };

    const response = await request.post(`${baseURL}/api/assumptions`, {
      data: assumptionData,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe(assumptionData.title);
    expect(body.status).toBe('Valid'); // Default status
    expect(body.risk_level).toBe('Low'); // Default risk level
    expect(body.category).toBe('Enemy');
    expect(body.confidence_score).toBe(75);
  });

  test('get all assumptions via API', async ({ request }) => {
    // Create a test assumption first
    const assumptionData = {
      title: 'e2e_assumption_list_' + Date.now(),
      category: 'Friendly',
      description: 'Test assumption for listing',
    };

    const createResponse = await request.post(`${baseURL}/api/assumptions`, {
      data: assumptionData,
    });
    expect(createResponse.status()).toBe(201);

    // Get all assumptions
    const listResponse = await request.get(`${baseURL}/api/assumptions`);
    expect(listResponse.status()).toBe(200);
    const assumptions = await listResponse.json();
    expect(Array.isArray(assumptions)).toBe(true);
    expect(assumptions.length).toBeGreaterThan(0);
    
    // Verify our assumption is in the list
    const found = assumptions.find((a: any) => a.title === assumptionData.title);
    expect(found).toBeTruthy();
  });

  test('update assumption status to Broken', async ({ request }) => {
    // Create assumption
    const createData = {
      title: 'e2e_assumption_update_' + Date.now(),
      category: 'Intelligence',
      description: 'Enemy communication patterns remain predictable',
      confidence_score: 80,
    };

    const createResponse = await request.post(`${baseURL}/api/assumptions`, {
      data: createData,
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    // Update to Broken status
    const updateData = {
      status: 'Broken',
      risk_level: 'Critical',
      impact_notes: 'Enemy has changed communication patterns, SIGINT unreliable',
    };

    const updateResponse = await request.put(
      `${baseURL}/api/assumptions/${created.id}`,
      { data: updateData }
    );
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated.status).toBe('Broken');
    expect(updated.risk_level).toBe('Critical');
    expect(updated.impact_notes).toContain('communication patterns');
  });

  test('filter assumptions by status', async ({ request }) => {
    // Create assumptions with different statuses
    const assumption1 = {
      title: 'e2e_assumption_valid_' + Date.now(),
      category: 'Environmental',
      status: 'Valid',
    };

    const assumption2 = {
      title: 'e2e_assumption_monitoring_' + Date.now(),
      category: 'Political',
    };

    // Create first assumption
    const resp1 = await request.post(`${baseURL}/api/assumptions`, {
      data: assumption1,
    });
    expect(resp1.status()).toBe(201);
    const created1 = await resp1.json();

    // Create and update second assumption to Monitoring
    const resp2 = await request.post(`${baseURL}/api/assumptions`, {
      data: assumption2,
    });
    expect(resp2.status()).toBe(201);
    const created2 = await resp2.json();

    await request.put(`${baseURL}/api/assumptions/${created2.id}`, {
      data: { status: 'Monitoring' },
    });

    // Filter by Valid status
    const validResponse = await request.get(`${baseURL}/api/assumptions?status=Valid`);
    expect(validResponse.status()).toBe(200);
    const validAssumptions = await validResponse.json();
    const foundValid = validAssumptions.find((a: any) => a.id === created1.id);
    expect(foundValid).toBeTruthy();

    // Filter by Monitoring status
    const monitoringResponse = await request.get(`${baseURL}/api/assumptions?status=Monitoring`);
    expect(monitoringResponse.status()).toBe(200);
    const monitoringAssumptions = await monitoringResponse.json();
    const foundMonitoring = monitoringAssumptions.find((a: any) => a.id === created2.id);
    expect(foundMonitoring).toBeTruthy();
  });

  test('get assumptions summary', async ({ request }) => {
    // Create multiple assumptions with different statuses
    const assumptions = [
      { title: 'e2e_summary_1_' + Date.now(), category: 'Enemy', status: 'Valid' },
      { title: 'e2e_summary_2_' + Date.now(), category: 'Friendly', status: 'Valid' },
      { title: 'e2e_summary_3_' + Date.now(), category: 'Political', status: 'Monitoring' },
    ];

    // Create assumptions
    for (const assumption of assumptions) {
      const resp = await request.post(`${baseURL}/api/assumptions`, {
        data: assumption,
      });
      expect(resp.status()).toBe(201);
      const created = await resp.json();
      
      // Update status if needed
      if (assumption.status !== 'Valid') {
        await request.put(`${baseURL}/api/assumptions/${created.id}`, {
          data: { status: assumption.status },
        });
      }
    }

    // Get summary
    const summaryResponse = await request.get(`${baseURL}/api/assumptions/summary`);
    expect(summaryResponse.status()).toBe(200);
    const summary = await summaryResponse.json();
    
    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('valid');
    expect(summary).toHaveProperty('monitoring');
    expect(summary).toHaveProperty('challenged');
    expect(summary).toHaveProperty('broken');
    expect(summary.total).toBeGreaterThan(0);
  });

  test('delete assumption', async ({ request }) => {
    // Create assumption
    const createData = {
      title: 'e2e_assumption_delete_' + Date.now(),
      category: 'Logistical',
      description: 'Assumption to be deleted',
    };

    const createResponse = await request.post(`${baseURL}/api/assumptions`, {
      data: createData,
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    // Delete assumption
    const deleteResponse = await request.delete(
      `${baseURL}/api/assumptions/${created.id}`
    );
    expect(deleteResponse.status()).toBe(204);

    // Verify deletion
    const getResponse = await request.get(
      `${baseURL}/api/assumptions/${created.id}`
    );
    expect(getResponse.status()).toBe(404);
  });

  test('validate assumption categories', async ({ request }) => {
    const validCategories = [
      'Enemy',
      'Friendly',
      'Environmental',
      'Political',
      'Logistical',
      'Intelligence',
      'Temporal',
      'Technical',
    ];

    for (const category of validCategories) {
      const assumptionData = {
        title: `e2e_assumption_category_${category}_` + Date.now(),
        category: category,
        description: `Testing ${category} category`,
      };

      const response = await request.post(`${baseURL}/api/assumptions`, {
        data: assumptionData,
      });
      
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.category).toBe(category);
    }
  });

  test('broken assumptions appear in uncertainty page integration', async ({ request }) => {
    // Create a broken assumption
    const createData = {
      title: 'e2e_assumption_broken_integration_' + Date.now(),
      category: 'Enemy',
      description: 'Enemy will not use chemical weapons',
      confidence_score: 90,
    };

    const createResponse = await request.post(`${baseURL}/api/assumptions`, {
      data: createData,
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    // Mark it as broken
    const updateResponse = await request.put(
      `${baseURL}/api/assumptions/${created.id}`,
      { 
        data: { 
          status: 'Broken',
          risk_level: 'High',
          impact_notes: 'Enemy has deployed chemical weapons, all force protection plans compromised'
        } 
      }
    );
    expect(updateResponse.status()).toBe(200);

    // Verify it appears in broken assumptions list
    const brokenResponse = await request.get(`${baseURL}/api/assumptions?status=Broken`);
    expect(brokenResponse.status()).toBe(200);
    const brokenAssumptions = await brokenResponse.json();
    const found = brokenAssumptions.find((a: any) => a.id === created.id);
    expect(found).toBeTruthy();
    expect(found.status).toBe('Broken');
    expect(found.risk_level).toBe('High');
  });

  test('assumption confidence score validation', async ({ request }) => {
    // Test valid confidence scores
    const validScores = [0, 50, 100];
    
    for (const score of validScores) {
      const assumptionData = {
        title: `e2e_assumption_confidence_${score}_` + Date.now(),
        category: 'Intelligence',
        confidence_score: score,
      };

      const response = await request.post(`${baseURL}/api/assumptions`, {
        data: assumptionData,
      });
      
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.confidence_score).toBe(score);
    }
  });
});
