import { createFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/Placeholder'
import { Key } from 'lucide-react'

export const Route = createFileRoute('/api-management')({
    component: () => (
        <Placeholder
            title="API Management"
            description="The application programming interface control panel is currently being built. This console will allow you to generate API keys, manage webhooks, and monitor external integrations."
            icon={Key}
            color="from-rose-500 to-pink-600"
        />
    ),
})
