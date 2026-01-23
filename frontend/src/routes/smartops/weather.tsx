import { createFileRoute } from '@tanstack/react-router';
import { WeatherManagement } from '@/features/smartops/components/WeatherManagement';

export const Route = createFileRoute('/smartops/weather')({
    component: WeatherManagement,
});
