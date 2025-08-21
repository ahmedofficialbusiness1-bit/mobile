
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
import type { Product } from '@/context/financial-context'

interface ReportDamageFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quantity: number, reason: string) => void
  product: Product | null
}

export function ReportDamageForm({ isOpen, onClose, onSave, product }: ReportDamageFormProps) {
  
  const totalStock = product ? product.mainStock + product.shopStock : 0;

  const formSchema = z.object({
    quantity: z.coerce
      .number()
      .min(1, 'Quantity must be at least 1.')
      .max(totalStock, `Cannot report more than available stock (${totalStock}).`),
    reason: z.string().min(5, 'Please provide a brief reason for the damage.'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      reason: '',
    },
  })

  React.useEffect(() => {
    if (product) {
      form.reset({ quantity: 1, reason: '' });
    }
  }, [product, form, isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.quantity, values.reason)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Damaged Goods</DialogTitle>
          <DialogDescription>
            Record damaged or unsellable units of <span className="font-bold">{product?.name}</span>. This will reduce the stock level.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <p className="text-sm">
                    Total Available Stock: <span className="font-bold">{totalStock.toLocaleString()} {product?.uom}</span>
                </p>
                 <p className="text-xs text-muted-foreground">
                    (Main: {product?.mainStock.toLocaleString()} | Shop: {product?.shopStock.toLocaleString()})
                </p>
            </div>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damaged Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Damage</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Expired, Broken during transit, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">Confirm Damage</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
