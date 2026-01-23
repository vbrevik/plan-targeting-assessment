import { createFileRoute } from '@tanstack/react-router';
import { TargetNominationPage } from '@/features/smartops/components/TargetNominationPage';

export const Route = createFileRoute('/smartops/targeting/nominate')({
    component: TargetNominationPage,
});
