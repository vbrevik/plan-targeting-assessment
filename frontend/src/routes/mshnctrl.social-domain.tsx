import { createFileRoute } from '@tanstack/react-router';
import { SocialDomain } from '@/features/intelligence/SocialDomain';

export const Route = createFileRoute('/mshnctrl/social-domain')({
  component: SocialDomain,
});
