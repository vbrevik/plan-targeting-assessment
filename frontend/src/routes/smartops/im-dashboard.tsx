import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/smartops/im-dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/smartops/im-dashboard"!</div>
}
