
'use client'

import * as React from 'react'
import { PlusCircle, MoreHorizontal, DollarSign, Users, CreditCard, Calendar as CalendarIcon, Trash2, ArrowRightLeft, Search } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useFinancials, type Transaction } from '@/context/financial-context'
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from "react-day-picker"
import { SaleForm, type SaleFormData } from './sale-form'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { TransferRecordDialog } from '@/components/transfer-record-dialog'
import { Input } from '@/components/ui/input'


export default function SalesPageContent() {
  const { transactions, products, addSale, customers, deleteSale, transferSale, shops } = useFinancials()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isTransferOpen, setIsTransferOpen] = React.useState(false)
  const [selectedSale, setSelectedSale] = React.useState<Transaction | null>(null)
  const { toast } = useToast()
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [paymentFilter, setPaymentFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
  const todaySales = transactions.filter(t => format(t.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length
  const creditSales = transactions.filter(t => t.status === 'Credit').length

  const handleSaveSale = (data: SaleFormData) => {
    try {
        addSale(data);
        toast({
            title: 'Sale Recorded Successfully',
            description: `A sale of ${data.quantity} x ${data.productName} has been recorded.`,
        });
        setIsFormOpen(false);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Recording Sale',
            description: error.message,
        })
    }
  }

  const handleDeleteSale = (sale: Transaction) => {
    try {
        deleteSale(sale.id);
        toast({
            variant: 'destructive',
            title: 'Sale Deleted',
            description: 'The sale has been successfully deleted and stock reversed.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Deleting Sale',
            description: error.message,
        })
    }
  }
  
  const handleOpenTransfer = (sale: Transaction) => {
      setSelectedSale(sale);
      setIsTransferOpen(true);
  }
  
  const handleTransferSale = async (toShopId: string) => {
      if (!selectedSale) return;
      try {
          await transferSale(selectedSale.id, toShopId);
          toast({
              title: "Sale Transferred",
              description: `Sale has been successfully moved to the new branch.`
          });
          setIsTransferOpen(false);
          setSelectedSale(null);
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: "Transfer Failed",
              description: error.message
          });
      }
  }

  const filteredTransactions = React.useMemo(() => {
    return transactions
        .filter(t => {
            if (!date?.from || !date?.to) return true;
            return isWithinInterval(t.date, { start: date.from, end: date.to });
        })
        .filter(t => {
            if (paymentFilter === 'All') return true;
            if (paymentFilter === 'Credit') return t.status === 'Credit';
            return t.paymentMethod === paymentFilter && t.status === 'Paid';
        })
        .filter(t => {
            if (searchTerm === '') return true;
            const searchTermLower = searchTerm.toLowerCase();
            return (
                t.name.toLowerCase().includes(searchTermLower) ||
                t.product.toLowerCase().includes(searchTermLower)
            );
        });
  }, [transactions, date, paymentFilter, searchTerm]);
  
  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Sales Management
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Track and manage all your sales activities from a single place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">TSh {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">All time sales revenue</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
                <CreditCard className="h-5 w-5 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">+{todaySales}</p>
                 <p className="text-xs text-muted-foreground">transactions recorded today</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Credits</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{creditSales}</p>
                 <p className="text-xs text-muted-foreground">customers on credit</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>
                A log of all sales transactions recorded in the system.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customer or product..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by payment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Payments</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Mobile">Mobile</SelectItem>
                            <SelectItem value="Bank">Bank</SelectItem>
                            <SelectItem value="Credit">Credit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Sale
                </Button>
            </div>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((sale) => (
                    <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.name}</TableCell>
                        <TableCell>{sale.product}</TableCell>
                        <TableCell>{format(sale.date, 'PPP')}</TableCell>
                        <TableCell>
                            <Badge variant={sale.status === 'Paid' ? 'default' : 'secondary'}>
                                {sale.status} {sale.status === 'Paid' && `(${sale.paymentMethod})`}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        TSh {sale.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Generate Receipt</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenTransfer(sale)}>
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Transfer to another Branch
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Sale
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action will permanently delete this sale and reverse the stock movement. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteSale(sale)} className="bg-destructive hover:bg-destructive/90">
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
                    <TableCell colSpan={6} className="h-24 text-center">
                        No sales recorded for the selected period/filter.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="font-bold text-lg">Filtered Total</TableCell>
                        <TableCell className="text-right font-bold text-lg">TSh {filteredTotal.toLocaleString()}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            </div>
        </CardContent>
      </Card>
    </div>
    <SaleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSale}
        products={products}
        customers={customers}
    />
    <TransferRecordDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSave={handleTransferSale}
        shops={shops}
        currentShopId={selectedSale?.shopId}
        recordType="Sale"
    />
    </>
  )
}
