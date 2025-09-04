
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Shop } from '@/context/financial-context'

interface TransferRecordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (toShopId: string) => void
  shops: Shop[]
  currentShopId?: string | null
  recordType: 'Sale' | 'Purchase Order' | 'Invoice'
}

const formSchema = z.object({
  toShopId: z.string({ required_error: 'Please select a destination shop.' }),
})

export function TransferRecordDialog({ isOpen, onClose, onSave, shops, currentShopId, recordType }: TransferRecordDialogProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  React.useEffect(() => {
    form.reset();
  }, [isOpen, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.toShopId)
    onClose()
  }

  const currentShopName = shops.find(s => s.id === currentShopId)?.name || 'Headquarters';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer {recordType}</DialogTitle>
          <DialogDescription>
            Move this {recordType.toLowerCase()} from <span className="font-bold">{currentShopName}</span> to another branch. Stock levels and financial records will be adjusted accordingly.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="toShopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Branch</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shops.filter(s => s.id !== currentShopId).map(shop => (
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
