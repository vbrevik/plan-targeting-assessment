import { createFileRoute } from '@tanstack/react-router';
import { ExternalContextDashboard } from '@/features/intelligence/ExternalContextDashboard';

export const Route = createFileRoute('/mshnctrl/external-context')({
    component: ExternalContextDashboard,
});
