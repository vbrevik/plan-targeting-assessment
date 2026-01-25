import { createFileRoute } from '@tanstack/react-router';
import { BriefingManagement } from '@/features/operations/BriefingManagement';

export const Route = createFileRoute('/smartops/briefing')({
    component: BriefingManagement,
});
