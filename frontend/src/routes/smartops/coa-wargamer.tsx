import { createFileRoute } from '@tanstack/react-router';
import { CoAWargamer } from '@/features/smartops/components/CoAWargamer';

export const Route = createFileRoute('/smartops/coa-wargamer')({
  component: CoAWargamer,
});
