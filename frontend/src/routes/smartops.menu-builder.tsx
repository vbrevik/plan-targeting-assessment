import { createFileRoute } from '@tanstack/react-router';
import { MenuBuilder } from '@/features/admin/MenuBuilder';

export const Route = createFileRoute('/smartops/menu-builder')({
    component: MenuBuilder,
});
