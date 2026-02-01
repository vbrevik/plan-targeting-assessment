import { createFileRoute } from '@tanstack/react-router';
import { DTLBoard } from '@/features/targeting/components/dtl/DTLBoard';

export const Route = createFileRoute('/mshnctrl/targeting/dtl')({
    component: DTLBoard,
});
