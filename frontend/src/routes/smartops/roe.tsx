import { createFileRoute } from '@tanstack/react-router';
import { ROEManagement } from '@/features/smartops/components/ROEManagement';

export const Route = createFileRoute('/smartops/roe')({
    component: ROEManagement,
});
