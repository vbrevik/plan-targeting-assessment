import { createFileRoute } from '@tanstack/react-router';
import { SmartOpsLayout } from '@/features/smartops/components/SmartOpsLayout';

export const Route = createFileRoute('/smartops')({
    component: SmartOpsLayout,
});
