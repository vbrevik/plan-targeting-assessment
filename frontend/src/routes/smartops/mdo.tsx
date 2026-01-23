import { createFileRoute } from '@tanstack/react-router';
import { MDOSyncMatrix } from '@/features/smartops/components/MDOSyncMatrix';

export const Route = createFileRoute('/smartops/mdo')({
  component: MDOSyncMatrix,
});
