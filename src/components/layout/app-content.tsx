
'use client'

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import { AppHeader } from '@/components/layout/header'
import { PageGuard } from '@/components/security/page-guard';
import { useAuth } from '@/context/auth-context';


const authRoutes = ['/login', '/signup', '/forgot-password'];

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (loading) {
      return; // Don't do anything while loading
    }

    // If user is not logged in and not on an auth route, redirect to login
    if (!user && !isAuthRoute) {
      router.push('/login');
    }

    // If user is logged in and on an auth route, redirect to shop selection
    if (user && isAuthRoute) {
      router.push('/select-shop');
    }
  }, [user, loading, isAuthRoute, router]);


  // While loading or if a redirect is imminent, don't render children to avoid flashes of wrong content
  if (loading || (!user && !isAuthRoute) || (user && isAuthRoute)) {
    // You can return a global loader here if you have one
    return null;
  }
  
  // If we are on an auth route and the user is not logged in (passes the checks above), render the auth content
  if (isAuthRoute) {
    return <>{children}</>;
  }
  
  // If we are on a protected route and the user is logged in, render the main app layout
  return (
    <SidebarProvider>
      <PageGuard>
        <div className="flex">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
      </PageGuard>
    </SidebarProvider>
  );
}
