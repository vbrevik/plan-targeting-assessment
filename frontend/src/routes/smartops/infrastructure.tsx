import { createFileRoute } from '@tanstack/react-router';
import { InfrastructureMonitor } from '@/features/smartops/components/InfrastructureMonitor';

export const Route = createFileRoute('/smartops/infrastructure')({
    component: InfrastructureMonitor,
});
