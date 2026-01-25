import { createFileRoute } from '@tanstack/react-router'
import { DecisionBoardView } from '@/features/operations/DecisionBoard'

export const Route = createFileRoute('/smartops/decision-board')({
  component: DecisionBoardView,
})
