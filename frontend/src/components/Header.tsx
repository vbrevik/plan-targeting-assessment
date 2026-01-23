import { Link } from '@tanstack/react-router'
import { Home, Sun, Moon, User, Terminal, LogOut } from 'lucide-react'
import Notifications from './Notifications'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/lib/context'
import { Button } from '@/components/ui/button'
import { ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'

export default function Header({ collapsed }: { collapsed?: boolean }) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  // Listen for nav-toggle events dispatched by triggers to toggle dropdowns
  useEffect(() => {
    const handler = (e: any) => {
      const key = e?.detail?.key
      setOpenKey((cur) => (cur === key ? null : key))
    }
    const outsideClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement
      if (!target.closest('nav')) {
        setOpenKey(null)
      }
    }
    window.addEventListener('nav-toggle', handler as EventListener)
    window.addEventListener('click', outsideClick)
    return () => {
      window.removeEventListener('nav-toggle', handler as EventListener)
      window.removeEventListener('click', outsideClick)
    }
  }, [])

  // Theme (dark/light) handling
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Initialize theme from localStorage or OS preference
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored)
      document.documentElement.classList.toggle('dark', stored === 'dark')
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', next)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center bg-background/80 backdrop-blur-md border-b border-border text-foreground shadow-sm z-50">
        <h1 className="text-xl font-bold tracking-tight">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <img src="/tanstack-word-logo-white.svg" alt="T" className="h-5 w-5" />
            </div>
            <span className="hidden md:inline text-cyan-600">TemplateApp</span>
          </Link>
        </h1>
        <div className="ml-auto flex items-center gap-4">
          <Notifications />
          <div className="h-6 w-[1px] bg-border mx-1" />
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <AuthControls />
        </div>
      </header>

      <aside
        className={`sticky top-16 h-[calc(100vh-4rem)] bg-gray-900 text-white shadow z-40 flex flex-col ${collapsed ? 'w-20' : 'w-64'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto pt-2">
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2">
              <Home size={20} />
              <span className={`font-medium ${collapsed ? 'hidden' : 'inline'}`}>Home</span>
            </Link>
            <div className="ml-2">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2">
                <span className={`font-medium ${collapsed ? 'hidden' : 'inline'}`}>Components</span>
              </div>
              {openKey === 'components' && (
                <div className="ml-4 mt-2 flex flex-col gap-1">
                  <a href="/docs/primitives/alert-dialog" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <ItemContent>
                      <ItemTitle>Alert Dialog</ItemTitle>
                      <ItemDescription>A modal dialog that interrupts the user with important content.</ItemDescription>
                    </ItemContent>
                  </a>
                  <a href="/docs/primitives/hover-card" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <ItemContent>
                      <ItemTitle>Hover Card</ItemTitle>
                      <ItemDescription>Preview content available behind a link.</ItemDescription>
                    </ItemContent>
                  </a>
                  <a href="/docs/primitives/tabs" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <ItemContent>
                      <ItemTitle>Tabs</ItemTitle>
                      <ItemDescription>Layered sections of content displayed one at a time.</ItemDescription>
                    </ItemContent>
                  </a>
                </div>
              )}
            </div>
            {/* Additional nav items can be added here */}
          </div>
        </nav>
      </aside>
    </>
  )
}

function AuthControls() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-sm text-muted-foreground whitespace-nowrap">
            {user?.email}
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-full border border-border pl-1 pr-3 py-1 hover:bg-muted transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                {user?.username?.substring(0, 2) || '??'}
              </div>
              <span className="hidden sm:inline font-medium text-sm">{user?.username ?? 'Account'}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-popover border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Account</p>
                  <p className="text-sm font-medium truncate">{user?.username}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                  Profile Settings
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Terminal size={14} className="text-muted-foreground" />
                  </div>
                  Administration
                </Link>
                <Link
                  to="/debug"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Terminal size={14} className="text-muted-foreground" />
                  </div>
                  Debug
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-md text-sm font-medium transition-colors text-left mt-1"
                >
                  <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <LogOut size={14} />
                  </div>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-medium">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="font-medium px-4 shadow-sm shadow-primary/20">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
