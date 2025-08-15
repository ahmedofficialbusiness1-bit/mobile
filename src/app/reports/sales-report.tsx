
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead, TableFooter } from '@/components/ui/table';

export default function SalesReport() {
    const { transactions, products } = useFinancials();

    const salesByProduct = products.map(product => {
        const totalSales = transactions
            .filter(t => t.product === product.name && t.status === 'Paid')
            .reduce((sum, t) => sum + t.amount, 0);
        const quantitySold = transactions
            .filter(t => t.product === product.name && (t.status === 'Paid' || t.status === 'Credit'))
            .length; // Simplified: Assumes 1 transaction = 1 unit
        return { name: product.name, quantity: quantitySold, total: totalSales };
    }).filter(p => p.total > 0).sort((a,b) => b.total - a.total);

    const totalSalesValue = salesByProduct.reduce((sum, p) => sum + p.total, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>Breakdown of sales by product for the period ending {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Quantity Sold</TableHead>
                            <TableHead className="text-right">Total Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salesByProduct.map(p => (
                            <TableRow key={p.name}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell className="text-right">{p.quantity.toLocaleString()}</TableCell>
                                <TableCell className="text-right">TSh {p.total.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold text-lg bg-muted">
                            <TableCell colSpan={2}>Total Sales Value</TableCell>
                            <TableCell className="text-right">TSh {totalSalesValue.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
