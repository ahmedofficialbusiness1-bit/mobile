
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
import type { Product } from '@/context/financial-context'

interface TransferStockFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quantity: number) => void
  product: Product | null
}

export function TransferStockForm({ isOpen, onClose, onSave, product }: TransferStockFormProps) {
  
  const formSchema = z.object({
    quantity: z.coerce
      .number()
      .min(1, 'Quantity must be at least 1.')
      .max(product?.mainStock || 0, `Cannot transfer more than available stock (${product?.mainStock || 0}).`),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  React.useEffect(() => {
    if (product) {
      form.reset({ quantity: 1 });
    }
  }, [product, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.quantity)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Stock to Shop</DialogTitle>
          <DialogDescription>
            Transfer <span className="font-bold">{product?.name}</span> from Main Inventory to Shop Inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <p className="text-sm">
                    Available in Main Inventory: <span className="font-bold">{product?.mainStock.toLocaleString()} {product?.uom}</span>
                </p>
                 <p className="text-sm">
                    Currently in Shop Inventory: <span className="font-bold">{product?.shopStock.toLocaleString()} {product?.uom}</span>
                </p>
            </div>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Transfer</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Confirm Transfer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
