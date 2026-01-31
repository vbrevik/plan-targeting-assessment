import type { 
    DecisionTracking, 
    DecisionImpactMonitor,
    ConsequenceOutcome,
    DecisionContribution,
    CascadeImpact 
} from '../types';

// Mock tracked decisions
const MOCK_TRACKED_DECISIONS: DecisionTracking[] = [
    {
        decisionId: 'decision-strike-t1002',
        decisionTitle: 'Strike T-1002 Authorization',
        approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        approvedBy: 'commander-jfc',
        selectedOption: {
            id: 'option-defer-24h',
            label: 'DEFER 24H + COORDINATE',
            description: 'Delay strike to coordinate with POLAD',
            recommended: true,
            immediateConsequences: [],
            secondaryConsequences: [],
            timeline: {
                executionDuration: '24 hours',
                firstImpactTime: '24 hours',
                fullImpactTime: '72 hours'
            },
            confidence: 0.91
        },
        status: 'unfolding',
        daysElapsed: 2,
        expectedDuration: 3,
        predictedScore: 25,
        actualScore: 22,
        accuracy: 0.88, // 22/25
        consequenceTracking: [
            {
                consequenceId: 'cons-pol-coord',
                description: 'Political coordination achieved',
                predicted: {
                    impactScore: 15,
                    likelihood: 0.95,
                    timeframe: 'immediate'
                },
                actual: {
                    impactScore: 17,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'POLAD coordination exceeded expectations, comprehensive messaging strategy developed'
                },
                status: 'complete',
                variance: 2 // 17 - 15
            },
            {
                consequenceId: 'cons-target-assess',
                description: 'Updated target assessment',
                predicted: {
                    impactScore: 10,
                    likelihood: 0.85,
                    timeframe: 'short_term'
                },
                actual: {
                    occurred: false, // In progress
                    notes: 'J2 imagery collected, analysis in progress'
                },
                status: 'on_track',
                variance: 0
            },
            {
                consequenceId: 'cons-messaging',
                description: 'Messaging strategy prepared',
                predicted: {
                    impactScore: 20,
                    likelihood: 0.9,
                    timeframe: 'short_term'
                },
                actual: {
                    impactScore: 18,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Strategy prepared and approved by higher HQ'
                },
                status: 'complete',
                variance: -2 // 18 - 20
            },
            {
                consequenceId: 'cons-target-relocate',
                description: 'Target may relocate (20% probability)',
                predicted: {
                    impactScore: -15,
                    likelihood: 0.2,
                    timeframe: 'short_term'
                },
                actual: {
                    impactScore: 0,
                    occurred: false,
                    occurredAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Target confirmed static via satellite imagery - no relocation detected'
                },
                status: 'risk_avoided',
                variance: 15 // Risk did not materialize
            }
        ],
        discrepancies: [],
        learnings: [],
        affectedDimensions: ['political', 'operational', 'personnel']
    },
    {
        decisionId: 'decision-auth-445',
        decisionTitle: 'Strike AUTH-445',
        approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        approvedBy: 'commander-jfc',
        selectedOption: {
            id: 'option-approve-as-planned',
            label: 'APPROVE STRIKE (AS PLANNED)',
            description: 'Execute strike without modifications',
            recommended: false,
            immediateConsequences: [],
            secondaryConsequences: [],
            timeline: {
                executionDuration: '30 minutes',
                firstImpactTime: 'Immediate',
                fullImpactTime: '72 hours'
            },
            confidence: 0.75
        },
        status: 'needs_review',
        daysElapsed: 14,
        expectedDuration: 7,
        predictedScore: 35,
        actualScore: 18,
        accuracy: 0.51, // 18/35 - poor accuracy
        consequenceTracking: [
            {
                consequenceId: 'cons-target-neutral',
                description: 'Target neutralized',
                predicted: {
                    impactScore: 40,
                    likelihood: 0.8,
                    timeframe: 'immediate'
                },
                actual: {
                    impactScore: 35,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 13.5 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Target neutralized but secondary C2 activated nearby'
                },
                status: 'complete',
                variance: -5
            },
            {
                consequenceId: 'cons-civilian-cas',
                description: 'Civilian casualties (30% probability)',
                predicted: {
                    impactScore: -15,
                    likelihood: 0.3,
                    timeframe: 'immediate'
                },
                actual: {
                    impactScore: -25,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 13.5 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: '4 civilian casualties - hospital proximity risk materialized'
                },
                status: 'complete',
                variance: -10 // Worse than predicted
            },
            {
                consequenceId: 'cons-budget-scrutiny',
                description: 'Budget scrutiny triggered',
                predicted: {
                    impactScore: 0,
                    likelihood: 0,
                    timeframe: 'medium_term'
                },
                actual: {
                    impactScore: -10,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'International media coverage led to ministerial review of operational budget'
                },
                status: 'unexpected',
                variance: -10 // Was not predicted
            }
        ],
        discrepancies: [
            {
                type: 'under_predicted',
                description: 'Civilian casualty impact was underestimated',
                predictedImpact: -15,
                actualImpact: -25,
                rootCause: 'Intelligence assessment on hospital proximity was 48 hours old and did not account for increased civilian activity',
                recommendation: 'Update prediction model to weight intelligence staleness more heavily in civilian casualty risk calculations'
            },
            {
                type: 'unexpected_consequence',
                description: 'Budget scrutiny triggered by media amplification',
                predictedImpact: 0,
                actualImpact: -10,
                rootCause: 'Media visibility factor not included in political impact model for strike decisions',
                recommendation: 'Add media amplification factor to political consequence predictions for all kinetic operations'
            }
        ],
        learnings: [
            {
                category: 'prediction_accuracy',
                insight: 'Intelligence staleness significantly increases civilian casualty risk',
                actionable: 'Require intelligence updates within 24h for all high-collateral-risk strikes',
                modelUpdate: true
            },
            {
                category: 'cascade_detection',
                insight: 'High-visibility operations can trigger budget scrutiny even when politically coordinated',
                actionable: 'Include media visibility as cascade trigger in political impact model',
                modelUpdate: true
            }
        ],
        affectedDimensions: ['operational', 'political', 'budget', 'personnel']
    },
    {
        decisionId: 'decision-maneuver-mech',
        decisionTitle: 'Move 1 MECH BDE to Sector Beta',
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        approvedBy: 'commander-jfc',
        selectedOption: {
            id: 'option-approve-move',
            label: 'APPROVE MANEUVER',
            description: 'Execute brigade movement',
            recommended: true,
            immediateConsequences: [],
            secondaryConsequences: [],
            timeline: {
                executionDuration: '12 hours',
                firstImpactTime: '12 hours',
                fullImpactTime: '24 hours'
            },
            confidence: 0.88
        },
        status: 'complete',
        daysElapsed: 3,
        expectedDuration: 2,
        predictedScore: 22,
        actualScore: 24,
        accuracy: 1.09, // 24/22 - exceeded expectations
        consequenceTracking: [
            {
                consequenceId: 'cons-defensive-posture',
                description: 'Strengthened defensive posture in Sector Beta',
                predicted: {
                    impactScore: 20,
                    likelihood: 0.9,
                    timeframe: 'short_term'
                },
                actual: {
                    impactScore: 22,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Brigade deployed ahead of schedule, defensive positions established'
                },
                status: 'complete',
                variance: 2
            },
            {
                consequenceId: 'cons-sector-alpha-gap',
                description: 'Defensive gap in Sector Alpha',
                predicted: {
                    impactScore: -8,
                    likelihood: 0.7,
                    timeframe: 'immediate'
                },
                actual: {
                    impactScore: -6,
                    occurred: true,
                    occurredAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Reserve forces covered gap faster than expected'
                },
                status: 'complete',
                variance: 2 // Better than predicted
            }
        ],
        discrepancies: [],
        learnings: [],
        affectedDimensions: ['operational']
    }
];

