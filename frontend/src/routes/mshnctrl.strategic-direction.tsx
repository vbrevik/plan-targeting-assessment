import { createFileRoute } from '@tanstack/react-router';
import { StrategicDirection } from '@/features/planning/StrategicDirection';

export const Route = createFileRoute('/mshnctrl/strategic-direction')({
  component: StrategicDirection,
});
