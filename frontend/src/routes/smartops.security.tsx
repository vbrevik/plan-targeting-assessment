import { createFileRoute } from '@tanstack/react-router';
import { InsiderThreatDashboard } from '@/features/admin/InsiderThreatDashboard';

export const Route = createFileRoute('/smartops/security')({
    component: InsiderThreatDashboard,
});
