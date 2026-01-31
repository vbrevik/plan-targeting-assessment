import { createFileRoute } from '@tanstack/react-router';
import { COPSummary } from '@/features/operations/COPSummary';

export const Route = createFileRoute('/mshnctrl/cop-summary')({
  component: COPSummary,
});
