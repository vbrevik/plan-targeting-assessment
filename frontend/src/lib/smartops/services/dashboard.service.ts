import { store, LATENCY } from './store';
import { WorkflowState } from '../types';

export const DashboardService = {
    getDashboardStats: async () => {
        const activeCampaign = store.campaigns.find(c => c.status === 'Active');
        const campaignId = activeCampaign?.id;

        return new Promise(resolve => setTimeout(() => resolve({
            activeOrders: store.activeJCOs.length,
            pendingProposals: store.proposals.filter(p => p.status === WorkflowState.Proposed || p.status === WorkflowState.UnderReview).length,
            activeScenario: store.scenarios.find(s => s.isActive)?.name || 'None',
            readiness: 87, // Mocked overall readiness
            loos: campaignId ? store.loos.filter(l => l.campaignId === campaignId) : [],
            decisiveConditions: campaignId ? store.decisiveConditions.filter(dc => dc.campaignId === campaignId) : []
        }), LATENCY));
    }
};
