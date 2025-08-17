
'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { KeyRound } from 'lucide-react'

interface PasswordPromptDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => void
  tabName: string
}

const formSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
})

export function PasswordPromptDialog({ isOpen, onClose, onSubmit, tabName }: PasswordPromptDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  })

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.password)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4">
                <KeyRound className="h-8 w-8"/>
            </div>
          <DialogTitle>Access Restricted</DialogTitle>
          <DialogDescription>
            The &quot;{tabName}&quot; tab is password protected. Please enter the password to continue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="w-full">Unlock</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
