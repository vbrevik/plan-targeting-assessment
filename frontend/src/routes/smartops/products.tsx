import { createFileRoute } from '@tanstack/react-router';
import { ProductCenter } from '@/features/smartops/components/ProductCenter';

export const Route = createFileRoute('/smartops/products')({
    component: ProductCenter,
});
