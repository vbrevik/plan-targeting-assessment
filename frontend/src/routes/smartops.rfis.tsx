import { createFileRoute } from '@tanstack/react-router';
import { RFIManagement } from '@/features/operations/RFIManagement';

export const Route = createFileRoute('/smartops/rfis')({
    component: RFIManagement,
});
