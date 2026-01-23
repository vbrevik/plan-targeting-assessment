import { createFileRoute } from '@tanstack/react-router';
import { CCIRManagement } from '@/features/smartops/components/CCIRManagement';

export const Route = createFileRoute('/smartops/ccir')({
    component: CCIRManagement,
});
