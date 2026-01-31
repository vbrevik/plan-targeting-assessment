import { createFileRoute } from '@tanstack/react-router';
import { RFIManagement } from '@/features/operations/RFIManagement';

export const Route = createFileRoute('/mshnctrl/rfis')({
    component: RFIManagement,
});
