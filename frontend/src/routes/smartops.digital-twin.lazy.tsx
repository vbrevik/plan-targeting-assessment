
import { createLazyFileRoute } from '@tanstack/react-router';
import { DigitalTwinView } from '@/features/intelligence/DigitalTwinView';

export const Route = createLazyFileRoute('/smartops/digital-twin')({
    component: DigitalTwinView,
});
