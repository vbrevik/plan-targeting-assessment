// Breadcrumb Navigation Component for Targeting Pages
// Provides navigation context and back-to-dashboard link

import { Link, useLocation } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function TargetingBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // Parse breadcrumbs from pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/mshnctrl/targeting-cell-dashboard' },
    ];

    // Parse targeting detail pages
    if (pathname.includes('/targeting/targets')) {
      items.push({ label: 'Targets', path: '/mshnctrl/targeting/targets' });
    } else if (pathname.includes('/targeting/intelligence')) {
      items.push({ label: 'Intelligence', path: '/mshnctrl/targeting/intelligence' });
    } else if (pathname.includes('/targeting/effects')) {
      items.push({ label: 'Effects Assessment', path: '/mshnctrl/targeting/effects' });
    } else if (pathname.includes('/targeting/assets')) {
      items.push({ label: 'Assets & Capabilities', path: '/mshnctrl/targeting/assets' });
    } else if (pathname.includes('/targeting/risk')) {
      items.push({ label: 'Risk & Constraints', path: '/mshnctrl/targeting/risk' });
    } else if (pathname.includes('/targeting/analysis')) {
      items.push({ label: 'Alternative Analysis', path: '/mshnctrl/targeting/analysis' });
    } else if (pathname.includes('/targeting/collaboration')) {
      items.push({ label: 'Collaboration', path: '/mshnctrl/targeting/collaboration' });
    } else if (pathname.includes('/targeting/mission-command')) {
      items.push({ label: 'Mission Command', path: '/mshnctrl/targeting/mission-command' });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-slate-900 border-b border-slate-800 overflow-x-auto">
      <Link
        to="/mshnctrl/targeting-cell-dashboard"
        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-400 active:text-blue-300 transition-colors touch-manipulation flex-shrink-0"
      >
        <Home className="w-3 h-3" />
        <span className="hidden sm:inline">Dashboard</span>
        <span className="sm:hidden">Home</span>
      </Link>
      {breadcrumbs.length > 1 && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          {breadcrumbs.slice(1).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.path && index < breadcrumbs.length - 2 ? (
                <Link
                  to={item.path}
                  className="text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs font-bold text-white">{item.label}</span>
              )}
              {index < breadcrumbs.length - 2 && (
                <ChevronRight className="w-3 h-3 text-slate-600" />
              )}
            </div>
          ))}
        </>
      )}
    </nav>
  );
}
