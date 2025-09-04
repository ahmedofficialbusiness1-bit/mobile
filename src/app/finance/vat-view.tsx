
'use client'

import * as React from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth, addDays, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Edit } from 'lucide-react'
import { useFinancials, Transaction } from '@/context/financial-context'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VatAdjustmentDialog } from './vat-adjustment-dialog'
import type { VatRate } from '@/app/sales/sale-form'

export default function VatView() {
    const { transactions, adjustTransactionVat } = useFinancials()
    const { toast } = useToast()

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    })
    const [selectedPreset, setSelectedPreset] = React.useState<string>("month")

    const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const now = new Date();
        switch (value) {
            case 'today': setDate({ from: now, to: now }); break;
            case 'week': setDate({ from: startOfWeek(now), to: endOfWeek(now) }); break;
            case 'month': setDate({ from: startOfMonth(now), to: endOfMonth(now) }); break;
            case 'year': setDate({ from: startOfYear(now), to: endOfYear(now) }); break;
            case 'all': setDate({ from: new Date('2020-01-01'), to: endOfYear(addDays(now, 1)) }); break;
        }
    }

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t =>
            date?.from && date?.to && isWithinInterval(t.date, { start: date.from, end: addDays(date.to, 1) }) && t.productId !== 'invoice'
        )
    }, [transactions, date])

    const handleOpenDialog = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setDialogOpen(true)
    }

    const handleSaveVat = async (transactionId: string, newVatRate: VatRate) => {
        try {
            await adjustTransactionVat(transactionId, newVatRate);
            toast({
                title: "VAT Adjusted Successfully",
                description: "The transaction's net and VAT amounts have been updated.",
            });
            setDialogOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Error Adjusting VAT",
                description: error.message,
            });
        }
    }
    
    const totals = filteredTransactions.reduce((acc, t) => {
        acc.gross += t.amount;
        acc.net += t.netAmount;
        acc.vat += t.vatAmount;
        return acc;
    }, { gross: 0, net: 0, vat: 0 });

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>VAT Management</CardTitle>
                            <CardDescription>
                                Adjust VAT for sales transactions. Changes will reflect in all financial reports.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal md:w-[260px]", !date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2}/>
                                </PopoverContent>
                            </Popover>
                            <Select value={selectedPreset} onValueChange={handlePresetChange}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Select a preset" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Gross Amount</TableHead>
                                    <TableHead className="text-right">VAT Amount</TableHead>
                                    <TableHead className="text-right">Net Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium whitespace-nowrap">{item.name}</div>
                                                <div className="text-sm text-muted-foreground">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{item.product}</TableCell>
                                            <TableCell className="whitespace-nowrap">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap font-semibold">TSh {item.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.vatAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">TSh {item.netAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>
                                                    <Edit className="mr-2 h-3 w-3" />
                                                    Adjust
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No sales transactions for the selected period.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold text-lg bg-muted">
                                    <TableCell colSpan={3}>Filtered Totals</TableCell>
                                    <TableCell className="text-right">TSh {totals.gross.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">TSh {totals.vat.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                                    <TableCell className="text-right">TSh {totals.net.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <VatAdjustmentDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSaveVat}
                transaction={selectedTransaction}
            />
        </>
    )
}
