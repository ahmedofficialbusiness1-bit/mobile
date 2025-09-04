
'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Transaction } from '@/context/financial-context'
import type { VatRate } from '@/app/sales/sale-form'
import { Separator } from '@/components/ui/separator'

interface VatAdjustmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transactionId: string, newVatRate: VatRate) => void
  transaction: Transaction | null
}

const formSchema = z.object({
  vatRate: z.coerce.number().min(0).max(0.18),
})

type FormValues = z.infer<typeof formSchema>

export function VatAdjustmentDialog({ isOpen, onClose, onSave, transaction }: VatAdjustmentDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vatRate: 0.18,
    },
  })

  const watchedVatRate = form.watch('vatRate');

  React.useEffect(() => {
    if (transaction) {
      const currentVatRate = transaction.netAmount > 0 ? transaction.vatAmount / transaction.netAmount : 0.18;
      // Round to nearest standard rate
      const roundedRate = [0, 0.15, 0.18].reduce((prev, curr) => 
        (Math.abs(curr - currentVatRate) < Math.abs(prev - currentVatRate) ? curr : prev)
      );
      form.reset({ vatRate: roundedRate as VatRate });
    }
  }, [transaction, form, isOpen]);

  const newCalculations = React.useMemo(() => {
    if (!transaction) return { net: 0, vat: 0 };
    const gross = transaction.amount;
    const net = gross / (1 + watchedVatRate);
    const vat = gross - net;
    return { net, vat };
  }, [transaction, watchedVatRate]);

  const onSubmit = (values: FormValues) => {
    if (transaction) {
      onSave(transaction.id, values.vatRate as VatRate)
      onClose()
    }
  }
  
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust VAT for Transaction</DialogTitle>
          <DialogDescription>
            Modify the VAT rate for the sale to <span className="font-semibold">{transaction.name}</span> for product <span className="font-semibold">{transaction.product}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Amount:</span>
                    <span className="font-mono">TSh {transaction.amount.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Net Amount:</span>
                    <span className="font-mono">TSh {transaction.netAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current VAT Amount:</span>
                    <span className="font-mono">TSh {transaction.vatAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
            </div>
            
            <Separator />

            <FormField
              control={form.control}
              name="vatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New VAT Rate</FormLabel>
                   <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="0.18">Mainland (18%)</SelectItem>
                            <SelectItem value="0.15">Zanzibar (15%)</SelectItem>
                            <SelectItem value="0">No VAT (0%)</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <div className="space-y-2 font-medium">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New Net Amount:</span>
                    <span className="font-mono">TSh {newCalculations.net.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New VAT Amount:</span>
                    <span className="font-mono">TSh {newCalculations.vat.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
            </div>


            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
