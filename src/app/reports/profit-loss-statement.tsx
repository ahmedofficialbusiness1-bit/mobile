
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableFooter } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';


const ReportRow = ({ label, value, isBold = false, isSub = false, isNegative = false, isFooter = false }) => (
    <TableRow className={cn(isBold ? 'font-bold' : '', isFooter ? 'bg-muted text-lg' : '')}>
        <TableCell className={cn(isSub ? 'pl-8' : '', isFooter ? 'font-bold' : '')}>{label}</TableCell>
        <TableCell className={cn('text-right', isNegative ? 'text-red-600' : '', isFooter ? 'font-bold' : '')}>
            {value != null ? `TSh ${value.toLocaleString()}` : '---'}
        </TableCell>
    </TableRow>
);


interface ReportProps {
    dateRange?: DateRange;
}

export default function ProfitLossStatement({ dateRange }: ReportProps) {
    const { allTransactions, allExpenses, companyName, activeShopId } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    if (!allTransactions || !allExpenses) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Report...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please wait while financial data is being loaded.</p>
                </CardContent>
            </Card>
        );
    }

    const fromDate = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const toDate = dateRange?.to;

    // Filter all data based on the selected period and active shop
    const transactionsForPeriod = allTransactions.filter(t => 
        (activeShopId ? t.shopId === activeShopId : true) &&
        fromDate && toDate && isWithinInterval(t.date, { start: fromDate, end: toDate })
    );

    const expensesForPeriod = allExpenses.filter(e =>
        (activeShopId ? e.shopId === activeShopId : true) &&
        e.status === 'Approved' && fromDate && toDate && isWithinInterval(e.date, { start: fromDate, end: toDate })
    );
    
    // Revenue (Gross Sales)
    const revenue = transactionsForPeriod
        .filter(t => t.status === 'Paid' || t.status === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0);

    // Operating Expenses
    const operatingExpenses = expensesForPeriod.reduce((sum, e) => sum + e.amount, 0);

    // VAT at 15% of Revenue
    const vatExpense = revenue * 0.15;

    // Net Profit
    const netProfit = revenue - operatingExpenses - vatExpense;

    const chartData = [
        { name: 'Revenue', value: revenue },
        { name: 'Net Profit', value: netProfit },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{companyName}</CardTitle>
                <CardDescription>Simplified Profit Statement</CardDescription>
                <CardDescription>For the period ending {currentDate}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{ value: { label: "Amount (TSh)" } }}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `TSh ${Math.floor(Number(value) / 1000)}k`} />
                            <Tooltip content={<ChartTooltipContent formatter={(value) => `TSh ${Number(value).toLocaleString()}`} />} cursor={{ fill: 'hsl(var(--muted))' }} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <Table className="mt-8">
                    <TableBody>
                        <ReportRow label="Revenue (Gross Sales)" value={revenue} isBold />
                        <ReportRow label="Operating Expenses" value={operatingExpenses} isNegative isBold />
                        <ReportRow label="VAT (15%)" value={vatExpense} isNegative />
                    </TableBody>
                    <TableFooter>
                       <ReportRow label="Net Profit for the Period" value={netProfit} isFooter />
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
