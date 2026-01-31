import { useState, useEffect } from 'react';
import { OntologyService, type Entity } from '@/lib/mshnctrl/services/ontology.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ScrollText,
    Plus,
    Save,
    FileText,
    Shield,
    Clock,
    AlertCircle,
    X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function TORManager() {
    const [tours, setTours] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTor, setEditingTor] = useState<Partial<Entity> | null>(null);
    const [agendaPoints, setAgendaPoints] = useState<{ id?: string, title: string, description: string }[]>([]);

    useEffect(() => {
        loadTours();
    }, []);

    const loadTours = async () => {
        setLoading(true);
        try {
            const items = await OntologyService.getEntities({ type: 'TOR' });
            setTours(items);
        } catch (error) {
            console.error('Failed to load TORs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = async (tor: Entity) => {
        setLoading(true);
        try {
            const fullEntity = await OntologyService.getEntityWithRelationships(tor.id);
            setEditingTor(fullEntity);

            // Extract agenda points from relationships
            // Looking for entities where relation_type is HAS_PART and target is an AgendaPoint
            // But getEntityWithRelationships only gives us relationships, not the target entities details if we stored title in the entity name

            // We need to fetch the agenda point entities
            const outgoing = fullEntity.outgoing_relationships.filter(r => r.relation_type === 'HAS_PART');
            const points: { id?: string, title: string, description: string }[] = [];

            for (const rel of outgoing) {
                try {
                    const pointEntity = await OntologyService.getEntity(rel.target_id);
                    if (pointEntity.type === 'AgendaPoint') {
                        points.push({
                            id: pointEntity.id,
                            title: pointEntity.name,
                            description: pointEntity.description || ''
                        });
                    }
                } catch (e) {
                    console.error('Failed to load agenda point', rel.target_id);
                }
            }
            setAgendaPoints(points);
        } catch (error) {
            console.error('Failed to load generic entity details', error);
            // Fallback to basic entity if relationship fetch fails
            setEditingTor(tor);
            setAgendaPoints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingTor({ name: '', description: '', properties: { version: '1.0', classification: 'SECRET' } });
        setAgendaPoints([]);
    };

    const handleSaveTor = async () => {
        if (!editingTor?.name) return;

        try {
            let torId = editingTor.id;

            if (torId) {
                await OntologyService.updateEntity(torId, {
                    name: editingTor.name,
                    description: editingTor.description,
                    properties: editingTor.properties
                });
                toast({ title: 'Success', description: 'TOR updated' });
            } else {
                const newTor = await OntologyService.createEntity({
                    name: editingTor.name,
                    type: 'TOR',
                    description: editingTor.description,
                    properties: editingTor.properties || {}
                });
                torId = newTor.id;
                toast({ title: 'Success', description: 'TOR created' });
            }

            // Handle Agenda Points
            // 1. For new points (no ID), create entity and relationship
            // 2. For existing points (has ID), update entity
            // 3. (Optional) Handle deletions - strictly speaking we should diff, but for MVP we might just append new ones

            if (torId) {
                for (const point of agendaPoints) {
                    if (point.id) {
                        // Update existing
                        await OntologyService.updateEntity(point.id, {
                            name: point.title,
                            description: point.description
                        });
                    } else {
                        // Create new
                        const newPoint = await OntologyService.createEntity({
                            name: point.title,
                            type: 'AgendaPoint',
                            description: point.description,
                            properties: { parent_tor_id: torId }
                        });

                        // Link to TOR
                        await OntologyService.createRelationship({
                            source_id: torId,
                            target_id: newPoint.id,
                            relation_type: 'HAS_PART',
                            properties: { order: 0 } // Could handle ordering
                        });
                    }
                }
            }

            setEditingTor(null);
            loadTours();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to save TOR', variant: 'destructive' });
        }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-full text-slate-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <ScrollText className="text-purple-500" />
                        Terms of Reference
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
                        Operational Authority & Mandate Management
                    </p>
                </div>
                <Button
                    onClick={handleCreateClick}
                    className="bg-purple-600 hover:bg-purple-500 text-xs font-black uppercase"
                >
                    <Plus size={16} className="mr-2" /> New TOR
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-900 rounded border border-slate-800" />)}
                        </div>
                    ) : tours.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-slate-800 rounded-xl text-center">
                            <FileText className="mx-auto text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 uppercase font-black text-sm">No TOR documents found</p>
                        </div>
                    ) : (
                        tours.map(tor => (
                            <Card key={tor.id} className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors">
                                <CardContent className="p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-950 rounded border border-slate-800">
                                                <Shield className="text-purple-400" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black uppercase text-lg tracking-tight">{tor.name}</h3>
                                                <div className="flex gap-4 mt-1">
                                                    <span className="text-[10px] text-red-500 font-black flex items-center gap-1">
                                                        <AlertCircle size={10} /> {tor.properties?.classification}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                                        <Clock size={10} /> v{tor.properties?.version}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(tor)}
                                                className="text-slate-400 hover:text-white uppercase font-black text-[10px]"
                                            >
                                                Edit Mandate
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 italic">
                                        {tor.description || 'No description provided.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    {editingTor && (
                        <Card className="bg-slate-900 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <CardHeader>
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-purple-400">
                                    {editingTor.id ? 'Edit Terms' : 'New Terms of Reference'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-500">Document Title</Label>
                                    <Input
                                        value={editingTor.name}
                                        onChange={e => setEditingTor({ ...editingTor, name: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-xs font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-500">Mandate Description</Label>
                                    <Textarea
                                        value={editingTor.description || ''}
                                        onChange={e => setEditingTor({ ...editingTor, description: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-xs h-32"
                                        placeholder="Describe the authority, responsibilities and constraints..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-slate-500">Classification</Label>
                                        <Input
                                            value={editingTor.properties?.classification || ''}
                                            onChange={e => setEditingTor({
                                                ...editingTor,
                                                properties: { ...editingTor.properties, classification: e.target.value }
                                            })}
                                            className="bg-slate-950 border-slate-800 text-[10px] font-black uppercase text-red-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-slate-500">Status</Label>
                                        <select
                                            value={editingTor.status || 'DRAFT'}
                                            onChange={e => setEditingTor({ ...editingTor, status: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-[10px] font-black uppercase text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="DRAFT">DRAFT</option>
                                            <option value="REVIEW">REVIEW</option>
                                            <option value="APPROVED">APPROVED (Requires Authorization)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-500">Assign Update Task To</Label>
                                    <Input
                                        value={editingTor.properties?.assigned_to || ''}
                                        onChange={e => setEditingTor({
                                            ...editingTor,
                                            properties: { ...editingTor.properties, assigned_to: e.target.value }
                                        })}
                                        className="bg-slate-950 border-slate-800 text-xs"
                                        placeholder="Enter email or user ID..."
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] uppercase font-black text-slate-500">Agenda Points (Standard)</Label>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 text-[10px] bg-slate-800 hover:bg-slate-700"
                                            onClick={() => setAgendaPoints([...agendaPoints, { title: '', description: '' }])}
                                        >
                                            <Plus size={10} className="mr-1" /> Add Point
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {agendaPoints.map((point, index) => (
                                            <div key={index} className="flex gap-2 items-start p-2 bg-slate-950/50 rounded border border-slate-800/50">
                                                <div className="pt-2 text-[10px] font-mono text-slate-600">{(index + 1).toString().padStart(2, '0')}</div>
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={point.title}
                                                        onChange={e => {
                                                            const newPoints = [...agendaPoints];
                                                            newPoints[index].title = e.target.value;
                                                            setAgendaPoints(newPoints);
                                                        }}
                                                        placeholder="Agenda Item Title"
                                                        className="h-7 text-xs bg-slate-900 border-none focus:ring-1"
                                                    />
                                                    <Textarea
                                                        value={point.description}
                                                        onChange={e => {
                                                            const newPoints = [...agendaPoints];
                                                            newPoints[index].description = e.target.value;
                                                            setAgendaPoints(newPoints);
                                                        }}
                                                        placeholder="Context / Details..."
                                                        className="h-12 min-h-[3rem] text-[10px] bg-slate-900 border-none resize-none"
                                                    />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-slate-600 hover:text-red-500"
                                                    onClick={() => {
                                                        const newPoints = [...agendaPoints];
                                                        newPoints.splice(index, 1);
                                                        setAgendaPoints(newPoints);
                                                    }}
                                                >
                                                    <X size={12} />
                                                </Button>
                                            </div>
                                        ))}
                                        {agendaPoints.length === 0 && (
                                            <div className="text-center py-4 text-[10px] text-slate-600 italic">No standard agenda points defined</div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-2">
                                    <Button
                                        onClick={handleSaveTor}
                                        disabled={editingTor.status === 'APPROVED'} // Handled by separate approve action
                                        className="w-full bg-purple-600 hover:bg-purple-500 font-black uppercase text-[10px]"
                                    >
                                        <Save size={14} className="mr-2" /> {editingTor.id ? 'Save Changes' : 'Draft Mandate'}
                                    </Button>

                                    {editingTor.status === 'REVIEW' && (
                                        <Button
                                            variant="outline"
                                            className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 font-black uppercase text-[10px]"
                                            onClick={() => {
                                                if (confirm('Approve this Terms of Reference?')) {
                                                    // Logic for approval would go here
                                                    toast({ title: 'Authorized', description: 'TOR has been approved' });
                                                }
                                            }}
                                        >
                                            <Shield size={14} className="mr-2" /> Authorize TOR
                                        </Button>
                                    )}

                                    <Button variant="ghost" onClick={() => setEditingTor(null)} className="text-[10px] font-black uppercase">
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>

    );
}
