import { createFileRoute } from '@tanstack/react-router';
import { CampaignManagement } from '@/features/smartops/components/CampaignManagement';

export const Route = createFileRoute('/smartops/campaign')({
    component: CampaignManagement,
});
