import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { targetingApi } from '@/lib/targeting';
import type { JtbSession } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Clock, User, Users } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const JTBSessionManager: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<JtbSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Session Form State
    const [newSession, setNewSession] = useState({
        sessionName: '',
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: '14:00',
        chair: '',
        chairRank: 'OF-5',
        classification: 'SECRET//NATO SECRET',
        requiredAttendees: ['J2', 'J3', 'LEGAD', 'POLAD']
    });

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await targetingApi.listJtbSessions();
            setSessions(data);
        } catch (error) {
            console.error("Failed to load JTB sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            // Combine date and time for ISO string if needed by backend
            const datetime = `${newSession.sessionDate}T${newSession.sessionTime}:00Z`;

            await targetingApi.createJtbSession({
                ...newSession,
                sessionDatetime: datetime
            });

            setIsCreateOpen(false);
            loadSessions();
        } catch (error) {
            console.error("Failed to create session", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'In Progress': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Concluded': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Joint Targeting Board</h2>
                    <p className="text-muted-foreground">Manage execution cycles and target validation sessions</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Schedule New JTB Session</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newSession.sessionDate}
                                        onChange={e => setNewSession({ ...newSession, sessionDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={newSession.sessionTime}
                                        onChange={e => setNewSession({ ...newSession, sessionTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Session Name</Label>
                                <Input
                                    placeholder="e.g., Weekly JTB - Cycle 24-05"
                                    value={newSession.sessionName}
                                    onChange={e => setNewSession({ ...newSession, sessionName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Chair</Label>
                                    <Input
                                        placeholder="Name"
                                        value={newSession.chair}
                                        onChange={e => setNewSession({ ...newSession, chair: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rank</Label>
                                    <Select
                                        value={newSession.chairRank}
                                        onValueChange={(v: string) => setNewSession({ ...newSession, chairRank: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OF-4">OF-4 (LtCol)</SelectItem>
                                            <SelectItem value="OF-5">OF-5 (Col)</SelectItem>
                                            <SelectItem value="OF-6">OF-6 (BrigGen)</SelectItem>
                                            <SelectItem value="OF-7">OF-7 (MajGen)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Classification</Label>
                                <Select
                                    value={newSession.classification}
                                    onValueChange={(v: string) => setNewSession({ ...newSession, classification: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UNCLASSIFIED">UNCLASSIFIED</SelectItem>
                                        <SelectItem value="RESTRICTED">RESTRICTED</SelectItem>
                                        <SelectItem value="SECRET//NATO SECRET">SECRET//NATO SECRET</SelectItem>
                                        <SelectItem value="TOP SECRET">TOP SECRET</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateSession}>Create Session</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
            ) : sessions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No Sessions Scheduled</h3>
                        <p>Create a new JTB session to begin.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map(session => (
                        <Card
                            key={session.id}
                            className="cursor-pointer hover:border-slate-500 transition-colors"
                            onClick={() => navigate({ to: `/mshnctrl/targeting/jtb/${session.id}` })}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <div className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)}`}>
                                    {session.status}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {session.classification.includes('//') ? session.classification.split('//')[1] : session.classification}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="mb-4 text-lg">{session.sessionName}</CardTitle>

                                <div className="space-y-3 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {session.sessionDate}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {session.sessionTime} Zulu
                                    </div>
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        {session.chairRank} {session.chair}
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        {session.requiredAttendees?.length || 0} Required Attendees
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
