import { Outlet } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { OntologyService } from '@/lib/mshnctrl/services/ontology.service';
import { Toaster } from '@/components/ui/toaster';
import { OperationalContextProvider } from '@/lib/mshnctrl/hooks/useOperationalContext';
import { RoleProvider, useRoleContext } from '@/lib/mshnctrl/hooks/useRoleContext';
import { MshnCtrlSidebar } from './MshnCtrlSidebar';
import { MshnCtrlHeader } from './MshnCtrlHeader';

// Inner component to access role context
function MshnCtrlContent() {
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
        let mounted = true;

        const fetchNav = async () => {
            try {
                // 1. Try fetching from Ontology Service
                // This performs a client-side join of entities for now
                const ontologyNav = await OntologyService.fetchNavigation(currentRole.id);

                if (mounted && ontologyNav && ontologyNav.length > 0) {
                    setNavGroups(ontologyNav);
                    return;
                }
            } catch (err) {
                console.warn('Ontology navigation fetch failed, check backend services.', err);
            }

            // 2. Fallback to hardcoded config if Ontology returns nothing or fails
            // This ensures other roles (Commander, J2, etc.) still work until they are seeded.
            if (mounted) {
                try {
                    const { getFilteredNavGroups } = await import('./config/navigation.config');
                    setNavGroups(getFilteredNavGroups(currentRole));
                } catch (configErr) {
                    console.error('Failed to load fallback navigation config', configErr);
                }
            }
        };

        fetchNav();

        return () => { mounted = false; };
    }, [currentRole.id, currentRole]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        localStorage.setItem('theme', next);
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
            <MshnCtrlSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                navGroups={navGroups}
                currentRole={currentRole}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <MshnCtrlHeader
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
export function MshnCtrlLayout() {
    return (
        <RoleProvider>
            <OperationalContextProvider>
                <MshnCtrlContent />
            </OperationalContextProvider>
        </RoleProvider>
    );
}
