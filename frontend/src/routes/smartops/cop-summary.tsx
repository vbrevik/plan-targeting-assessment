import { createFileRoute } from '@tanstack/react-router';
import { COPSummary } from '@/features/smartops/components/COPSummary';

export const Route = createFileRoute('/smartops/cop-summary')({
  component: COPSummary,
});
