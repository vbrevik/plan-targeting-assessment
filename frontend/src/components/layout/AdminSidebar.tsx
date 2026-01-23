import { Link, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Users,
    Shield,
    Activity,
    Radio,
    Lock,
    FileText,
    Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
    label: string
    href: string
    icon: React.ElementType
    children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Service Discovery',
        href: '/admin/discovery',
        icon: Radio,
    },
    {
        label: 'User Management',
        href: '/admin/users',
        icon: Users,
    },
    {
        label: 'Access Control',
        href: '/admin/abac',
        icon: Shield,
    },
    {
        label: 'System Metrics',
        href: '/stats/system',
        icon: Activity,
    },
    {
        label: 'Session Management',
        href: '/admin/new',
        icon: Lock,
    },
    {
        label: 'System Logs',
        href: '/logs',
        icon: FileText,
    },
    {
        label: 'API Status',
        href: '/api-management',
        icon: Database,
    },
]

export function AdminSidebar() {
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('adminSidebarCollapsed') === 'true'
        }
        return false
    })

    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', String(collapsed))
    }, [collapsed])

    const isActive = (href: string) => {
        if (href === '/admin') {
            return location.pathname === '/admin' || location.pathname === '/admin/'
        }
        return location.pathname.startsWith(href)
    }

    return (
        <aside
            className={cn(
                "h-[calc(100vh-4rem)] sticky top-16 border-r border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300 flex flex-col",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex-1 py-4 overflow-y-auto">
                <nav className="px-2 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-primary")} />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-2 border-t border-border/40">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "w-full flex items-center gap-2 text-muted-foreground hover:text-foreground",
                        collapsed && "justify-center"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="text-xs">Collapse</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    )
}
