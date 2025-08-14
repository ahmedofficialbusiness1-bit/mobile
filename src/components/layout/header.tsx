'use client'

import * as React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'

const getPageTitle = (path: string) => {
  switch (path) {
    case '/':
      return 'Dashboard'
    case '/co-pilot':
      return 'AI Co-Pilot'
    case '/receipts':
      return 'Digital Receipts'
    case '/integrations':
      return 'WhatsApp & USSD'
    default:
      return 'DiraBiz'
  }
}

export function AppHeader() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger variant="outline" size="icon">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Toggle sidebar</span>
        </SidebarTrigger>
      </div>
      <h1 className="text-xl font-semibold md:text-2xl font-headline">{title}</h1>
    </header>
  )
}
