import type { Decision, DecisionAnalysis, Consequence, DecisionOption, RiskFactor } from '../types';

// Mock decision data demonstrating the full structure
const MOCK_DECISIONS: Decision[] = [
    {
        id: 'decision-strike-t1002',
        title: 'Strike T-1002 Authorization',
        description: 'High-value enemy command post near civilian infrastructure',
        urgency: 'critical',
        complexity: 'high',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        context: {
            category: 'strike',
            relatedEntityIds: ['target-t1002'],
            backgroundBriefId: 'brief-b-strike-12',
            triggeringEvent: 'J2 intelligence identified high-value C2 facility',
            stakeholders: [
                { name: 'LEGAD-North', role: 'Legal Advisor', impact: 'direct', mustConsult: true },
                { name: 'POLAD', role: 'Political Advisor', impact: 'direct', mustConsult: true },
                { name: 'J2 Director', role: 'Intelligence', impact: 'indirect', mustConsult: false },
                { name: 'J4 Aviation', role: 'Logistics', impact: 'indirect', mustConsult: false }
            ],
            politicalSensitivity: 'high',
            mediaVisibility: 'high'
        },
        options: [
            {
                id: 'option-approve-as-planned',
                label: 'APPROVE STRIKE (AS PLANNED)',
                description: 'Execute strike within 6 hours using current plan',
                recommended: false,
                immediateConsequences: [],
                secondaryConsequences: [],
                resourceRequirements: [
                    { resourceType: 'equipment', quantity: 2, unit: 'F-35 aircraft', availability: 'available' },
                    { resourceType: 'equipment', quantity: 4, unit: 'precision munitions', availability: 'available' },
                    { resourceType: 'personnel', quantity: 2, unit: 'POLAD/LEGAD hours', availability: 'unavailable', conflict: 'Not consulted' }
                ],
                timeline: {
                    executionDuration: '30 minutes',
                    firstImpactTime: 'Immediate (target destruction)',
                    fullImpactTime: '72 hours (political fallout manifests)',
                    reversibilityWindow: undefined // Irreversible
                },
                confidence: 0.82
            },
            {
                id: 'option-defer-24h',
                label: 'DEFER 24H + COORDINATE',
                description: 'Delay strike 24 hours to coordinate with POLAD and update target assessment',
                recommended: true,
                immediateConsequences: [],
                secondaryConsequences: [],
                resourceRequirements: [
                    { resourceType: 'time', quantity: 6, unit: 'hours', availability: 'available' },
                    { resourceType: 'personnel', quantity: 2, unit: 'POLAD hours', availability: 'available' },
                    { resourceType: 'personnel', quantity: 1, unit: 'LEGAD hours', availability: 'available' },
                    { resourceType: 'personnel', quantity: 4, unit: 'J2 imagery hours', availability: 'available' }
                ],
                timeline: {
                    executionDuration: '6 hours (coordination) + 12 hours (imagery) + 24 hours (execution)',
                    firstImpactTime: '24 hours (coordinated strike)',
                    fullImpactTime: '48 hours (full assessment)',
                    reversibilityWindow: '24 hours'
                },
                confidence: 0.91
            },
            {
                id: 'option-modify-approve',
                label: 'MODIFY STRIKE & APPROVE',
                description: 'Approve with modifications: precision munition + civilian warning + expedited POLAD coordination',
                recommended: false,
                immediateConsequences: [],
                secondaryConsequences: [],
                resourceRequirements: [
                    { resourceType: 'equipment', quantity: 2, unit: 'F-35 aircraft', availability: 'available' },
                    { resourceType: 'equipment', quantity: 2, unit: 'precision munitions', availability: 'available' },
                    { resourceType: 'budget', quantity: 500000, unit: 'USD', availability: 'available' },
                    { resourceType: 'personnel', quantity: 2, unit: 'POLAD hours (expedited)', availability: 'constrained', conflict: 'Requires priority' }
                ],
                timeline: {
                    executionDuration: '2 hours (coordination) + 30 minutes (warning) + execution',
                    firstImpactTime: '12 hours',
                    fullImpactTime: '48 hours',
                    reversibilityWindow: '6 hours (before civilian warning)'
                },
                confidence: 0.78
            },
            {
                id: 'option-reject',
                label: 'REJECT STRIKE',
                description: 'Do not execute strike, seek alternative courses of action',
                recommended: false,
                immediateConsequences: [],
                secondaryConsequences: [],
                resourceRequirements: [],
                timeline: {
                    executionDuration: 'Immediate',
                    firstImpactTime: 'Immediate (no strike)',
                    fullImpactTime: '3-5 days (alternative targeting)',
                    reversibilityWindow: undefined // Can re-propose later
                },
                confidence: 0.65
            }
        ],
        riskFactors: [
            {
                id: 'risk-political-ultimatum',
                description: 'Conflicts with Presidential Ultimatum guidance on minimizing civilian impact',
                severity: 'critical',
                category: 'political',
                mitigation: 'Coordinate with POLAD before approval',
                detectedBy: 'system'
            },
            {
                id: 'risk-civilian-proximity',
                description: '200m from civilian hospital - high collateral damage risk',
                severity: 'high',
                category: 'safety',
                mitigation: 'Use precision munition + pre-strike civilian warning',
                detectedBy: 'system'
            },
            {
                id: 'risk-stale-intelligence',
                description: 'Target assessment is 48 hours old (may be outdated)',
                severity: 'medium',
                category: 'operational',
                mitigation: 'Request updated imagery from J2',
                detectedBy: 'system'
            },
            {
                id: 'risk-media-visibility',
                description: 'High probability of negative international media coverage',
                severity: 'medium',
                category: 'political',
                mitigation: 'Prepare coordinated messaging strategy',
                detectedBy: 'ai'
            }
        ],
        requiredApprovers: ['commander-jfc'],
        status: 'pending',
        roeStatus: 'requires_roe_release', // Strike requires new ROE authorization
        roeNotes: 'Target near civilian infrastructure requires specific ROE for precision strike with civilian warning protocol',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        createdBy: 'user-j3-ops'
    },
    {
        id: 'decision-maneuver-mech-bde',
        title: 'Move 1 MECH BDE to Sector Beta',
        description: 'Reposition 1-64 Mechanized Brigade to strengthen defensive posture in Sector Beta',
        urgency: 'high',
        complexity: 'medium',
        deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        context: {
            category: 'maneuver',
            relatedEntityIds: ['unit-1-64-mech', 'sector-beta'],
            triggeringEvent: 'Increased hostile activity detected in Sector Beta',
            stakeholders: [
                { name: 'Unit Commander', role: '1-64 MECH CO', impact: 'direct', mustConsult: true },
                { name: 'J4 Logistics', role: 'Logistics Support', impact: 'direct', mustConsult: true },
                { name: 'J3 Ops', role: 'Operations Planning', impact: 'direct', mustConsult: false }
            ],
            politicalSensitivity: 'low',
            mediaVisibility: 'low'
        },
        options: [
            {
                id: 'option-approve-move',
                label: 'APPROVE MANEUVER',
                description: 'Execute brigade movement within 12 hours',
                recommended: true,
                immediateConsequences: [],
                secondaryConsequences: [],
                resourceRequirements: [
                    { resourceType: 'equipment', quantity: 1, unit: 'Brigade (450 vehicles)', availability: 'available' },
                    { resourceType: 'budget', quantity: 150000, unit: 'USD (fuel)', availability: 'available' },
                    { resourceType: 'time', quantity: 12, unit: 'hours', availability: 'available' }
                ],
                timeline: {
                    executionDuration: '12 hours',
                    firstImpactTime: '12 hours (arrival)',
                    fullImpactTime: '24 hours (full deployment)',
                    reversibilityWindow: '6 hours'
                },
                confidence: 0.88
            },
            {
                id: 'option-defer-move',
                label: 'DEFER 24H',
                description: 'Delay movement to gather more intelligence on threat level',
                recommended: false,
                immediateConsequences: [],
                secondaryConsequences: [],
                timeline: {
                    executionDuration: '24 hours delay + 12 hours execution',
                    firstImpactTime: '36 hours',
                    fullImpactTime: '48 hours',
                },
                confidence: 0.65
            },
            {
                id: 'option-partial-move',
                label: 'PARTIAL DEPLOYMENT',
                description: 'Send one battalion instead of full brigade',
                recommended: false,
                immediateConsequences: [],
                secondaryConsequences: [],
                resourceRequirements: [
                    { resourceType: 'equipment', quantity: 1, unit: 'Battalion (150 vehicles)', availability: 'available' },
                    { resourceType: 'budget', quantity: 50000, unit: 'USD (fuel)', availability: 'available' }
                ],
                timeline: {
                    executionDuration: '6 hours',
                    firstImpactTime: '6 hours',
                    fullImpactTime: '12 hours',
                },
                confidence: 0.72
            }
        ],
        riskFactors: [
            {
                id: 'risk-sector-alpha-gap',
                description: 'Moving brigade creates defensive gap in Sector Alpha',
                severity: 'high',
                category: 'operational',
                mitigation: 'Pre-position reserve forces to cover Sector Alpha',
                detectedBy: 'system'
            },
            {
                id: 'risk-fuel-consumption',
                description: 'Large fuel consumption may impact other operations',
                severity: 'medium',
                category: 'operational',
                mitigation: 'Coordinate with J4 to ensure adequate reserves',
                detectedBy: 'system'
            }
        ],
        requiredApprovers: ['commander-jfc'],
        status: 'pending',
        roeStatus: 'within_approved_roe', // Maneuver within current ROE
        roeNotes: 'Brigade movement falls under approved defensive operations ROE (ROE-2024-03)',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user-j3-plans'
    }
];

