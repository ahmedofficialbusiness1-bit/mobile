
'use client'

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { PaymentMethod } from '@/context/financial-context';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: { amount: number, paymentMethod: PaymentMethod }) => void;
  title?: string;
  description?: string;
  totalAmount?: number;
}

export function PaymentDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  description,
  totalAmount = 0,
}: PaymentDialogProps) {
  
  const formSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be greater than zero.").max(totalAmount, `Amount cannot exceed the balance of ${totalAmount.toLocaleString()} TSh.`),
    paymentMethod: z.enum(['Cash', 'Bank', 'Mobile', 'Credit', 'Prepaid']),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: totalAmount,
      paymentMethod: 'Bank',
    },
  });

   React.useEffect(() => {
    if (isOpen) {
      form.reset({
        amount: totalAmount,
        paymentMethod: 'Bank',
      });
    }
  }, [isOpen, totalAmount, form]);


  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const defaultTitle = "Record Payment";
  const defaultDescription = "Select the payment method and enter the amount.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount (TSh)</FormLabel>
                   <div className="relative">
                     <Input type="number" {...field} />
                     <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                        onClick={() => form.setValue('amount', totalAmount)}
                    >
                        Pay Full
                    </Button>
                   </div>
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
                        <SelectItem value="Mobile">Mobile Money</SelectItem>
                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                    </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
