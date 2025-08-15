
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
import { Product, PaymentMethod } from '@/context/financial-context'
import { useToast } from '@/hooks/use-toast'

export interface SaleFormData {
  customerName: string
  customerPhone: string
  productId: string
  productName: string
  quantity: number
  paymentMethod: PaymentMethod
}

interface SaleFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SaleFormData) => void
  products: Product[]
}

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name is required.' }),
  customerPhone: z.string().min(10, { message: 'Enter a valid phone number.' }),
  productId: z.string({ required_error: 'Please select a product.' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }),
  paymentMethod: z.enum(['Cash', 'Mobile', 'Bank', 'Credit']),
})

export function SaleForm({ isOpen, onClose, onSave, products }: SaleFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      quantity: 1,
      paymentMethod: 'Cash',
    },
  })

  const selectedProductId = form.watch('productId');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedProduct) {
        return; // Should not happen if form is valid
    }
    const saleData: SaleFormData = {
      ...values,
      productName: selectedProduct.name,
    }
    onSave(saleData)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Fill in the details below to record a new sales transaction.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Doe" {...field} />
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
                        <Input placeholder="e.g. 0712345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
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
                <FormItem>
                    <FormLabel>Total Price (TSh)</FormLabel>
                    <Input 
                        readOnly 
                        value={selectedProduct ? (selectedProduct.sellingPrice * (form.getValues('quantity') || 0)).toLocaleString() : '0'} 
                        className="font-bold bg-muted"
                    />
                </FormItem>
            </div>

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