// Mock consequence data for analysis
const generateConsequenceAnalysis = (optionId: string): { immediate: Consequence[], secondary: Consequence[] } => {
    const consequenceTemplates: Record<string, { immediate: Consequence[], secondary: Consequence[] }> = {
        'option-approve-as-planned': {
            immediate: [
                {
                    domain: 'operational',
                    type: 'positive',
                    severity: 'high',
                    description: 'High-value target neutralized',
                    likelihood: 0.8,
                    impactScore: 40,
                    timeframe: 'immediate',
                    affectedMetrics: ['operational_effectiveness']
                },
                {
                    domain: 'operational',
                    type: 'positive',
                    severity: 'medium',
                    description: 'Enemy C2 disrupted for 24-48h',
                    likelihood: 0.75,
                    impactScore: 25,
                    timeframe: 'short_term',
                    affectedMetrics: ['tactical_advantage']
                },
                {
                    domain: 'political',
                    type: 'negative',
                    severity: 'high',
                    description: 'Civilian casualties likely',
                    likelihood: 0.6,
                    impactScore: -30,
                    timeframe: 'immediate',
                    affectedMetrics: ['political_capital']
                },
                {
                    domain: 'political',
                    type: 'negative',
                    severity: 'medium',
                    description: 'International media backlash',
                    likelihood: 0.7,
                    impactScore: -25,
                    timeframe: 'short_term',
                    affectedMetrics: ['info_dominance']
                }
            ],
            secondary: [
                {
                    domain: 'political',
                    type: 'negative',
                    severity: 'critical',
                    description: 'Presidential Ultimatum compromised',
                    likelihood: 0.8,
                    impactScore: -40,
                    timeframe: 'medium_term',
                    affectedMetrics: ['political_capital'],
                    cascades: [
                        {
                            domain: 'political',
                            type: 'negative',
                            severity: 'high',
                            description: 'Ministerial intervention required',
                            likelihood: 0.6,
                            impactScore: -20,
                            timeframe: 'medium_term',
                            affectedMetrics: ['political_capital']
                        }
                    ]
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'Campaign objective "Info Dominance" at risk',
                    likelihood: 0.65,
                    impactScore: -15,
                    timeframe: 'medium_term',
                    affectedMetrics: ['campaign_progress'],
                    cascades: [
                        {
                            domain: 'operational',
                            type: 'negative',
                            severity: 'medium',
                            description: 'Extended operation duration (+2 weeks)',
                            likelihood: 0.5,
                            impactScore: -10,
                            timeframe: 'long_term',
                            affectedMetrics: ['campaign_timeline']
                        }
                    ]
                },
                {
                    domain: 'personnel',
                    type: 'negative',
                    severity: 'low',
                    description: 'Force morale impact if civilian casualties occur',
                    likelihood: 0.4,
                    impactScore: -5,
                    timeframe: 'medium_term',
                    affectedMetrics: ['personnel_satisfaction'],
                    cascades: [
                        {
                            domain: 'personnel',
                            type: 'negative',
                            severity: 'low',
                            description: 'Retention risk increases',
                            likelihood: 0.3,
                            impactScore: -3,
                            timeframe: 'long_term',
                            affectedMetrics: ['retention_rate']
                        }
                    ]
                }
            ]
        },
        'option-defer-24h': {
            immediate: [
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'medium',
                    description: 'Political coordination achieved',
                    likelihood: 0.95,
                    impactScore: 15,
                    timeframe: 'immediate',
                    affectedMetrics: ['political_capital']
                },
                {
                    domain: 'operational',
                    type: 'positive',
                    severity: 'medium',
                    description: 'Updated target assessment increases confidence',
                    likelihood: 0.85,
                    impactScore: 10,
                    timeframe: 'short_term',
                    affectedMetrics: ['strike_confidence']
                },
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'low',
                    description: 'Messaging strategy prepared',
                    likelihood: 0.9,
                    impactScore: 20,
                    timeframe: 'short_term',
                    affectedMetrics: ['info_dominance']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'Target may relocate',
                    likelihood: 0.2,
                    impactScore: -15,
                    timeframe: 'short_term',
                    affectedMetrics: ['operational_effectiveness']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'low',
                    description: '24h delay in campaign timeline',
                    likelihood: 1.0,
                    impactScore: -5,
                    timeframe: 'immediate',
                    affectedMetrics: ['momentum']
                }
            ],
            secondary: [
                {
                    domain: 'operational',
                    type: 'positive',
                    severity: 'medium',
                    description: 'Modified strike with lower civilian risk',
                    likelihood: 0.85,
                    impactScore: 15,
                    timeframe: 'medium_term',
                    affectedMetrics: ['operational_effectiveness'],
                    cascades: [
                        {
                            domain: 'personnel',
                            type: 'positive',
                            severity: 'low',
                            description: 'Higher force morale (responsible action)',
                            likelihood: 0.7,
                            impactScore: 5,
                            timeframe: 'medium_term',
                            affectedMetrics: ['personnel_satisfaction']
                        }
                    ]
                },
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'high',
                    description: 'Political support maintained',
                    likelihood: 0.9,
                    impactScore: 20,
                    timeframe: 'medium_term',
                    affectedMetrics: ['political_capital'],
                    cascades: [
                        {
                            domain: 'economic',
                            type: 'positive',
                            severity: 'medium',
                            description: 'Continued resource support (budget stable)',
                            likelihood: 0.8,
                            impactScore: 10,
                            timeframe: 'long_term',
                            affectedMetrics: ['budget_allocation']
                        }
                    ]
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'If target relocates: Alternative targets required',
                    likelihood: 0.2,
                    impactScore: -10,
                    timeframe: 'medium_term',
                    affectedMetrics: ['operational_effectiveness'],
                    cascades: [
                        {
                            domain: 'operational',
                            type: 'negative',
                            severity: 'low',
                            description: 'Extended targeting cycle (+48h)',
                            likelihood: 0.15,
                            impactScore: -5,
                            timeframe: 'medium_term',
                            affectedMetrics: ['campaign_timeline']
                        }
                    ]
                }
            ]
        },
        'option-modify-approve': {
            immediate: [
                {
                    domain: 'operational',
                    type: 'positive',
                    severity: 'high',
                    description: 'Target neutralized within 12 hours',
                    likelihood: 0.75,
                    impactScore: 35,
                    timeframe: 'short_term',
                    affectedMetrics: ['operational_effectiveness']
                },
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'medium',
                    description: 'Reduced civilian casualty risk',
                    likelihood: 0.8,
                    impactScore: 15,
                    timeframe: 'immediate',
                    affectedMetrics: ['political_capital']
                },
                {
                    domain: 'operational',
                    type: 'positive',
                    severity: 'low',
                    description: 'Maintains campaign momentum',
                    likelihood: 0.9,
                    impactScore: 10,
                    timeframe: 'immediate',
                    affectedMetrics: ['momentum']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'low',
                    description: '6h delay for expedited coordination',
                    likelihood: 1.0,
                    impactScore: -5,
                    timeframe: 'immediate',
                    affectedMetrics: ['operational_speed']
                },
                {
                    domain: 'economic',
                    type: 'negative',
                    severity: 'low',
                    description: 'Precision munition cost +$500K',
                    likelihood: 1.0,
                    impactScore: -2,
                    timeframe: 'immediate',
                    affectedMetrics: ['budget']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'Target may be alerted by civilian warning',
                    likelihood: 0.3,
                    impactScore: -10,
                    timeframe: 'immediate',
                    affectedMetrics: ['surprise']
                }
            ],
            secondary: [
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'medium',
                    description: 'Political support maintained (expedited coordination)',
                    likelihood: 0.85,
                    impactScore: 15,
                    timeframe: 'medium_term',
                    affectedMetrics: ['political_capital'],
                    cascades: [
                        {
                            domain: 'operational',
                            type: 'positive',
                            severity: 'low',
                            description: 'Continued operations authority',
                            likelihood: 0.8,
                            impactScore: 10,
                            timeframe: 'long_term',
                            affectedMetrics: ['political_support']
                        }
                    ]
                },
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'low',
                    description: 'Media narrative managed (civilian warning shows care)',
                    likelihood: 0.7,
                    impactScore: 10,
                    timeframe: 'medium_term',
                    affectedMetrics: ['info_dominance']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'If target alerted: Partial effectiveness only',
                    likelihood: 0.3,
                    impactScore: -15,
                    timeframe: 'short_term',
                    affectedMetrics: ['operational_effectiveness'],
                    cascades: [
                        {
                            domain: 'economic',
                            type: 'negative',
                            severity: 'medium',
                            description: 'May require re-strike (+$1M, +48h)',
                            likelihood: 0.2,
                            impactScore: -10,
                            timeframe: 'medium_term',
                            affectedMetrics: ['budget', 'campaign_timeline']
                        }
                    ]
                }
            ]
        },
        'option-reject': {
            immediate: [
                {
                    domain: 'political',
                    type: 'positive',
                    severity: 'low',
                    description: 'No civilian casualty risk',
                    likelihood: 1.0,
                    impactScore: 5,
                    timeframe: 'immediate',
                    affectedMetrics: ['political_capital']
                },
                {
                    domain: 'economic',
                    type: 'positive',
                    severity: 'low',
                    description: 'Resources freed for other missions',
                    likelihood: 1.0,
                    impactScore: 10,
                    timeframe: 'immediate',
                    affectedMetrics: ['resource_availability']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'critical',
                    description: 'Target remains operational',
                    likelihood: 1.0,
                    impactScore: -40,
                    timeframe: 'immediate',
                    affectedMetrics: ['operational_effectiveness']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'Enemy C2 continues functioning',
                    likelihood: 1.0,
                    impactScore: -20,
                    timeframe: 'immediate',
                    affectedMetrics: ['tactical_advantage']
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'Campaign objective "Hostile Neutralized" delayed',
                    likelihood: 0.9,
                    impactScore: -15,
                    timeframe: 'short_term',
                    affectedMetrics: ['campaign_progress']
                }
            ],
            secondary: [
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'medium',
                    description: 'Alternative targeting required',
                    likelihood: 1.0,
                    impactScore: -10,
                    timeframe: 'medium_term',
                    affectedMetrics: ['operational_tempo'],
                    cascades: [
                        {
                            domain: 'operational',
                            type: 'negative',
                            severity: 'low',
                            description: 'Extended targeting cycle (+3-5 days)',
                            likelihood: 0.8,
                            impactScore: -8,
                            timeframe: 'medium_term',
                            affectedMetrics: ['campaign_timeline']
                        }
                    ]
                },
                {
                    domain: 'operational',
                    type: 'negative',
                    severity: 'high',
                    description: 'Target may harden defenses',
                    likelihood: 0.5,
                    impactScore: -20,
                    timeframe: 'medium_term',
                    affectedMetrics: ['operational_effectiveness'],
                    cascades: [
                        {
                            domain: 'economic',
                            type: 'negative',
                            severity: 'medium',
                            description: 'More difficult strike later (+$2M cost, +risk)',
                            likelihood: 0.4,
                            impactScore: -15,
                            timeframe: 'long_term',
                            affectedMetrics: ['budget']
                        }
                    ]
                },
                {
                    domain: 'personnel',
                    type: 'negative',
                    severity: 'low',
                    description: 'Staff morale impact (prepared strike cancelled)',
                    likelihood: 0.6,
                    impactScore: -5,
                    timeframe: 'short_term',
                    affectedMetrics: ['personnel_satisfaction']
                }
            ]
        }
    };

    return consequenceTemplates[optionId] || { immediate: [], secondary: [] };
};

