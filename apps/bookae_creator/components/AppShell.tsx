'use client'

import { usePathname } from 'next/navigation'
import AuthGuard from './AuthGuard'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'

const PUBLIC_PATHS = ['/login', '/signup']

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isPublicRoute = PUBLIC_PATHS.includes(pathname)

  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
      <ThemeToggle />
    </AuthGuard>
  )
}

