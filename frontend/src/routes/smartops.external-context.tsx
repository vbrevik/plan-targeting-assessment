import { createFileRoute } from '@tanstack/react-router';
import { ExternalContextDashboard } from '@/features/intelligence/ExternalContextDashboard';

export const Route = createFileRoute('/smartops/external-context')({
    component: ExternalContextDashboard,
});
