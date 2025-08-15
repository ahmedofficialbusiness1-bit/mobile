
'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { PlusCircle, MoreHorizontal } from 'lucide-react'
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
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  const handleSavePO = (data: Omit<PurchaseOrder, 'id'>) => {
    // In a real app, you would differentiate between add and update
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

  return (
    <>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Purchases & Suppliers</CardTitle>
              <CardDescription>
                Streamline your procurement and supplier management process.
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Purchase Order
            </Button>
          </CardHeader>
          <CardContent>
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
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((po) => (
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
                        No purchase orders created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
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
