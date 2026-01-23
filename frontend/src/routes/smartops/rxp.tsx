import { createFileRoute } from '@tanstack/react-router';
import { RecognisedPicture } from '@/features/smartops/components/RecognisedPicture';

export const Route = createFileRoute('/smartops/rxp')({
    component: RecognisedPicture,
});
