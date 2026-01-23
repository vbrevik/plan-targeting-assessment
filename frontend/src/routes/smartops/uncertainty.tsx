import { createFileRoute } from '@tanstack/react-router';
import { UncertaintyManagement } from '@/features/smartops/components/UncertaintyManagement';

export const Route = createFileRoute('/smartops/uncertainty')({
    component: UncertaintyManagement,
});
