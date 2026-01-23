import { createFileRoute } from '@tanstack/react-router';
import { CONOPSBuilder } from '@/features/smartops/components/CONOPSBuilder';

export const Route = createFileRoute('/smartops/conops')({
  component: CONOPSBuilder,
});
