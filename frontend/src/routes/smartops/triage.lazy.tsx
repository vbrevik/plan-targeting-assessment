
import { createLazyFileRoute } from '@tanstack/react-router';
import { SensorTriageDashboard } from '@/features/smartops/components/SensorTriageDashboard';

export const Route = createLazyFileRoute('/smartops/triage')({
    component: SensorTriageDashboard,
});
