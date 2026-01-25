import { createFileRoute } from '@tanstack/react-router';
import { SocialDomain } from '@/features/intelligence/SocialDomain';

export const Route = createFileRoute('/smartops/social-domain')({
  component: SocialDomain,
});
