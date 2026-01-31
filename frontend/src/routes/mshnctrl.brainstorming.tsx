import { createFileRoute } from '@tanstack/react-router'
import { BrainstormingCanvas } from '@/features/planning/BrainstormingCanvas'

export const Route = createFileRoute('/mshnctrl/brainstorming')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BrainstormingCanvas />
}
