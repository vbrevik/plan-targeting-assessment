import { createFileRoute } from '@tanstack/react-router';
import { AssumptionManagement } from '@/features/planning/AssumptionManagement';

export const Route = createFileRoute('/smartops/assumptions')({
    component: AssumptionManagement,
});
