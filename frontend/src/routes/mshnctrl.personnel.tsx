import { createFileRoute } from '@tanstack/react-router';
import { PersonnelManagement } from '@/features/admin/PersonnelManagement';

export const Route = createFileRoute('/mshnctrl/personnel')({
    component: PersonnelManagement,
});
