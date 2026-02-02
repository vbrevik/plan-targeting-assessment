import { createFileRoute } from '@tanstack/react-router';
import { IMDashboard } from '@/features/dashboard/IMDashboard';

export const Route = createFileRoute('/mshnctrl/information-management')({
    component: IMDashboard,
});
