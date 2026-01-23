import { createFileRoute } from '@tanstack/react-router';
import { TargetDetailView } from '@/features/smartops/components/TargetDetailView';

export const Route = createFileRoute('/smartops/targeting/$targetId')({
    component: TargetDetailView,
});
