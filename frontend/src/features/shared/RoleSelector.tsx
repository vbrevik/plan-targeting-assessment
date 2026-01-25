import { useState } from 'react';
import { ChevronDown, Users, Shield, User } from 'lucide-react';
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';
import { cn } from '@/lib/utils';

export function RoleSelector() {
    const { currentRole, setRole, availableRoles } = useRoleContext();
    const [isOpen, setIsOpen] = useState(false);

    const getRoleIcon = (roleId: string) => {
        if (roleId === 'commander') return Shield;
        if (roleId.includes('j2') || roleId.includes('j3') || roleId.includes('j4') || roleId.includes('j5')) return Users;
        return User;
    };

    const getRoleColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; border: string; text: string; hover: string; active: string }> = {
            red: { bg: 'bg-red-900/30', border: 'border-red-500/50', text: 'text-red-400', hover: 'hover:border-red-400', active: 'bg-red-900/20' },
            blue: { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400', hover: 'hover:border-blue-400', active: 'bg-blue-900/20' },
            green: { bg: 'bg-green-900/30', border: 'border-green-500/50', text: 'text-green-400', hover: 'hover:border-green-400', active: 'bg-green-900/20' },
            purple: { bg: 'bg-purple-900/30', border: 'border-purple-500/50', text: 'text-purple-400', hover: 'hover:border-purple-400', active: 'bg-purple-900/20' },
            amber: { bg: 'bg-amber-900/30', border: 'border-amber-500/50', text: 'text-amber-400', hover: 'hover:border-amber-400', active: 'bg-amber-900/20' },
            orange: { bg: 'bg-orange-900/30', border: 'border-orange-500/50', text: 'text-orange-400', hover: 'hover:border-orange-400', active: 'bg-orange-900/20' },
            cyan: { bg: 'bg-cyan-900/30', border: 'border-cyan-500/50', text: 'text-cyan-400', hover: 'hover:border-cyan-400', active: 'bg-cyan-900/20' },
            slate: { bg: 'bg-slate-900/30', border: 'border-slate-500/50', text: 'text-slate-400', hover: 'hover:border-slate-400', active: 'bg-slate-900/20' },
        };
        return colors[color] || colors.slate;
    };

    const colorClasses = getRoleColorClasses(currentRole.color);
    const RoleIcon = getRoleIcon(currentRole.id);

    return (
        <div className="relative">
            {/* Current Role Display */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                    colorClasses.bg,
                    colorClasses.border,
                    colorClasses.hover
                )}
            >
                <RoleIcon size={14} className={colorClasses.text} />

                <div className="flex flex-col items-start">
                    <span className="text-[8px] uppercase font-bold tracking-widest text-slate-500">
                        Demo Role
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {currentRole.shortName}
                    </span>
                </div>

                <ChevronDown size={14} className={cn(
                    "text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800">
                        <div className="text-xs font-bold text-white mb-1">Select Demo Role</div>
                        <div className="text-[9px] text-slate-500">
                            Switch between different operational roles for testing
                        </div>
                    </div>

                    {/* Roles List */}
                    <div className="max-h-96 overflow-y-auto">
                        {availableRoles.map(role => {
                            const Icon = getRoleIcon(role.id);
                            const roleColors = getRoleColorClasses(role.color);
                            const isActive = currentRole.id === role.id;

                            return (
                                <button
                                    key={role.id}
                                    onClick={() => {
                                        setRole(role.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800 last:border-b-0",
                                        isActive && roleColors.active
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg shrink-0",
                                        roleColors.bg
                                    )}>
                                        <Icon size={16} className={roleColors.text} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-white">{role.name}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                                roleColors.bg,
                                                roleColors.text
                                            )}>
                                                {role.shortName}
                                            </span>
                                            {isActive && (
                                                <span className="ml-auto text-[8px] font-bold text-blue-400 uppercase">Active</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-400 leading-relaxed">
                                            {role.description}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {role.permissions.slice(0, 3).map((perm, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono"
                                                >
                                                    {perm === '*' ? 'All Access' : perm.split('.')[0]}
                                                </span>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <span className="text-[8px] px-1.5 py-0.5 text-slate-500 font-mono">
                                                    +{role.permissions.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Note */}
                    <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[9px] text-slate-500 text-center">
                        <span className="font-bold text-amber-500">⚠️ DEMO MODE:</span> Role switching is for testing only. Production uses actual RBAC.
                    </div>
                </div>
            )}
        </div>
    );
}
