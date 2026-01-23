import type { FeedbackEvent } from '../types/feedback';

export const mockFeedbackEvents: FeedbackEvent[] = [
    {
        id: 'evt-001',
        type: 'AV',
        source: 'J2-INTEL',
        target: 'PLAN-J5',
        severity: 'CRITICAL',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        title: 'Assumption Invalidated: Host Nation Support',
        description: 'New SIGINT confirms port access for Sector 7 has been revoked by local authorities.',
        recommendation: 'Suspend Log-Route Alpha immediately. Develop alternative offload branch.',
        linkedEntities: [
            { type: 'Assumption', id: 'a-104', name: 'Port Access Sector 7' },
            { type: 'Decision', id: 'd-202', name: 'Logistics Main Effort' }
        ],
        status: 'OPEN'
    },
    {
        id: 'evt-002',
        type: 'PEV',
        source: 'DIGITAL-TWIN',
        target: 'OPS-J3',
        severity: 'WARNING',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        title: 'Execution Variance: Advance Rate Limit',
        description: 'Unit 2nd Armored is moving at 15km/h, plan requires 25km/h to meet Phase Line Bronze.',
        recommendation: 'Inject reserve fuel assets or adjusting timing for subsequent waves.',
        linkedEntities: [
            { type: 'Unit', id: 'u-armor-02', name: '2nd Armored Div' },
            { type: 'Plan', id: 'p-adv-01', name: 'OP NORTHERN SHIELD' }
        ],
        status: 'ACKNOWLEDGED',
        resolvedBy: 'MAJ S. Johnson'
    },
    {
        id: 'evt-003',
        type: 'BDA',
        source: 'TARGETING',
        target: 'OPS-J3',
        severity: 'WARNING',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        title: 'Effects Not Met: TGT-Alpha-04',
        description: 'Post-strike analysis indicates target facility is still 60% operational.',
        recommendation: 'Re-task air assets for secondary strike window.',
        linkedEntities: [
            { type: 'Target', id: 't-04', name: 'Comms Bunker Alpha' }
        ],
        status: 'OPEN'
    },
    {
        id: 'evt-004',
        type: 'CQ',
        source: 'DATA-QUALITY',
        target: 'J2-COLL',
        severity: 'INFO',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        title: 'Stale Intelligence: Sector 9',
        description: 'Last verified HUMINT report for Sector 9 is >48hrs old.',
        linkedEntities: [
            { type: 'PIR', id: 'pir-09', name: 'Sector 9 Civ Sentiment' }
        ],
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: 'LT C. Vance'
    }
];

export const getFeedbackStats = () => {
    return {
        total: mockFeedbackEvents.length,
        open: mockFeedbackEvents.filter(e => e.status === 'OPEN').length,
        critical: mockFeedbackEvents.filter(e => e.severity === 'CRITICAL' && e.status !== 'RESOLVED').length
    };
};
