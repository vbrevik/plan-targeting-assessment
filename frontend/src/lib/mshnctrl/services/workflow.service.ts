import { store, LATENCY } from './store';
import type { Proposal, UUID, BattleRhythmEvent, GovernanceSession, TermsOfReference, MeetingRecord, Brief, DecisionBoard } from '../types';
import { ProposalType, WorkflowState } from '../types';

export const WorkflowService = {
    getProposals: async (): Promise<Proposal[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.proposals]), LATENCY));
    },

    getProposal: async (id: UUID): Promise<Proposal | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(store.proposals.find(p => p.id === id)), LATENCY));
    },

    createProposal: async (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'decisions'>): Promise<Proposal> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newProposal: Proposal = {
                    ...proposal,
                    id: `p-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    decisions: []
                };
                store.proposals.unshift(newProposal);
                resolve(newProposal);
            }, LATENCY);
        });
    },

    updateProposalStatus: async (id: UUID, status: WorkflowState): Promise<Proposal> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = store.proposals.findIndex(p => p.id === id);
                if (idx === -1) return reject('Proposal not found');
                store.proposals[idx] = { ...store.proposals[idx], status, updatedAt: new Date().toISOString() };
                resolve(store.proposals[idx]);
            }, LATENCY);
        });
    },

    submitProposal: async (proposal: Partial<Proposal>): Promise<Proposal> => {
        return new Promise(resolve => setTimeout(() => {
            const newProposal = {
                ...proposal,
                id: `p-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: WorkflowState.Draft,
                approvers: [],
                decisions: []
            } as Proposal;
            // Also add a simplified target if it's a nomination, for immediate feedback
            if (proposal.type === ProposalType.TargetNomination && proposal.body && proposal.title) {
                const targetName = proposal.title.replace('Nominate Target: ', '');
                store.targets.push({
                    id: `t-${Date.now()}`,
                    designator: `T-${Math.floor(Math.random() * 1000)}`,
                    targetId: `T-${Math.floor(Math.random() * 1000)}`,
                    name: targetName,
                    category: 'Pending Analysis',
                    catCode: '0000',
                    priority: 'Medium',
                    location: 'TBD',
                    description: proposal.body,
                    desiredEffect: 'Neutralize',
                    collateralDamageEstimate: 'Low',
                    status: 'Nominated', // JTL Status
                    nominatedById: proposal.originatorId,
                    killChainPhase: 'Target'
                } as any); // Use any for simplicity here, or import Target
            }
            store.proposals.push(newProposal);
            resolve(newProposal);
        }, LATENCY));
    },

    getBattleRhythmEvents: async (): Promise<BattleRhythmEvent[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.battleRhythmEvents]), LATENCY));
    },

    getGovernanceSessions: async (): Promise<GovernanceSession[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.governanceSessions]), LATENCY));
    },

    getGovernanceSession: async (id: UUID): Promise<GovernanceSession | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(store.governanceSessions.find(s => s.id === id)), LATENCY));
    },

    getTORs: async (): Promise<TermsOfReference[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.tors]), LATENCY));
    },

    getTOR: async (id: UUID): Promise<TermsOfReference | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(store.tors.find(t => t.id === id)), LATENCY));
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

    getBriefs: async (): Promise<Brief[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.briefs]), LATENCY));
    },

    getDecisionBoards: async (): Promise<DecisionBoard[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.decisionBoards]), LATENCY));
    }
};
