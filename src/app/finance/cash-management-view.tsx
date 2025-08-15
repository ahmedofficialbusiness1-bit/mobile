
'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Landmark, Smartphone, PiggyBank, ArrowUpRight, ArrowDownLeft, MinusCircle, PlusCircle, CreditCard, ReceiptText } from 'lucide-react'
import { useFinancials } from '@/context/financial-context'
import { LoanRepaymentForm } from './loan-repayment-form'
import { useToast } from '@/hooks/use-toast'
import { DrawingForm, type DrawingData } from './drawing-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CashManagementView() {
    const { cashBalances, ownerLoans, repayOwnerLoan, addDrawing, transactions, payables } = useFinancials();
    const router = useRouter();
    const { toast } = useToast();
    const [isRepayOpen, setIsRepayOpen] = React.useState(false);
    const [isDrawingOpen, setIsDrawingOpen] = React.useState(false);
    
    const totalLoan = ownerLoans.reduce((acc, loan) => acc + loan.amount - loan.repaid, 0);
    const totalReceivable = transactions.filter(t => t.status === 'Credit').reduce((acc, t) => acc + t.amount, 0);
    const totalPayable = payables.filter(p => p.status === 'Unpaid').reduce((acc, p) => acc + p.amount, 0);


    const handleRepayment = (amount: number, paymentMethod: "Cash" | "Bank" | "Mobile", notes: string) => {
        if (ownerLoans.length === 0) return;
        
        const loanToRepay = ownerLoans.find(l => (l.amount - l.repaid) > 0);
        if (!loanToRepay) {
            toast({ variant: 'destructive', title: 'No outstanding loan balance to repay.' });
            return;
        }

        repayOwnerLoan(loanToRepay.id, amount, paymentMethod, notes);
        toast({
            title: 'Loan Repayment Successful',
            description: `Paid TSh ${amount.toLocaleString()} via ${paymentMethod}.`,
        });
        setIsRepayOpen(false);
    };

    const handleDrawing = (data: DrawingData) => {
        addDrawing(data);
        toast({
            title: "Owner Drawing Recorded",
            description: `TSh ${data.amount.toLocaleString()} withdrawn from ${data.source}.`,
        });
        setIsDrawingOpen(false);
    }

    const handleNavigateToExpenses = () => {
        // This is a client component, we can't directly switch tabs on another page.
        // A better UX is to navigate to the page. We can use a query param if we want to pre-select a tab
        // but for now, just navigating is enough. The user can then select the expenses tab.
        // A more complex solution would involve a global state manager for active tabs.
         router.push('/finance');
         // The user needs to manually click on the 'Expenses' tab.
         toast({
            title: 'Navigating to Finance Module',
            description: 'Please select the "Expenses" tab to record a new payment.',
         })
    }


    return (
        <>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Cash & Bank Balances</CardTitle>
                        <CardDescription>
                            An overview of your liquid funds and credits across different accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
                               <Wallet className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">TSh {cashBalances.cash.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
                               <Landmark className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">TSh {cashBalances.bank.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <CardTitle className="text-sm font-medium">Mobile Money</CardTitle>
                               <Smartphone className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">TSh {cashBalances.mobile.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <CardTitle className="text-sm font-medium">Customer Credits (Receivable)</CardTitle>
                               <CreditCard className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">TSh {totalReceivable.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsDrawingOpen(true)}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Record Owner Drawing
                        </Button>
                        <Button onClick={handleNavigateToExpenses}>
                            <ArrowDownLeft className="mr-2 h-4 w-4" />
                            Make a Payment
                        </Button>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Capital & Liabilities</CardTitle>
                        <CardDescription>
                           Overview of capital structure including owner's loans and supplier debts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <CardTitle className="text-sm font-medium">Owner's Loan to Business</CardTitle>
                               <PiggyBank className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">TSh {totalLoan.toLocaleString()}</p>
                               <p className="text-xs text-muted-foreground">Outstanding balance</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" onClick={() => setIsRepayOpen(true)} disabled={totalLoan <= 0}>
                                    <MinusCircle className="mr-2 h-4 w-4" />
                                    Repay Loan
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <CardTitle className="text-sm font-medium">Supplier Credits (Payable)</CardTitle>
                               <ReceiptText className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">TSh {totalPayable.toLocaleString()}</p>
                               <p className="text-xs text-muted-foreground">Total amount owed to suppliers</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
            
            <LoanRepaymentForm
                isOpen={isRepayOpen}
                onClose={() => setIsRepayOpen(false)}
                onSave={handleRepayment}
                maxAmount={totalLoan}
                maxBalances={cashBalances}
            />

            <DrawingForm
                isOpen={isDrawingOpen}
                onClose={() => setIsDrawingOpen(false)}
                onSave={handleDrawing}
                maxBalances={cashBalances}
            />
        </>
    )
}
