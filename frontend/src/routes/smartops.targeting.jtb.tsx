import { createFileRoute } from '@tanstack/react-router';
import { JTBVotingView } from '@/features/targeting/JTBVotingView';

export const Route = createFileRoute('/smartops/targeting/jtb')({
    component: JTBVotingView,
});
