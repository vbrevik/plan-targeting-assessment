import { createFileRoute } from '@tanstack/react-router';
import { AssessmentManagement } from '@/features/smartops/components/AssessmentManagement';

export const Route = createFileRoute('/smartops/assessment')({
  component: AssessmentManagement,
});
