import { createFileRoute } from '@tanstack/react-router';
import { CCIRManagement } from '@/features/intelligence/CCIRManagement';

export const Route = createFileRoute('/mshnctrl/ccir')({
    component: CCIRManagement,
});
