import { createFileRoute } from '@tanstack/react-router';
import { MshnCtrlLayout } from '@/features/layout/MshnCtrlLayout';

export const Route = createFileRoute('/mshnctrl')({
    component: MshnCtrlLayout,
});
