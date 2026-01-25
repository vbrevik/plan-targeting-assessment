import { createFileRoute } from '@tanstack/react-router';
import { MDOSyncMatrix } from '@/features/planning/MDOSyncMatrix';

export const Route = createFileRoute('/smartops/mdo')({
  component: MDOSyncMatrix,
});
