import { createFileRoute } from '@tanstack/react-router';
import { WeatherManagement } from '@/features/operations/WeatherManagement';

export const Route = createFileRoute('/smartops/weather')({
    component: WeatherManagement,
});
