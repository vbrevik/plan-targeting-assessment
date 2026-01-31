import { createFileRoute } from '@tanstack/react-router';
import { CDEManager } from '@/features/targeting/CDEManager';

export const Route = createFileRoute('/mshnctrl/cde')({
    component: CDEManager,
});
