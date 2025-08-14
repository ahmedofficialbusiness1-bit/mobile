
'use client'

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Asset, PaymentMethod } from '@/context/financial-context';

interface SellAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => void;
  asset: Asset | null;
}

const formSchema = z.object({
  sellPrice: z.coerce.number().min(0, { message: "Sell price must be zero or more." }),
  paymentMethod: z.enum(['Cash', 'Bank', 'Mobile', 'Credit']),
});

export function SellAssetDialog({ isOpen, onClose, onSubmit, asset }: SellAssetDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sellPrice: 0,
      paymentMethod: 'Cash',
    },
  });

  React.useEffect(() => {
    if (asset) {
      form.reset({ sellPrice: asset.netBookValue, paymentMethod: 'Cash' });
    }
  }, [asset, form]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.sellPrice, values.paymentMethod);
  };
  
  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell Asset: {asset.name}</DialogTitle>
          <DialogDescription>
            Record the sale of this asset. Current book value is TSh {asset.netBookValue.toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price (TSh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter the final selling price" {...field} />
                  </FormControl>
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
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank">Bank Transfer</SelectItem>
                            <SelectItem value="Mobile">Mobile Money</SelectItem>
                            <SelectItem value="Credit">On Credit</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Confirm Sale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
