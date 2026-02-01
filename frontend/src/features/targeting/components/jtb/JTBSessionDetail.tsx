import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { targetingApi } from '@/lib/targeting';
import type { JtbSession, JtbTarget } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Clock, CheckCircle, XCircle, AlertCircle, Gavel, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Type for enriched target data (JtbTarget joined with Target entity)
interface EnrichedJtbTarget extends JtbTarget {
    targetName: string;
    targetPriority: string;
    targetStatus: string;
    targetCategory: string;
}

export const JTBSessionDetail: React.FC = () => {
    const { sessionId } = useParams({ from: '/mshnctrl/targeting/jtb/$sessionId' });
    const navigate = useNavigate();

    const [session, setSession] = useState<JtbSession | null>(null);
    const [targets, setTargets] = useState<EnrichedJtbTarget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            loadSessionData();
        }
    }, [sessionId]);

    const loadSessionData = async () => {
        try {
            setLoading(true);
            const data = await targetingApi.getJtbSession(sessionId!);
            setSession(data.session);

            // Map JTB targets to include target details (fetched or joined)
            // Ideally backend returns this join. For now assuming backend returns correct structure or we'd need to fetch targets.
            // Based on backend handler: "targets": targets (which are JtbTarget structs)
            // We might need to fetch target details separately if not included.
            // NOTE: The MVP backend might just return the junction table. 
            // For MVP speed, let's assume we might need to fetch target names if they aren't in the join.
            // But let's check what the API returns. The handler `get_jtb_session` returns { session, targets }.
            // The JtbRepository `get_targets_for_session` does a JOIN to get target name/priority.
            // So `data.targets` should have those fields.

            setTargets(data.targets);
        } catch (error) {
            console.error("Failed to load session details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordDecision = async (jtbTargetId: string, decision: 'Approved' | 'Rejected' | 'Rework') => {
        try {
            await targetingApi.recordJtbDecision(jtbTargetId, {
                decision,
                decisionRationale: "Recorded via JTB Board",
                decidedBy: "Current User", // Should be user ID
                votesFor: 1, // Simplified for MVP
                votesAgainst: 0,
                votesAbstain: 0
            });
            loadSessionData(); // Refresh to show new status
        } catch (error) {
            console.error("Failed to record decision", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading session details...</div>;
    }

    if (!session) {
        return <div className="p-8 text-center">Session not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/mshnctrl/targeting/jtb' })}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Board
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{session.sessionName}</h2>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant={session.status === 'Scheduled' ? 'secondary' : 'default'}>
                            {session.status}
                        </Badge>
                        <span>•</span>
                        <span>{session.classification}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Target Nomination List</CardTitle>
                        <CardDescription>
                            Targets prioritized for this board session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Board Decision</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {targets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No targets assigned to this session.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    targets.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium text-center">{t.presentationOrder}</TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{t.targetName}</div>
                                                <div className="text-xs text-muted-foreground">ID: {t.targetId}</div>
                                            </TableCell>
                                            <TableCell>{t.targetCategory}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.targetPriority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                                    {t.targetPriority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {t.decision === 'Approved' && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
                                                    {t.decision === 'Rejected' && <XCircle className="w-4 h-4 mr-2 text-red-500" />}
                                                    {t.decision === 'Rework' && <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />}
                                                    {t.decision === 'Pending' && <Clock className="w-4 h-4 mr-2 text-slate-400" />}
                                                    {t.decision}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {t.decision === 'Pending' && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleRecordDecision(t.id, 'Approved')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => handleRecordDecision(t.id, 'Rejected')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" /> Date
                                </span>
                                <span className="font-medium">{session.sessionDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="w-4 h-4 mr-2" /> Time
                                </span>
                                <span className="font-medium">{session.sessionTime} Zulu</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Chair
                                </span>
                                <div className="text-right">
                                    <div className="font-medium">{session.chair}</div>
                                    <div className="text-xs text-muted-foreground">{session.chairRank}</div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <span className="text-sm text-muted-foreground block mb-2">Required Attendees</span>
                                <div className="flex flex-wrap gap-1">
                                    {session.requiredAttendees?.map((attendee, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {attendee}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {/* Future: Add Target Search/Add Component here */}
                            <Button className="w-full" variant="outline">
                                <Gavel className="w-4 h-4 mr-2" />
                                Add Target to Session
                            </Button>
                            <Button className="w-full" variant="secondary" onClick={() => navigate({ to: '/mshnctrl/targeting/dtl' })}>
                                View Dynamic Target List
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

