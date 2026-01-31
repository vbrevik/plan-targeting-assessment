import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mshnctrl/im-dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mshnctrl/im-dashboard"!</div>
}
