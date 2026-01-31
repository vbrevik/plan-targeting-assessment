import { createFileRoute } from '@tanstack/react-router';
import { TargetNominationPage } from '@/features/targeting/TargetNominationPage';

export const Route = createFileRoute('/mshnctrl/targeting/nominate')({
    component: TargetNominationPage,
});
