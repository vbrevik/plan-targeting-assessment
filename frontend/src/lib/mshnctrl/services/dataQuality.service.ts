import type { BaseEntity } from '../types';

export interface QualityReport {
    entityId: string;
    passed: boolean;
    score: number; // 0-100
    issues: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
}

export const DataQualityService = {
    /**
     * Comprehensive validation of an entity against Trusted Data standards.
     */
    validateEntity: (entity: BaseEntity): QualityReport => {
        const issues: string[] = [];
        let score = 100;

        // 1. Staleness Check (> 24 hours)
        if (entity.lastVerified) {
            const lastVerified = new Date(entity.lastVerified).getTime();
            const now = Date.now();
            const hoursSince = (now - lastVerified) / (1000 * 60 * 60);

            if (hoursSince > 24) {
                issues.push(`Data Stale: Last verified ${hoursSince.toFixed(1)}h ago`);
                score -= 20;
            }
        } else {
            issues.push('Missing verification timestamp');
            score -= 30;
        }

        // 2. Uncertainty Gates
        if (entity.uncertainty !== undefined) {
            if (entity.uncertainty > 0.8) {
                issues.push('Critical Uncertainty: Data unusable (>80%)');
                score -= 50;
            } else if (entity.uncertainty > 0.4) {
                issues.push('High Uncertainty: Verification recommended (>40%)');
                score -= 20;
            }
        }

        // 3. Completeness Checks
        if (!entity.location) {
            issues.push('Missing Location Data');
            score -= 15;
        }
        if (!entity.affiliation) {
            issues.push('Missing Affiliation');
            score -= 10;
        }

        // Determine Risk Level based on score
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
        if (score < 50) riskLevel = 'High';
        else if (score < 80) riskLevel = 'Medium';

        return {
            entityId: entity.id,
            passed: score >= 50,
            score: Math.max(0, score),
            issues,
            riskLevel
        };
    },

    checkStaleness: (entity: BaseEntity): boolean => {
        if (!entity.lastVerified) return true;
        const hoursSince = (Date.now() - new Date(entity.lastVerified).getTime()) / 36e5;
        return hoursSince > 24;
    },

    checkCompleteness: (entity: BaseEntity): string[] => {
        const missing: string[] = [];
        if (!entity.location) missing.push('location');
        if (!entity.affiliation) missing.push('affiliation');
        return missing;
    }
};
