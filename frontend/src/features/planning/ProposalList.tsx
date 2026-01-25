import { useNavigate } from '@tanstack/react-router';
import { WorkflowState } from '@/lib/smartops/types';
import type { Proposal } from '@/lib/smartops/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ProposalListProps {
    proposals: Proposal[];
}

export function ProposalList({ proposals }: ProposalListProps) {
    const navigate = useNavigate();

    const getStatusColor = (status: WorkflowState) => {
        switch (status) {
            case WorkflowState.Approved: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case WorkflowState.Rejected: return 'bg-red-500/10 text-red-500 border-red-500/20';
            case WorkflowState.Proposed: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case WorkflowState.UnderReview: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: WorkflowState) => {
        switch (status) {
            case WorkflowState.Approved: return <CheckCircle2 size={12} />;
            case WorkflowState.Proposed: return <Clock size={12} />;
            case WorkflowState.UnderReview: return <FileText size={12} />;
            default: return <AlertCircle size={12} />;
        }
    };

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
                <div
                    key={proposal.id}
                    onClick={() => navigate({ to: `/smartops/proposals/$proposalId`, params: { proposalId: proposal.id } })}
                    className="group bg-slate-950 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/10 relative overflow-hidden"
                >
                    {/* Decorative accent */}
                    <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50",
                        proposal.status === WorkflowState.Approved ? "bg-emerald-500" :
                            proposal.status === WorkflowState.Proposed ? "bg-blue-500" : "bg-slate-700")}
                    />

                    <div className="flex justify-between items-start mb-4">
                        <Badge className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border flex items-center gap-1.5", getStatusColor(proposal.status))}>
                            {getStatusIcon(proposal.status)}
                            {proposal.status}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-600">#{proposal.id.slice(0, 8)}</span>
                    </div>

                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors leading-tight">
                        {proposal.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 leading-relaxed italic">
                        "{proposal.body}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-700">
                                {proposal.originatorId.charAt(0)}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{proposal.originatorId}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            View Detail <ArrowRight size={10} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
