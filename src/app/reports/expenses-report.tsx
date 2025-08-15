
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead, TableFooter } from '@/components/ui/table';
import { expenseCategories } from '@/app/finance/expense-form';

export default function ExpensesReport() {
    const { expenses } = useFinancials();

    const expensesByCategory = expenseCategories.map(category => {
        const total = expenses
            .filter(e => e.status === 'Approved' && e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        return { category, total };
    }).filter(e => e.total > 0);

    const totalExpenses = expensesByCategory.reduce((sum, e) => sum + e.total, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Expenses Report</CardTitle>
                <CardDescription>Breakdown of expenses by category for the period ending {new Date().toLocaleDateString()}</CardDescription>
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
