import { createFileRoute } from '@tanstack/react-router';
import { CoAWargamer } from '@/features/planning/CoAWargamer';

export const Route = createFileRoute('/mshnctrl/coa-wargamer')({
  component: CoAWargamer,
});
