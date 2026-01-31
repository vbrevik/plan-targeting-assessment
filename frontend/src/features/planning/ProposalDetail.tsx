import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { WorkflowState } from '@/lib/mshnctrl/types';
import type { Proposal } from '@/lib/mshnctrl/types';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, Send, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProposalDetailProps {
    proposalId: string;
}

export function ProposalDetail({ proposalId }: ProposalDetailProps) {
    const navigate = useNavigate();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        MshnCtrlService.getProposal(proposalId).then((p) => {
            setProposal(p || null);
            setLoading(false);
        });
    }, [proposalId]);

    const handleAction = async (newState: WorkflowState) => {
        if (!proposal) return;
        const updated = await MshnCtrlService.updateProposalStatus(proposal.id, newState);
        setProposal(updated);
    };

    if (loading) return <div>Loading Proposal...</div>;
    if (!proposal) return <div>Proposal not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/mshnctrl/proposals' })}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{proposal.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{proposal.type}</span>
                        <span>•</span>
                        <span>ID: {proposal.id}</span>
                        <span>•</span>
                        <span>Created by {proposal.originatorId}</span>
                    </div>
                </div>
                <Badge className="text-lg px-4 py-1" variant={proposal.status === WorkflowState.Approved ? 'default' : 'secondary'}>
                    {proposal.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Proposal Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 font-mono text-sm whitespace-pre-wrap">
                                {proposal.body}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity / Decisions Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Decision History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {proposal.decisions.length === 0 ? (
                                <div className="text-muted-foreground text-sm italic">No decisions recorded yet.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {proposal.decisions.map(d => (
                                        <li key={d.id} className="border-l-2 border-slate-300 pl-4 py-1">
                                            <div className="font-semibold">{d.decision} by {d.deciderId}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">{d.rationale}</div>
                                            <div className="text-xs text-slate-400 mt-1">{new Date(d.timestamp).toLocaleString()}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Panel */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle>Workflow Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm text-muted-foreground mb-4">
                                Current Role: <strong>J3 Commander</strong> (Mocked)
                            </div>

                            {proposal.status === WorkflowState.Draft && (
                                <Button className="w-full gap-2" onClick={() => handleAction(WorkflowState.Proposed)}>
                                    <Send className="h-4 w-4" /> Submit Proposal
                                </Button>
                            )}

                            {proposal.status === WorkflowState.Proposed && (
                                <Button className="w-full gap-2" variant="secondary" onClick={() => handleAction(WorkflowState.UnderReview)}>
                                    <FileEdit className="h-4 w-4" /> Begin Review
                                </Button>
                            )}

                            {proposal.status === WorkflowState.UnderReview && (
                                <>
                                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(WorkflowState.Approved)}>
                                        <CheckCircle className="h-4 w-4" /> Approve
                                    </Button>
                                    <Button className="w-full gap-2" variant="destructive" onClick={() => handleAction(WorkflowState.Rejected)}>
                                        <XCircle className="h-4 w-4" /> Reject
                                    </Button>
                                    <Button className="w-full gap-2" variant="outline" onClick={() => handleAction(WorkflowState.Revision)}>
                                        <FileEdit className="h-4 w-4" /> Request Revision
                                    </Button>
                                </>
                            )}

                            {proposal.status === WorkflowState.Approved && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-center text-sm font-semibold">
                                    Processed & Approved
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
