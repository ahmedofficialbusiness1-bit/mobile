
'use client'

import * as React from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth, addDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useFinancials } from '@/context/financial-context'

interface JournalEntry {
  date: Date
  description: string
  debit?: number // Money out
  credit?: number // Money in
}

export default function JournalView() {
  const { transactions, expenses, capitalContributions, payrollHistory, payables } = useFinancials()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const journalEntries: JournalEntry[] = React.useMemo(() => {
    const allEntries: JournalEntry[] = []

    // Credits (Money In)
    transactions.filter(t => t.status === 'Paid').forEach(t => {
      allEntries.push({ date: t.date, description: `Sale: ${t.product} to ${t.name}`, credit: t.amount })
    })
    capitalContributions.filter(c => c.type !== 'Drawing').forEach(c => {
      allEntries.push({ date: c.date, description: `Capital: ${c.description}`, credit: c.amount })
    })

    // Debits (Money Out)
    expenses.filter(e => e.status === 'Approved').forEach(e => {
      allEntries.push({ date: e.date, description: `Expense: ${e.description}`, debit: e.amount })
    })
    capitalContributions.filter(c => c.type === 'Drawing').forEach(d => {
        allEntries.push({ date: d.date, description: `Drawing: ${d.description}`, debit: d.amount })
    })
    payrollHistory.forEach(p => {
        allEntries.push({ date: p.date, description: `Payroll for ${p.month}`, debit: p.totalNet })
    })
    payables.filter(p => p.status === 'Paid').forEach(p => {
        allEntries.push({ date: p.date, description: `Payable: ${p.product} to ${p.supplierName}`, debit: p.amount })
    })

    return allEntries.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [transactions, expenses, capitalContributions, payrollHistory, payables])

  const filteredEntries = journalEntries.filter(entry => {
    if (!date?.from || !date?.to) return true
    return isWithinInterval(entry.date, { start: date.from, end: addDays(date.to, 1) }) // addDays to include the end date
  })

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Transaction Journal</CardTitle>
                <CardDescription>A chronological record of all financial transactions.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal md:w-[300px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit (TSh)</TableHead>
                <TableHead className="text-right">Credit (TSh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">{format(entry.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right text-red-600 font-mono">
                      {entry.debit ? entry.debit.toLocaleString() : '---'}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-mono">
                      {entry.credit ? entry.credit.toLocaleString() : '---'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No transactions found for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold text-lg">
                <TableCell colSpan={2}>Totals</TableCell>
                <TableCell className="text-right text-red-600 font-mono">{totalDebits.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600 font-mono">{totalCredits.toLocaleString()}</TableCell>
              </TableRow>
               <TableRow className="font-bold text-lg bg-muted">
                <TableCell colSpan={3}>Net Change</TableCell>
                <TableCell className="text-right font-mono">{(totalCredits - totalDebits).toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
