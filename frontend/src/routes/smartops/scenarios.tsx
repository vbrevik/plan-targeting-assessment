import { createFileRoute } from '@tanstack/react-router';
import { ScenariosManagement } from '@/features/smartops/components/ScenariosManagement';

export const Route = createFileRoute('/smartops/scenarios')({
    component: ScenariosManagement,
});
