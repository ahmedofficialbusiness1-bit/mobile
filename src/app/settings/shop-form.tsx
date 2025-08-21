
'use client'

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Shop } from '@/context/financial-context';


interface ShopFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Shop, 'id' | 'userId'>) => void;
  shop: Shop | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Shop name is required." }),
  location: z.string().optional(),
});

export function ShopForm({ isOpen, onClose, onSave, shop }: ShopFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        location: '',
    },
  });

  React.useEffect(() => {
    if (shop) {
        form.reset(shop);
    } else {
        form.reset({
            name: '',
            location: '',
        });
    }
  }, [shop, form, isOpen]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shop ? 'Edit Shop Details' : 'Add New Shop/Branch'}</DialogTitle>
          <DialogDescription>
            {shop ? "Update the shop's information below." : "Fill in the form to register a new shop or branch."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop / Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kariakoo Branch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dar es Salaam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Shop</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
