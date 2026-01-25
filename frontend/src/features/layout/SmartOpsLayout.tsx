import { Outlet } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { OperationalContextProvider } from '@/lib/smartops/hooks/useOperationalContext';
import { RoleProvider, useRoleContext } from '@/lib/smartops/hooks/useRoleContext';
import { api } from '@/lib/api';
import { SmartOpsSidebar } from './SmartOpsSidebar';
import { SmartOpsHeader } from './SmartOpsHeader';

// Inner component to access role context
function SmartOpsContent() {
    const [collapsed, setCollapsed] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const { currentRole } = useRoleContext();
    const [navGroups, setNavGroups] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored as 'light' | 'dark');
            document.documentElement.classList.toggle('dark', stored === 'dark');
        }
    }, []);

    useEffect(() => {
        const fetchNav = async () => {
            // Force use of local config for permission-based navigation
            // The API return is Role-ID based (Ontology) which conflicts with our 
            // permission-based requirement for derived roles like Assistant-IM.
            const { getFilteredNavGroups } = await import('./config/navigation.config');
            setNavGroups(getFilteredNavGroups(currentRole));

            /* 
            // Legacy Ontology-based navigation fetch
            try {
                const data = await api.get<any[]>('/navigation');
                // If API returns empty, use hardcoded config as fallback
                if (data && data.length > 0) {
                    setNavGroups(data);
                } else {
                    // Fallback to hardcoded config
                    const { getFilteredNavGroups } = await import('./config/navigation.config');
                    setNavGroups(getFilteredNavGroups(currentRole));
                }
            } catch (err) {
                console.error('Failed to fetch navigation:', err);
                // On error, fallback to hardcoded config
                const { getFilteredNavGroups } = await import('./config/navigation.config');
                setNavGroups(getFilteredNavGroups(currentRole));
            }
            */
        };
        fetchNav();
    }, [currentRole.id, currentRole]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        localStorage.setItem('theme', next);
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
            <SmartOpsSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                navGroups={navGroups}
                currentRole={currentRole}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <SmartOpsHeader
                    collapsed={collapsed}
                    toggleTheme={toggleTheme}
                    theme={theme}
                    navGroups={navGroups}
                />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="h-full w-full">
                        <Outlet />
                    </div>
                </main>
                <Toaster />
            </div>
        </div>
    );
}

// Outer wrapper component with providers
export function SmartOpsLayout() {
    return (
        <RoleProvider>
            <OperationalContextProvider>
                <SmartOpsContent />
            </OperationalContextProvider>
        </RoleProvider>
    );
}
