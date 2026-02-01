import { createFileRoute } from '@tanstack/react-router';
import { JTBSessionDetail } from '@/features/targeting/components/jtb/JTBSessionDetail';

export const Route = createFileRoute('/mshnctrl/targeting/jtb/$sessionId')({
    component: JTBSessionDetail,
});
