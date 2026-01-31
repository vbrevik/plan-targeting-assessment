
import { createLazyFileRoute } from '@tanstack/react-router';
import { AdvisoryReviewQueue } from '@/features/legal/AdvisoryReviewQueue';

export const Route = createLazyFileRoute('/mshnctrl/advisory')({
    component: AdvisoryReviewQueue,
});
