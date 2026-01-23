import { createFileRoute } from '@tanstack/react-router';
import { ExternalContextDashboard } from '@/features/smartops/components/ExternalContextDashboard';

export const Route = createFileRoute('/smartops/external-context')({
    component: ExternalContextDashboard,
});
