import { createFileRoute } from '@tanstack/react-router';
import { AssumptionManagement } from '@/features/smartops/components/AssumptionManagement';

export const Route = createFileRoute('/smartops/assumptions')({
    component: AssumptionManagement,
});
