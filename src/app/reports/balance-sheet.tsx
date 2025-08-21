
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';


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
    const { assets, products, transactions, payables, cashBalances, capitalContributions, ownerLoans, companyName } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    const endDate = dateRange?.to || new Date();

    // Assets
    const nonCurrentAssets = assets
        .filter(a => new Date(a.acquisitionDate) <= endDate && a.status === 'Active')
        .reduce((sum, asset) => sum + asset.netBookValue, 0); // Note: Depreciation should be calculated up to endDate

    const inventory = products.reduce((sum, p) => sum + ((p.mainStock + p.shopStock) * p.purchasePrice), 0); // Snapshot at current time

    const tradeReceivables = transactions
        .filter(t => t.status === 'Credit' && new Date(t.date) <= endDate)
        .reduce((sum, t) => sum + t.amount, 0);

    // Simplified cash calculation up to the period end. A real system needs historical balance.
    const cashAndEquivalents = cashBalances.cash + cashBalances.bank + cashBalances.mobile;
    
    const currentAssets = inventory + tradeReceivables + cashAndEquivalents;
    const totalAssets = nonCurrentAssets + currentAssets;

    // Liabilities
    const tradePayables = payables
        .filter(p => p.status === 'Unpaid' && new Date(p.date) <= endDate)
        .reduce((sum, p) => sum + p.amount, 0);
    const currentLiabilities = tradePayables;

    const nonCurrentLiabilities = ownerLoans
        .filter(l => new Date(l.date) <= endDate)
        .reduce((sum, loan) => sum + (loan.amount - loan.repaid), 0);

    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    // Equity
    const shareCapital = capitalContributions
        .filter(c => c.type !== 'Liability' && new Date(c.date) <= endDate)
        .reduce((sum, c) => sum + c.amount, 0);

        
    const retainedEarnings = 0; // Simplified - needs P&L calculation up to date
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
