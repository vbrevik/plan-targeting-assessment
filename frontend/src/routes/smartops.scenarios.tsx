import { createFileRoute } from '@tanstack/react-router';
import { ScenariosManagement } from '@/features/planning/ScenariosManagement';

export const Route = createFileRoute('/smartops/scenarios')({
    component: ScenariosManagement,
});
