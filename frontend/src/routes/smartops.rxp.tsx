import { createFileRoute } from '@tanstack/react-router';
import { RecognisedPicture } from '@/features/intelligence/RecognisedPicture';

export const Route = createFileRoute('/smartops/rxp')({
    component: RecognisedPicture,
});
