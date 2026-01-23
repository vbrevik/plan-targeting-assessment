import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/smartops/conduct/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/smartops/conduct/$sessionId"!</div>
}
