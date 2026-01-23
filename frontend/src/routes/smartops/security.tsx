import { createFileRoute } from '@tanstack/react-router';
import { InsiderThreatDashboard } from '@/features/smartops/components/InsiderThreatDashboard';

export const Route = createFileRoute('/smartops/security')({
    component: InsiderThreatDashboard,
});
