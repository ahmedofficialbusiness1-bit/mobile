
'use client'

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSecurity } from '@/context/security-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFinancials } from '@/context/financial-context';
import { Lock, Building, Store, Home, ShoppingCart, Users, FileText, Truck, Warehouse, Banknote, FilePlus2, BarChart2, Settings, Compass } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const lockableItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


const formSchema = z.object({
  items: z.array(lockableItemSchema),
});


const pageItems = [
    { id: '/', name: 'Dashboard', icon: Home },
    { id: '/sales', name: 'Sales', icon: ShoppingCart },
    { id: '/customers', name: 'Customers', icon: Users },
    { id: '/invoices', name: 'Invoices', icon: FileText },
    { id: '/purchases', name: 'Purchases', icon: Truck },
    { id: '/inventory', name: 'Inventory', icon: Warehouse },
    { id: '/finance', name: 'Finance', icon: Banknote },
    { id: '/post-expense', name: 'Post Expense', icon: FilePlus2 },
    { id: '/reports', name: 'Reports', icon: BarChart2 },
    { id: '/settings', name: 'Settings', icon: Settings },
];

export default function SecuritySettings() {
    const { setLock, removeLock, isItemLocked } = useSecurity();
    const { shops, companyName } = useFinancials();
    const { toast } = useToast();
    
    const allItems = React.useMemo(() => [
        { id: 'hq', name: `${companyName} (All Shops)`, icon: Building },
        ...shops.map(shop => ({ id: shop.id, name: shop.name, icon: Store })),
        ...pageItems
    ], [shops, companyName]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: allItems.map(item => ({
                id: item.id,
                name: item.name,
                password: '',
                confirmPassword: '',
            }))
        },
    });
    
    const { control, reset, setError } = form;

    const { fields } = useFieldArray({
        control: form.control,
        name: "items"
    });

     React.useEffect(() => {
        reset({
            items: allItems.map(item => ({
                id: item.id,
                name: item.name,
                password: '',
                confirmPassword: '',
            }))
        });
    }, [allItems, reset]);


    const onSubmit = (data: z.infer<typeof formSchema>) => {
        let changesMade = false;
        let hasErrors = false;

        data.items.forEach((item, index) => {
            if (item.password && item.password.length > 0) {
                 if (item.password.length < 4) {
                     setError(`items.${index}.password`, { message: "Password must be at least 4 characters."});
                     hasErrors = true;
                     return;
                 }
                if (item.password === item.confirmPassword) {
                    setLock(item.id, item.password);
                    changesMade = true;
                }
            }
        });

        if (hasErrors) return;

        if (changesMade) {
             toast({
                title: "Security Settings Updated",
                description: "Your new password settings have been saved.",
            });
            reset({
                 items: allItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    password: '',
                    confirmPassword: '',
                }))
            });
        } else {
             toast({
                title: "No Changes Made",
                description: "Enter a new password in both fields to set or change a lock.",
                variant: "default"
            });
        }
    };
    
    const handleRemoveLock = (itemId: string) => {
        removeLock(itemId);
        toast({
            title: "Lock Removed",
            description: `The password for this item has been removed.`,
            variant: 'destructive'
        });
    };
    
    const getItemIcon = (id: string) => {
        const item = allItems.find(i => i.id === id);
        return item?.icon || Lock;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Access Security Settings</CardTitle>
                <CardDescription>
                    Set a unique password for any page or shop view to restrict access. Leave password fields blank to make no changes. Use 'Remove Lock' to delete an existing password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            {fields.map((field, index) => {
                                 const Icon = getItemIcon(field.id);
                                 const hasLock = isItemLocked(field.id, true);
                                 return (
                                <div key={field.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="font-semibold">{field.name}</h3>
                                            {hasLock && <Lock className="h-4 w-4 text-primary" />}
                                        </div>
                                        {hasLock && (
                                            <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveLock(field.id)}>
                                                Remove Lock
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pl-7">
                                        <FormField
                                            control={control}
                                            name={`items.${index}.password`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{hasLock ? 'New Password' : 'Set Password'}</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} value={field.value || ''} placeholder="Leave blank to keep current" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name={`items.${index}.confirmPassword`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} value={field.value || ''} placeholder="Confirm new password" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {index < fields.length -1 && <Separator className="mt-6"/>}
                                </div>
                            )})}
                        </div>

                        <Button type="submit">Save All Changes</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
