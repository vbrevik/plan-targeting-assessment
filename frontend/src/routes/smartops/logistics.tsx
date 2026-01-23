import { createFileRoute } from '@tanstack/react-router';
import { LogisticsManagement } from '@/features/smartops/components/LogisticsManagement';

export const Route = createFileRoute('/smartops/logistics')({
    component: LogisticsManagement,
});
