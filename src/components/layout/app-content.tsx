
'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import { AppHeader } from '@/components/layout/header'


const authRoutes = ['/login', '/signup', '/forgot-password'];

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
        <div className="flex">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    </SidebarProvider>
  );
}
