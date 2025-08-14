
'use client'

import * as React from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Undo, Menu } from 'lucide-react'
import { useFinancials, PaymentMethod } from '@/context/financial-context'
import { PaymentDialog } from '@/components/payment-dialog'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'

function PlaceholderCard({ title, description }: { title: string, description: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Coming Soon</p>
                </div>
            </CardContent>
        </Card>
    )
}

function AccountsView() {
    const { 
        transactions, 
        payables, 
        prepayments, 
        markReceivableAsPaid, 
        markPayableAsPaid, 
        markPrepaymentAsUsed,
        markPrepaymentAsRefunded 
    } = useFinancials();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<{ id: string; type: 'receivable' | 'payable' } | null>(null);

    const receivables = transactions.filter(t => t.status === 'Credit');
    const activePayables = payables.filter(p => p.status === 'Unpaid');
    const activePrepayments = prepayments.filter(p => p.status === 'Active');
    
    const totalReceivable = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalPayable = activePayables.reduce((sum, item) => sum + item.amount, 0);
    const totalPrepayment = activePrepayments.reduce((sum, item) => sum + item.prepaidAmount, 0);

    const handleOpenDialog = (id: string, type: 'receivable' | 'payable') => {
      setSelectedItem({ id, type });
      setDialogOpen(true);
    };

    const handlePaymentSubmit = (paymentMethod: PaymentMethod) => {
      if (selectedItem) {
        if (selectedItem.type === 'receivable') {
          markReceivableAsPaid(selectedItem.id, paymentMethod);
        } else if (selectedItem.type === 'payable') {
          markPayableAsPaid(selectedItem.id, paymentMethod);
        }
      }
      setDialogOpen(false);
      setSelectedItem(null);
    };
    
    return (
    <>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                  <CardTitle>Accounts Receivable</CardTitle>
                  <CardDescription>
                    Customers you have sold to on credit. Click 'Mark as Paid' once they settle their debt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receivables.length > 0 ? (
                                receivables.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium whitespace-nowrap">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">{item.phone}</div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{item.product}</TableCell>
                                        <TableCell className="whitespace-nowrap">{format(item.date, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">TSh {item.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item.id, 'receivable')} className="whitespace-nowrap">
                                                <CheckCircle className="mr-2 h-4 w-4"/>
                                                Mark as Paid
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No outstanding credits. All customers have paid.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="font-bold text-lg">Total Receivable</TableCell>
                                <TableCell className="text-right font-bold text-lg whitespace-nowrap">TSh {totalReceivable.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                  </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Accounts Payable</CardTitle>
                    <CardDescription>
                        Suppliers you have purchased from on credit. Click 'Mark as Paid' once you settle the debt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activePayables.length > 0 ? (
                                    activePayables.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell><div className="font-medium whitespace-nowrap">{item.supplierName}</div></TableCell>
                                            <TableCell className="whitespace-nowrap">{item.product}</TableCell>
                                            <TableCell className="whitespace-nowrap">{format(item.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item.id, 'payable')} className="whitespace-nowrap">
                                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                                    Mark as Paid
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No outstanding payables. All suppliers have been paid.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="font-bold text-lg">Total Payable</TableCell>
                                    <TableCell className="text-right font-bold text-lg whitespace-nowrap">TSh {totalPayable.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Deposits (Prepaid)</CardTitle>
                    <CardDescription>
                        Customers with a prepaid balance. This balance can be used for a future purchase or refunded in cash.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Prepaid Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activePrepayments.length > 0 ? (
                                    activePrepayments.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium whitespace-nowrap">{item.customerName}</div>
                                                <div className="text-sm text-muted-foreground">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{format(item.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.prepaidAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => markPrepaymentAsUsed(item.id)} className="whitespace-nowrap">
                                                    <CreditCard className="mr-2 h-4 w-4"/>
                                                    Use Balance
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => markPrepaymentAsRefunded(item.id)} className="whitespace-nowrap">
                                                    <Undo className="mr-2 h-4 w-4"/>
                                                    Refund Cash
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No active customer deposits found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="font-bold text-lg">Total Deposits</TableCell>
                                    <TableCell className="text-right font-bold text-lg whitespace-nowrap">TSh {totalPrepayment.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                     </div>
                </CardContent>
            </Card>
        </div>
      <PaymentDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handlePaymentSubmit}
      />
    </>
    );
}


const financeNavItems = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'capital', label: 'Capital' },
    { id: 'assets', label: 'Assets' },
    { id: 'cash', label: 'Cash Flow' }
]

function FinanceNav({ activeTab, setActiveTab, isSheet = false }: { activeTab: string, setActiveTab: (id: string) => void, isSheet?: boolean }) {
    const NavWrapper = ({ children }: { children: React.ReactNode }) => 
        isSheet ? <>{children}</> : <nav className="hidden md:flex flex-col gap-2 sticky top-20">{children}</nav>;
        
    const navItems = financeNavItems.map(item => {
        const button = (
            <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(item.id)}
                className="justify-start"
            >
                {item.label}
            </Button>
        );

        if (isSheet) {
            return <SheetClose asChild key={item.id}>{button}</SheetClose>;
        }
        return button;
    });

    return <NavWrapper>{navItems}</NavWrapper>;
}

export default function FinancePage() {
    const [activeTab, setActiveTab] = React.useState('accounts');

    return (
        <div className="flex flex-col gap-8">
            <div className="text-left flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">
                        Finance Management
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Track and manage your company's financial health, from debts to customer deposits.
                    </p>
                </div>
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <Menu className="mr-2 h-4 w-4"/>
                                Open Menu
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <h2 className="text-lg font-semibold p-4">Finance Menu</h2>
                            <div className="flex flex-col gap-2 p-4">
                               <FinanceNav activeTab={activeTab} setActiveTab={setActiveTab} isSheet={true} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
                <FinanceNav activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="min-w-0">
                    {activeTab === 'accounts' && <AccountsView />}
                    {activeTab === 'payroll' && (
                        <PlaceholderCard 
                            title="Payroll Management"
                            description="Manage employee salaries, deductions, and payroll taxes."
                        />
                    )}
                    {activeTab === 'expenses' && (
                        <PlaceholderCard 
                            title="Daily Expenses"
                            description="Track and categorize all business operational expenses."
                        />
                    )}
                    {activeTab === 'capital' && (
                        <PlaceholderCard 
                            title="Capital Management"
                            description="Monitor owner's equity, investments, and drawings."
                        />
                    )}
                    {activeTab === 'assets' && (
                        <PlaceholderCard 
                            title="Asset Management"
                            description="Track fixed assets, depreciation, and value over time."
                        />
                    )}
                    {activeTab === 'cash' && (
                        <PlaceholderCard 
                            title="Cash Management"
                            description="Analyze cash flow from operating, investing, and financing activities."
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
