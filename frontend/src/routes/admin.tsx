import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export const Route = createFileRoute('/admin')({
    component: AdminLayout,
})

function AdminLayout() {
    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1 min-h-[calc(100vh-4rem)]">
                <Outlet />
            </div>
        </div>
    )
}
