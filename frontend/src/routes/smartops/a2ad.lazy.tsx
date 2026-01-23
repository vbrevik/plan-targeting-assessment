
import { createLazyFileRoute } from '@tanstack/react-router';
import { A2ADStrategicView } from '@/features/smartops/components/A2ADStrategicView';

export const Route = createLazyFileRoute('/smartops/a2ad')({
    component: A2ADStrategicView,
});
