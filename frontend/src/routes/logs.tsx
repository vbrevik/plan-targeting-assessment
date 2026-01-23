import { createFileRoute } from '@tanstack/react-router'
import Placeholder from '@/components/Placeholder'
import { FileText } from 'lucide-react'

export const Route = createFileRoute('/logs')({
    component: () => (
        <Placeholder
            title="System Logs"
            description="The audit log and system debugging interface is being integrated. This feature will provide high-granularity visibility into security events and system performance."
            icon={FileText}
            color="from-cyan-500 to-blue-600"
        />
    ),
})
