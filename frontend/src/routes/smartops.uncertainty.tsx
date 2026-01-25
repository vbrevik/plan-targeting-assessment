import { createFileRoute } from '@tanstack/react-router';
import { UncertaintyManagement } from '@/features/intelligence/UncertaintyManagement';

export const Route = createFileRoute('/smartops/uncertainty')({
    component: UncertaintyManagement,
});
