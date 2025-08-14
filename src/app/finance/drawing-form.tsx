
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

export interface DrawingData {
  amount: number;
  source: 'Cash' | 'Bank' | 'Mobile';
  description: string;
}

interface DrawingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DrawingData) => void;
  maxBalances: { cash: number, bank: number, mobile: number };
}

export function DrawingForm({ isOpen, onClose, onSave, maxBalances }: DrawingFormProps) {
  
  const formSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be greater than zero."),
    source: z.enum(['Cash', 'Bank', 'Mobile']),
    description: z.string().min(3, { message: "Please provide a brief description." }),
  }).refine(data => {
    if (data.source === 'Cash') return data.amount <= maxBalances.cash;
    if (data.source === 'Bank') return data.amount <= maxBalances.bank;
    if (data.source === 'Mobile') return data.amount <= maxBalances.mobile;
    return false;
  }, {
    message: "Withdrawal amount cannot exceed the selected source's balance.",
    path: ['amount'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      source: 'Bank',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Owner Drawing</DialogTitle>
          <DialogDescription>
            Record funds withdrawn by the owner for personal use. This will reduce owner's equity.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount (TSh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 250000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source of Funds</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the source of funds" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Cash">Cash on Hand (TSh {maxBalances.cash.toLocaleString()})</SelectItem>
                            <SelectItem value="Bank">Bank Account (TSh {maxBalances.bank.toLocaleString()})</SelectItem>
                            <SelectItem value="Mobile">Mobile Money (TSh {maxBalances.mobile.toLocaleString()})</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Personal expenses" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Drawing</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
