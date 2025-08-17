
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
import { CheckCircle, CreditCard, Undo } from 'lucide-react'
import { useFinancials, PaymentMethod } from '@/context/financial-context'
import { PaymentDialog } from '@/components/payment-dialog'
import { useToast } from '@/hooks/use-toast'
    
export default function AccountsView() {
    const { 
        transactions, 
        payables, 
        prepayments, 
        markReceivableAsPaid, 
        markPayableAsPaid, 
        markPrepaymentAsUsed,
        markPrepaymentAsRefunded 
    } = useFinancials();
    const { toast } = useToast();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<{ id: string; type: 'receivable' | 'payable', amount: number } | null>(null);

    const receivables = transactions.filter(t => t.status === 'Credit');
    const activePayables = payables.filter(p => p.status === 'Unpaid');
    const activePrepayments = prepayments.filter(p => p.status === 'Active');
    
    const totalReceivable = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalPayable = activePayables.reduce((sum, item) => sum + item.amount, 0);
    const totalPrepayment = activePrepayments.reduce((sum, item) => sum + item.prepaidAmount, 0);

    const handleOpenDialog = (id: string, type: 'receivable' | 'payable', amount: number) => {
      setSelectedItem({ id, type, amount });
      setDialogOpen(true);
    };

    const handlePaymentSubmit = (paymentData: { amount: number, paymentMethod: PaymentMethod }) => {
      if (selectedItem) {
          try {
            if (selectedItem.type === 'receivable') {
              markReceivableAsPaid(selectedItem.id, paymentData.amount, paymentData.paymentMethod);
            } else if (selectedItem.type === 'payable') {
              markPayableAsPaid(selectedItem.id, paymentData.amount, paymentData.paymentMethod);
            }
             toast({
                title: 'Payment Successful',
                description: `TSh ${paymentData.amount.toLocaleString()} paid via ${paymentData.paymentMethod}.`,
            });
            setDialogOpen(false);
            setSelectedItem(null);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: error.message,
            });
        }
      }
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
                                        <TableCell className="whitespace-nowrap">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">TSh {item.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item.id, 'receivable', item.amount)} className="whitespace-nowrap">
                                                <CheckCircle className="mr-2 h-4 w-4"/>
                                                Receive Payment
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
                                            <TableCell className="whitespace-nowrap">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item.id, 'payable', item.amount)} className="whitespace-nowrap">
                                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                                    Make Payment
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
                                            <TableCell className="whitespace-nowrap">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
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
        totalAmount={selectedItem?.amount}
      />
    </>
    );
}
