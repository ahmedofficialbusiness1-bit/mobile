
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, subDays } from 'date-fns';


const ReportRow = ({ label, value, isBold = false, isSub = false }) => (
    <TableRow className={isBold ? 'font-bold' : ''}>
        <TableCell className={isSub ? 'pl-8' : ''}>{label}</TableCell>
        <TableCell className="text-right">{value != null ? `TSh ${value.toLocaleString()}` : '---'}</TableCell>
    </TableRow>
);

interface ReportProps {
    dateRange?: DateRange;
}


export default function BalanceSheet({ dateRange }: ReportProps) {
    const { 
        initialAssets, 
        allProducts, 
        allTransactions, 
        allPayables, 
        cashBalances, 
        allCapitalContributions, 
        allOwnerLoans, 
        companyName, 
        allExpenses, 
        activeShopId,
        allPurchaseOrders 
    } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    // Guard against undefined data during initial render
    if (!allTransactions || !allExpenses || !allPurchaseOrders || !allProducts || !allPayables || !allCapitalContributions) {
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

    const endDate = dateRange?.to || new Date();
    
    const assets = activeShopId ? initialAssets.filter(a => a.shopId === activeShopId) : initialAssets;
    const transactions = activeShopId ? allTransactions.filter(t => t.shopId === activeShopId) : allTransactions;
    const payables = activeShopId ? allPayables.filter(p => p.shopId === activeShopId) : allPayables;
    const capitalContributions = activeShopId ? allCapitalContributions.filter(c => c.shopId === activeShopId) : allCapitalContributions;
    const ownerLoans = activeShopId ? allOwnerLoans.filter(l => l.shopId === activeShopId) : allOwnerLoans;
    const expenses = activeShopId ? allExpenses.filter(e => e.shopId === activeShopId) : allExpenses;
    const products = allProducts;
    const purchaseOrders = activeShopId ? allPurchaseOrders.filter(po => po.shopId === activeShopId) : allPurchaseOrders;

    // RETAINED EARNINGS CALCULATION
    const historicalTransactions = transactions.filter(t => new Date(t.date) <= endDate);
    const historicalExpenses = expenses.filter(e => e.status === 'Approved' && new Date(e.date) <= endDate);
    
    const calculateInventoryValueAtDate = (targetDate: Date) => {
        return products.reduce((totalValue, product) => {
             const stockTransactions = transactions.filter(t =>
                t.productId === product.id &&
                t.date <= targetDate
            );
            const stockPurchases = purchaseOrders.filter(po =>
                 po.receivingStatus === 'Received' && po.purchaseDate <= targetDate &&
                 po.items.some(item => item.description === product.name)
            );

            const salesQty = stockTransactions.reduce((sum, t) => sum + t.quantity, 0);
            const purchaseQty = stockPurchases.reduce((sum, po) => 
                sum + po.items.find(i => i.description === product.name)!.quantity, 0);

            const currentStockLevel = (product.initialStock + purchaseQty) - salesQty;
            
            return totalValue + (Math.max(0, currentStockLevel) * product.purchasePrice);
        }, 0);
    };

    const revenue = historicalTransactions
        .filter(t => t.status === 'Paid' || t.status === 'Credit')
        .reduce((sum, t) => sum + t.netAmount, 0);

    const openingInventory = calculateInventoryValueAtDate(subDays(new Date('2020-01-01'), 1));
    const closingInventory = calculateInventoryValueAtDate(endDate);
    const historicalPurchases = purchaseOrders.filter(po => po.purchaseDate <= endDate).reduce((sum, po) => 
        sum + po.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0);

    const costOfSalesHistorical = openingInventory + historicalPurchases - closingInventory;

    const grossProfit = revenue - costOfSalesHistorical;
    const operatingExpenses = historicalExpenses.reduce((sum, e) => sum + e.amount, 0);
    const retainedEarnings = grossProfit - operatingExpenses;


    // --- ASSETS ---
    const nonCurrentAssets = assets
        .filter(a => new Date(a.acquisitionDate) <= endDate && a.status === 'Active')
        .reduce((sum, asset) => sum + asset.netBookValue, 0);

    const inventory = closingInventory;

    const tradeReceivables = historicalTransactions
        .filter(t => t.status === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const cashAndEquivalents = cashBalances.cash + cashBalances.bank + cashBalances.mobile;
    
    const currentAssets = inventory + tradeReceivables + cashAndEquivalents;
    const totalAssets = nonCurrentAssets + currentAssets;

    // --- LIABILITIES ---
    const tradePayables = payables
        .filter(p => p.status === 'Unpaid' && new Date(p.date) <= endDate)
        .reduce((sum, p) => sum + p.amount, 0);
    const currentLiabilities = tradePayables;

    const nonCurrentLiabilities = ownerLoans
        .filter(l => new Date(l.date) <= endDate)
        .reduce((sum, loan) => sum + (loan.amount - loan.repaid), 0);

    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    // --- EQUITY ---
    const shareCapital = capitalContributions
        .filter(c => c.type !== 'Liability' && new Date(c.date) <= endDate)
        .reduce((sum, c) => sum + c.amount, 0);

    const totalEquity = shareCapital + retainedEarnings;
    
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{companyName}</CardTitle>
                <CardDescription>Statement of Financial Position (Balance Sheet)</CardDescription>
                 <CardDescription>As at {currentDate}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <ReportRow label="ASSETS" isBold />
                        <ReportRow label="Non-current Assets" value={nonCurrentAssets} isSub />
                        <ReportRow label="Current Assets" isBold />
                        <ReportRow label="Inventory" value={inventory} isSub />
                        <ReportRow label="Trade Receivables" value={tradeReceivables} isSub />
                        <ReportRow label="Cash and Cash Equivalents" value={cashAndEquivalents} isSub />
                        <ReportRow label="Total Current Assets" value={currentAssets} isBold />
                        <ReportRow label="Total Assets" value={totalAssets} isBold />
                        
                        <TableRow><TableCell colSpan={2}>&nbsp;</TableCell></TableRow>

                        <ReportRow label="LIABILITIES & EQUITY" isBold />
                        <ReportRow label="LIABILITIES" isBold />
                        <ReportRow label="Current Liabilities" value={currentLiabilities} isSub />
                        <ReportRow label="Non-current Liabilities" value={nonCurrentLiabilities} isSub />
                        <ReportRow label="Total Liabilities" value={totalLiabilities} isBold />
                        
                        <TableRow><TableCell colSpan={2}>&nbsp;</TableCell></TableRow>

                        <ReportRow label="EQUITY" isBold />
                        <ReportRow label="Share Capital" value={shareCapital} isSub />
                        <ReportRow label="Retained Earnings" value={retainedEarnings} isSub />
                        <ReportRow label="Total Equity" value={totalEquity} isBold />

                        <TableRow><TableCell colSpan={2}>&nbsp;</TableCell></TableRow>

                        <ReportRow label="Total Liabilities and Equity" value={totalLiabilitiesAndEquity} isBold />
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
