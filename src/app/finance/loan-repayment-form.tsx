
'use client'

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentMethod } from '@/context/financial-context';

interface LoanRepaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => void;
  maxAmount: number;
}

export function LoanRepaymentForm({ isOpen, onClose, onSave, maxAmount }: LoanRepaymentFormProps) {
  const formSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be greater than zero.").max(maxAmount, `Amount cannot exceed the outstanding balance of ${maxAmount.toLocaleString()} TSh.`),
    paymentMethod: z.enum(['Cash', 'Bank', 'Mobile']),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'Bank',
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.amount, values.paymentMethod, values.notes || '');
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Repay Owner's Loan</DialogTitle>
          <DialogDescription>
            Record a payment made from the business back to the owner to reduce the loan balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repayment Amount (TSh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 500000" {...field} />
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
                  <FormLabel>Payment From</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the source of funds" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Cash">Cash on Hand</SelectItem>
                            <SelectItem value="Bank">Bank Account</SelectItem>
                            <SelectItem value="Mobile">Mobile Money</SelectItem>
                        </SelectContent>
                    </Select>
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
                    <Textarea placeholder="e.g. Partial repayment for Q2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Repayment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
