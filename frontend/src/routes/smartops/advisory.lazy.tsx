
import { createLazyFileRoute } from '@tanstack/react-router';
import { AdvisoryReviewQueue } from '@/features/smartops/components/AdvisoryReviewQueue';

export const Route = createLazyFileRoute('/smartops/advisory')({
    component: AdvisoryReviewQueue,
});
