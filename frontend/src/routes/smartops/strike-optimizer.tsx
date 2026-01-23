import { createFileRoute } from '@tanstack/react-router';
import { StrikeOptimizer } from '@/features/smartops/components/StrikeOptimizer';

export const Route = createFileRoute('/smartops/strike-optimizer')({
    component: StrikeOptimizer,
});
