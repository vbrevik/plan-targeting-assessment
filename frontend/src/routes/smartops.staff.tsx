import { createFileRoute } from '@tanstack/react-router';
import { StaffMonitor } from '@/features/admin/StaffMonitor';

export const Route = createFileRoute('/smartops/staff')({
    component: StaffMonitor,
});
