
import { createLazyFileRoute } from '@tanstack/react-router';
import { SensorTriageDashboard } from '@/features/intelligence/SensorTriageDashboard';

export const Route = createLazyFileRoute('/smartops/triage')({
    component: SensorTriageDashboard,
});
