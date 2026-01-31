import type { StrategicGuidance } from './mshnctrl/types';

const API_BASE = '/api';

export const strategicApi = {
    getGuidance: async (): Promise<StrategicGuidance | null> => {
        try {
            const response = await fetch(`${API_BASE}/strategy/guidance`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access to strategy guidance');
                    return null;
                }
                if (response.status === 404) return null;
                throw new Error('Failed to fetch strategic guidance');
            }
            const data = await response.json();

            // Transform date strings to Date objects if needed, though frontend currently displays string/Date mixed usage
            // The StrategicGuidance type in types.ts expects strings for ISO dates mostly, but UI might parse them.
            // Let's return raw data and let UI handle parsing (new Date(lastUpdated))
            return data;
        } catch (error) {
            console.error('Error fetching strategic guidance:', error);
            return null;
        }
    }
};
