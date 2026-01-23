import { createFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/Placeholder'
import { Download } from 'lucide-react'

export const Route = createFileRoute('/reports')({
    component: () => (
        <Placeholder
            title="Export Reports"
            description="The reporting and data export system is being finalized. Soon you will be able to generate comprehensive PDF and CSV reports of user activity and system performance."
            icon={Download}
            color="from-amber-500 to-orange-600"
        />
    ),
})
