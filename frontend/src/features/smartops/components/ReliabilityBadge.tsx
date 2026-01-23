import React from 'react';
import { cn } from '@/lib/utils';

export type ReliabilityCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type CredibilityCode = '1' | '2' | '3' | '4' | '5' | '6';

interface Props {
    reliability: ReliabilityCode;
    credibility: CredibilityCode;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const RELIABILITY_LABELS: Record<ReliabilityCode, string> = {
    'A': 'Reliable',
    'B': 'Usually Reliable',
    'C': 'Fairly Reliable',
    'D': 'Not Usually Reliable',
    'E': 'Unreliable',
    'F': 'Cannot Judge'
};

const CREDIBILITY_LABELS: Record<CredibilityCode, string> = {
    '1': 'Confirmed',
    '2': 'Prob. True',
    '3': 'Possibly True',
    '4': 'Doubtful',
    '5': 'Improbable',
    '6': 'Cannot Judge'
};

export function ReliabilityBadge({ reliability, credibility, showLabel = false, size = 'md' }: Props) {
    const isHighConfidence = (reliability === 'A' || reliability === 'B') && (credibility === '1' || credibility === '2');
    const isLowConfidence = reliability === 'E' || reliability === 'F' || credibility === '5' || credibility === '6';

    const bgClass = isHighConfidence ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
        isLowConfidence ? 'bg-red-950/50 border-red-900 text-red-400' :
            'bg-amber-950/50 border-amber-900 text-amber-400';

    const sizeClass = size === 'sm' ? 'text-[9px] px-1 py-0.5' :
        size === 'lg' ? 'text-sm px-3 py-1.5' :
            'text-[10px] px-1.5 py-0.5';

    return (
        <div className="inline-flex items-center gap-2" title={`Source: ${RELIABILITY_LABELS[reliability]}, Info: ${CREDIBILITY_LABELS[credibility]}`}>
            <span className={cn("font-mono font-black border rounded uppercase tracking-tighter", bgClass, sizeClass)}>
                {reliability}{credibility}
            </span>
            {showLabel && (
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                    {RELIABILITY_LABELS[reliability]} / {CREDIBILITY_LABELS[credibility]}
                </span>
            )}
        </div>
    );
}
