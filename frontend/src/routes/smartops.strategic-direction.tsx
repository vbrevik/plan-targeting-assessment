import { createFileRoute } from '@tanstack/react-router';
import { StrategicDirection } from '@/features/planning/StrategicDirection';

export const Route = createFileRoute('/smartops/strategic-direction')({
  component: StrategicDirection,
});
