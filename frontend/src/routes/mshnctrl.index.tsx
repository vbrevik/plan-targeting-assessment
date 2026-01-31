import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SituationAwarenessCockpit } from '@/features/operations/SituationAwarenessCockpit';
import { useAuth } from '@/features/auth/lib/context';
import { useRoleContext } from '@/lib/mshnctrl/hooks/useRoleContext';
import { useEffect } from 'react';

export const Route = createFileRoute('/mshnctrl/')({
    component: MshnCtrlDashboardRouter,
});

function MshnCtrlDashboardRouter() {
    const { user } = useAuth();
    const { currentRole } = useRoleContext();
    const navigate = useNavigate();

    useEffect(() => {
        // Role-specific dashboard mapping
        const roleDashboardMap: Record<string, string> = {
            'commander': '/mshnctrl/cop-summary',
            'targeting-cell': '/mshnctrl/targeting-cell-dashboard',
            'j2-intel': '/mshnctrl/j2-dashboard',
            'j3-ops': '/mshnctrl/j3-dashboard',
            'j5-plans': '/mshnctrl/j5-dashboard',
            'j4-log': '/mshnctrl/j4-dashboard',
            'legad': '/mshnctrl/legad-dashboard',
            'analyst': '/mshnctrl/analyst-dashboard',
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
