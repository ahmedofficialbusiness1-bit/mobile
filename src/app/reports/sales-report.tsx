
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead, TableFooter } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';

interface ReportProps {
    dateRange?: DateRange;
}

export default function SalesReport({ dateRange }: ReportProps) {
    const { transactions, products, companyName } = useFinancials();
    
    const filteredTransactions = transactions.filter(t => 
        dateRange?.from && dateRange?.to && isWithinInterval(t.date, { start: dateRange.from, end: dateRange.to })
    );

    const salesByProduct = products.map(product => {
        const totalSales = filteredTransactions
            .filter(t => t.product === product.name && t.status === 'Paid')
            .reduce((sum, t) => sum + t.amount, 0);
        const quantitySold = filteredTransactions
            .filter(t => t.product === product.name && (t.status === 'Paid' || t.status === 'Credit'))
            .length; // Simplified: Assumes 1 transaction = 1 unit
        return { name: product.name, quantity: quantitySold, total: totalSales };
    }).filter(p => p.total > 0).sort((a,b) => b.total - a.total);

    const totalSalesValue = salesByProduct.reduce((sum, p) => sum + p.total, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{companyName}</CardTitle>
                <CardDescription>Sales Report</CardDescription>
                <CardDescription>Breakdown of sales by product for the selected period</CardDescription>
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
                        {salesByProduct.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No sales recorded for this period.</TableCell>
                            </TableRow>
                        )}
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
