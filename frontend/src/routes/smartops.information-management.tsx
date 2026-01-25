import { createFileRoute } from '@tanstack/react-router';
import { InformationManagement } from '@/features/intelligence/InformationManagement';

export const Route = createFileRoute('/smartops/information-management')({
    component: InformationManagement,
});
