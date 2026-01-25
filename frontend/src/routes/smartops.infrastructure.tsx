import { createFileRoute } from '@tanstack/react-router';
import { InfrastructureMonitor } from '@/features/logistics/InfrastructureMonitor';

export const Route = createFileRoute('/smartops/infrastructure')({
    component: InfrastructureMonitor,
});
