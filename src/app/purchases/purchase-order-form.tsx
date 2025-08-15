
'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import type { PurchaseOrder } from '@/context/financial-context'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PurchaseOrderFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<PurchaseOrder, 'id'>) => void
  purchaseOrder: PurchaseOrder | null
}

const itemSchema = z.object({
  description: z.string().min(1, 'Item description is required.'),
  quantity: z.coerce.number().min(0.1, 'Quantity must be positive.'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative.'),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative.'),
  uom: z.string().min(1, 'UoM is required.'),
  totalPrice: z.coerce.number(),
})

const formSchema = z.object({
  poNumber: z.string().min(1, 'PO Number is required.'),
  purchaseDate: z.date(),
  supplierName: z.string().min(1, 'Supplier name is required.'),
  contactInformation: z.string().optional(),
  referenceNumber: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required.'),
  paymentTerms: z.enum(['Cash', 'Credit 30 days', 'Credit 60 days']),
  paymentStatus: z.enum(['Paid', 'Unpaid']),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Mpesa', 'Credit']),
  invoiceNumber: z.string().optional(),
  shippingMethod: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  receivingStatus: z.enum(['Pending', 'Partial', 'Received']),
  shippingCost: z.coerce.number().min(0).default(0),
  taxes: z.coerce.number().min(0).default(0),
  otherCharges: z.coerce.number().min(0).default(0),
})

export function PurchaseOrderForm({
  isOpen,
  onClose,
  onSave,
  purchaseOrder,
}: PurchaseOrderFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: purchaseOrder
      ? { ...purchaseOrder }
      : {
          poNumber: `PO-${Date.now()}`,
          purchaseDate: new Date(),
          supplierName: '',
          contactInformation: '',
          referenceNumber: '',
          items: [
            {
              description: '',
              quantity: 1,
              unitPrice: 0,
              sellingPrice: 0,
              uom: 'pcs',
              totalPrice: 0,
            },
          ],
          paymentTerms: 'Credit 30 days',
          paymentStatus: 'Unpaid',
          paymentMethod: 'Credit',
          invoiceNumber: '',
          shippingMethod: '',
          receivingStatus: 'Pending',
          shippingCost: 0,
          taxes: 0,
          otherCharges: 0,
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = form.watch('items');

  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const items = form.getValues('items');
    const item = items[index];

    if (field === 'quantity') {
        item.quantity = numericValue;
    } else if (field === 'unitPrice') {
        item.unitPrice = numericValue;
    }

    item.totalPrice = (item.quantity || 0) * (item.unitPrice || 0);

    form.setValue('items', items, { shouldDirty: true });
    // Manually trigger re-render for the total price field
    form.trigger(`items.${index}.totalPrice`);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {purchaseOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create or update a purchase order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] p-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="poNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Order No.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="referenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. INV-123" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Supplier Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                     <FormField
                        control={form.control}
                        name="supplierName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier/Vendor Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Mzuri Supplies Ltd" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="contactInformation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Information</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 0712345678" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Items</h3>
                  <div className="space-y-4 mt-2">
                    {fields.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-md">
                        <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                                <FormItem className="col-span-12">
                                <FormLabel>Item Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="Item description" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="col-span-3 md:col-span-2">
                                <FormLabel>Qty</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={(e) => { field.onChange(e); handleItemChange(index, 'quantity', e.target.value); }} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.uom`}
                            render={({ field }) => (
                                <FormItem className="col-span-3 md:col-span-2">
                                <FormLabel>UoM</FormLabel>
                                <FormControl>
                                    <Input placeholder="pcs" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                                <FormItem className="col-span-3 md:col-span-2">
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={(e) => { field.onChange(e); handleItemChange(index, 'unitPrice', e.target.value); }} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.sellingPrice`}
                            render={({ field }) => (
                                <FormItem className="col-span-3 md:col-span-2">
                                <FormLabel>Selling Price</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-full md:col-span-3">
                            <FormLabel>Total</FormLabel>
                            <Input value={watchedItems[index]?.totalPrice.toLocaleString() || '0'} readOnly className="font-mono text-right bg-muted" />
                        </div>
                        <div className="col-span-1 flex items-end h-full">
                           {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                           )}
                        </div>
                      </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ description: '', quantity: 1, unitPrice: 0, sellingPrice: 0, uom: 'pcs', totalPrice: 0 })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </div>
                </div>

                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Credit 30 days">Credit 30 days</SelectItem>
                                <SelectItem value="Credit 60 days">Credit 60 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Mpesa">Mpesa</SelectItem>
                                <SelectItem value="Credit">Credit</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="receivingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receiving Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Partial">Partial</SelectItem>
                                <SelectItem value="Received">Received</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Purchase Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
