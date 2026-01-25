import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SituationAwarenessCockpit } from '@/features/operations/SituationAwarenessCockpit';
import { useAuth } from '@/features/auth/lib/context';
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';
import { useEffect } from 'react';

export const Route = createFileRoute('/smartops/')({
    component: SmartOpsDashboardRouter,
});

function SmartOpsDashboardRouter() {
    const { user } = useAuth();
    const { currentRole } = useRoleContext();
    const navigate = useNavigate();

    useEffect(() => {
        // Role-specific dashboard mapping
        const roleDashboardMap: Record<string, string> = {
            'commander': '/smartops/cop-summary',
            'targeting-cell': '/smartops/targeting-cell-dashboard',
            'j2-intel': '/smartops/j2-dashboard',
            'j3-ops': '/smartops/j3-dashboard',
            'j5-plans': '/smartops/j5-dashboard',
            'j4-log': '/smartops/j4-dashboard',
            'legad': '/smartops/legad-dashboard',
            'analyst': '/smartops/analyst-dashboard',
        };

        // Redirect to role-specific dashboard
        const dashboardPath = roleDashboardMap[currentRole.id];
        if (dashboardPath) {
            navigate({ to: dashboardPath });
        }
    }, [currentRole, navigate]);

    // Fallback: Show default dashboard if no role-specific dashboard found
    return <SituationAwarenessCockpit />;
}
