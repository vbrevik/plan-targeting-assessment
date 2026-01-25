import { createFileRoute } from '@tanstack/react-router';
import { CONOPSBuilder } from '@/features/planning/CONOPSBuilder';

export const Route = createFileRoute('/smartops/conops')({
  component: CONOPSBuilder,
});
