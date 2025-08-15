
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableFooter } from '@/components/ui/table';

const ReportRow = ({ label, value, isBold = false, isSub = false, isNegative = false }) => (
    <TableRow className={isBold ? 'font-bold' : ''}>
        <TableCell className={isSub ? 'pl-8' : ''}>{label}</TableCell>
        <TableCell className={`text-right ${isNegative ? 'text-red-600' : ''}`}>
            {value ? `TSh ${value.toLocaleString()}` : '---'}
        </TableCell>
    </TableRow>
);

export default function ProfitLossStatement() {
    const { transactions, expenses, products, purchaseOrders } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString());
    }, []);

    // Use netAmount for revenue calculation (Sales After VAT)
    const revenue = transactions
        .filter(t => t.status === 'Paid')
        .reduce((sum, t) => sum + t.netAmount, 0);

    const openingInventory = 0; // Simplified for now
    const purchases = purchaseOrders
        .filter(po => po.receivingStatus === 'Received')
        .reduce((sum, po) => sum + po.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0);
    const closingInventory = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
    const costOfSales = openingInventory + purchases - closingInventory;
    const grossProfit = revenue - costOfSales;

    const operatingExpenses = expenses
        .filter(e => e.status === 'Approved')
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
                <CardTitle>Profit and Loss Statement</CardTitle>
                <CardDescription>For the period ending {currentDate}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <ReportRow label="Revenue (Net of VAT)" value={revenue} isBold />
                        
                        <ReportRow label="Cost of Sales" value={costOfSales} isNegative isBold />
                        <ReportRow label="Opening Inventory" value={openingInventory} isSub />
                        <ReportRow label="Add: Purchases" value={purchases} isSub />
                        <ReportRow label="Less: Closing Inventory" value={closingInventory} isSub isNegative />
                        
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

    
