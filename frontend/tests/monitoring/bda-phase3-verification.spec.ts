// BDA Phase 3 Verification Test
// Focus: Intelligence Integration & Ontology-First Data Flow

import { expect } from '@playwright/test';
import { targetingUserTest as test } from '../fixtures/auth';

const INTEL_API = 'http://localhost:3000/api/intelligence';
const ONTOLOGY_API = 'http://localhost:3000/api/ontology';

test.describe('BDA Phase 3 Integration - Intelligence & Ontology', () => {

    test('Should create intelligence feed and verify ontology projection', async ({ authenticatedRequest: request }) => {
        const targetId = 'bab40e83-9d6a-4faf-b2ca-1b999c2c275b';

        // 1. Create an Intelligence Feed entry
        const intelData = {
            target_id: targetId,
            intel_type: 'sigint',
            source_agency: 'NSA/CSS',
            raw_data: 'Intercepted encrypted transmission at target site: "Operational status: Red"',
            interpretation: 'Target facility exhibits increased electronic activity consistent with secondary command node.',
            confidence_score: 0.85,
            reliability_rating: 'A1',
            visibility_level: 'TOP SECRET',
            external_reference_id: 'SIG-2026-X45'
        };

        const intelResponse = await request.post(`${INTEL_API}`, { data: intelData });
        expect(intelResponse.status()).toBe(201);
        const feed = await intelResponse.json();
        expect(feed.id).toBeDefined();

        // 2. Verify retrieval via Intelligence API
        const getIntelResponse = await request.get(`${INTEL_API}/target/${targetId}`);
        expect(getIntelResponse.ok()).toBeTruthy();
        const feeds = await getIntelResponse.json();
        expect(feeds.some((f: any) => f.id === feed.id)).toBeTruthy();

        // 3. Verify Ontology Projection (The "Ontology-First" check)
        // Every IntelFeed should have been synced to the 'entities' table via database triggers
        const ontologyEntityResponse = await request.get(`${ONTOLOGY_API}/entities/${feed.id}`);
        expect(ontologyEntityResponse.status()).toBe(200);
        const entity = await ontologyEntityResponse.json();

        expect(entity.type).toBe('INTEL_FEED'); // Sync trigger uses 'INTEL_FEED' (checked migration)
        expect(entity.properties.source).toBe('NSA/CSS');

        // 4. Verify Relationship existence in Ontology
        // The trigger should have created a 'PROVIDES_INTEL_FOR' relationship to the target
        const neighborsResponse = await request.get(`${ONTOLOGY_API}/entities/${feed.id}/neighbors`);
        expect(neighborsResponse.ok()).toBeTruthy();
        const neighbors = await neighborsResponse.json();

        // Target should be a neighbor of the Intel Feed
        expect(neighbors.some((n: any) => n.id === targetId)).toBeTruthy();
    });

    test('Intelligence Panel should be accessible for a target', async ({ authenticatedRequest: request }) => {
        const targetId = 'bab40e83-9d6a-4faf-b2ca-1b999c2c275b';
        const response = await request.get(`${INTEL_API}/target/${targetId}`);
        expect(response.status()).toBe(200);
    });
});
