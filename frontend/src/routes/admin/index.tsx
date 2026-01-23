import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { useAbac } from '@/features/abac/lib/abac';
import Dashboard from '@/features/dashboard/components/Dashboard';

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard,
})

function AdminDashboard() {
    const { hasRole } = useAbac();
    const isAdmin = hasRole('superadmin') || hasRole('admin');

    if (!isAdmin) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to access the Administration Dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return <Dashboard />;
}
