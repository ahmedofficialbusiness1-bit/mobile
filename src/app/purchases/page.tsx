
'use client'

import * as React from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react'
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
import { useFinancials, type PurchaseOrder } from '@/context/financial-context'
import { PurchaseOrderForm } from './purchase-order-form'
import { useToast } from '@/hooks/use-toast'
import { PurchasePaymentDialog } from './payment-dialog'

export default function PurchasesPage() {
  const { purchaseOrders, addPurchaseOrder, receivePurchaseOrder, payPurchaseOrder } = useFinancials()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
  const [selectedPO, setSelectedPO] = React.useState<PurchaseOrder | null>(null)

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState('All');
  const [receivingStatusFilter, setReceivingStatusFilter] = React.useState('All');


  const handleSavePO = (data: Omit<PurchaseOrder, 'id'>) => {
    addPurchaseOrder(data)
    toast({
        title: 'Purchase Order Created',
        description: `PO #${data.poNumber} for ${data.supplierName} has been created.`,
    })
    setIsFormOpen(false)
    setSelectedPO(null)
  }

  const handleCreateNew = () => {
    setSelectedPO(null)
    setIsFormOpen(true)
  }

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setIsFormOpen(true)
  }

  const handleReceive = (poId: string) => {
    receivePurchaseOrder(poId)
    toast({
        title: 'Goods Received',
        description: 'Inventory has been updated with items from the purchase order.',
    })
  }

  const handleOpenPaymentDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsPaymentDialogOpen(true);
  }

  const handlePayment = (poId: string, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => {
    payPurchaseOrder(poId, paymentMethod)
    toast({
        title: 'Payment Successful',
        description: `Purchase order has been marked as paid via ${paymentMethod}.`,
    })
    setIsPaymentDialogOpen(false)
    setSelectedPO(null)
  }

  const filteredPurchaseOrders = React.useMemo(() => {
    return purchaseOrders
        .filter(po => {
            if (!date?.from || !date?.to) return true;
            return isWithinInterval(po.purchaseDate, { start: date.from, end: date.to });
        })
        .filter(po => paymentStatusFilter === 'All' || po.paymentStatus === paymentStatusFilter)
        .filter(po => receivingStatusFilter === 'All' || po.receivingStatus === receivingStatusFilter);
  }, [purchaseOrders, date, paymentStatusFilter, receivingStatusFilter]);

  const filteredTotal = filteredPurchaseOrders.reduce((sum, po) => 
    sum + po.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0);


  return (
    <>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
              <CardTitle>Purchases & Suppliers</CardTitle>
              <CardDescription>
                Streamline your procurement and supplier management process.
              </CardDescription>
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
                     <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Payment Status</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={receivingStatusFilter} onValueChange={setReceivingStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Receiving Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Receiving Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            <SelectItem value="Received">Received</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <Button onClick={handleCreateNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Purchase Order
                </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Payment Status</TableHead>
                    <TableHead className="text-center">Receiving Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseOrders.length > 0 ? (
                    filteredPurchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell>{format(po.purchaseDate, 'PPP')}</TableCell>
                        <TableCell className="text-right">
                          TSh{' '}
                          {po.items
                            .reduce((sum, item) => sum + item.totalPrice, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              po.paymentStatus === 'Paid' ? 'default' : 'secondary'
                            }
                          >
                            {po.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                           <Badge
                            variant={
                              po.receivingStatus === 'Received' ? 'default' : 'secondary'
                            }
                          >
                            {po.receivingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEdit(po)}>Edit</DropdownMenuItem>
                                    {po.paymentStatus === 'Unpaid' && (
                                        <DropdownMenuItem onClick={() => handleOpenPaymentDialog(po)}>Mark as Paid</DropdownMenuItem>
                                    )}
                                    {po.receivingStatus !== 'Received' && (
                                        <DropdownMenuItem onClick={() => handleReceive(po.id)}>Mark as Received</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No purchase orders found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="font-bold text-lg">Filtered Total</TableCell>
                        <TableCell className="text-right font-bold text-lg">TSh {filteredTotal.toLocaleString()}</TableCell>
                        <TableCell colSpan={3}></TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePO}
        purchaseOrder={selectedPO}
      />
       <PurchasePaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSubmit={handlePayment}
        purchaseOrder={selectedPO}
      />
    </>
  )
}
