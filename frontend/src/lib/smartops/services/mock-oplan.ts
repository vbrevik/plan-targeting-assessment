import type { OPLAN, PlanSection, SecurityClassification } from '../types';

const createSection = (
    id: string,
    title: string,
    content: string,
    type: PlanSection['type'],
    order: number,
    audience: string[] = ['All'],
    subSections: PlanSection[] = [],
    classification: SecurityClassification = 'Secret'
): PlanSection => ({
    id, title, content, type, order, subSections, audience, classification,
    referencedEntities: [], status: 'draft', feedback: [], overlays: []
});

const oplanBravo: OPLAN = {
    id: 'oplan-bravo-2026',
    campaignId: 'campaign-1',
    name: 'OPLAN 10305 BRAVO - SHIFTING SANDS',
    classification: 'Secret',
    status: 'active',
    version: '1.2.0',
    lastUpdated: '2026-01-05',
    consistencyChecks: [
        {
            id: 'check-1',
            rule: 'Logistics Feasibility',
            severity: 'warning',
            message: 'Annex D (Logistics) fuel sustainment rate (1200m3/day) is below Main Body Phase 3 requirement (1450m3/day).',
            affectedSectionIds: ['sec-3-execution', 'annex-d-logistics']
        },
        {
            id: 'check-2',
            rule: 'Ontology Integrity',
            severity: 'critical',
            message: 'Unit "1st Armored Div" referenced in Task Org is marked as "Detached" in Force Store.',
            affectedSectionIds: ['annex-a-task-org']
        }
    ],
    sections: [
        // --- MAIN BODY ---
        createSection('sec-1-situation', '1. Situation',
            `<p><strong>a. General.</strong> The geopolitical situation in Sector Alpha has deteriorated following the breakdown of the Geneva talks. Red Force elements like the [[Unit:u-red-7th|7th Motorized Rifles]] have mobilized along the PL FLOT. This follows the [[Political:pol-001|Presidential Ultimatum]] issued earlier this week.</p>
             <p><strong>b. Area of Interest.</strong> The joint operations area (JOA) is defined by the coordinates in Appendix 1 to Annex C. Current operations are hampered by [[Disaster:env-001|Flash Floods in Sector North]].</p>`,
            'main-body', 1, ['J2', 'J3', 'J5']
        ),
        createSection('sec-2-mission', '2. Mission',
            `<p>Joint Task Force (JTF) ALPHA, centered on the [[Unit:u-blue-hq|Joint Force Command]], conducts offensive operations in JOA SANDS commencing D-Day H-Hour to neutralize the enemy [[COG:cog-red-1|Integrated Air Defense System]] and restore territorial integrity of Blue Alliance states.</p>`,
            'main-body', 2, ['All']
        ),
        createSection('sec-3-execution', '3. Execution',
            `<p><strong>a. Concept of Operations.</strong> The operation will be conducted in four phases:</p>
             <ul>
                <li>Phase 1: Deter & Prepare</li>
                <li>Phase 2: Seize Initiative (Air/Cyber Dominance)</li>
                <li>Phase 3: Dominate (Ground Maneuver)</li>
                <li>Phase 4: Stabilize</li>
             </ul>
             <p><strong>b. Commander's Intent.</strong> Fast, decisive action targeting enemy [[Target:t-1001|C2 Bunker]] nodes while minimizing collateral damage to critical infrastructure.</p>`,
            'main-body', 3, ['J3', 'J5'],
            [], 'Secret'
        ),
        // --- ANNEX A: TASK ORG ---
        createSection('annex-a-task-org', 'Annex A: Task Organization',
            `<p>Effective for planning and execution. See Appendix 1 for Time-Phased Force Deployment Data (TPFDD). Force readiness is monitored via [[Unit:u-blue-1bde|1st Mechanized Brigade]] reports.</p>`,
            'annex', 4, ['J1', 'J3', 'J4'],
            [
                createSection('appendix-1-annex-a', 'Appendix 1: Land Component',
                    `<p><strong>1. Main Effort.</strong> [[Unit:u-blue-1bde|1st Mechanized Brigade (1 BDE)]]</p>
                     <p><strong>2. Supporting Effort.</strong> [[Unit:u-blue-1bn|1st Battalion (1 BN)]]</p>`,
                    'appendix', 1, ['J3 Land']
                )
            ]
        ),
        // --- ANNEX B: INTEL ---
        createSection('annex-b-intel', 'Annex B: Intelligence',
            `<p><strong>1. Enemy Forces.</strong> Red Force relies heavily on integrated air defense systems (IADS) such as [[Target:t-002|SA-20 Battery South]] located at...</p>
             <p><strong>2. PIRs.</strong> Priority Intelligence Requirements are listed in Tab A. Current disinformation threat: [[Disinfo:info-001|False CivCas Report]].</p>`,
            'annex', 5, ['J2']
        ),
        // --- ANNEX D: LOGISTICS ---
        createSection('annex-d-logistics', 'Annex D: Logistics',
            `<p><strong>1. Concept of Support.</strong> Sustainment will be conducted via Main Supply Route (MSR) GOLD. Civil dependencies include [[Unit:u-blue-hq|JFC Power Supply]].</p>
             <p><strong>2. Supply Classes.</strong>
                <br/>Class I: MREs (DoH: 30 days)
                <br/>Class III: Fuel (Bulk distribution at BSA)</p>`,
            'annex', 6, ['J4'],
            [], 'Secret'
        )
    ]
};

const oplanCharlie: OPLAN = {
    id: 'oplan-charlie-2026',
    campaignId: 'campaign-1',
    name: 'OPLAN 10400 CHARLIE - RELIEF (CONTINGENCY)',
    classification: 'Restricted',
    status: 'latent',
    version: '0.9.0',
    lastUpdated: '2025-12-15',
    consistencyChecks: [],
    sections: [
        createSection('charlie-sec-1', '1. Situation',
            `<p>Potential humanitarian crisis following flooding in low-lying sectors of the JOA.</p>`,
            'main-body', 1, ['J9']
        ),
        createSection('charlie-sec-2', '2. Mission',
            `<p>JTF Alpha provides humanitarian relief support to civil authorities to stabilize public health and critical services.</p>`,
            'main-body', 2
        )
    ]
};

export const mockOPLANs: OPLAN[] = [oplanBravo, oplanCharlie];
