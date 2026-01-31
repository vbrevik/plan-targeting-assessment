import { createFileRoute } from '@tanstack/react-router';
import { RecognisedPicture } from '@/features/intelligence/RecognisedPicture';

export const Route = createFileRoute('/mshnctrl/rxp')({
    component: RecognisedPicture,
});
