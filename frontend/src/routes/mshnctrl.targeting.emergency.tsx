import { createFileRoute } from '@tanstack/react-router';
import { TargetNominationPage } from '@/features/targeting/TargetNominationPage';

export const Route = createFileRoute('/mshnctrl/targeting/emergency')({
    component: EmergencyNominationPage,
});

function EmergencyNominationPage() {
    // For now, use the same component as regular nomination
    // In the future, this could be enhanced with emergency-specific features:
    // - Pre-filled priority: CRITICAL
    // - Expedited approval workflow
    // - Emergency notification flags
    // - Reduced form fields for speed
    return <TargetNominationPage />;
}
