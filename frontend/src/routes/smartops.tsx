import { createFileRoute } from '@tanstack/react-router';
import { SmartOpsLayout } from '@/features/layout/SmartOpsLayout';

export const Route = createFileRoute('/smartops')({
    component: SmartOpsLayout,
});
