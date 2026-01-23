import { createFileRoute } from '@tanstack/react-router';
import { JTBVotingView } from '@/features/smartops/components/JTBVotingView';

export const Route = createFileRoute('/smartops/targeting/jtb')({
    component: JTBVotingView,
});
