import { createFileRoute } from '@tanstack/react-router'
import { FeedbackDashboard } from '../../features/smartops/components/FeedbackDashboard'

export const Route = createFileRoute('/smartops/feedback')({
    component: FeedbackDashboard,
})
