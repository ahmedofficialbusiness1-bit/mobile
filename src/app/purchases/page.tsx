
'use client'

import * as React from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Trash2, ArrowRightLeft } from 'lucide-react'
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFinancials, type PurchaseOrder } from '@/context/financial-context'
import { PurchaseOrderForm } from './purchase-order-form'
import { useToast } from '@/hooks/use-toast'
import { PaymentDialog } from '@/components/payment-dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { TransferRecordDialog } from '@/components/transfer-record-dialog'

function PurchasesPageContent() {
  const { purchaseOrders, addPurchaseOrder, receivePurchaseOrder, payPurchaseOrder, deletePurchaseOrder, transferPurchaseOrder, shops } = useFinancials()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
  const [isTransferOpen, setIsTransferOpen] = React.useState(false)
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
  
  const handleDelete = (po: PurchaseOrder) => {
    deletePurchaseOrder(po.id)
    toast({
        variant: 'destructive',
        title: 'Purchase Order Deleted',
        description: `PO #${po.poNumber} has been deleted.`,
    })
  }

  const handleOpenPaymentDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsPaymentDialogOpen(true);
  }

  const handlePayment = (paymentData: {amount: number; paymentMethod: 'Cash' | 'Bank' | 'Mobile'}) => {
    if (!selectedPO) return;
    try {
        payPurchaseOrder(selectedPO.id, paymentData)
        toast({
            title: 'Payment Successful',
            description: `A payment of TSh ${paymentData.amount.toLocaleString()} for the purchase order has been recorded.`,
        })
        setIsPaymentDialogOpen(false)
        setSelectedPO(null)
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: error.message,
        })
    }
  }

  const handleOpenTransfer = (po: PurchaseOrder) => {
      setSelectedPO(po);
      setIsTransferOpen(true);
  }

  const handleTransfer = async (toShopId: string) => {
      if (!selectedPO) return;
      try {
          await transferPurchaseOrder(selectedPO.id, toShopId);
          toast({
              title: "Purchase Order Transferred",
              description: `PO #${selectedPO.poNumber} has been moved to the new branch.`
          });
          setIsTransferOpen(false);
          setSelectedPO(null);
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: "Transfer Failed",
              description: error.message
          });
      }
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
                    <TableHead>Items</TableHead>
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
                        <TableCell>
                          {po.items[0].description}
                          {po.items.length > 1 && ` + ${po.items.length - 1} more`}
                        </TableCell>
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
                                        <DropdownMenuItem onClick={() => handleOpenPaymentDialog(po)}>Make Payment</DropdownMenuItem>
                                    )}
                                    {po.receivingStatus !== 'Received' && (
                                        <DropdownMenuItem onClick={() => handleReceive(po.id)}>Mark as Received</DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => handleOpenTransfer(po)}>
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Transfer to another Branch
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
                                                    This action will permanently delete PO #{po.poNumber}. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(po)} className="bg-destructive hover:bg-destructive/90">
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
                      <TableCell colSpan={8} className="h-24 text-center">
                        No purchase orders found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="font-bold text-lg">Filtered Total</TableCell>
                        <TableCell className="text-right font-bold text-lg" colSpan={4}>TSh {filteredTotal.toLocaleString()}</TableCell>
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
       <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSubmit={handlePayment}
        title={`Pay Purchase Order #${selectedPO?.poNumber}`}
        description={`Total amount due is TSh ${selectedPO?.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}.`}
        totalAmount={selectedPO?.items.reduce((sum, item) => sum + item.totalPrice, 0)}
      />
      <TransferRecordDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSave={handleTransfer}
        shops={shops}
        currentShopId={selectedPO?.shopId}
        recordType="Purchase Order"
    />
    </>
  )
}

export default function PurchasesPage() {
    return (
        <PurchasesPageContent />
    )
}
