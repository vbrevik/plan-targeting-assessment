import { createFileRoute } from '@tanstack/react-router';
import { CCIRManagement } from '@/features/intelligence/CCIRManagement';

export const Route = createFileRoute('/smartops/ccir')({
    component: CCIRManagement,
});
