import { createFileRoute } from '@tanstack/react-router';
import { ProposalDetail } from '@/features/planning/ProposalDetail';

export const Route = createFileRoute('/smartops/proposals/$proposalId')({
    component: ProposalDetailRoute,
});

function ProposalDetailRoute() {
    const { proposalId } = Route.useParams();
    return <ProposalDetail proposalId={proposalId} />;
}
