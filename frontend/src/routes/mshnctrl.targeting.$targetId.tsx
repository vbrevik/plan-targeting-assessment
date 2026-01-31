import { createFileRoute } from '@tanstack/react-router';
import { TargetDetailView } from '@/features/targeting/TargetDetailView';

export const Route = createFileRoute('/mshnctrl/targeting/$targetId')({
    component: TargetDetailView,
});
