
import { createLazyFileRoute } from '@tanstack/react-router';
import { A2ADStrategicView } from '@/features/intelligence/A2ADStrategicView';

export const Route = createLazyFileRoute('/mshnctrl/a2ad')({
    component: A2ADStrategicView,
});
