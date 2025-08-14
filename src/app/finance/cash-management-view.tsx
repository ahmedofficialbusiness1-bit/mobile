
'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Landmark, Smartphone, PiggyBank, ArrowDownUp, MinusCircle, PlusCircle } from 'lucide-react'
import { useFinancials } from '@/context/financial-context'
import { LoanRepaymentForm } from './loan-repayment-form'
import { useToast } from '@/hooks/use-toast'

export default function CashManagementView() {
    const { cashBalances, ownerLoans, repayOwnerLoan } = useFinancials();
    const { toast } = useToast();
    const [isRepayOpen, setIsRepayOpen] = React.useState(false);
    
    const totalLoan = ownerLoans.reduce((acc, loan) => acc + loan.amount - loan.repaid, 0);

    const handleRepayment = (amount: number, paymentMethod: "Cash" | "Bank" | "Mobile", notes: string) => {
        if (ownerLoans.length === 0) return;
        
        // For simplicity, repaying the first loan in the list
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

    return (
        <>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Cash & Bank Balances</CardTitle>
                        <CardDescription>
                            An overview of your liquid funds across different accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Capital & Liabilities</CardTitle>
                        <CardDescription>
                           Overview of capital structure including owner's loans.
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
                    </CardContent>
                </Card>
            </div>
            
            <LoanRepaymentForm
                isOpen={isRepayOpen}
                onClose={() => setIsRepayOpen(false)}
                onSave={handleRepayment}
                maxAmount={totalLoan}
            />
        </>
    )
}
