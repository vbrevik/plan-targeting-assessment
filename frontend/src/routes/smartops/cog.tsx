import { createFileRoute } from '@tanstack/react-router';
import { COGAnalyzer } from '@/features/smartops/components/COGAnalyzer';

interface COGSearch {
    cogId?: string;
}

export const Route = createFileRoute('/smartops/cog')({
    validateSearch: (search: Record<string, unknown>): COGSearch => {
        return {
            cogId: (search.cogId as string) || undefined,
        };
    },
    component: COGAnalyzer,
});
