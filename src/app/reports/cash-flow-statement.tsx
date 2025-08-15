
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


export default function CashFlowStatement() {
    const { cashBalances } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString());
    }, []);

    // This is a simplified version. A real indirect method cash flow is very complex.
    const openingBalance = 0; // Simplified
    const closingBalance = cashBalances.cash + cashBalances.bank + cashBalances.mobile;
    const netChange = closingBalance - openingBalance;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
                <CardDescription>For the period ending {currentDate} (Simplified)</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <ReportRow label="Cash Flows from Operating Activities" isBold />
                        <ReportRow label="Net Profit before Tax" value={0} isSub />
                        {/* Add adjustments here */}
                        <ReportRow label="Net Cash from Operations" value={0} isBold />
                        
                        <ReportRow label="Cash Flows from Investing Activities" isBold />
                        <ReportRow label="Purchase of PPE" value={0} isSub isNegative />
                        <ReportRow label="Net Cash from Investing" value={0} isBold />

                        <ReportRow label="Cash Flows from Financing Activities" isBold />
                        <ReportRow label="Proceeds from Loans" value={0} isSub />
                         <ReportRow label="Net Cash from Financing" value={0} isBold />

                    </TableBody>
                    <TableFooter>
                         <TableRow>
                            <TableCell>Net Increase/Decrease in Cash</TableCell>
                            <TableCell className="text-right">TSh {netChange.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Opening Cash Balance</TableCell>
                            <TableCell className="text-right">TSh {openingBalance.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow className="font-bold text-lg bg-muted">
                            <TableCell>Closing Cash Balance</TableCell>
                            <TableCell className="text-right">TSh {closingBalance.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
