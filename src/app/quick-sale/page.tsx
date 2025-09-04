
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useFinancials } from '@/context/financial-context'
import { useToast } from '@/hooks/use-toast'
import { SaleForm, type SaleFormData } from '@/app/sales/sale-form'

function QuickSalePageContent() {
    const { products, customers, addSale } = useFinancials();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = React.useState(false);

     const handleSaveSale = (data: SaleFormData) => {
        try {
            addSale(data);
            toast({
                title: 'Sale Recorded Successfully',
                description: `A sale of ${data.quantity} x ${data.productName} has been recorded.`,
            });
            setIsFormOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error Recording Sale',
                description: error.message,
            })
        }
    }

    return (
        <>
            <div className="flex flex-col gap-8 max-w-2xl mx-auto">
                <div className="text-left">
                    <h1 className="text-3xl font-bold font-headline">
                    Quick Sale Entry
                    </h1>
                    <p className="text-muted-foreground mt-2">
                    Use this simplified form to quickly record a new cash or credit sale.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Sale Transaction</CardTitle>
                        <CardDescription>Click the button below to open the sales form and record a transaction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setIsFormOpen(true)} size="lg" className="w-full">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Record New Sale
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <SaleForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveSale}
                products={products}
                customers={customers}
            />
        </>
    )
}


export default function QuickSalePage() {
    return (
        <QuickSalePageContent />
    )
}
