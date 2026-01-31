import { createFileRoute } from '@tanstack/react-router';
import { JTBVotingView } from '@/features/targeting/JTBVotingView';

export const Route = createFileRoute('/mshnctrl/targeting/jtb')({
    component: JTBVotingView,
});
