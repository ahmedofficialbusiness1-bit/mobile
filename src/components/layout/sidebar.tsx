'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
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
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

  return (
    <Sidebar className="border-r" side="left">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
              className="font-headline"
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
            <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" />
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
    </Sidebar>
  )
}
