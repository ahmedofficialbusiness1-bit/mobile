

'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
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
  FormDescription,
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
import { Product, PaymentMethod, Customer } from '@/context/financial-context'
import { Switch } from '@/components/ui/switch'

export type VatRate = 0 | 0.15 | 0.18;

export interface SaleFormData {
  customerType: 'existing' | 'new'
  customerId?: string
  customerName: string
  customerPhone: string
  productId: string
  productName: string
  quantity: number
  paymentMethod: PaymentMethod
  vatRate: VatRate
}

interface SaleFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SaleFormData) => void
  products: Product[]
  customers: Customer[]
}

const formSchema = z.object({
  customerType: z.enum(['existing', 'new']),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  productId: z.string({ required_error: 'Please select a product.' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }),
  paymentMethod: z.enum(['Cash', 'Mobile', 'Bank', 'Credit', 'Prepaid']),
  vatRate: z.coerce.number().min(0).max(0.18),
}).superRefine((data, ctx) => {
    if (data.customerType === 'existing' && !data.customerId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select a customer.",
            path: ['customerId'],
        });
    }
    if (data.customerType === 'new') {
        if (!data.customerName || data.customerName.length < 2) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Customer name is required.",
                path: ['customerName'],
            });
        }
        if (!data.customerPhone || data.customerPhone.length < 10) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Enter a valid phone number.",
                path: ['customerPhone'],
            });
        }
    }
})


export function SaleForm({ isOpen, onClose, onSave, products, customers }: SaleFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerType: 'existing',
      quantity: 1,
      paymentMethod: 'Cash',
      vatRate: 0.18,
    },
  })

  const selectedProductId = form.watch('productId');
  const customerType = form.watch('customerType');
  const quantity = form.watch('quantity');
  const vatRate = form.watch('vatRate');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedProduct) {
        return; 
    }

    let saleCustomerName = '';
    let saleCustomerPhone = '';

    if (values.customerType === 'existing') {
        const selectedCustomer = customers.find(c => c.id === values.customerId);
        if (selectedCustomer) {
            saleCustomerName = selectedCustomer.name;
            saleCustomerPhone = selectedCustomer.phone;
        }
    } else {
        saleCustomerName = values.customerName || '';
        saleCustomerPhone = values.customerPhone || '';
    }

    const saleData: SaleFormData = {
      ...values,
      productName: selectedProduct.name,
      customerName: saleCustomerName,
      customerPhone: saleCustomerPhone,
      vatRate: values.vatRate as VatRate,
    }
    onSave(saleData)
    form.reset({
      customerType: 'existing',
      quantity: 1,
      paymentMethod: 'Cash',
      vatRate: 0.18,
    })
    onClose()
  }
  
  const calculateTotal = () => {
      if (!selectedProduct || !quantity) return 0;
      const netTotal = selectedProduct.sellingPrice * quantity;
      const vatAmount = netTotal * (vatRate || 0);
      return netTotal + vatAmount;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Fill in the details below to record a new sales transaction.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>New Customer?</FormLabel>
                    <FormDescription>
                      Switch this on if the customer is not in your list.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'new'}
                      onCheckedChange={(checked) => field.onChange(checked ? 'new' : 'existing')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {customerType === 'existing' ? (
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an existing customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} ({customer.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            ) : (
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Jane Doe" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 0712345678" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            )}
            
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product to sell" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.filter(p => p.status !== 'Out of Stock' && p.status !== 'Expired').map(product => (
                        <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.currentStock} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="vatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
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
            </div>

             <FormItem>
                <FormLabel>Total Price (TSh)</FormLabel>
                <Input 
                    readOnly 
                    value={calculateTotal().toLocaleString()} 
                    className="font-bold bg-muted"
                />
            </FormItem>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Mobile">Mobile Money</SelectItem>
                      <SelectItem value="Bank">Bank Transfer</SelectItem>
                      <SelectItem value="Credit">On Credit</SelectItem>
                       <SelectItem value="Prepaid">Use Customer Deposit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Sale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

