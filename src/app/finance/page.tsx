
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
import { CheckCircle, Trash2, Banknote, Smartphone, Landmark } from 'lucide-react'
import { useFinancials, PaymentMethod } from '@/context/financial-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"


export default function FinancePage() {
    const { 
        transactions, 
        payables, 
        prepayments, 
        markReceivableAsPaid, 
        markPayableAsPaid, 
        usePrepayment 
    } = useFinancials();
    
    const [selectedReceivable, setSelectedReceivable] = React.useState<{id: string, name: string} | null>(null);

    const receivables = transactions.filter(t => t.status === 'Credit');
    
    const totalReceivable = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalPayable = payables.reduce((sum, item) => sum + item.amount, 0);
    const totalPrepayment = prepayments.reduce((sum, item) => sum + item.prepaidAmount, 0);

    const handlePayment = (paymentMethod: PaymentMethod) => {
      if (selectedReceivable) {
        markReceivableAsPaid(selectedReceivable.id, paymentMethod);
        setSelectedReceivable(null);
      }
    }

  return (
    <Dialog>
      <div className="w-full max-w-lg mx-auto flex flex-col gap-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold font-headline">
            Finance Management
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Track and manage your company's financial health, from debts to customer deposits.
          </p>
        </div>

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
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedReceivable({id: item.id, name: item.name})} className="whitespace-nowrap">
                                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                                    Mark as Paid
                                                </Button>
                                            </DialogTrigger>
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
                                {payables.length > 0 ? (
                                    payables.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell><div className="font-medium whitespace-nowrap">{item.supplierName}</div></TableCell>
                                            <TableCell className="whitespace-nowrap">{item.product}</TableCell>
                                            <TableCell className="whitespace-nowrap">{format(item.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => markPayableAsPaid(item.id)} className="whitespace-nowrap">
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
                        Customers with a prepaid balance. This balance is automatically used on their next order, or you can manually mark it as refunded.
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
                                {prepayments.length > 0 ? (
                                    prepayments.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium whitespace-nowrap">{item.customerName}</div>
                                                <div className="text-sm text-muted-foreground">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{format(item.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.prepaidAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => usePrepayment(item.id)} className="whitespace-nowrap">
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Mark as Used/Refunded
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No customer deposits found.</TableCell>
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
      </div>
      <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>
              How did {selectedReceivable?.name} pay their outstanding balance?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <DialogClose asChild>
              <Button onClick={() => handlePayment('Cash')} variant="outline"><Banknote className="mr-2"/>Cash</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => handlePayment('Mobile')} variant="outline"><Smartphone className="mr-2"/>Mobile Money</Button>
            </DialogClose>
             <DialogClose asChild>
              <Button onClick={() => handlePayment('Bank')} variant="outline"><Landmark className="mr-2"/>Bank Transfer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