// Mock impact monitors
const MOCK_IMPACT_MONITORS: DecisionImpactMonitor[] = [
    {
        dimension: 'political',
        currentScore: 68,
        baseline: 75,
        netImpact: -7,
        trend: 'declining',
        contributingDecisions: [
            {
                decisionId: 'decision-auth-445',
                decisionTitle: 'Strike AUTH-445',
                approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 14,
                directImpact: -5,
                cascadedImpacts: [
                    {
                        source: 'Civilian casualties',
                        description: 'Budget scrutiny triggered',
                        impact: -3,
                        triggeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ],
                totalImpact: -8, // -5 direct + (-3 cascaded)
                isOngoing: true,
                expectedDuration: 21, // 3 weeks
                decayRate: 0.1, // 10% per week
                reversible: false,
                reversalAction: undefined
            },
            {
                decisionId: 'decision-budget-override',
                decisionTitle: 'Budget Override Request',
                approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 7,
                directImpact: -3,
                cascadedImpacts: [],
                totalImpact: -3,
                isOngoing: true,
                expectedDuration: 14, // 2 weeks
                decayRate: 0.15,
                reversible: true,
                reversalAction: 'Implement cost-saving measures to restore budget confidence'
            },
            {
                decisionId: 'decision-strike-t1002',
                decisionTitle: 'Strike T-1002 (Deferred)',
                approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 2,
                directImpact: 4, // Positive from coordination
                cascadedImpacts: [],
                totalImpact: 4,
                isOngoing: true,
                expectedDuration: 7,
                decayRate: 0.05,
                reversible: false
            }
        ],
        forecast: {
            projectedScore: 73,
            confidenceInterval: [70, 76],
            naturalDecay: 5, // Negative impacts fading
            requiresIntervention: false
        },
        alerts: [
            {
                severity: 'warning',
                message: 'Political capital declining due to multiple recent decisions',
                threshold: 60,
                daysToThreshold: undefined,
                recommendedAction: 'Consider POLAD coordination session to rebuild confidence'
            }
        ]
    },
    {
        dimension: 'personnel',
        currentScore: 79,
        baseline: 83,
        netImpact: -4,
        trend: 'critical',
        contributingDecisions: [
            {
                decisionId: 'decision-extended-ops',
                decisionTitle: 'Extended Operations Tempo',
                approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 14,
                directImpact: -4,
                cascadedImpacts: [
                    {
                        source: '18-hour shifts maintained',
                        description: 'Retention risk increased',
                        impact: -2,
                        triggeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        source: 'Delayed rest cycles',
                        description: 'Morale survey scores declined',
                        impact: -1,
                        triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ],
                totalImpact: -7, // -4 direct + (-3 cascaded)
                isOngoing: true,
                expectedDuration: 30,
                decayRate: 0.05,
                reversible: true,
                reversalAction: 'Implement mandatory rest cycle or wellness program immediately'
            },
            {
                decisionId: 'decision-training-cancel',
                decisionTitle: 'Cancel Scheduled Training',
                approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 7,
                directImpact: -2,
                cascadedImpacts: [],
                totalImpact: -2,
                isOngoing: true,
                expectedDuration: 14,
                decayRate: 0.1,
                reversible: true,
                reversalAction: 'Reschedule training within 30 days'
            },
            {
                decisionId: 'decision-wellness-defer',
                decisionTitle: 'Defer Wellness Program',
                approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 3,
                directImpact: -1,
                cascadedImpacts: [],
                totalImpact: -1,
                isOngoing: true,
                expectedDuration: 7,
                decayRate: 0.2,
                reversible: true,
                reversalAction: 'Launch wellness program immediately'
            }
        ],
        forecast: {
            projectedScore: 76, // Will improve slightly
            confidenceInterval: [74, 78],
            naturalDecay: 2, // Some improvement expected
            requiresIntervention: true // But still needs action
        },
        alerts: [
            {
                severity: 'critical',
                message: 'Personnel satisfaction approaching threshold',
                threshold: 75,
                daysToThreshold: 7,
                recommendedAction: 'Implement rest cycle or wellness program NOW to prevent threshold breach'
            },
            {
                severity: 'warning',
                message: 'Cumulative effect detected: 3 decisions in 14 days affecting Personnel',
                threshold: 75,
                recommendedAction: 'Prioritize personnel-positive decisions in next governance cycle'
            }
        ]
    },
    {
        dimension: 'operational',
        currentScore: 89,
        baseline: 87,
        netImpact: 2,
        trend: 'improving',
        contributingDecisions: [
            {
                decisionId: 'decision-maneuver-mech',
                decisionTitle: 'Move 1 MECH BDE to Sector Beta',
                approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 3,
                directImpact: 5,
                cascadedImpacts: [],
                totalImpact: 5,
                isOngoing: false,
                expectedDuration: 2,
                decayRate: 0,
                reversible: false
            },
            {
                decisionId: 'decision-training-cancel',
                decisionTitle: 'Cancel Training',
                approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 7,
                directImpact: -3,
                cascadedImpacts: [],
                totalImpact: -3,
                isOngoing: true,
                expectedDuration: 30,
                decayRate: 0.05,
                reversible: true,
                reversalAction: 'Reschedule training to restore long-term readiness'
            }
        ],
        forecast: {
            projectedScore: 90,
            confidenceInterval: [88, 92],
            naturalDecay: 0,
            requiresIntervention: false
        },
        alerts: []
    },
    {
        dimension: 'budget',
        currentScore: 92,
        baseline: 95,
        netImpact: -3,
        trend: 'stable',
        contributingDecisions: [
            {
                decisionId: 'decision-precision-munition',
                decisionTitle: 'Precision Munition Purchase',
                approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                daysAgo: 7,
                directImpact: -3,
                cascadedImpacts: [],
                totalImpact: -3,
                isOngoing: false,
                expectedDuration: 7,
                decayRate: 0,
                reversible: false
            }
        ],
        forecast: {
            projectedScore: 93,
            confidenceInterval: [92, 94],
            naturalDecay: 1,
            requiresIntervention: false
        },
        alerts: []
    }
];

export const DecisionTrackingService = {
    getTrackedDecisions: async (): Promise<DecisionTracking[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(MOCK_TRACKED_DECISIONS), 300);
        });
    },

    getDecisionTracking: async (decisionId: string): Promise<DecisionTracking | null> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const tracking = MOCK_TRACKED_DECISIONS.find(t => t.decisionId === decisionId);
                resolve(tracking || null);
            }, 200);
        });
    },

    getImpactMonitors: async (): Promise<DecisionImpactMonitor[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(MOCK_IMPACT_MONITORS), 300);
        });
    },

    updateConsequenceOutcome: async (
        decisionId: string,
        consequenceId: string,
        actualImpact: number,
        notes: string
    ): Promise<void> => {
        console.log(`Updating consequence ${consequenceId} for decision ${decisionId}: ${actualImpact}, ${notes}`);
        // TODO: Implement backend API call
    },

    closeTracking: async (decisionId: string): Promise<void> => {
        console.log(`Closing tracking for decision ${decisionId}`);
        // TODO: Implement backend API call
    }
};
