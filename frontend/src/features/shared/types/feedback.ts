export type FeedbackType = 'PEV' | 'A2P' | 'AV' | 'BDA' | 'LL' | 'CQ';

export interface FeedbackEvent {
    id: string;
    type: FeedbackType;
    source: string;       // Module that generated the event
    target: string;       // Module that should act on it
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    timestamp: Date;
    title: string;
    description: string;
    recommendation?: string;
    linkedEntities: { type: string; id: string; name: string }[];
    status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
    resolvedBy?: string;
    resolvedAt?: Date;
}

export const FEEDBACK_LABELS: Record<FeedbackType, string> = {
    'PEV': 'Plan-Execute Variance',
    'A2P': 'Effectiveness Gap',
    'AV': 'Assumption Invalidated',
    'BDA': 'Re-Strike Required',
    'LL': 'Lesson Learned',
    'CQ': 'Collection Quality'
};

export const FEEDBACK_COLORS: Record<FeedbackType, string> = {
    'PEV': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    'A2P': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'AV': 'text-red-500 bg-red-500/10 border-red-500/20',
    'BDA': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    'LL': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    'CQ': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
};
