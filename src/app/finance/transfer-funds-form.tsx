
'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type AccountType = 'Cash' | 'Bank' | 'Mobile';

interface TransferFundsFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (from: AccountType, to: AccountType, amount: number, notes: string) => void
  balances: Record<Lowercase<AccountType>, number>
}

export function TransferFundsForm({ isOpen, onClose, onSave, balances }: TransferFundsFormProps) {
  const formSchema = z.object({
    fromAccount: z.enum(['Cash', 'Bank', 'Mobile']),
    toAccount: z.enum(['Cash', 'Bank', 'Mobile']),
    amount: z.coerce.number().min(1, 'Amount must be greater than zero.'),
    notes: z.string().optional(),
  }).refine(data => data.fromAccount !== data.toAccount, {
    message: "Source and destination accounts cannot be the same.",
    path: ['toAccount'],
  }).refine(data => {
      const fromBalance = balances[data.fromAccount.toLowerCase() as Lowercase<AccountType>];
      return data.amount <= fromBalance;
  }, {
      message: "Transfer amount exceeds the selected source's balance.",
      path: ['amount'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromAccount: 'Bank',
      toAccount: 'Cash',
      amount: 0,
      notes: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.fromAccount, values.toAccount, values.amount, values.notes || '')
    form.reset()
    onClose()
  }
  
  const accountOptions = [
      { value: 'Cash', label: `Cash on Hand (TSh ${balances.cash.toLocaleString()})` },
      { value: 'Bank', label: `Bank Account (TSh ${balances.bank.toLocaleString()})` },
      { value: 'Mobile', label: `Mobile Money (TSh ${balances.mobile.toLocaleString()})` },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            Move money between your cash, bank, and mobile money accounts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="fromAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {accountOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="toAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {accountOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Transfer (TSh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 250000" {...field} />
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
                    <Textarea placeholder="e.g., Bank deposit for office supplies cash" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Confirm Transfer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
