import { createFileRoute } from '@tanstack/react-router';
import { JTBSessionManager } from '@/features/targeting/components/jtb/JTBSessionManager';

export const Route = createFileRoute('/mshnctrl/targeting/jtb')({
    component: JTBSessionManager,
});
