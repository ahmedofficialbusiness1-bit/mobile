
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
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/invoices', label: 'Invoice', icon: FileText },
  { href: '/purchases', label: 'Purchases', icon: Truck },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/finance', label: 'Finance', icon: Banknote },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    // Close sidebar on link click on mobile
    setOpenMobile(false)
  }

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
          {navItems.map((item) => (
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
                alt="@shadcn"
                data-ai-hint="avatar placeholder"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                Juma Doe
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                muhasibu@dirabiz.co
              </span>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
