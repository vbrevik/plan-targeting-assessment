import { createFileRoute } from '@tanstack/react-router'
import { BDAManagementView } from '@/features/bda/BDAManagementView'

export const Route = createFileRoute('/mshnctrl/bda')({
    component: BDAManagementView
});
