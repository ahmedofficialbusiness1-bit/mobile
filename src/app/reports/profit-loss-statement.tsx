
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableFooter } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';

const ReportRow = ({ label, value, isBold = false, isSub = false, isNegative = false }) => (
    <TableRow className={isBold ? 'font-bold' : ''}>
        <TableCell className={isSub ? 'pl-8' : ''}>{label}</TableCell>
        <TableCell className={`text-right ${isNegative ? 'text-red-600' : ''}`}>
            {value != null ? `TSh ${value.toLocaleString()}` : '---'}
        </TableCell>
    </TableRow>
);

interface ReportProps {
    dateRange?: DateRange;
}

export default function ProfitLossStatement({ dateRange }: ReportProps) {
    const { transactions, expenses, products, companyName } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    const filteredTransactions = transactions.filter(t => 
        dateRange?.from && dateRange?.to && isWithinInterval(t.date, { start: dateRange.from, end: dateRange.to })
    );

    const filteredExpenses = expenses.filter(e =>
        e.status === 'Approved' && dateRange?.from && dateRange?.to && isWithinInterval(e.date, { start: dateRange.from, end: dateRange.to })
    );
    
    // Revenue (Net of VAT) for the period
    const revenue = filteredTransactions
        .filter(t => t.status === 'Paid' || t.status === 'Credit')
        .reduce((sum, t) => sum + t.netAmount, 0);

    // Direct Cost of Sales Calculation for the period
    const costOfSales = filteredTransactions.reduce((sum, t) => {
        if (t.productId === 'invoice') return sum; // Exclude service invoices from COGS
        const product = products.find(p => p.id === t.productId);
        const cost = product ? product.purchasePrice * t.quantity : 0;
        return sum + cost;
    }, 0);

    const grossProfit = revenue - costOfSales;

    const operatingExpenses = filteredExpenses
        .reduce((sum, e) => sum + e.amount, 0);

    const operatingProfit = grossProfit - operatingExpenses;
    
    // Simplified for now
    const financeCosts = 0;
    const otherIncome = 0;
    const profitBeforeTax = operatingProfit - financeCosts + otherIncome;
    const taxExpense = 0; // Simplified
    const netProfit = profitBeforeTax - taxExpense;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{companyName}</CardTitle>
                <CardDescription>Profit and Loss Statement</CardDescription>
                <CardDescription>For the period ending {currentDate}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <ReportRow label="Revenue (Net of VAT)" value={revenue} isBold />
                        
                        <ReportRow label="Cost of Sales" value={costOfSales} isNegative isBold />
                        
                        <ReportRow label="Gross Profit" value={grossProfit} isBold />

                        <ReportRow label="Operating Expenses" value={operatingExpenses} isNegative isBold />
                        {/* You can list detailed expenses here if needed */}
                        
                        <ReportRow label="Operating Profit" value={operatingProfit} isBold />
                        
                        <ReportRow label="Other Income" value={otherIncome} />
                        <ReportRow label="Finance Costs" value={financeCosts} isNegative />

                        <ReportRow label="Profit Before Tax" value={profitBeforeTax} isBold />

                        <ReportRow label="Tax Expense" value={taxExpense} isNegative />

                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold text-lg bg-muted">
                            <TableCell>Net Profit for the Period</TableCell>
                            <TableCell className="text-right">TSh {netProfit.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
