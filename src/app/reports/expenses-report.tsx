
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead, TableFooter } from '@/components/ui/table';
import { expenseCategories } from '@/app/finance/expense-form';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';

interface ReportProps {
    dateRange?: DateRange;
}

export default function ExpensesReport({ dateRange }: ReportProps) {
    const { expenses, companyName } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    const filteredExpenses = expenses.filter(e =>
        dateRange?.from && dateRange?.to && isWithinInterval(e.date, { start: dateRange.from, end: dateRange.to })
    );

    const expensesByCategory = expenseCategories.map(category => {
        const total = filteredExpenses
            .filter(e => e.status === 'Approved' && e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        return { category, total };
    }).filter(e => e.total > 0);

    const totalExpenses = expensesByCategory.reduce((sum, e) => sum + e.total, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{companyName}</CardTitle>
                <CardDescription>Expenses Report</CardDescription>
                <CardDescription>Breakdown of expenses by category for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Expense Category</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expensesByCategory.map(exp => (
                            <TableRow key={exp.category}>
                                <TableCell>{exp.category}</TableCell>
                                <TableCell className="text-right">TSh {exp.total.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                         {expensesByCategory.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">No expenses recorded for this period.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="font-bold text-lg bg-muted">
                            <TableCell>Total Expenses</TableCell>
                            <TableCell className="text-right">TSh {totalExpenses.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
