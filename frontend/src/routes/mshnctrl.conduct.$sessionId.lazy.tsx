import { createLazyFileRoute } from '@tanstack/react-router'
import { MeetingConductor } from '@/features/operations/MeetingConductor'

export const Route = createLazyFileRoute('/mshnctrl/conduct/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = Route.useParams()
  return <MeetingConductor sessionId={sessionId} />
}
