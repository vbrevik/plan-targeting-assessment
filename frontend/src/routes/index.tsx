import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/lib/context'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function Landing() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-900/20 rounded-full blur-3xl -z-10 opacity-50" />

        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-900 hover:bg-blue-200 mb-6 uppercase tracking-wider">
          SmartOps v2.0 - Active
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Next-Gen Military <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Operations Planning
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Data-driven command & control. From capacity planning to assessment,
          aligned with NATO COPD standards.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full gap-2 text-base px-8 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
              Initialize System <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 w-full text-base px-8">
              Access Terminal
            </Button>
          </Link>
        </div>
      </section>


    </>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background">Loading...</div>
  }

  // If user is authenticated, redirect to SmartOps dashboard
  if (isAuthenticated) {
    return <Navigate to="/smartops" />
  }

  // Public landing page
  return <Landing />
}
