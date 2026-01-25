import { createLazyFileRoute } from '@tanstack/react-router'
import { GapAnalysisFramework } from '@/features/planning/GapAnalysisFramework'

export const Route = createLazyFileRoute('/smartops/gap-analysis')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GapAnalysisFramework />
}
