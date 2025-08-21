

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
import { Combobox } from '@/components/ui/combobox'

export type VatRate = 0 | 0.15 | 0.18;

export interface SaleFormData {
  customerType: 'existing' | 'new'
  customerId?: string
  customerName: string
  customerPhone: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
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
  unitPrice: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
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
      unitPrice: 0,
      paymentMethod: 'Cash',
      vatRate: 0.18,
    },
  })

  const customerType = form.watch('customerType');
  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unitPrice');
  
  const productOptions = React.useMemo(() => 
    products
        .filter(p => p.status !== 'Out of Stock' && p.status !== 'Expired')
        .map(product => ({
            value: product.id,
            label: `${product.name} (${product.currentStock} in stock)`
        })), 
  [products]);

  const customerOptions = React.useMemo(() =>
    customers.map(customer => ({
        value: customer.id,
        label: `${customer.name} (${customer.phone})`
    })),
  [customers]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedProduct = products.find(p => p.id === values.productId);
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
      unitPrice: 0,
      paymentMethod: 'Cash',
      vatRate: 0.18,
    })
    onClose()
  }
  
  const calculateTotal = () => {
      if (!unitPrice || !quantity) return 0;
      const grossTotal = unitPrice * quantity;
      return grossTotal;
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
                       <Combobox
                            options={customerOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Search for a customer..."
                            searchPlaceholder="Search customer..."
                            notFoundText="No customer found."
                        />
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
            
            <div className="grid grid-cols-1 gap-2">
                <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Combobox
                            options={productOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Search for a product..."
                            searchPlaceholder="Search product..."
                            notFoundText="No product found."
                        />
                        <FormMessage />
                    </FormItem>
                )}
                />
                <div className="flex items-end gap-2">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                        <FormItem className="flex-1">
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
                        name="unitPrice"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Enter selling price" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

             <FormItem>
                <FormLabel>Total Price (TSh)</FormLabel>
                <Input 
                    readOnly 
                    value={calculateTotal().toLocaleString()} 
                    className="font-bold bg-muted"
                />
            </FormItem>
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            
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

    