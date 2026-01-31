import { createFileRoute } from '@tanstack/react-router';
import { InsiderThreatDashboard } from '@/features/admin/InsiderThreatDashboard';

export const Route = createFileRoute('/mshnctrl/security')({
    component: InsiderThreatDashboard,
});
