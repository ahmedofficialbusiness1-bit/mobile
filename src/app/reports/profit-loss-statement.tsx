
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableFooter } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay } from 'date-fns';

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
    const { allTransactions, allExpenses, allProducts, companyName, activeShopId, allPurchaseOrders } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    const fromDate = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const toDate = dateRange?.to;

    // Filter all data based on the selected period and active shop
    const transactionsForPeriod = allTransactions.filter(t => 
        (activeShopId ? t.shopId === activeShopId : true) &&
        fromDate && toDate && isWithinInterval(t.date, { start: fromDate, end: toDate })
    );

    const purchasesForPeriod = allPurchaseOrders.filter(po => 
        (activeShopId ? po.shopId === activeShopId : true) &&
        fromDate && toDate && isWithinInterval(po.purchaseDate, { start: fromDate, end: toDate })
    );

    const expensesForPeriod = allExpenses.filter(e =>
        (activeShopId ? e.shopId === activeShopId : true) &&
        e.status === 'Approved' && fromDate && toDate && isWithinInterval(e.date, { start: fromDate, end: toDate })
    );

    // Calculate Net Sales for the period
    const netSales = transactionsForPeriod
        .filter(t => t.status === 'Paid' || t.status === 'Credit')
        .reduce((sum, t) => sum + t.netAmount, 0);

    // Cost of Sales Calculation using Opening + Purchases - Closing
    const calculateInventoryValue = (products: typeof allProducts, atDate: Date) => {
        return products.reduce((totalValue, product) => {
            const transactionsUpToDate = allTransactions.filter(t => 
                (activeShopId ? t.shopId === activeShopId : true) &&
                t.productId === product.id && t.date <= atDate
            );
            const purchasesUpToDate = allPurchaseOrders.filter(po => 
                (activeShopId ? po.shopId === activeShopId : true) &&
                po.receivingStatus === 'Received' && po.purchaseDate <= atDate && po.items.some(item => item.description === product.name)
            );
            
            let stock = product.initialStock;
            
            if (activeShopId) { // Branch specific stock calculation
                 const transfersToBranch = allTransactions.filter(t => t.notes === 'Stock Transfer' && t.shopId === activeShopId && t.productId === product.id && t.date <= atDate);
                 const transfersFromBranch = allTransactions.filter(t => t.notes === 'Stock Transfer Out' && t.shopId === activeShopId && t.productId === product.id && t.date <= atDate);
                 
                 const salesQty = transactionsUpToDate.reduce((sum, t) => sum + t.quantity, 0);
                 const purchaseQty = purchasesUpToDate.reduce((sum, po) => sum + po.items.find(i => i.description === product.name)!.quantity, 0);
                 const transferInQty = transfersToBranch.reduce((sum, t) => sum + t.quantity, 0);
                 const transferOutQty = transfersFromBranch.reduce((sum, t) => sum + t.quantity, 0);

                 // A simple branch stock model, might need refinement for complex transfers
                 stock = purchaseQty + transferInQty - salesQty - transferOutQty;
            } else { // HQ stock calculation
                const totalSalesQty = transactionsUpToDate.reduce((sum, t) => sum + t.quantity, 0);
                const totalPurchaseQty = purchasesUpToDate.reduce((sum, po) => sum + po.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
                stock = product.initialStock + totalPurchaseQty - totalSalesQty;
            }

            return totalValue + (Math.max(0, stock) * product.purchasePrice);
        }, 0);
    };

    const openingInventory = fromDate ? calculateInventoryValue(allProducts, new Date(fromDate.getTime() - 1)) : 0;
    const closingInventory = toDate ? calculateInventoryValue(allProducts, toDate) : 0;
    
    const purchases = purchasesForPeriod.reduce((sum, po) => 
        sum + po.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0);
    
    const costOfSales = openingInventory + purchases - closingInventory;

    const grossProfit = netSales - costOfSales;

    const operatingExpenses = expensesForPeriod.reduce((sum, e) => sum + e.amount, 0);

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
                        <ReportRow label="Net Sales" value={netSales} isBold />
                        <ReportRow label="Cost of Sales" value={costOfSales} isNegative isBold />
                        <ReportRow label="Gross Profit" value={grossProfit} isBold />
                        <ReportRow label="Operating Expenses" value={operatingExpenses} isNegative isBold />
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
