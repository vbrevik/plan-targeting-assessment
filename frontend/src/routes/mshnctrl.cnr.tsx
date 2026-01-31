import { createFileRoute } from '@tanstack/react-router';
import { CNRManagement } from '@/features/operations/CNRManagement';

export const Route = createFileRoute('/mshnctrl/cnr')({
    component: CNRManagement,
});
