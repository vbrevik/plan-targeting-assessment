import { createFileRoute } from '@tanstack/react-router'
import { BrainstormingCanvas } from '@/features/smartops/components/BrainstormingCanvas'

export const Route = createFileRoute('/smartops/brainstorming')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BrainstormingCanvas />
}
