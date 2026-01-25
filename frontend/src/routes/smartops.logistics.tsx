import { createFileRoute } from '@tanstack/react-router';
import { LogisticsManagement } from '@/features/logistics/LogisticsManagement';

export const Route = createFileRoute('/smartops/logistics')({
    component: LogisticsManagement,
});