export const DecisionService = {
    getPendingDecisions: async (): Promise<Decision[]> => {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => resolve(MOCK_DECISIONS.filter(d => d.status === 'pending')), 300);
        });
    },

    getDecisionById: async (id: string): Promise<Decision | null> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const decision = MOCK_DECISIONS.find(d => d.id === id);
                resolve(decision || null);
            }, 200);
        });
    },

    analyzeDecision: async (decisionId: string): Promise<DecisionAnalysis> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const decision = MOCK_DECISIONS.find(d => d.id === decisionId);
                if (!decision) {
                    throw new Error('Decision not found');
                }

                // Generate analysis for each option
                const analyzedOptions = decision.options.map((option) => {
                    const consequences = generateConsequenceAnalysis(option.id);
                    
                    // Calculate trade-off analysis
                    const tradeOffAnalysis = {
                        dimensions: {
                            operational: {
                                currentScore: 87,
                                projectedImpact: option.id === 'option-approve-as-planned' ? 5 : option.id === 'option-defer-24h' ? -2 : 3,
                                newScore: option.id === 'option-approve-as-planned' ? 92 : option.id === 'option-defer-24h' ? 85 : 90,
                                threshold: 70,
                                breachesThreshold: false,
                                priority: 'critical' as const
                            },
                            political: {
                                currentScore: 75,
                                projectedImpact: option.id === 'option-approve-as-planned' ? -25 : option.id === 'option-defer-24h' ? 7 : -2,
                                newScore: option.id === 'option-approve-as-planned' ? 50 : option.id === 'option-defer-24h' ? 82 : 73,
                                threshold: 60,
                                breachesThreshold: option.id === 'option-approve-as-planned',
                                priority: 'high' as const
                            },
                            personnel: {
                                currentScore: 83,
                                projectedImpact: option.id === 'option-approve-as-planned' ? -3 : option.id === 'option-defer-24h' ? 2 : 0,
                                newScore: option.id === 'option-approve-as-planned' ? 80 : option.id === 'option-defer-24h' ? 85 : 83,
                                threshold: 70,
                                breachesThreshold: false,
                                priority: 'medium' as const
                            },
                            budget: {
                                currentScore: 95,
                                projectedImpact: option.id === 'option-modify-approve' ? -0.5 : 0,
                                newScore: option.id === 'option-modify-approve' ? 94.5 : 95,
                                threshold: 85,
                                breachesThreshold: false,
                                priority: 'medium' as const
                            },
                            environmental: {
                                currentScore: 88,
                                projectedImpact: 0,
                                newScore: 88,
                                threshold: 75,
                                breachesThreshold: false,
                                priority: 'low' as const
                            },
                            legal: {
                                currentScore: 100,
                                projectedImpact: 0,
                                newScore: 100,
                                threshold: 100,
                                breachesThreshold: false,
                                priority: 'critical' as const
                            }
                        },
                        overallScore: option.id === 'option-approve-as-planned' ? 10 : option.id === 'option-defer-24h' ? 25 : 18,
                        recommendedOption: 'option-defer-24h'
                    };

                    return {
                        option: {
                            ...option,
                            immediateConsequences: consequences.immediate,
                            secondaryConsequences: consequences.secondary,
                            tradeOffAnalysis: tradeOffAnalysis
                        },
                        immediateConsequences: consequences.immediate,
                        secondaryConsequences: consequences.secondary,
                        tradeOffAnalysis: tradeOffAnalysis,
                        resourceAvailability: option.resourceRequirements || [],
                        overallScore: tradeOffAnalysis.overallScore
                    };
                });

                const analysis: DecisionAnalysis = {
                    decisionId: decision.id,
                    analyzedOptions,
                    riskFactors: decision.riskFactors,
                    precedents: [
                        {
                            decisionId: 'decision-auth-445',
                            title: 'Strike AUTH-445',
                            date: '2025-11-15',
                            chosenOption: 'Deferred 24h for coordination',
                            outcome: 'Success - Strike executed with zero casualties, political support maintained'
                        },
                        {
                            decisionId: 'decision-auth-318',
                            title: 'Strike AUTH-318',
                            date: '2025-09-22',
                            chosenOption: 'Approved with modifications',
                            outcome: 'Partial success - Target damaged but not destroyed, required follow-up strike'
                        },
                        {
                            decisionId: 'decision-auth-201',
                            title: 'Strike AUTH-201',
                            date: '2025-06-10',
                            chosenOption: 'Approved as planned',
                            outcome: 'Target neutralized but civilian casualties occurred - Political fallout required ministerial intervention'
                        }
                    ],
                    recommendation: 'option-defer-24h',
                    aiConfidence: 0.78,
                    cognitiveLoadWarning: {
                        timeOnDuty: 738, // 12h 18m
                        fatigueLevel: 'high',
                        recommendConsultation: true,
                        recommendBreak: true
                    }
                };

                resolve(analysis);
            }, 500);
        });
    },

    approveDecision: async (decisionId: string, optionId: string, justification: string): Promise<void> => {
        console.log(`Approving decision ${decisionId} with option ${optionId}: ${justification}`);
        // TODO: Implement backend API call
    }
};
