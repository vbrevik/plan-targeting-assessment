import { createFileRoute } from '@tanstack/react-router';
import { ROEManagement } from '@/features/legal/ROEManagement';

export const Route = createFileRoute('/mshnctrl/roe')({
    component: ROEManagement,
});
