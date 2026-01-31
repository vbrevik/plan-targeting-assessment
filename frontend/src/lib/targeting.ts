import { api } from './api';
import type { Target as FrontendTarget } from './mshnctrl/types';

// Backend Type Definition
export interface BackendTarget {
    id: string;
    name: string;
    description?: string;
    target_type: string;
    priority: string;
    target_status: string;
    coordinates: string;
    f3ead_stage?: string;
}

// Helper to convert Backend Target to Frontend Target
const mapBackendToFrontend = (backend: BackendTarget): FrontendTarget => {
    // Parse coordinates string "lat,lng" if possible
    let lat = 0;
    let lng = 0;
    if (backend.coordinates && backend.coordinates.includes(',')) {
        const [latStr, lngStr] = backend.coordinates.split(',');
        lat = parseFloat(latStr) || 0;
        lng = parseFloat(lngStr) || 0;
    }

    return {
        id: backend.id,
        name: backend.name,
        description: backend.description,
        type: 'Target',
        affiliation: 'Red', // Defaulting as usually targets are hostile
        status: 'Active', // OperationalStatus
        location: { lat, lng },

        // Target specific
        designator: backend.id, // Using ID as designator for now
        targetId: backend.id,
        category: backend.target_type,
        catCode: '00000', // Placeholder
        priority: backend.priority as 'High' | 'Medium' | 'Low', // Assuming values match, might need mapping
        desiredEffect: 'Neutralize', // Placeholder
        collateralDamageEstimate: 'Low', // Placeholder
        targetStatus: backend.target_status as any, // "Identified" | "Nominated" etc.
        killChainPhase: (backend.f3ead_stage as any) || 'Find',

        // Defaults for required fields missing in backend
        nominatedById: 'system',
    };
};

export const targetingApi = {
    getAll: async (): Promise<FrontendTarget[]> => {
        const backendTargets = await api.get<BackendTarget[]>('/targeting/targets');
        return backendTargets.map(mapBackendToFrontend);
    },

    getById: async (id: string): Promise<FrontendTarget | null> => {
        try {
            const backendTarget = await api.get<BackendTarget>(`/targeting/targets/${id}`);
            return mapBackendToFrontend(backendTarget);
        } catch (e) {
            console.error('Failed to fetch target', e);
            return null;
        }
    },

    updateStatus: async (id: string, status: string): Promise<void> => {
        // Backend expects { target_status: string }
        await api.put<void>(`/targeting/targets/${id}`, { target_status: status });
    },

    createStrikeRequest: async (data: any): Promise<void> => {
        // Placeholder as backend logic for strike requests isn't fully exposed yet
        console.log('Strike Request created:', data);
        return Promise.resolve();
    }
};
