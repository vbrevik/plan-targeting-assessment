import { assumptionsApi } from '@/lib/assumptions';
import type { Assumption as BackendAssumption } from '@/lib/assumptions';
import type { Assumption, AssumptionStatus, UUID } from '../domain/assumption';

// Maps backend status values to frontend domain status values
function mapStatusFromBackend(status: string): AssumptionStatus {
    switch (status) {
        case 'Valid':
        case 'Monitoring':
            return 'VALID';
        case 'Challenged':
            return 'CHALLENGED';
        case 'Broken':
            return 'INVALID';
        default:
            return 'VALID';
    }
}

// Maps frontend domain status values to backend status values
function mapStatusToBackend(status: AssumptionStatus): string {
    switch (status) {
        case 'VALID': return 'Valid';
        case 'CHALLENGED': return 'Challenged';
        case 'INVALID': return 'Broken';
        default: return 'Valid';
    }
}

// Maps backend risk_level to frontend impactIfFalse
function mapRiskToImpact(riskLevel: string): Assumption['impactIfFalse'] {
    switch (riskLevel) {
        case 'Critical': return 'Critical';
        case 'High': return 'Severe';
        case 'Medium': return 'Moderate';
        case 'Low': return 'Negligible';
        default: return 'Moderate';
    }
}

// Maps backend confidence_score (0-100) to frontend confidence enum
function mapConfidenceFromBackend(score?: number): Assumption['confidence'] {
    if (score == null) return 'MEDIUM';
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
}

// Maps frontend confidence enum to backend confidence_score
function mapConfidenceToBackend(confidence: string): number {
    switch (confidence) {
        case 'HIGH': return 85;
        case 'MEDIUM': return 55;
        case 'LOW': return 20;
        default: return 55;
    }
}

// Maps backend category to frontend category enum
function mapCategoryFromBackend(category: string): Assumption['category'] {
    const strategicCategories = ['Strategic', 'Political'];
    const tacticalCategories = ['Environmental', 'Logistical'];
    if (strategicCategories.includes(category)) return 'Strategic';
    if (tacticalCategories.includes(category)) return 'Tactical';
    if (['Strategic', 'Operational', 'Tactical'].includes(category)) {
        return category as Assumption['category'];
    }
    return 'Operational';
}

// Extracts linked decision IDs from backend dependencies JSON
function extractLinkedDecisions(dependencies?: any): UUID[] {
    if (!dependencies) return [];
    if (Array.isArray(dependencies)) return dependencies.filter((d: any) => typeof d === 'string');
    return [];
}

// Converts a backend assumption to the frontend domain type
function toFrontendAssumption(backend: BackendAssumption): Assumption {
    return {
        id: backend.id,
        text: backend.title,
        category: mapCategoryFromBackend(backend.category),
        confidence: mapConfidenceFromBackend(backend.confidence_score),
        status: mapStatusFromBackend(backend.status),
        createdBy: backend.stated_by ?? 'Unknown',
        createdAt: backend.created_at,
        linkedDecisionIds: extractLinkedDecisions(backend.dependencies),
        impactIfFalse: mapRiskToImpact(backend.risk_level),
    };
}

export class AssumptionService {
    static async getAssumptions(): Promise<Assumption[]> {
        const backendAssumptions = await assumptionsApi.getAll();
        return backendAssumptions.map(toFrontendAssumption);
    }

    static async createAssumption(assumption: Omit<Assumption, 'id' | 'createdAt' | 'linkedDecisionIds' | 'status'>): Promise<Assumption> {
        const created = await assumptionsApi.create({
            title: assumption.text,
            category: assumption.category,
            confidence_score: mapConfidenceToBackend(assumption.confidence),
            stated_by: assumption.createdBy,
        });
        return toFrontendAssumption(created);
    }

    static async updateStatus(id: UUID, status: AssumptionStatus): Promise<void> {
        await assumptionsApi.update(id, {
            status: mapStatusToBackend(status),
            risk_level: status === 'INVALID' ? 'Critical' : status === 'CHALLENGED' ? 'High' : undefined,
        });
    }

    static async deleteAssumption(id: UUID): Promise<void> {
        await assumptionsApi.delete(id);
    }

    static async linkDecision(assumptionId: UUID, decisionId: UUID): Promise<void> {
        // Fetch current assumption to preserve existing dependencies
        const current = await assumptionsApi.getById(assumptionId);
        const existingDeps = extractLinkedDecisions(current.dependencies);
        if (!existingDeps.includes(decisionId)) {
            existingDeps.push(decisionId);
            await assumptionsApi.update(assumptionId, {
                dependencies: existingDeps,
            });
        }
    }
}
