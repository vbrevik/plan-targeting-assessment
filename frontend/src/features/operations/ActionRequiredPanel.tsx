import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle2, Target, FileEdit, Send, Eye } from 'lucide-react';
import { SecurityBadge, type ClassificationLevel, type Caveat } from '@/components/SecurityBadge';
import { Link } from '@tanstack/react-router';
import { targetingApi } from '@/lib/smartops/api/targeting.api';

/**
 * Action Item Types
 */
export type ActionItemType = 'target' | 'nomination' | 'review' | 'approval' | 'cde' | 'deconfliction';

/**
 * Priority Levels
 */
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Action Item Interface
 */
export interface ActionItem {
    id: string;
    type: ActionItemType;
    title: string;
    subtitle?: string;
    classification: ClassificationLevel;
    caveats?: Caveat[];
    priority: Priority;
    dueTime?: Date;
    dueTimeDisplay?: string; // "in 2 hours", "Today", "Tomorrow"
    assignedToCurrentUser: boolean;
    blockers?: string[];
    quickActions: ActionButton[];
    targetId?: string; // For linking to target details
}

/**
 * Action Button Interface
 */
export interface ActionButton {
    label: string;
    icon: React.ElementType;
    to?: string; // Link destination
    onClick?: () => void; // Or callback
    variant: 'primary' | 'secondary' | 'danger';
}

/**
 * ActionRequiredPanel Component
 * 
 * Displays priority-sorted action items that require user attention.
 * This is the most critical panel - "What needs my attention NOW?"
 * 
 * Follows operational targeting doctrine:
 * - Mission first: Most urgent items at top
 * - Clear prioritization: CRITICAL > HIGH > MEDIUM
 * - Time-sensitive: Countdown timers for imminent actions
 * - Accountability: "YOUR" assignments highlighted
 * - Actionable: Direct buttons for immediate action
 * 
 * @example
 * <ActionRequiredPanel />
 */
