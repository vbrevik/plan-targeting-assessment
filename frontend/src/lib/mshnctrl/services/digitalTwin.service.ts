import { store, LATENCY } from './store';
import type { Track, PMESIIData } from '../types';

export const DigitalTwinService = {
    getRecognisedPicture: async (domain: Track['domain']): Promise<Track[]> => {
        return new Promise(resolve => setTimeout(() => {
            const data = store.tracks.filter(t => t.domain === domain);
            resolve([...data]);
        }, LATENCY));
    },

    getPMESIIData: async (): Promise<PMESIIData[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.pmesii]), LATENCY));
    }
};
