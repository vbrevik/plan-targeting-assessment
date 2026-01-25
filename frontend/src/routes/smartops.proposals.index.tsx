import { createFileRoute } from '@tanstack/react-router';
import { ProposalList } from '@/features/planning/ProposalList';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const Route = createFileRoute('/smartops/proposals/')({
    loader: () => SmartOpsService.getProposals(),
    component: ProposalsInbox,
});

function ProposalsInbox() {
    const { filterByContext } = useOperationalContext();
    const allProposals = Route.useLoaderData();
    const proposals = allProposals.filter(filterByContext);

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 rounded uppercase">HQ Governance</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Operational Proposals</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Central registry for all staff nominations, course of action proposals, and order drafts.
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded py-1 h-auto flex items-center gap-2">
                        <Plus size={14} /> New Proposal
                    </Button>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto">
                <ProposalList proposals={proposals} />
            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> REGISTRY LINK ACTIVE
                    </span>
                    <span>QUEUE: {proposals.filter(p => p.status === 'Proposed').length} PENDING</span>
                </div>
            </div>
        </div>
    );
}
