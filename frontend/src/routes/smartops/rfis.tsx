import { createFileRoute } from '@tanstack/react-router';
import { RFIManagement } from '@/features/smartops/components/RFIManagement';

export const Route = createFileRoute('/smartops/rfis')({
    component: RFIManagement,
});
