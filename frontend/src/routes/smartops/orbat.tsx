import { createFileRoute } from '@tanstack/react-router';
import { OrbatManagement } from '@/features/smartops/components/OrbatManagement';

interface OrbatSearch {
    unitId?: string;
}

export const Route = createFileRoute('/smartops/orbat')({
    validateSearch: (search: Record<string, unknown>): OrbatSearch => {
        return {
            unitId: (search.unitId as string) || undefined,
        };
    },
    component: OrbatManagement,
});
