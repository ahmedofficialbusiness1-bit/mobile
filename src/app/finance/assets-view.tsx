
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { useFinancials, Asset, AddAssetData } from '@/context/financial-context';
import { useToast } from '@/hooks/use-toast';
import { AssetForm } from './asset-form';
import { SellAssetDialog } from './sell-asset-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AssetsView() {
    const { assets, addAsset, sellAsset, writeOffAsset } = useFinancials();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isSellDialogOpen, setIsSellDialogOpen] = React.useState(false);
    const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);

    const handleSaveAsset = (data: AddAssetData) => {
        addAsset(data);
        toast({
            title: "Asset Registered Successfully",
            description: `${data.name} has been added to your asset register.`,
        });
        setIsFormOpen(false);
    };

    const openSellDialog = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsSellDialogOpen(true);
    };

    const handleSellAsset = (sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => {
        if (selectedAsset) {
            sellAsset(selectedAsset.id, sellPrice, paymentMethod);
            toast({
                title: "Asset Sold",
                description: `${selectedAsset.name} has been sold for TSh ${sellPrice.toLocaleString()}.`,
            });
        }
        setIsSellDialogOpen(false);
        setSelectedAsset(null);
    };
    
    const handleWriteOffAsset = (id: string) => {
        writeOffAsset(id);
        toast({
            title: "Asset Written Off",
            description: "The asset's value has been set to zero.",
            variant: "destructive"
        });
    }

    const totalAssetValue = assets.reduce((sum, asset) => sum + asset.netBookValue, 0);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Asset Management</CardTitle>
                        <CardDescription>Track fixed assets, depreciation, and value over time.</CardDescription>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Register New Asset
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Acquisition Date</TableHead>
                                    <TableHead className="text-right">Initial Cost</TableHead>
                                    <TableHead className="text-right">Accumulated Depreciation</TableHead>
                                    <TableHead className="text-right">Net Book Value</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.length > 0 ? (
                                    assets.map(asset => (
                                        <TableRow key={asset.id} className={asset.status !== 'Active' ? 'text-muted-foreground' : ''}>
                                            <TableCell className="font-medium whitespace-nowrap">{asset.name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{format(asset.acquisitionDate, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {asset.cost.toLocaleString()}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {asset.accumulatedDepreciation.toLocaleString()}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap font-semibold">TSh {asset.netBookValue.toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={asset.status === 'Active' ? 'default' : 'secondary'}>{asset.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {asset.status === 'Active' && (
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => openSellDialog(asset)}>
                                                                <DollarSign className="mr-2 h-4 w-4" /> Sell Asset
                                                            </DropdownMenuItem>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                                                         <Trash2 className="mr-2 h-4 w-4" /> Write Off
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action will write off the asset, setting its value to zero. This cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleWriteOffAsset(asset.id)}>Continue</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">No assets registered yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="font-bold text-lg">
                                    <TableCell colSpan={4}>Total Net Book Value</TableCell>
                                    <TableCell className="text-right" colSpan={3}>
                                        TSh {totalAssetValue.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AssetForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveAsset}
            />
            
            <SellAssetDialog
                isOpen={isSellDialogOpen}
                onClose={() => setIsSellDialogOpen(false)}
                onSubmit={handleSellAsset}
                asset={selectedAsset}
            />
        </>
    );
}
