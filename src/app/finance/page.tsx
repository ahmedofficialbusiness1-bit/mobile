
'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Briefcase, FileText, Banknote, Landmark, Users, PiggyBank, BookUser, Printer, Compass, FilePlus2, ShoppingCart, BarChart2, Settings, Home, Truck, Warehouse } from 'lucide-react'
import { cn } from '@/lib/utils'
import AccountsView from './accounts-view'
import ExpensesView from './expenses-view'
import CapitalView from './capital-view'
import AssetsView from './assets-view'
import CashManagementView from './cash-management-view'
import JournalView from './journal-view'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


const financeNavItems = [
    { id: 'accounts', label: 'Accounts', icon: Briefcase },
    { id: 'expenses', label: 'Expenses', icon: FileText },
    { id: 'capital', label: 'Capital', icon: Landmark },
    { id: 'assets', label: 'Assets', icon: Banknote },
    { id: 'cash', label: 'Cash Management', icon: PiggyBank },
    { id: 'journal', label: 'Journal', icon: BookUser },
]

function FinancePageContent() {
    const pathname = usePathname();
    const [activeView, setActiveView] = React.useState('accounts');

    const handlePrint = () => {
        window.print();
    };

    const renderContent = () => {
        switch (activeView) {
            case 'accounts':
                return <AccountsView />;
            case 'expenses':
                return <ExpensesView />;
            case 'capital':
                return <CapitalView />;
            case 'assets':
                return <AssetsView />;
            case 'cash':
                return <CashManagementView />;
            case 'journal':
                return <JournalView />;
            default:
                return <AccountsView />;
        }
    }
    
    const NavMenu = ({isSheet = false}: {isSheet?: boolean}) => (
         <nav className={cn("flex flex-col gap-2", isSheet ? "p-4" : "")}>
            {financeNavItems.map(item => (
                <Button
                    key={item.id}
                    variant={activeView === item.id ? 'default' : 'ghost'}
                    onClick={() => setActiveView(item.id)}
                    className="justify-start"
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                </Button>
            ))}
        </nav>
    )

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between no-print">
                <div className="text-left">
                    <h1 className="text-3xl font-bold font-headline">
                        Finance Management
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Track and manage your company's financial health, from debts to customer deposits.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print View
                    </Button>
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[240px]">
                               <NavMenu isSheet={true} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8">
                <aside className="hidden md:block no-print">
                   <NavMenu />
                </aside>
                <main className="printable-area">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default function FinancePage() {
    return (
        <FinancePageContent />
    )
}

    
