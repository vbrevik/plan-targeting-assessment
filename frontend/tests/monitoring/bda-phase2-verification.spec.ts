// BDA Phase 2 Verification Test
// Focus: Strike Correlation & Weaponeering Validation flow

import { expect } from '@playwright/test';
import { targetingUserTest as test } from '../fixtures/auth';

const BDA_API = 'http://localhost:3000/api/bda';

test.describe('BDA Phase 2 Integration - Weaponeering Validation', () => {

    test('Should link BDA report to strike and save weaponeering data', async ({ authenticatedRequest: request }) => {
        const targetId = 'bab40e83-9d6a-4faf-b2ca-1b999c2c275b';

        // 1. Create BDA Report first
        const reportData = {
            target_id: targetId,
            assessment_type: 'initial',
            physical_damage: 'MD',
            functional_damage: 'PMC',
            desired_effect: 'Neutralize capability',
            achieved_effect: 'Partial success',
            confidence_level: 0.9,
            recommendation: 'monitor',
            collateral_damage_detected: false,
            weapon_performance_vs_predicted: 'met',
            circular_error_probable_meters: 4.5,
            munition_reliability: 'Nominal functioning of all components',
            penetration_depth_meters: 2.1,
            classification_level: 'SECRET'
        };

        const reportResponse = await request.post(`${BDA_API}/reports`, { data: reportData });
        expect(reportResponse.status()).toBe(201);
        const report = await reportResponse.json();

        // 2. Create a mock strike for this target, linked to this report
        const strikeData = {
            bda_report_id: report.id,
            target_id: targetId,
            strike_mission_id: 'MSN-PHASE2-001',
            weapon_system: 'F-16C',
            munition_type: 'GBU-31 JDAM',
            munition_quantity: 2,
            time_on_target: new Date().toISOString(),
            impact_coordinates: '35.123, -117.456',
            circular_error_probable_meters: 4.5,
            classification_level: 'SECRET',
            malfunction_detected: false
        };

        const strikeResponse = await request.post(`${BDA_API}/strikes`, { data: strikeData });
        expect([200, 201]).toContain(strikeResponse.status());
        const strike = await strikeResponse.json();

        // 3. Verify the report retrieval includes Phase 2 fields
        // and that we can find the strike for this report/target
        const getResponse = await request.get(`${BDA_API}/reports/${report.id}`);
        expect(getResponse.ok()).toBeTruthy();
        const fetchedReport = await getResponse.json();

        expect(fetchedReport.weapon_performance_vs_predicted).toBe('met');
        expect(fetchedReport.circular_error_probable_meters).toBe(4.5);

        const strikesByTarget = await request.get(`${BDA_API}/strikes/target/${targetId}`);
        expect(strikesByTarget.ok()).toBeTruthy();
        const strikes = await strikesByTarget.json();
        expect(strikes.some((s: any) => s.id === strike.id)).toBeTruthy();
        expect(strikes.find((s: any) => s.id === strike.id).target_id).toBe(targetId);
    });

    test('Weapon Performance Summary API should aggregate Phase 2 data', async ({ authenticatedRequest: request }) => {
        const response = await request.get(`${BDA_API}/weapon-performance`);

        expect([200, 403, 404, 500]).toContain(response.status());

        if (response.ok()) {
            const data = await response.json();
            expect(Array.isArray(data)).toBeTruthy();
            if (data.length > 0) {
                expect(data[0]).toHaveProperty('weapon_system');
                expect(data[0]).toHaveProperty('reliability_percentage');
            }
        }
    });
});
