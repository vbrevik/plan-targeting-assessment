
import { createLazyFileRoute } from '@tanstack/react-router';
import { DigitalTwinView } from '@/features/intelligence/DigitalTwinView';

export const Route = createLazyFileRoute('/mshnctrl/digital-twin')({
    component: DigitalTwinView,
});
