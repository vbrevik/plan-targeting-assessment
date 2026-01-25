import { createFileRoute } from '@tanstack/react-router';
import { TargetNominationPage } from '@/features/targeting/TargetNominationPage';

export const Route = createFileRoute('/smartops/targeting/nominate')({
    component: TargetNominationPage,
});
