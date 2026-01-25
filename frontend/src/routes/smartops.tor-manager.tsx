import { createFileRoute } from '@tanstack/react-router';
import { TORManager } from '@/features/operations/TORManager';

export const Route = createFileRoute('/smartops/tor-manager')({
    component: TORManager,
});
