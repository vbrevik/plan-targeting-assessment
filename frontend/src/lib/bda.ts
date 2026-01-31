import { api } from './api';
import type { BDAReport } from './mshnctrl/types';

// Backend BDA Report matches closely enough or we use any for flexibility initially
// But let's verify if we need mapping. 
// Frontend BDAReport expects: targetId, physicalDamage, functionalDamage, recommendation, etc.
// Backend BDAReport has: target_id, physical_damage, functional_damage, etc. (snake_case)

export interface BackendBDAReport {
    id: string;
    target_id: string;
    physical_damage: string; // "SVD", "MD" etc
    functional_damage: string; // "NMC" etc
    recommendation: string; // "ReAttack" etc
    confidence_level: number;
    // ... other fields
}

const mapBackendBdaToFrontend = (backend: any): BDAReport => {
    return {
        id: backend.id,
        targetId: backend.target_id,
        strikes: [], // Backend doesn't seem to return strikes inline or slightly different
        physicalDamage: mapPhysicalDamage(backend.physical_damage),
        functionalDamage: mapFunctionalDamage(backend.functional_damage),
        collateralDamageReported: backend.collateral_damage_detected || false,
        recommendation: mapRecommendation(backend.recommendation),
        confidence: backend.confidence_level || 0,
        notes: backend.notes || '',
        assessorId: backend.analyst_id || 'system',
        submittedAt: backend.created_at,
        status: backend.status === 'Draft' ? 'Draft' : 'Submitted',
        assessmentType: 'Initial',
        imageUrl: undefined
    };
};

const mapPhysicalDamage = (val: string): any => {
    switch (val) {
        case 'ND': return 'None';
        case 'SD': return 'Light';
        case 'MD': return 'Moderate';
        case 'SVD': return 'Severe';
        case 'D': return 'Destroyed';
        default: return 'None';
    }
};

const mapFunctionalDamage = (val: string): any => {
    switch (val) {
        case 'FMC': return 'None';
        case 'PMC': return 'Degraded';
        case 'NMC': return 'Non-Mission Capable';
        default: return 'None';
    }
};

const mapRecommendation = (val: string): any => {
    switch (val) {
        case 'EffectAchieved': return 'Effect Achieved';
        case 'Monitor': return 'Monitor';
        case 'ReAttack': return 'Re-strike';
        case 'ReWeaponeer': return 'Re-strike'; // Mapping both to re-strike for now
        default: return 'Monitor';
    }
};

export const bdaApi = {
    getForTarget: async (targetId: string): Promise<BDAReport[]> => {
        // Using the historical/bda route or similar filtering? 
        // The backend router has `/api/bda` via `features::bda::router`.
        // Let's assume we can filter by target_id or get all and filter client side if needed
        // But referencing router.rs in targeting module showed `/api/targeting/bda` was moved.
        // We really need to know the BDA route. 
        // Based on main.rs: .nest("/bda", features::bda::router(pool.clone()))
        // So it is /api/bda.
        // Let's assume /api/bda/reports?target_id=X or similar.
        // Alternatively, get all and filter.
        try {
            const reports = await api.get<any[]>('/bda/reports', { target_id: targetId });
            return reports.map(mapBackendBdaToFrontend);
        } catch (e) {
            console.warn('Failed to fetch BDA reports', e);
            return [];
        }
    }
};
