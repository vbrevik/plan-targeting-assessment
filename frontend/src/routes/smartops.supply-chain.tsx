import { createFileRoute } from '@tanstack/react-router';
import { SupplyChainManagement } from '@/features/logistics/SupplyChainManagement';

export const Route = createFileRoute('/smartops/supply-chain')({
    component: SupplyChainManagement,
});
