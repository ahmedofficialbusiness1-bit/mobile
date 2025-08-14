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
  Cpu,
  FileText,
  ShoppingCart,
  Truck,
  Warehouse,
  Factory,
  Banknote,
  Landmark,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Building2,
  Telescope,
  GanttChartSquare,
  Network,
  ChevronLeft,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/co-pilot', label: 'AI Co-Pilot', icon: Cpu },
  { href: '/sales', label: 'Sales & POS', icon: ShoppingCart },
  { href: '/purchases', label: 'Purchases', icon: Truck },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/production', label: 'Production', icon: Factory },
  { href: '/finance', label: 'Finance', icon: Banknote },
  { href: '/tax', label: 'Tax & Compliance', icon: Landmark },
  { href: '/hr', label: 'HR & Payroll', icon: UserCheck },
  { href: '/crm', label: 'CRM & Field Sales', icon: Telescope },
  { href: '/procurement', label: 'Procurement', icon: Building2 },
  { href: '/projects', label: 'Projects & Jobs', icon: GanttChartSquare },
  { href: '/grc', label: 'Governance & Risk', icon: ShieldCheck },
  { href: '/bi', label: 'BI & Forecasting', icon: Briefcase },
  { href: '/integrations', label: 'Integrations', icon: Network },
  { href: '/receipts', label: 'Digital Receipts', icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed';

  return (
     <Sidebar className="border-r" side="left">
      <div className="flex h-full flex-col">
        <SidebarHeader className="relative">
          <Logo />
           <Button 
              variant="outline" 
              size="icon" 
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 bg-background h-7 w-7 hidden md:flex"
              onClick={toggleSidebar}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}/>
            </Button>
        </SidebarHeader>
        <SidebarMenu className="flex-1 p-2">
         <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                   <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                      className="font-headline"
                    >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          ))}
          </TooltipProvider>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarFooter>
          <div className={cn("flex items-center gap-3 p-2", isCollapsed && "justify-center")}>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" data-ai-hint="avatar placeholder"/>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 h-0" : "opacity-100")}>
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
