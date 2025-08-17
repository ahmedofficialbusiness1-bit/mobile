
'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react'
import { Product, Customer } from '@/context/financial-context'
import type { VatRate } from '@/app/sales/sale-form'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceFormData {
  invoiceNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  issueDate: Date
  dueDate: Date
  items: InvoiceItem[]
  vatRate: VatRate
}

const itemSchema = z.object({
  description: z.string().min(3, 'Please describe the service.'),
  quantity: z.coerce.number().min(0.1, 'Quantity must be positive.'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be positive.'),
  totalPrice: z.coerce.number(), // Calculated
})

const formSchema = z.object({
  customerId: z.string({ required_error: 'Please select a customer.' }),
  issueDate: z.date(),
  dueDate: z.date(),
  items: z.array(itemSchema).min(1, 'At least one item is required.'),
  vatRate: z.coerce.number().min(0).max(0.18),
})

type FormValues = z.infer<typeof formSchema>

export function InvoiceForm({ isOpen, onClose, onSave, customers }: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: InvoiceFormData) => void
  customers: Customer[]
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      items: [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      vatRate: 0.18,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = useWatch({ control: form.control, name: 'items' })

  const calculateTotals = React.useCallback(() => {
    const subtotal = watchedItems.reduce((acc, item) => {
        const total = (item.quantity || 0) * (item.unitPrice || 0);
        return acc + total;
    }, 0);
    const vatRate = form.getValues('vatRate');
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;
    return { subtotal, vatAmount, totalAmount };
  }, [watchedItems, form]);

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('items') && (name.endsWith('quantity') || name.endsWith('unitPrice'))) {
        const items = form.getValues('items');
        items.forEach((item, index) => {
          const total = (item.quantity || 0) * (item.unitPrice || 0);
          form.setValue(`items.${index}.totalPrice`, total);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const { subtotal, vatAmount, totalAmount } = calculateTotals();
  
  const onSubmit = (values: FormValues) => {
    const customer = customers.find(c => c.id === values.customerId)
    if (!customer) return

    const saleData: InvoiceFormData = {
      invoiceNumber: `INV-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      items: values.items,
      vatRate: values.vatRate as VatRate,
    }
    onSave(saleData)
    form.reset({
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      items: [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      vatRate: 0.18,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the details to generate a new invoice for a customer.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] p-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an existing customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.phone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium">Invoice Items</h3>
                  <div className="space-y-4 mt-2">
                    {fields.map((item, index) => (
                      <div key={item.id} className="p-3 border rounded-md">
                        <div className="grid grid-cols-1 gap-2">
                            <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Service Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g. Website design and development" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <div className="flex items-end gap-2">
                                <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                    <FormLabel>Qty</FormLabel>
                                    <Input type="number" {...field} />
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                 <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormLabel>Unit Price</FormLabel>
                                    <Input type="number" placeholder="e.g. 1,500,000" {...field} />
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className="w-40">
                                    <FormLabel>Total Price</FormLabel>
                                    <Input
                                        readOnly
                                        value={(watchedItems[index]?.totalPrice || 0).toLocaleString()}
                                        className="font-semibold bg-muted"
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                                </Button>
                           </div>
                        </div>
                      </div>
                    ))}
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </div>
                </div>
                <Separator />
                 <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">TSh {subtotal.toLocaleString()}</span>
                        </div>
                         <FormField
                            control={form.control}
                            name="vatRate"
                            render={({ field }) => (
                                <FormItem className="flex justify-between items-center">
                                <FormLabel>VAT</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={String(field.value)}>
                                    <FormControl>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="0.18">Mainland (18%)</SelectItem>
                                    <SelectItem value="0.15">Zanzibar (15%)</SelectItem>
                                    <SelectItem value="0">No VAT (0%)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VAT Amount</span>
                            <span className="font-medium">TSh {vatAmount.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span>TSh {totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
