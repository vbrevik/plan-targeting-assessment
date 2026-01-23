import { createFileRoute } from '@tanstack/react-router';
import { SocialDomain } from '@/features/smartops/components/SocialDomain';

export const Route = createFileRoute('/smartops/social-domain')({
  component: SocialDomain,
});
