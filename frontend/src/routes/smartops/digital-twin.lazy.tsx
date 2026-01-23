
import { createLazyFileRoute } from '@tanstack/react-router';
import { DigitalTwinView } from '@/features/smartops/components/DigitalTwinView';

export const Route = createLazyFileRoute('/smartops/digital-twin')({
    component: DigitalTwinView,
});
