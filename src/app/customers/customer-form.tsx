
'use client'

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Customer } from '@/context/financial-context';
import { Textarea } from '@/components/ui/textarea';


interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Customer, 'id'>) => void;
  customer: Customer | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Customer name is required." }),
  contactPerson: z.string().optional(),
  phone: z.string().min(10, { message: "Enter a valid phone number." }),
  email: z.string().email({ message: "Enter a valid email address." }).optional().or(z.literal('')),
  address: z.string().optional(),
  location: z.string().optional(),
});

export function CustomerForm({ isOpen, onClose, onSave, customer }: CustomerFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        location: '',
    },
  });

  React.useEffect(() => {
    if (customer) {
        form.reset(customer);
    } else {
        form.reset({
            name: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
            location: '',
        });
    }
  }, [customer, form, isOpen]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer Details' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? "Update the customer's information below." : "Fill in the form to register a new customer."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Juma Kondo or Kondo Supplies" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mariam Juma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 0712345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. juma.kondo@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Plot 24, Block C, Mbezi Beach" {...field} />
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
                        <Input placeholder="e.g. Dar es Salaam, Tanzania" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Customer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
