
'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Landmark, Smartphone, PiggyBank, ArrowDownLeft, MinusCircle, CreditCard, ReceiptText, ArrowRightLeft } from 'lucide-react'
import { useFinancials } from '@/context/financial-context'
import { LoanRepaymentForm } from './loan-repayment-form'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { TransferFundsForm } from './transfer-funds-form'

export default function CashManagementView() {
    const { cashBalances, ownerLoans, repayOwnerLoan, transactions, payables, addFundTransfer } = useFinancials();
    const router = useRouter();
    const { toast } = useToast();
    const [isRepayOpen, setIsRepayOpen] = React.useState(false);
    const [isTransferOpen, setIsTransferOpen] = React.useState(false);
    
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
    
    const handleTransfer = (from: 'Cash' | 'Bank' | 'Mobile', to: 'Cash' | 'Bank' | 'Mobile', amount: number, notes: string) => {
        try {
            addFundTransfer({ from, to, amount, notes, date: new Date() });
            toast({
                title: 'Funds Transferred Successfully',
                description: `TSh ${amount.toLocaleString()} moved from ${from} to ${to}.`,
            });
            setIsTransferOpen(false);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Transfer Failed',
                description: error.message,
            });
        }
    };

    const handleNavigateToExpenses = () => {
         router.push('/finance');
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
                    <CardFooter className="flex flex-wrap gap-2">
                        <Button onClick={handleNavigateToExpenses}>
                            <ArrowDownLeft className="mr-2 h-4 w-4" />
                            Record a Payment/Expense
                        </Button>
                         <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Transfer Funds
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
            <TransferFundsForm
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                onSave={handleTransfer}
                balances={cashBalances}
            />
        </>
    )
}
