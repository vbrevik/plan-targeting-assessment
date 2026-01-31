import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { AuthProvider } from '@/features/auth/lib/context'
import { Toaster } from '@/components/ui/toaster'
import { SkipLink } from '@/components/accessibility/SkipLink'

export const Route = createRootRoute({
  component: () => {
    const location = useLocation()
    const isMshnCtrl = location.pathname.startsWith('/mshnctrl')
    const isAuthRoute = ['/login', '/register'].includes(location.pathname)
    const shouldHideChrome = isMshnCtrl || isAuthRoute

    return (
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <SkipLink />
          {!shouldHideChrome && <Navbar />}
          {!shouldHideChrome && <Breadcrumbs />}
          <main className="flex-1" id="main-content">
            <Outlet />
          </main>
          {!shouldHideChrome && <Footer />}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Toaster />
        </div>
      </AuthProvider>
    )
  },
})
