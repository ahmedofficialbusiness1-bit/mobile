'use client'

import * as React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { Home, Cpu, FileText, ShoppingCart, Truck, Warehouse, Factory, Banknote, Landmark, ShieldCheck, Briefcase, UserCheck, Building2, Telescope, GanttChartSquare, Network } from 'lucide-react'


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

const getPageTitle = (path: string) => {
    for (const item of navItems) {
        if (path.startsWith(item.href) && (item.href !== '/' || path === '/')) {
            return item.label;
        }
    }
    return 'DiraBiz';
}

export function AppHeader() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger variant="outline" size="icon" className="shrink-0">
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
