import { useState, useEffect } from 'react';
import { OntologyService, type Entity } from '@/lib/smartops/services/ontology.service';
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
    AlertCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function TORManager() {
    const [tours, setTours] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTor, setEditingTor] = useState<Partial<Entity> | null>(null);

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

    const handleSaveTor = async () => {
        if (!editingTor?.name) return;

        try {
            if (editingTor.id) {
                await OntologyService.updateEntity(editingTor.id, {
                    name: editingTor.name,
                    description: editingTor.description,
                    properties: editingTor.properties
                });
                toast({ title: 'Success', description: 'TOR updated' });
            } else {
                await OntologyService.createEntity({
                    name: editingTor.name,
                    type: 'TOR',
                    description: editingTor.description,
                    properties: editingTor.properties || {}
                });
                toast({ title: 'Success', description: 'TOR created' });
            }
            setEditingTor(null);
            loadTours();
        } catch (error) {
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
                    onClick={() => setEditingTor({ name: '', description: '', properties: { version: '1.0', classification: 'SECRET' } })}
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
                                                onClick={() => setEditingTor(tor)}
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
