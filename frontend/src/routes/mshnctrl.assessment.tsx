import { createFileRoute } from '@tanstack/react-router';
import { AssessmentManagement } from '@/features/intelligence/AssessmentManagement';

export const Route = createFileRoute('/mshnctrl/assessment')({
  component: AssessmentManagement,
});
