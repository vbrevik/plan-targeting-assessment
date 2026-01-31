import { createFileRoute } from '@tanstack/react-router';
import { TargetingManagement } from '@/features/targeting/TargetingManagement';

interface TargetingSearch {
    targetId?: string;
}

export const Route = createFileRoute('/mshnctrl/targeting/')({
    validateSearch: (search: Record<string, unknown>): TargetingSearch => {
        return {
            targetId: (search.targetId as string) || undefined,
        };
    },
    component: TargetingManagement,
});
