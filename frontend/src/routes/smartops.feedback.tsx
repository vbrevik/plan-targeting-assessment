import { createFileRoute } from '@tanstack/react-router'
import { FeedbackDashboard } from '@/features/admin/FeedbackDashboard'

export const Route = createFileRoute('/smartops/feedback')({
    component: FeedbackDashboard,
})
