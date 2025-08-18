
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
        const productTransactions = filteredTransactions.filter(t => t.product === product.name && (t.status === 'Paid' || t.status === 'Credit'));
        
        const grossSales = productTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netSales = productTransactions.reduce((sum, t) => sum + t.netAmount, 0);
        const vatCollected = productTransactions.reduce((sum, t) => sum + t.vatAmount, 0);
        const quantitySold = productTransactions.reduce((sum, t) => sum + t.quantity, 0);

        return { 
            name: product.name, 
            quantity: quantitySold, 
            grossSales,
            netSales,
            vatCollected
        };
    }).filter(p => p.grossSales > 0).sort((a,b) => b.grossSales - a.grossSales);

    const totals = salesByProduct.reduce((acc, p) => {
        acc.gross += p.grossSales;
        acc.net += p.netSales;
        acc.vat += p.vatCollected;
        return acc;
    }, { gross: 0, net: 0, vat: 0 });

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
                            <TableHead className="text-right">Qty Sold</TableHead>
                            <TableHead className="text-right">Total Sales (Gross)</TableHead>
                            <TableHead className="text-right">VAT Collected</TableHead>
                            <TableHead className="text-right">Net Sales</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salesByProduct.map(p => (
                            <TableRow key={p.name}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell className="text-right">{p.quantity.toLocaleString()}</TableCell>
                                <TableCell className="text-right">TSh {p.grossSales.toLocaleString()}</TableCell>
                                <TableCell className="text-right">TSh {p.vatCollected.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-medium">TSh {p.netSales.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        {salesByProduct.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No sales recorded for this period.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold text-lg bg-muted">
                            <TableCell colSpan={2}>Totals</TableCell>
                            <TableCell className="text-right">TSh {totals.gross.toLocaleString()}</TableCell>
                            <TableCell className="text-right">TSh {totals.vat.toLocaleString()}</TableCell>
                            <TableCell className="text-right">TSh {totals.net.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
