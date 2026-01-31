import { createFileRoute } from '@tanstack/react-router'
import { FeedbackDashboard } from '@/features/admin/FeedbackDashboard'

export const Route = createFileRoute('/mshnctrl/feedback')({
    component: FeedbackDashboard,
})
