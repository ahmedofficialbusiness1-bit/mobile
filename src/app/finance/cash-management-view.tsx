
'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Landmark, Smartphone, PiggyBank, ArrowDownUp, MinusCircle } from 'lucide-react'

// Mock data for demonstration
const balances = {
    cash: 1250000,
    bank: 5800000,
    mobile: 780000,
    ownerLoan: 5000000,
}

export default function CashManagementView() {
    const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);

    return (
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
                           <p className="text-2xl font-bold">TSh {balances.cash.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
                           <Landmark className="h-5 w-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-2xl font-bold">TSh {balances.bank.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium">Mobile Money</CardTitle>
                           <Smartphone className="h-5 w-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-2xl font-bold">TSh {balances.mobile.toLocaleString()}</p>
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
                           <p className="text-2xl font-bold">TSh {balances.ownerLoan.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>
                       Perform cash-related transactions like withdrawals or payments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                     <Button onClick={() => setIsWithdrawOpen(true)}>
                        <MinusCircle className="mr-2 h-4 w-4" />
                        Withdraw Funds (Drawings)
                    </Button>
                    <Button variant="outline" onClick={() => setIsPaymentOpen(true)}>
                        <ArrowDownUp className="mr-2 h-4 w-4" />
                        Make a Payment / Transfer
                    </Button>
                </CardContent>
            </Card>
            
            {/*
            <WithdrawalForm isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
            <PaymentForm isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
            */}

        </div>
    )
}
