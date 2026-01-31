import { useEffect, useState } from 'react';
import {
    Search,
    Shield,
    GraduationCap,
    Award,
    Activity,
    Filter,
    Briefcase,
    Clock
} from 'lucide-react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { cn } from '@/lib/utils';
import type { StaffMember, Unit } from '@/lib/mshnctrl/types';

export function PersonnelManagement() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const [staffData, unitsData] = await Promise.all([
                MshnCtrlService.getStaffMembers(),
                MshnCtrlService.getOrbat() as Promise<Unit[]>
            ]);
            setStaff(staffData);
            setUnits(unitsData);
            setLoading(false);
        }
        loadData();
    }, []);

    const getUnitName = (unitId: string) => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : 'Unassigned';
    };

    const getTrainingLevelColor = (level: string) => {
        switch (level) {
            case 'Expert': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
            case 'Master': return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30';
            case 'Senior': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
            case 'Junior': return 'text-slate-400 bg-slate-900/20 border-slate-500/30';
            default: return 'text-slate-400';
        }
    };

    const roles = Array.from(new Set(staff.map(s => s.role)));
    const unitList = Array.from(new Set(staff.map(s => s.assignedUnitId)))
        .map(id => units.find(u => u.id === id))
        .filter(u => u !== undefined) as Unit[];

    const filteredStaff = staff.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.qualifications.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = roleFilter ? member.role === roleFilter : true;
        const matchesUnit = selectedUnit ? member.assignedUnitId === selectedUnit : true;

        return matchesSearch && matchesRole && matchesUnit;
    });

    const metrics = {
        total: filteredStaff.length,
        avgFatigue: Math.round(filteredStaff.reduce((acc, s) => acc + s.fatigueScore, 0) / (filteredStaff.length || 1)),
        experts: filteredStaff.filter(s => s.trainingLevel === 'Expert' || s.trainingLevel === 'Master').length,
        criticalStatus: filteredStaff.filter(s => s.cognitiveStatus === 'Critical').length
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Loading Personnel Records...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 rounded uppercase">J1 Personnel</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Personnel Management</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Individual readiness tracking, qualification management, and duty assignment.
                            Monitor training levels and specialized skillsets across the force.
                        </p>
                    </div>

                    {/* Unit Selector */}
                    <div className="flex bg-slate-900 p-1 rounded border border-slate-800">
                        <button
                            onClick={() => setSelectedUnit(null)}
                            className={cn(
                                "px-3 py-1 text-[10px] font-black uppercase rounded transition-all",
                                !selectedUnit ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                            )}
                        >All Units</button>
                        {unitList.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => setSelectedUnit(unit.id)}
                                className={cn(
                                    "px-3 py-1 text-[10px] font-black uppercase rounded transition-all",
                                    selectedUnit === unit.id ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >{unit.designator}</button>
                        ))}
                    </div>
                </div>

                {/* Metrics Dashboard (Data Driven) */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Personnel Count</span>
                        <span className="text-xl font-black text-white">{metrics.total}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Avg Fatigue</span>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xl font-black", metrics.avgFatigue > 70 ? "text-red-500" : "text-emerald-500")}>
                                {metrics.avgFatigue}%
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Experts / Masters</span>
                        <span className="text-xl font-black text-purple-400">{metrics.experts}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Critical Status</span>
                        <span className={cn("text-xl font-black", metrics.criticalStatus > 0 ? "text-red-500 animate-pulse" : "text-slate-600")}>
                            {metrics.criticalStatus}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH NAME, RANK, OR QUALIFICATION..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 bg-slate-900/50 border border-slate-800 rounded px-10 text-[10px] font-black text-white uppercase placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-500" />
                        <div className="flex bg-slate-900 p-1 rounded border border-slate-800">
                            <button
                                onClick={() => setRoleFilter(null)}
                                className={cn(
                                    "px-3 py-1 text-[10px] font-black uppercase rounded transition-all",
                                    !roleFilter ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >All Roles</button>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-black uppercase rounded transition-all",
                                        roleFilter === role ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >{role}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-3">
                    {filteredStaff.map(member => (
                        <div key={member.id} className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 flex items-center gap-6 hover:bg-slate-900/50 transition-colors group">

                            {/* Rank & Name */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-500 border border-slate-700">
                                    {member.rank}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{member.name}</div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                        <Shield size={10} />
                                        <span>{getUnitName(member.assignedUnitId)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Role & Training */}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[9px] uppercase font-black text-slate-600 mb-1 flex items-center gap-1">
                                        <Briefcase size={10} /> Role / Duty
                                    </div>
                                    <div className="text-xs font-mono font-bold text-slate-300">{member.role}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase font-black text-slate-600 mb-1 flex items-center gap-1">
                                        <GraduationCap size={10} /> Training Level
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase border inline-flex items-center gap-1.5",
                                        getTrainingLevelColor(member.trainingLevel)
                                    )}>
                                        {member.trainingLevel}
                                    </span>
                                </div>
                            </div>

                            {/* Qualifications */}
                            <div className="flex-[1.5]">
                                <div className="text-[9px] uppercase font-black text-slate-600 mb-1 flex items-center gap-1">
                                    <Award size={10} /> Certifications & Quals
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {member.qualifications.map(q => (
                                        <span key={q} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-mono rounded border border-slate-700">
                                            {q}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="text-right min-w-[100px]">
                                <div className={cn(
                                    "text-[10px] font-black uppercase mb-1",
                                    member.cognitiveStatus === 'Optimal' ? "text-emerald-500" :
                                        member.cognitiveStatus === 'Degraded' ? "text-yellow-500" : "text-red-500"
                                )}>
                                    {member.cognitiveStatus}
                                </div>
                                <div className="text-[9px] font-mono text-slate-500 flex items-center justify-end gap-1">
                                    <Activity size={10} /> FIT FOR DUTY
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-4">
                    <span>TOTAL PERSONNEL: <strong className="text-white">{staff.length}</strong></span>
                    <span className="h-3 w-px bg-slate-800" />
                    <span>QUALIFIED: <strong className="text-emerald-400">{staff.filter(s => s.trainingLevel === 'Expert' || s.trainingLevel === 'Master').length}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>LAST UPDATE: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
}
