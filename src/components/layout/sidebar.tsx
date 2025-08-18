
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/logo'
import {
  Home,
  FileText,
  ShoppingCart,
  Truck,
  Warehouse,
  Banknote,
  BarChart2,
  Users,
  Shield,
  Settings,
  Lock,
  FilePlus2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/auth-context'
import { useSecurity } from '@/context/security-context'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home, id: 'dashboard' },
  { href: '/sales', label: 'Sales', icon: ShoppingCart, id: 'sales' },
  { href: '/customers', label: 'Customers', icon: Users, id: 'customers' },
  { href: '/invoices', label: 'Invoice', icon: FileText, id: 'invoices' },
  { href: '/purchases', label: 'Purchases', icon: Truck, id: 'purchases' },
  { href: '/inventory', label: 'Inventory', icon: Warehouse, id: 'inventory' },
  { href: '/finance', label: 'Finance', icon: Banknote, id: 'finance' },
  { href: '/post-expense', label: 'Post Expense', icon: FilePlus2, id: 'post-expense' },
  { href: '/reports', label: 'Reports', icon: BarChart2, id: 'reports' },
]

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
]

const adminNavItem = { href: '/admin', label: 'Admin Panel', icon: Shield, id: 'admin' }

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { user, isAdmin } = useAuth()
  const { isTabLocked } = useSecurity();

  const handleLinkClick = () => {
    // Close sidebar on link click on mobile
    setOpenMobile(false)
  }
  
  const topNavItems = isAdmin ? [...navItems, adminNavItem] : navItems;
  
  if (!user) return null;

  return (
    <Sidebar
      className="border-r no-print"
      side="left"
      collapsible="offcanvas"
    >
      <div className="flex h-full flex-col">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarMenu className="flex-1 p-2">
          {topNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={
                  pathname.startsWith(item.href) &&
                  (item.href !== '/' || pathname === '/')
                }
                className="font-headline"
                onClick={handleLinkClick}
              >
                <Link href={item.href} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                   {isTabLocked(item.id) && <Lock className="h-3 w-3 text-muted-foreground" />}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarMenu className="p-2">
            {bottomNavItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        className="font-headline"
                        onClick={handleLinkClick}
                    >
                        <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src="https://placehold.co/40x40.png"
                alt={user?.email || 'User'}
                data-ai-hint="avatar placeholder"
              />
              <AvatarFallback>
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.displayName || user?.email}
              </span>
              <span className="text-xs text-sidebar-foreground/70 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
