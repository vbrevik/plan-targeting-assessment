import { createFileRoute } from '@tanstack/react-router';
import { CNRManagement } from '@/features/smartops/components/CNRManagement';

export const Route = createFileRoute('/smartops/cnr')({
    component: CNRManagement,
});
