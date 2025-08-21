
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
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import type { Product } from '@/context/financial-context'

interface RequestStockFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productId: string, productName: string, quantity: number, notes: string) => void
  products: Product[]
}

const formSchema = z.object({
  productIdentifier: z.string({ required_error: 'Please select or enter a product.' }),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  notes: z.string().optional(),
})

export function RequestStockForm({ isOpen, onClose, onSave, products }: RequestStockFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      notes: '',
    },
  })

  const productOptions = React.useMemo(() => {
    return products.map(product => ({
      value: product.id,
      label: `${product.name} (Main Stock: ${product.mainStock})`,
    }))
  }, [products]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedProduct = products.find(p => p.id === values.productIdentifier);
    const productId = selectedProduct ? selectedProduct.id : 'new-product-request';
    const productName = selectedProduct ? selectedProduct.name : values.productIdentifier;

    onSave(productId, productName, values.quantity, values.notes || '')
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Stock from Headquarters</DialogTitle>
          <DialogDescription>
            Select a product or type a new product name, and specify the quantity you need for your shop.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                    <Combobox
                        options={productOptions}
                        value={field.value}
                        onChange={(value) => {
                           const isOption = productOptions.some(opt => opt.value === value);
                           field.onChange(isOption ? value : value);
                        }}
                        placeholder="Search for a product..."
                        searchPlaceholder="Search or type new product..."
                        notFoundText="No product found. Type to add."
                        allowCustomValue={true}
                    />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Request</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any notes for the headquarters..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Send Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
