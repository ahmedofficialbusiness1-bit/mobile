
'use client'

import * as React from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth, addDays, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { DateRange } from 'react-day-picker'
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
import { CheckCircle, CreditCard, Undo, Calendar as CalendarIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import { useFinancials, PaymentMethod } from '@/context/financial-context'
import { PaymentDialog } from '@/components/payment-dialog'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
    
export default function AccountsView() {
    const { 
        transactions, 
        payables, 
        prepayments, 
        markReceivableAsPaid, 
        markPayableAsPaid, 
        markPrepaymentAsUsed,
        markPrepaymentAsRefunded,
        deleteReceivable,
        deletePayable
    } = useFinancials();
    const { toast } = useToast();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<{ id: string; type: 'receivable' | 'payable', amount: number } | null>(null);
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    })
    const [selectedPreset, setSelectedPreset] = React.useState<string>("month");

     const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const now = new Date();
        switch (value) {
            case 'today':
                setDate({ from: now, to: now });
                break;
            case 'week':
                setDate({ from: startOfWeek(now), to: endOfWeek(now) });
                break;
            case 'month':
                setDate({ from: startOfMonth(now), to: endOfMonth(now) });
                break;
            case 'year':
                setDate({ from: startOfYear(now), to: endOfYear(now) });
                break;
            case 'all':
                setDate({ from: new Date('2020-01-01'), to: endOfYear(addDays(now, 1)) });
                break;
        }
    }


    const receivables = React.useMemo(() => transactions.filter(t => t.status === 'Credit' && date?.from && date?.to && isWithinInterval(t.date, { start: date.from, end: addDays(date.to, 1) })), [transactions, date]);
    const activePayables = React.useMemo(() => payables.filter(p => p.status === 'Unpaid' && date?.from && date?.to && isWithinInterval(p.date, { start: date.from, end: addDays(date.to, 1) })), [payables, date]);
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                     <DropdownMenuItem onClick={() => handleOpenDialog(item.id, 'receivable', item.amount)}>
                                                        <CheckCircle className="mr-2 h-4 w-4"/>
                                                        Receive Payment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                   This action will permanently delete this credit record and reverse the stock movement.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteReceivable(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No outstanding credits for the selected period.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="font-bold text-lg">Total Receivable (Filtered)</TableCell>
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
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleOpenDialog(item.id, 'payable', item.amount)}>
                                                            <CheckCircle className="mr-2 h-4 w-4"/>
                                                            Make Payment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action will permanently delete this payable record. This cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deletePayable(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No outstanding payables for the selected period.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="font-bold text-lg">Total Payable (Filtered)</TableCell>
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
                        Customers with a prepaid balance. This balance can be used for a future purchase or refunded in cash. (Not affected by date filter).
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
