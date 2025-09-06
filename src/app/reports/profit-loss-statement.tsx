
'use client'

import * as React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableFooter, TableHead, TableHeader } from '@/components/ui/table';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
    const { allTransactions, allExpenses, allProducts, allPurchaseOrders, companyName, activeShopId } = useFinancials();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-GB'));
    }, []);

    if (!allTransactions || !allExpenses || !allProducts || !allPurchaseOrders) {
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
    
    // Revenue (Net Sales)
    const revenue = transactionsForPeriod
        .filter(t => t.status === 'Paid' || t.status === 'Credit')
        .reduce((sum, t) => sum + t.netAmount, 0);

    // Cost of Goods Sold (COGS)
    const costOfSales = transactionsForPeriod
        .filter(t => t.productId !== 'invoice') // Exclude services/invoices from COGS
        .reduce((sum, t) => {
            const product = allProducts.find(p => p.id === t.productId);
            return sum + ((product?.purchasePrice || 0) * t.quantity);
        }, 0);

    // COGS Breakdown by product
    const cogsBreakdown = transactionsForPeriod
        .filter(t => t.productId !== 'invoice')
        .reduce((acc, t) => {
            const product = allProducts.find(p => p.id === t.productId);
            if (product) {
                if (!acc[product.name]) {
                    acc[product.name] = { productName: product.name, totalQuantity: 0, totalCost: 0 };
                }
                acc[product.name].totalQuantity += t.quantity;
                acc[product.name].totalCost += (product.purchasePrice || 0) * t.quantity;
            }
            return acc;
        }, {} as Record<string, { productName: string; totalQuantity: number; totalCost: number }>);

    const cogsBreakdownArray = Object.values(cogsBreakdown).sort((a,b) => b.totalCost - a.totalCost);

    // Gross Profit
    const grossProfit = revenue - costOfSales;

    // Operating Expenses
    const operatingExpenses = expensesForPeriod.reduce((sum, e) => sum + e.amount, 0);

    // Operating Profit
    const operatingProfit = grossProfit - operatingExpenses;

    // Other Income / Expenses
    const otherIncome = 0; // Placeholder
    const otherExpenses = 0; // Placeholder
    const ebit = operatingProfit + otherIncome - otherExpenses;

    // Finance Costs
    const financeCosts = 0; // Placeholder, can be calculated from interest expenses

    // Profit Before Tax
    const profitBeforeTax = ebit - financeCosts;
    
    // Tax (Assuming 30% corporate tax rate)
    const taxExpense = profitBeforeTax > 0 ? profitBeforeTax * 0.30 : 0; 
    
    // Net Profit
    const netProfit = profitBeforeTax - taxExpense;

    const chartData = [
        { name: 'Revenue', value: revenue },
        { name: 'Gross Profit', value: grossProfit },
        { name: 'Net Profit', value: netProfit },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{companyName}</CardTitle>
                <CardDescription>Profit and Loss Statement (Income Statement)</CardDescription>
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
                        <ReportRow label="Revenue (Net Sales)" value={revenue} isBold />
                        <TableRow>
                            <TableCell colSpan={2} className="p-0">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="cogs" className="border-b-0">
                                        <AccordionTrigger className="flex w-full justify-between p-4 font-normal hover:no-underline">
                                            <span>Cost of Goods Sold (COGS)</span>
                                            <span className="text-right text-red-600">TSh {costOfSales.toLocaleString()}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="border rounded-lg">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead className="text-right">Quantity Sold</TableHead>
                                                        <TableHead className="text-right">Cost</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {cogsBreakdownArray.map(item => (
                                                        <TableRow key={item.productName}>
                                                            <TableCell>{item.productName}</TableCell>
                                                            <TableCell className="text-right">{item.totalQuantity.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right">TSh {item.totalCost.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </TableCell>
                        </TableRow>
                        <ReportRow label="Gross Profit" value={grossProfit} isBold />
                        
                        <TableRow><TableCell colSpan={2}>&nbsp;</TableCell></TableRow>
                        
                        <ReportRow label="Operating Expenses" value={operatingExpenses} isNegative isBold />
                        <ReportRow label="Operating Profit (EBITDA)" value={operatingProfit} isBold />
                        
                        <TableRow><TableCell colSpan={2}>&nbsp;</TableCell></TableRow>

                        <ReportRow label="Finance Costs" value={financeCosts} isNegative />
                        <ReportRow label="Profit Before Tax" value={profitBeforeTax} isBold />
                        <ReportRow label="Tax Expense" value={taxExpense} isNegative />
                    </TableBody>
                    <TableFooter>
                       <ReportRow label="Net Profit for the Period" value={netProfit} isFooter />
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
