import type { Assumption, AssumptionStatus, UUID } from '../domain/assumption';

// Mock Data
let mockAssumptions: Assumption[] = [
    {
        id: 'asm-001',
        text: 'Air Superiority maintained in Sector 4',
        category: 'Operational',
        confidence: 'HIGH',
        status: 'VALID',
        createdBy: 'J2 Air',
        createdAt: new Date().toISOString(),
        linkedDecisionIds: [],
        impactIfFalse: 'Critical'
    },
    {
        id: 'asm-002',
        text: 'Main Supply Route (MSR) Alpha remains passable',
        category: 'Tactical',
        confidence: 'MEDIUM',
        status: 'CHALLENGED',
        createdBy: 'J4 Logistics',
        createdAt: new Date().toISOString(),
        linkedDecisionIds: [],
        impactIfFalse: 'Severe'
    }
];

export class AssumptionService {
    static async getAssumptions(): Promise<Assumption[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...mockAssumptions];
    }

    static async createAssumption(assumption: Omit<Assumption, 'id' | 'createdAt' | 'linkedDecisionIds' | 'status'>): Promise<Assumption> {
        const newAssumption: Assumption = {
            ...assumption,
            id: `asm-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'VALID',
            linkedDecisionIds: []
        };
        mockAssumptions.unshift(newAssumption);
        return newAssumption;
    }

    static async updateStatus(id: UUID, status: AssumptionStatus): Promise<void> {
        mockAssumptions = mockAssumptions.map(a =>
            a.id === id ? { ...a, status } : a
        );
    }

    static async deleteAssumption(id: UUID): Promise<void> {
        mockAssumptions = mockAssumptions.filter(a => a.id !== id);
    }

    static async linkDecision(assumptionId: UUID, decisionId: UUID): Promise<void> {
        const assumption = mockAssumptions.find(a => a.id === assumptionId);
        if (assumption && !assumption.linkedDecisionIds.includes(decisionId)) {
            assumption.linkedDecisionIds.push(decisionId);
        }
    }
}
