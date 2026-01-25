import { createFileRoute } from '@tanstack/react-router';
import { ProductCenter } from '@/features/admin/ProductCenter';

export const Route = createFileRoute('/smartops/products')({
    component: ProductCenter,
});
