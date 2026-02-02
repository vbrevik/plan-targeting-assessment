import type {
    CCIR,
    CCIRHit,
    OPLAN,
    Track,
    CenterOfGravity,
    Scenario,
    CourseOfAction,
    StrategicGuidance,
    LineOfOperation,
    DecisiveCondition,
    Operation,
    DecisionBoard,
    ROE,
    Proposal,
    InformationRequirement,
    InformationFlow,
    ProductReport,
    RequestForInformation,
    WeatherReport,
    StrikeAnalysis,
    WeatherImpact,
    BattleRhythmEvent,
    GovernanceSession,
    MeetingRecord,
    TermsOfReference,
    PMESIIData,
    Unit,
    BiometricReading,
    PoliticalStatement,
    NaturalDisaster,
    DisinformationEvent,
    FakeMedia
} from './types';
import { store, LATENCY } from './services/store';

// Mock service layer
import { OperationsApi } from './api/operations';

// ...

export const MshnCtrlService = {
    // Campaign Management
    getActiveCampaign: async (): Promise<any> => {
        try {
            const campaigns = await OperationsApi.getCampaigns();
            return campaigns.find(c => c.status === 'Active');
        } catch (e) {
            console.error("Failed to fetch active campaign from API, falling back to mock", e);
            return new Promise(resolve => setTimeout(() => {
                resolve(store.campaigns.find(c => c.status === 'Active'));
            }, LATENCY));
        }
    },

    getDashboardStats: async (operationId?: string): Promise<any> => {
        return new Promise(resolve => setTimeout(() => {
            // In a real app, backend would filter. Here we filter mock store.
            const filterOp = (items: any[]) => operationId
                ? items.filter(i => i.operationId === operationId || i.relatedOperationId === operationId)
                : items;

            resolve({
                activeOrders: operationId ? 4 : 12, // Mock difference
                pendingProposals: filterOp(store.proposals).filter((p: any) => p.status === 'Proposed').length,
                activeScenario: operationId ? 'Scenario Bravo (Localized)' : 'Scenario Alpha (Global)',
                readiness: operationId ? 92 : 85,
                loos: store.loos || [], // LOOs usually campaign level
                decisiveConditions: store.decisiveConditions || []
            });
        }, LATENCY));
    },

    // Gap Analysis
    getGapAnalysis: async (campaignId: string): Promise<any> => {
        return new Promise(resolve => setTimeout(() => {
            resolve({
                campaignId,
                generatedAt: new Date().toISOString(),
                framework: 'NATO-COPD-v2',
                looVariance: [
                    { looId: 'loo-1', variance: -15, trend: 'degrading' },
                    { looId: 'loo-2', variance: 5, trend: 'improving' }
                ],
                criticalGaps: [
                    { id: 'gap-1', severity: 'High', description: 'Logistics throughput deficit for Phase 3.' }
                ]
            });
        }, LATENCY));
    },

    // CCIR Management
    getCCIRs: async (): Promise<CCIR[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.ccirs || []);
        }, LATENCY));
    },

    toggleCCIRStatus: async (id: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const ccir = store.ccirs.find(c => c.id === id);
            if (ccir) {
                ccir.status = ccir.status === 'Active' ? 'Met' : 'Active';
            }
            resolve();
        }, LATENCY));
    },

    getCCIRHits: async (): Promise<CCIRHit[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.ccirHits || []);
        }, LATENCY));
    },

    addCCIRHitFeedback: async (hitId: string, comment: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const hit = store.ccirHits.find(h => h.id === hitId);
            if (hit) {
                if (!hit.feedback) hit.feedback = [];
                hit.feedback.push({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: 'user-1',
                    comment,
                    createdAt: new Date().toISOString()
                });
            }
            resolve();
        }, LATENCY));
    },

    updateCCIRHitStatus: async (hitId: string, status: CCIRHit['status']): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const hit = store.ccirHits.find(h => h.id === hitId);
            if (hit) {
                hit.status = status;
            }
            resolve();
        }, LATENCY));
    },

    addCCIRFeedback: async (ccirId: string, comment: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const ccir = store.ccirs.find((c: CCIR) => c.id === ccirId);
            if (ccir) {
                if (!ccir.feedback) ccir.feedback = [];
                ccir.feedback.push({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: 'user-1',
                    comment,
                    createdAt: new Date().toISOString()
                });
            }
            resolve();
        }, LATENCY));
    },

    // --- OPLAN Management ---
    getOPLANs: async (campaignId: string = 'campaign-1'): Promise<OPLAN[]> => {
        return new Promise(resolve => setTimeout(() => {
            const plans = store.oplans?.filter(p => p.campaignId === campaignId) || [];
            resolve(plans);
        }, LATENCY));
    },

    getOPLAN: async (id: string): Promise<OPLAN | undefined> => {
        return new Promise(resolve => setTimeout(() => {
            const plan = store.oplans?.find(p => p.id === id);
            resolve(plan);
        }, LATENCY));
    },

    // COG / Analysis Support
    updateCVStatus: async (cvId: string, status: string): Promise<void> => {
        console.log(`[Mock] Updating CV ${cvId} status to ${status}`);
    },

    updateCVProtection: async (cvId: string, protectionStatus: 'Unprotected' | 'Guarded' | 'Fortified', score: number): Promise<void> => {
        console.log(`[Mock] Updating CV ${cvId} protection to ${protectionStatus} (Score: ${score})`);
    },

    // Personnel & ORBAT
    getStaffMembers: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.staffMembers || []);
        }, LATENCY));
    },

    getBiometrics: async (): Promise<BiometricReading[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.biometrics || []);
        }, LATENCY));
    },

    getOrbat: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.units || []);
        }, LATENCY));
    },

    // COP Support
    getRecognisedPicture: async (domain: string): Promise<Track[]> => {
        return new Promise(resolve => setTimeout(() => {
            const tracks = store.tracks?.filter(t => t.domain === domain) || [];
            resolve(tracks);
        }, LATENCY));
    },

    getCOGs: async (side: 'Blue' | 'Red' = 'Blue'): Promise<CenterOfGravity[]> => {
        return new Promise(resolve => setTimeout(() => {
            const cogs = store.cogs?.filter(c => c.side === side) || store.cogs || [];
            resolve(cogs);
        }, LATENCY));
    },

    // Targeting & BDA
    getTargets: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.targets || []);
        }, LATENCY));
    },

    getTarget: async (id: string): Promise<any | undefined> => {
        return new Promise(resolve => setTimeout(() => {
            // Fuzzy match for flexibility (ID, Designator, or lowercase ID)
            const target = store.targets.find(t =>
                t.id === id ||
                t.id.toLowerCase() === id.toLowerCase() ||
                t.designator === id ||
                t.designator.toLowerCase() === id.toLowerCase()
            );
            resolve(target);
        }, LATENCY));
    },

    updateTargetStatus: async (id: string, status: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const target = store.targets.find(t => t.id === id);
            if (target) target.status = status as any;
            resolve();
        }, LATENCY));
    },

    submitProposal: async (proposal: any): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            store.proposals.push({
                ...proposal,
                id: Math.random().toString(36).substr(2, 9),
                status: 'Proposed',
                submittedAt: new Date().toISOString()
            });
            resolve();
        }, LATENCY));
    },

    getStrikeAnalysis: async (targetId: string): Promise<StrikeAnalysis | undefined> => {
        return new Promise(resolve => setTimeout(() => {
            resolve({
                targetId,
                selectionScore: 88,
                tacticalGain: 92,
                strategicGain: 78,
                economicImpact: -15,
                legalCompliance: 'Clear',
                reasoning: 'Primary C2 node neutralization enables immediate sector dominance.'
            });
        }, LATENCY));
    },

    getBDAReports: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.bdaReports || []);
        }, LATENCY));
    },

    getProposals: async (operationId?: string): Promise<Proposal[]> => {
        return new Promise(resolve => setTimeout(() => {
            const all = store.proposals || [];
            if (!operationId) resolve(all);
            else resolve(all.filter(p => !p.operationId || p.operationId === operationId));
        }, LATENCY));
    },

    getProposal: async (id: string): Promise<Proposal | undefined> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.proposals.find(p => p.id === id));
        }, LATENCY));
    },

    updateProposalStatus: async (id: string, status: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const proposal = store.proposals.find(p => p.id === id);
            if (proposal) proposal.status = status as any;
            resolve();
        }, LATENCY));
    },

    resolveAssessment: async (targetId: string, recommendation: string): Promise<void> => {
        console.log(`[Mock] Resolved assessment for ${targetId} with ${recommendation}`);
        return Promise.resolve();
    },

    submitStrikeRequest: async (targetId: string, weapon: string, justification: string): Promise<void> => {
        console.log(`[Mock] Strike requested on ${targetId} with ${weapon}: ${justification}`);
        return Promise.resolve();
    },

    // Infrastructure & Civil
    getInfrastructure: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.infrastructure || []);
        }, LATENCY));
    },

    getCivilAgencies: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.civilAgencies || []);
        }, LATENCY));
    },

    getCivilDependencies: async (): Promise<any[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.civilDependencies || []);
        }, LATENCY));
    },

    getLibraryData: async (): Promise<{ nodes: any[], vendors: any[] }> => {
        return new Promise(resolve => setTimeout(() => {
            resolve({ nodes: store.supplyWeb || [], vendors: [] });
        }, LATENCY));
    },

    getOverallSupplyHealth: async (side: 'Blue' | 'Red'): Promise<number> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(side === 'Blue' ? 88 : 65);
        }, LATENCY));
    },
    // --- Planning & Campaign ---
    getScenarios: async (): Promise<Scenario[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.scenarios || []);
        }, LATENCY));
    },

    getCOAs: async (): Promise<CourseOfAction[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.coas || []);
        }, LATENCY));
    },

    updateCOA: async (id: string, updates: Partial<CourseOfAction>): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const coa = store.coas.find(c => c.id === id);
            if (coa) Object.assign(coa, updates);
            resolve();
        }, LATENCY));
    },

    getStrategicGuidance: async (): Promise<StrategicGuidance> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.strategicGuidance);
        }, LATENCY));
    },

    getCampaignLOOs: async (campaignId: string): Promise<LineOfOperation[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.loos.filter(l => l.campaignId === campaignId));
        }, LATENCY));
    },

    getLOODecisiveConditions: async (looId: string): Promise<DecisiveCondition[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.decisiveConditions.filter(dc => dc.looId === looId));
        }, LATENCY));
    },

    getOperations: async (campaignId: string): Promise<Operation[]> => {
        try {
            return await OperationsApi.getOperations(campaignId);
        } catch (e) {
            console.error("Failed to fetch operations from API, falling back to mock", e);
            return new Promise(resolve => setTimeout(() => {
                resolve(store.operations.filter(op => op.campaignId === campaignId));
            }, LATENCY));
        }
    },

    updateDCStatus: async (id: string, status: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            const dc = store.decisiveConditions.find(d => d.id === id);
            if (dc) dc.status = status as any;
            resolve();
        }, LATENCY));
    },

    getDecisionBoards: async (): Promise<DecisionBoard[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.decisionBoards || []);
        }, LATENCY));
    },

    getROEs: async (): Promise<ROE[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.roes || []);
        }, LATENCY));
    },

    // --- Info & Products ---
    getInformationRequirements: async (): Promise<InformationRequirement[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.informationRequirements || []);
        }, LATENCY));
    },

    getInformationFlows: async (): Promise<InformationFlow[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.informationFlows || []);
        }, LATENCY));
    },

    getProductReports: async (): Promise<ProductReport[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.productReports || []);
        }, LATENCY));
    },

    generateProductReport: async (title: string, type: string, content: any, owner: string): Promise<void> => {
        return new Promise(resolve => setTimeout(() => {
            store.productReports.push({
                id: Math.random().toString(36).substr(2, 9),
                title,
                type: type as any,
                summary: `Generated ${type} for ${title}`,
                content,
                author: owner,
                generatedAt: new Date().toISOString(),
                integrityHash: 'sha256-' + Math.random().toString(36).substr(2, 12),
                status: 'Final',
                version: 1
            });
            resolve();
        }, LATENCY));
    },

    getRFIs: async (): Promise<RequestForInformation[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.rfis || []);
        }, LATENCY));
    },

    addRFIResponse: async (id: string, response: string, responder: string): Promise<void> => {
        console.log(`[Mock] RFI ${id} responded by ${responder}: ${response}`);
        return Promise.resolve();
    },

    updateRFIStatus: async (id: string, status: string): Promise<void> => {
        const rfi = store.rfis.find(r => r.id === id);
        if (rfi) rfi.status = status as any;
        return Promise.resolve();
    },

    // --- Misc & Admin ---
    getWeatherReport: async (): Promise<WeatherReport> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.weatherReport);
        }, LATENCY));
    },

    getWeatherImpacts: async (): Promise<WeatherImpact[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.weatherImpacts || []);
        }, LATENCY));
    },

    getBattleRhythmEvents: async (): Promise<BattleRhythmEvent[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.battleRhythmEvents || []);
        }, LATENCY));
    },

    getGovernanceSessions: async (operationId?: string): Promise<GovernanceSession[]> => {
        return new Promise(resolve => setTimeout(() => {
            const all = store.governanceSessions || [];
            if (!operationId) resolve(all);
            else resolve(all.filter(s => !s.operationId || s.operationId === operationId));
        }, LATENCY));
    },

    getGovernanceSession: async (id: string): Promise<GovernanceSession | undefined> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.governanceSessions.find(s => s.id === id));
        }, LATENCY));
    },

    saveMeetingRecord: async (record: MeetingRecord): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const session = store.governanceSessions.find(s => s.id === record.sessionId);
                if (session) {
                    session.meetingRecord = record;
                    session.status = 'Concluded';
                }
                resolve();
            }, LATENCY);
        });
    },

    getTORs: async (): Promise<TermsOfReference[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.tors || []);
        }, LATENCY));
    },

    getPMESIIData: async (): Promise<PMESIIData[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.pmesii || []);
        }, LATENCY));
    },

    validateEntity: (_entity: any): any => {
        return { valid: true, issues: [] };
    },

    getUnits: async (): Promise<Unit[]> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(store.units || []);
        }, LATENCY));
    },

    // --- External Context & PMESII ---
    getPoliticalStatements: async (operationId?: string): Promise<PoliticalStatement[]> => {
        return new Promise(resolve => setTimeout(() => {
            const all = store.politicalStatements || [];
            if (!operationId) resolve(all);
            else resolve(all.filter(i => i.affectedOperationIds.includes(operationId)));
        }, LATENCY));
    },

    getNaturalDisasters: async (operationId?: string): Promise<NaturalDisaster[]> => {
        return new Promise(resolve => setTimeout(() => {
            const all = store.naturalDisasters || [];
            if (!operationId) resolve(all);
            else resolve(all.filter(i => i.affectedOperationIds.includes(operationId)));
        }, LATENCY));
    },

    getDisinformationEvents: async (operationId?: string): Promise<DisinformationEvent[]> => {
        return new Promise(resolve => setTimeout(() => {
            const all = store.disinformationEvents || [];
            if (!operationId) resolve(all);
            else resolve(all.filter(i => i.affectedOperationIds.includes(operationId)));
        }, LATENCY));
    },

    getFakeMedia: async (operationId?: string): Promise<FakeMedia[]> => {
        return new Promise(resolve => setTimeout(() => {
            const all = store.fakeMedia || [];
            if (!operationId) resolve(all);
            else resolve(all.filter(i => i.affectedOperationIds.includes(operationId)));
        }, LATENCY));
    }
};
