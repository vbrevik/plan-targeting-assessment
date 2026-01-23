import { createFileRoute } from '@tanstack/react-router'
import { BDAManagementView } from '../../features/smartops/components/BDAManagementView'

export const Route = createFileRoute('/smartops/bda')({
    component: BDAManagementView
});
