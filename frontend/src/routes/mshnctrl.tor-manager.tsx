import { createFileRoute } from '@tanstack/react-router';
import { TORManager } from '@/features/operations/TORManager';

export const Route = createFileRoute('/mshnctrl/tor-manager')({
    component: TORManager,
});
