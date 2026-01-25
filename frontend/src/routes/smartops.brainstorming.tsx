import { createFileRoute } from '@tanstack/react-router'
import { BrainstormingCanvas } from '@/features/planning/BrainstormingCanvas'

export const Route = createFileRoute('/smartops/brainstorming')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BrainstormingCanvas />
}
