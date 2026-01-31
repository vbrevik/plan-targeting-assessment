import { createFileRoute } from '@tanstack/react-router';
import { SupplyChainManagement } from '@/features/logistics/SupplyChainManagement';

export const Route = createFileRoute('/mshnctrl/supply-chain')({
    component: SupplyChainManagement,
});
