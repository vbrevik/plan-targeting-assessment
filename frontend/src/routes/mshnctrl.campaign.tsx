import { createFileRoute } from '@tanstack/react-router';
import { CampaignManagement } from '@/features/planning/CampaignManagement';

export const Route = createFileRoute('/mshnctrl/campaign')({
    component: CampaignManagement,
});
