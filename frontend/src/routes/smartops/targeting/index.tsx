import { createFileRoute } from '@tanstack/react-router';
import { TargetingManagement } from '@/features/smartops/components/TargetingManagement';

interface TargetingSearch {
    targetId?: string;
}

export const Route = createFileRoute('/smartops/targeting/')({
    validateSearch: (search: Record<string, unknown>): TargetingSearch => {
        return {
            targetId: (search.targetId as string) || undefined,
        };
    },
    component: TargetingManagement,
});
