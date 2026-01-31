import { store, LATENCY } from './store';

export const LogisticsService = {
    getLibraryData: async () => {
        return new Promise(resolve => setTimeout(() => resolve({
            nodes: [...store.supplyNodes],
            edges: [...store.supplyEdges],
            vendors: [...store.vendors]
        }), LATENCY));
    },

    getOverallSupplyHealth: async (owner: 'Blue' | 'Red') => {
        const nodes = store.supplyNodes.filter(n => n.owner === owner);
        if (nodes.length === 0) return 0;
        const avgCrit = nodes.reduce((acc, n) => acc + n.criticality, 0) / nodes.length;
        return new Promise(resolve => setTimeout(() => resolve(Math.round(avgCrit * 100)), LATENCY));
    }
};
