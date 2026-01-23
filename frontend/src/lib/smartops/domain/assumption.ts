export type UUID = string;

export type AssumptionStatus = 'VALID' | 'INVALID' | 'CHALLENGED';
export type AssumptionConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Assumption {
    id: UUID;
    text: string;
    category: 'Strategic' | 'Operational' | 'Tactical';
    confidence: AssumptionConfidence;
    status: AssumptionStatus;
    createdBy: string;
    createdAt: string;
    validityPeriod?: {
        start: string;
        end: string;
    };
    linkedDecisionIds: UUID[];
    impactIfFalse: 'Critical' | 'Severe' | 'Moderate' | 'Negligible';
}
