import { Suspense, useState } from 'react'
import { Outlet } from 'react-router'
import { Spinner } from '@/components/ui/Spinner'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/** Authenticated chrome: the patient registry on the left, topbar above the routed page. */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 p-4 sm:p-6">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Spinner className="size-6" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
