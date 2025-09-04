
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
import type { Product, Shop } from '@/context/financial-context'
import { useFinancials } from '@/context/financial-context'

interface TransferStockFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quantity: number, fromShopId: string | null, toShopId: string) => void
  product: Product | null
  shops: Shop[]
}

export function TransferStockForm({ isOpen, onClose, onSave, product, shops }: TransferStockFormProps) {
  const { activeShopId, activeShop } = useFinancials();

  const availableStock = activeShopId ? product?.currentStock || 0 : product?.mainStock || 0;

  const formSchema = z.object({
    quantity: z.coerce
      .number()
      .min(1, 'Quantity must be at least 1.')
      .max(availableStock, `Cannot transfer more than available stock (${availableStock}).`),
    toShopId: z.string({ required_error: 'Please select a destination shop.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  React.useEffect(() => {
    if (product) {
      form.reset({ quantity: 1, toShopId: undefined });
    }
  }, [product, form, isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.quantity, activeShopId, values.toShopId)
    form.reset()
    onClose()
  }
  
  const fromLocation = activeShop ? activeShop.name : "Main Inventory (HQ)";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer <span className="font-bold">{product?.name}</span> to another location.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <p className="text-sm">
                    From: <span className="font-bold">{fromLocation}</span>
                </p>
                <p className="text-sm">
                    Available Stock: <span className="font-bold">{availableStock.toLocaleString()} {product?.uom}</span>
                </p>
            </div>
            <FormField
              control={form.control}
              name="toShopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Shop</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a shop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shops.filter(shop => shop.id !== activeShopId).map(shop => (
                            <SelectItem key={shop.id} value={shop.id}>
                              {shop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
