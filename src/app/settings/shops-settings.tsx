
'use client'

import * as React from 'react';
import { useFinancials, type Shop } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShopForm } from './shop-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ShopsSettings() {
    const { shops, addShop, updateShop, deleteShop } = useFinancials();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedShop, setSelectedShop] = React.useState<Shop | null>(null);

    const handleSaveShop = (data: Omit<Shop, 'id' | 'userId'>) => {
        if (selectedShop) {
            updateShop(selectedShop.id, data);
            toast({ title: "Shop Updated", description: "The shop details have been updated." });
        } else {
            addShop(data);
            toast({ title: "Shop Added", description: "The new shop has been successfully created." });
        }
        setIsFormOpen(false);
        setSelectedShop(null);
    };

    const handleAddNew = () => {
        setSelectedShop(null);
        setIsFormOpen(true);
    };

    const handleEdit = (shop: Shop) => {
        setSelectedShop(shop);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        deleteShop(id);
        toast({
            variant: 'destructive',
            title: 'Shop Deleted',
            description: `The shop "${name}" has been removed.`,
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Shops & Branches</CardTitle>
                        <CardDescription>Manage all your business locations or branches.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Shop
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shop Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shops && shops.length > 0 ? (
                                    shops.map(shop => (
                                        <TableRow key={shop.id}>
                                            <TableCell className="font-medium">{shop.name}</TableCell>
                                            <TableCell>{shop.location || '---'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleEdit(shop)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the shop "{shop.name}". This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(shop.id, shop.name)} className="bg-destructive hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No shops have been created yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ShopForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveShop}
                shop={selectedShop}
            />
        </>
    );
}
