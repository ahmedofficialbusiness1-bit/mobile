
'use client'

import * as React from 'react'
import { PageGuard } from '@/components/security/page-guard'
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, FileText } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFinancials, type Invoice } from '@/context/financial-context'
import { InvoiceForm, type InvoiceFormData } from './invoice-form'
import { useToast } from '@/hooks/use-toast'
import { PaymentDialog } from '@/components/payment-dialog'

function InvoicesPageContent() {
  const { invoices, customers, addInvoice, payInvoice } = useFinancials()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
  const { toast } = useToast()
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [statusFilter, setStatusFilter] = React.useState('All');

  const handleSaveInvoice = (data: InvoiceFormData) => {
    try {
        addInvoice(data);
        toast({
            title: 'Invoice Created Successfully',
            description: `Invoice #${data.invoiceNumber} for ${data.customerName} has been created.`,
        });
        setIsFormOpen(false);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Creating Invoice',
            description: error.message,
        })
    }
  }
  
  const handleOpenPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  }
  
  const handlePayment = (paymentData: { amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' }) => {
    if (selectedInvoice) {
        payInvoice(selectedInvoice.id, paymentData.amount, paymentData.paymentMethod);
        toast({
            title: 'Payment Recorded',
            description: `Payment for invoice #${selectedInvoice.invoiceNumber} has been recorded.`,
        });
    }
    setIsPaymentDialogOpen(false);
    setSelectedInvoice(null);
  }

  const filteredInvoices = React.useMemo(() => {
    return invoices
        .filter(i => {
            if (!date?.from || !date?.to) return true;
            return isWithinInterval(i.issueDate, { start: date.from, end: date.to });
        })
        .filter(i => statusFilter === 'All' || i.status === statusFilter);
  }, [invoices, date, statusFilter]);
  
  const filteredTotal = filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <>
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>
                Create, send, and track the status of your customer invoices for the current shop.
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Invoice
            </Button>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full sm:w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={setDate}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{format(invoice.issueDate, 'PPP')}</TableCell>
                        <TableCell>{format(invoice.dueDate, 'PPP')}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>
                                {invoice.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            TSh {invoice.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    {invoice.status !== 'Paid' && (
                                        <DropdownMenuItem onClick={() => handleOpenPaymentDialog(invoice)}>
                                            Record Payment
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No invoices found for the selected period/filter.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="font-bold text-lg">Filtered Total</TableCell>
                        <TableCell className="text-right font-bold text-lg">TSh {filteredTotal.toLocaleString()}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            </div>
        </CardContent>
      </Card>
    </div>
    <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveInvoice}
        customers={customers}
    />
     <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSubmit={handlePayment}
        title={`Record Payment for Invoice #${selectedInvoice?.invoiceNumber}`}
        description={`The total amount due is TSh ${selectedInvoice?.totalAmount.toLocaleString()}.`}
        totalAmount={selectedInvoice?.totalAmount}
      />
    </>
  )
}


export default function InvoicesPage() {
    return (
        <PageGuard tabId="invoices">
            <InvoicesPageContent />
        </PageGuard>
    )
}
