
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';

const ReportRow = ({ label, value, isBold = false, isSub = false }) => (
    <TableRow className={isBold ? 'font-bold' : ''}>
        <TableCell className={isSub ? 'pl-8' : ''}>{label}</TableCell>
        <TableCell className="text-right">{value ? `TSh ${value.toLocaleString()}` : '---'}</TableCell>
    </TableRow>
);

export default function BalanceSheet() {
    const { assets, products, transactions, payables, cashBalances, capitalContributions, ownerLoans } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString());
    }, []);

    // Assets
    const nonCurrentAssets = assets.reduce((sum, asset) => sum + asset.netBookValue, 0);
    const inventory = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
    const tradeReceivables = transactions.filter(t => t.status === 'Credit').reduce((sum, t) => sum + t.amount, 0);
    const cashAndEquivalents = cashBalances.cash + cashBalances.bank + cashBalances.mobile;
    const currentAssets = inventory + tradeReceivables + cashAndEquivalents;
    const totalAssets = nonCurrentAssets + currentAssets;

    // Liabilities
    const tradePayables = payables.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);
    const currentLiabilities = tradePayables;
    const nonCurrentLiabilities = ownerLoans.reduce((sum, loan) => sum + (loan.amount - loan.repaid), 0);
    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    // Equity
    const shareCapital = capitalContributions.filter(c => c.type !== 'Liability' && c.type !== 'Drawing').reduce((sum, c) => sum + c.amount, 0);
    const drawings = capitalContributions.filter(c => c.type === 'Drawing').reduce((sum, c) => sum + c.amount, 0);
    const retainedEarnings = 0; // Simplified - needs P&L calculation
    const totalEquity = shareCapital + retainedEarnings - drawings;
    
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement of Financial Position (Balance Sheet)</CardTitle>
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
                        <ReportRow label="Current Assets" value={currentAssets} isSub />
                        <ReportRow label="Total Assets" value={totalAssets} isBold />
                        
                        <ReportRow label="LIABILITIES & EQUITY" isBold />
                        <ReportRow label="Current Liabilities" value={currentLiabilities} isSub />
                         <ReportRow label="Non-current Liabilities" value={nonCurrentLiabilities} isSub />
                        <ReportRow label="Total Liabilities" value={totalLiabilities} isBold />
                        
                        <ReportRow label="Equity" value={totalEquity} isSub />
                        <ReportRow label="Total Liabilities and Equity" value={totalLiabilitiesAndEquity} isBold />
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
