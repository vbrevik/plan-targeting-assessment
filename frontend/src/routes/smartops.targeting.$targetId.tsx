import { createFileRoute } from '@tanstack/react-router';
import { TargetDetailView } from '@/features/targeting/TargetDetailView';

export const Route = createFileRoute('/smartops/targeting/$targetId')({
    component: TargetDetailView,
});
