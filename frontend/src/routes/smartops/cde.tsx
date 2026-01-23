import { createFileRoute } from '@tanstack/react-router';
import { CDEManager } from '@/features/smartops/components/CDEManager';

export const Route = createFileRoute('/smartops/cde')({
    component: CDEManager,
});
