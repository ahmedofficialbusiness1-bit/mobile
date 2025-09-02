
'use client'

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSecurity } from '@/context/security-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFinancials } from '@/context/financial-context';
import { Lock, Building, Store, Home, ShoppingCart, Users, FileText, Truck, Warehouse, Banknote, FilePlus2, BarChart2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  lockedItems: z.array(z.string()),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
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
];

export default function SecuritySettings() {
    const { password, setPassword, lockedItems, toggleLockedItem } = useSecurity();
    const { shops, companyName } = useFinancials();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
            lockedItems: lockedItems,
        },
    });

    React.useEffect(() => {
        form.setValue('lockedItems', lockedItems);
    }, [lockedItems, form]);

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        if (data.password) {
            if (data.password.length < 4) {
                 form.setError("password", { message: "Password must be at least 4 characters."});
                 return;
            }
            setPassword(data.password);
            toast({
                title: "Password Updated",
                description: "Your new password has been set successfully.",
            });
            form.reset({ password: '', confirmPassword: '', lockedItems: data.lockedItems });
        } else {
             toast({
                title: "Settings Saved",
                description: "Your lock settings have been updated.",
            });
        }
    };
    
    const shopItems = [
        { id: 'hq', name: `${companyName} (All Shops)`, icon: Building },
        ...shops.map(shop => ({ id: shop.id, name: shop.name, icon: Store }))
    ];


    return (
        <Card>
            <CardHeader>
                <CardTitle>Access Security Settings</CardTitle>
                <CardDescription>
                    Set a password to lock access to specific shops or pages.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <h3 className="text-lg font-medium">Set/Change Password</h3>
                            <p className="text-sm text-muted-foreground">
                               {password ? "Enter a new password to update it. Leave blank to keep the current one." : "Set a password to enable locking features."}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        
                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium">Lock Management</h3>
                            <p className="text-sm text-muted-foreground">
                                Select which pages or shop views to protect with the password.
                            </p>
                            {!password && (
                                <p className="text-sm text-destructive mt-4">You must set a password before you can lock any items.</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                                 <div>
                                    <h4 className="font-semibold mb-2">Shops / Branches</h4>
                                     <div className="space-y-4">
                                       {shopItems.map(item => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="lockedItems"
                                                render={() => (
                                                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="flex items-center gap-2">
                                                                <item.icon className="h-4 w-4" />
                                                                {item.name}
                                                            </FormLabel>
                                                        </div>
                                                        <FormControl>
                                                           <Switch
                                                                disabled={!password}
                                                                checked={lockedItems.includes(item.id)}
                                                                onCheckedChange={() => toggleLockedItem(item.id)}
                                                            />
                                                        </FormControl>
                                                     </FormItem>
                                                )}
                                            />
                                       ))}
                                    </div>
                                 </div>
                                 <div>
                                    <h4 className="font-semibold mb-2">Pages / Menu Items</h4>
                                     <div className="space-y-4">
                                       {pageItems.map(item => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="lockedItems"
                                                render={() => (
                                                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="flex items-center gap-2">
                                                                <item.icon className="h-4 w-4" />
                                                                {item.name}
                                                            </FormLabel>
                                                        </div>
                                                        <FormControl>
                                                           <Switch
                                                                disabled={!password}
                                                                checked={lockedItems.includes(item.id)}
                                                                onCheckedChange={() => toggleLockedItem(item.id)}
                                                            />
                                                        </FormControl>
                                                     </FormItem>
                                                )}
                                            />
                                       ))}
                                    </div>
                                 </div>
                            </div>
                        </div>

                        <Button type="submit">Save Settings</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
