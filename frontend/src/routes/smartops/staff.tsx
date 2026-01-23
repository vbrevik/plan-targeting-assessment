import { createFileRoute } from '@tanstack/react-router';
import { StaffMonitor } from '@/features/smartops/components/StaffMonitor';

export const Route = createFileRoute('/smartops/staff')({
    component: StaffMonitor,
});