export function ActionRequiredPanel() {
    const [items, setItems] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActionItems();
        // Refresh every minute (action items are time-sensitive)
        const interval = setInterval(fetchActionItems, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchActionItems = async () => {
        try {
            const response = await targetingApi.getActionRequired().catch(() => null);

            if (response && response.items) {
                // Transform API response to component format
                const transformed: ActionItem[] = response.items.map((item: any) => ({
                    id: item.id,
                    type: item.type || item.item_type,
                    title: item.title,
                    subtitle: item.subtitle,
                    classification: item.classification as ClassificationLevel,
                    caveats: item.caveats as Caveat[],
                    priority: item.priority as Priority,
                    dueTime: item.due_time ? new Date(item.due_time) : undefined,
                    dueTimeDisplay: item.due_time_display,
                    assignedToCurrentUser: item.assigned_to_current_user || false,
                    blockers: item.blockers,
                    quickActions: (() => {
                        const actions: ActionButton[] = [];
                        if (item.type === 'cde' && item.target_id) {
                            actions.push(
                                { label: 'Complete CDE', icon: FileEdit, to: `/smartops/targeting/${item.target_id}/cde`, variant: 'primary' },
                                { label: 'View Target', icon: Eye, to: `/smartops/targeting/${item.target_id}`, variant: 'secondary' }
                            );
                        } else if (item.type === 'approval') {
                            actions.push(
                                { label: 'Review', icon: Eye, to: item.target_id ? `/smartops/targeting/${item.target_id}` : '/smartops/targeting', variant: 'primary' }
                            );
                        } else if (item.type === 'target' && item.target_id) {
                            actions.push(
                                { label: 'View Target', icon: Eye, to: `/smartops/targeting/${item.target_id}`, variant: 'primary' }
                            );
                        } else {
                            // Default actions
                            actions.push(
                                { label: 'View Details', icon: Eye, to: '/smartops/targeting', variant: 'primary' }
                            );
                        }
                        return actions;
                    })(),
                    targetId: item.target_id,
                }));

                setItems(transformed);
                setLoading(false);
                return;
            }

            // Fallback to mock data if API fails
            const mockItems: ActionItem[] = [
                {
                    id: 't-2398-action',
                    type: 'nomination',
                    title: 'T-2398 SAM Battery Site',
                    subtitle: 'JTB in 2 hours • CDE analysis missing',
                    classification: 'SECRET',
                    caveats: ['NOFORN'],
                    priority: 'CRITICAL',
                    dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                    dueTimeDisplay: 'in 2 hours',
                    assignedToCurrentUser: true,
                    blockers: ['CDE analysis pending'],
                    quickActions: [
                        { label: 'Complete CDE', icon: FileEdit, to: '/smartops/targeting/cde-request', variant: 'primary' },
                        { label: 'View Target', icon: Eye, to: '/smartops/targeting', variant: 'secondary' },
                    ],
                    targetId: 'T-2398',
                },
                {
                    id: 't-2401-action',
                    type: 'target',
                    title: 'T-2401 Command Post',
                    subtitle: 'Approved • Awaiting Time Over Target (TOT)',
                    classification: 'TOP_SECRET',
                    caveats: ['NOFORN'],
                    priority: 'HIGH',
                    dueTimeDisplay: 'Today',
                    assignedToCurrentUser: false,
                    blockers: [],
                    quickActions: [
                        { label: 'Set TOT', icon: Clock, to: '/smartops/targeting', variant: 'primary' },
                        { label: 'View Details', icon: Eye, to: '/smartops/targeting', variant: 'secondary' },
                    ],
                    targetId: 'T-2401',
                },
                {
                    id: 'nom-441',
                    type: 'nomination',
                    title: 'NOM-441 Logistics Hub',
                    subtitle: 'Draft nomination requiring submission',
                    classification: 'SECRET',
                    priority: 'MEDIUM',
                    dueTimeDisplay: 'Tomorrow',
                    assignedToCurrentUser: true,
                    blockers: [],
                    quickActions: [
                        { label: 'Submit', icon: Send, to: '/smartops/targeting/my-targets', variant: 'primary' },
                        { label: 'Edit', icon: FileEdit, to: '/smartops/targeting/my-targets', variant: 'secondary' },
                    ],
                },
            ];

            setItems(mockItems);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch action items:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
                <div className="text-slate-500">Loading action items...</div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <h2 className="font-black uppercase text-sm text-white tracking-tight">
                            Action Required
                        </h2>
                    </div>
                    <SecurityBadge level="SECRET" size="sm" />
                </div>
                <div className="p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <p className="text-slate-400 font-semibold">All Caught Up!</p>
                    <p className="text-slate-500 text-sm mt-1">
                        No pending actions requiring immediate attention.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                        Action Required
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        {items.length} Item{items.length !== 1 ? 's' : ''}
                    </span>
                    <SecurityBadge level="SECRET" size="sm" />
                </div>
            </div>
            <div className="p-6 space-y-3">
                {items.map(item => (
                    <ActionItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}

/**
 * ActionItemCard Component
 * 
 * Individual action item display with priority, classification, and quick actions
 */
function ActionItemCard({ item }: { item: ActionItem }) {
    const priorityConfig = {
        CRITICAL: {
            bg: 'bg-red-950/50',
            text: 'text-red-400',
            border: 'border-red-900',
            dot: 'bg-red-500',
        },
        HIGH: {
            bg: 'bg-orange-950/50',
            text: 'text-orange-400',
            border: 'border-orange-900',
            dot: 'bg-orange-500',
        },
        MEDIUM: {
            bg: 'bg-amber-950/50',
            text: 'text-amber-400',
            border: 'border-amber-900',
            dot: 'bg-amber-500',
        },
        LOW: {
            bg: 'bg-blue-950/50',
            text: 'text-blue-400',
            border: 'border-blue-900',
            dot: 'bg-blue-500',
        },
    };

    const config = priorityConfig[item.priority];

    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors ${item.assignedToCurrentUser ? 'ring-1 ring-blue-900/50' : ''
            }`}>
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Priority Dot */}
                        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>

                        {/* Title */}
                        <span className="text-sm font-black text-white">
                            {item.title}
                        </span>

                        {/* Assignment Badge */}
                        {item.assignedToCurrentUser && (
                            <span className="px-2 py-0.5 bg-blue-950/50 text-blue-400 border border-blue-900 rounded text-xs font-bold uppercase">
                                YOUR {item.type.toUpperCase()}
                            </span>
                        )}

                        {/* Classification Badge */}
                        <SecurityBadge
                            level={item.classification}
                            caveats={item.caveats}
                            size="sm"
                        />
                    </div>

                    {/* Subtitle */}
                    {item.subtitle && (
                        <div className="text-xs text-slate-400 mb-2">
                            {item.subtitle}
                        </div>
                    )}

                    {/* Due Time with Icon */}
                    {item.dueTimeDisplay && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className={`font-bold ${item.priority === 'CRITICAL' ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                Due: {item.dueTimeDisplay}
                            </span>
                        </div>
                    )}

                    {/* Blockers */}
                    {item.blockers && item.blockers.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-amber-400 font-semibold">
                                Blocked: {item.blockers.join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Priority Badge */}
                <span className={`text-xs px-2 py-1 rounded border font-bold uppercase shrink-0 ${config.bg} ${config.text} ${config.border}`}>
                    {item.priority}
                </span>
            </div>

            {/* Quick Actions */}
            {item.quickActions.length > 0 && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                    {item.quickActions.map((action, index) => (
                        <ActionItemButton key={index} action={action} />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * ActionItemButton Component
 * 
 * Quick action button for action items
 */
function ActionItemButton({ action }: { action: ActionButton }) {
    const variantConfig = {
        primary: 'bg-blue-950/50 text-blue-400 border-blue-900 hover:bg-blue-900/50 hover:border-blue-800',
        secondary: 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600',
        danger: 'bg-red-950/50 text-red-400 border-red-900 hover:bg-red-900/50 hover:border-red-800',
    };

    const config = variantConfig[action.variant];
    const Icon = action.icon;

    if (action.to) {
        return (
            <Link
                to={action.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-bold uppercase transition-colors ${config}`}
            >
                <Icon className="w-3 h-3" />
                <span>{action.label}</span>
            </Link>
        );
    }

    return (
        <button
            onClick={action.onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-bold uppercase transition-colors ${config}`}
        >
            <Icon className="w-3 h-3" />
            <span>{action.label}</span>
        </button>
    );
}
