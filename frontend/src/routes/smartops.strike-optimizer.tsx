import { createFileRoute } from '@tanstack/react-router';
import { StrikeOptimizer } from '@/features/targeting/StrikeOptimizer';

export const Route = createFileRoute('/smartops/strike-optimizer')({
    component: StrikeOptimizer,
});
