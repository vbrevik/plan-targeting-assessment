import { createFileRoute } from '@tanstack/react-router';
import { PersonnelManagement } from '@/features/smartops/components/PersonnelManagement';

export const Route = createFileRoute('/smartops/personnel')({
    component: PersonnelManagement,
});
