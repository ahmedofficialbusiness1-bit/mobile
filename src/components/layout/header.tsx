
'use client'

import * as React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
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
  LogOut,
  Store,
  ChevronDown,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useFinancials } from '@/context/financial-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useSecurity } from '@/context/security-context'
import { PasswordPromptDialog } from '@/components/security/password-prompt-dialog'


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

const getPageTitle = (path: string) => {
  // Find a direct match first for nested routes
  const directMatch = navItems.find((item) => path === item.href)
  if (directMatch) {
    return directMatch.label
  }

  // Find the best parent match for nested routes
  const parentMatch = navItems
    .filter((item) => item.href !== '/')
    .sort((a, b) => b.href.length - a.href.length) // Sort by length to find most specific match
    .find((item) => path.startsWith(item.href))

  if (parentMatch) {
    return parentMatch.label
  }
  
  // Fallback for root
  if (path === '/') {
    return 'Dashboard'
  }
  
  // If no match found, fallback to a default title or parse the path
  const pageName = path.split('/').filter(Boolean).pop() || 'Page';
  return pageName.charAt(0).toUpperCase() + pageName.slice(1);
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getPageTitle(pathname)
  const { user } = useAuth();
  const { shops, activeShop, setActiveShopId, companyName } = useFinancials();
  const { isItemLocked, verifyPassword, unlockItem } = useSecurity();
  
  const [promptingFor, setPromptingFor] = React.useState<{id: string | null, name: string} | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  const handleShopChange = (shopId: string | null, shopName: string) => {
      const idToCheck = shopId === null ? 'headquarters' : shopId;
      if (isItemLocked(idToCheck)) {
          setPromptingFor({ id: idToCheck, name: shopName });
      } else {
          setActiveShopId(shopId);
      }
  }

  const handlePasswordSubmit = (password: string) => {
      if (!promptingFor) return;

      if (verifyPassword(promptingFor.id!, password)) {
          unlockItem(promptingFor.id!);
          setActiveShopId(promptingFor.id === 'headquarters' ? null : promptingFor.id);
          setPromptingFor(null);
      } else {
          alert('Incorrect password');
      }
  }

  if (!user) return null;

  return (
    <>
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 no-print">
      <div className="flex items-center gap-4">
        <SidebarTrigger variant="outline" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </SidebarTrigger>
        <h1 className="text-xl font-semibold md:text-2xl font-headline">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
         {shops && shops.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {activeShop ? <Store className="mr-2 h-4 w-4" /> : <Building className="mr-2 h-4 w-4" />}
                  {activeShop ? activeShop.name : `${companyName} (All)`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Switch View</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShopChange(null, 'Headquarters (All Shops)')}>
                   <Building className="mr-2 h-4 w-4" />
                   {companyName} (All Shops)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {shops.map(shop => (
                  <DropdownMenuItem key={shop.id} onClick={() => handleShopChange(shop.id, shop.name)}>
                    <Store className="mr-2 h-4 w-4" />
                    {shop.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
     <PasswordPromptDialog
        isOpen={!!promptingFor}
        onClose={() => setPromptingFor(null)}
        onSubmit={handlePasswordSubmit}
        tabName={promptingFor?.name || ''}
      />
    </>
  )
}
