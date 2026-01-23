import { createLazyFileRoute } from '@tanstack/react-router'
import { GapAnalysisFramework } from '@/features/smartops/components/GapAnalysisFramework'

export const Route = createLazyFileRoute('/smartops/gap-analysis')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GapAnalysisFramework />
}
