import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    className?: string;
    variant?: 'card' | 'text' | 'circle';
    height?: number | string;
    width?: number | string;
}

export function LoadingSkeleton({ className, variant = 'text', height, width }: LoadingSkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-slate-800/50 rounded",
                variant === 'circle' && "rounded-full",
                variant === 'card' && "rounded-xl border border-slate-800",
                className
            )}
            style={{
                height: height ?? (variant === 'text' ? '1em' : undefined),
                width: width
            }}
        />
    );
}
