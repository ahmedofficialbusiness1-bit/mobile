
'use client'

import * as React from 'react'
import { format, isWithinInterval, startOfMonth, endOfMonth, addDays, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon, ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useFinancials } from '@/context/financial-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'


interface JournalEntry {
  id: string; 
  type: 'transaction' | 'expense' | 'capital' | 'payroll';
  rawId: string; // The original ID from the source collection
  date: Date
  description: string
  debit?: number // Money out
  credit?: number // Money in
}

export default function JournalView() {
  const { transactions, expenses, capitalContributions, payrollHistory, deleteSale, deleteExpense, deleteCapitalContribution } = useFinancials()
  const { toast } = useToast()
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [selectedPreset, setSelectedPreset] = React.useState<string>("month");

  const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const now = new Date();
        switch (value) {
            case 'today':
                setDate({ from: now, to: now });
                break;
            case 'week':
                setDate({ from: startOfWeek(now), to: endOfWeek(now) });
                break;
            case 'month':
                setDate({ from: startOfMonth(now), to: endOfMonth(now) });
                break;
            case 'year':
                setDate({ from: startOfYear(now), to: endOfYear(now) });
                break;
            case 'all':
                setDate({ from: new Date('2020-01-01'), to: endOfYear(addDays(now, 1)) });
                break;
        }
    }


  const journalEntries: JournalEntry[] = React.useMemo(() => {
    const allEntries: JournalEntry[] = []

    // Credits (Money In)
    transactions.filter(t => t.status === 'Paid').forEach(t => {
      allEntries.push({ id: `t-${t.id}`, type: 'transaction', rawId: t.id, date: t.date, description: `Sale: ${t.product} to ${t.name}`, credit: t.amount })
    })
    capitalContributions.filter(c => c.type === 'Cash' || c.type === 'Bank').forEach(c => {
      allEntries.push({ id: `c-${c.id}`, type: 'capital', rawId: c.id, date: c.date, description: `Capital: ${c.description}`, credit: c.amount })
    })

    // Debits (Money Out)
    expenses.filter(e => e.status === 'Approved').forEach(e => {
      allEntries.push({ id: `e-${e.id}`, type: 'expense', rawId: e.id, date: e.date, description: `Expense: ${e.description}`, debit: e.amount })
    })
     payrollHistory.forEach(p => {
        allEntries.push({ id: `p-${p.id}`, type: 'payroll', rawId: p.id, date: p.date, description: `Payroll for ${p.month}`, debit: p.netSalary })
    })


    return allEntries.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [transactions, expenses, capitalContributions, payrollHistory])

  const filteredEntries = journalEntries.filter(entry => {
    if (!date?.from || !date?.to) return true
    return isWithinInterval(entry.date, { start: date.from, end: addDays(date.to, 1) }) // addDays to include the end date
  })
  
  const handleDeleteEntry = async (entry: JournalEntry) => {
    try {
        if (entry.type === 'transaction') {
            const saleToDelete = transactions.find(t => t.id === entry.rawId);
            if(saleToDelete) await deleteSale(saleToDelete.id);
        } else if (entry.type === 'expense') {
            const expenseToDelete = expenses.find(e => e.id === entry.rawId);
            if(expenseToDelete) await deleteExpense(expenseToDelete.id, { amount: expenseToDelete.amount, paymentMethod: expenseToDelete.paymentMethod! });
        } else if (entry.type === 'capital') {
            const capToDelete = capitalContributions.find(c => c.id === entry.rawId);
            if(capToDelete) await deleteCapitalContribution(capToDelete.id, capToDelete.type, capToDelete.amount);
        }
        toast({
            title: "Entry Deleted",
            description: "The journal entry has been deleted and balances reversed.",
            variant: "destructive"
        })
    } catch(error: any) {
        toast({
            title: "Error Deleting Entry",
            description: error.message,
            variant: "destructive"
        })
    }
  }


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
             <div className="flex items-center gap-2 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal md:w-[260px]",
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
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit (TSh)</TableHead>
                <TableHead className="text-right">Credit (TSh)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">{format(entry.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right text-red-600 font-mono">
                      {entry.debit ? entry.debit.toLocaleString() : '---'}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-mono">
                      {entry.credit ? entry.credit.toLocaleString() : '---'}
                    </TableCell>
                    <TableCell className="text-right">
                       {entry.type !== 'payroll' && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                               This action will permanently delete this journal entry and reverse the transaction. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteEntry(entry)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
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
                <TableCell></TableCell>
              </TableRow>
               <TableRow className="font-bold text-lg bg-muted">
                <TableCell colSpan={3}>Net Change</TableCell>
                <TableCell className="text-right font-mono" colSpan={2}>{(totalCredits - totalDebits).toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

    