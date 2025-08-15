
'use client'

import * as React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, Printer } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import ProfitLossStatement from './profit-loss-statement'
import BalanceSheet from './balance-sheet'
import CashFlowStatement from './cash-flow-statement'
import ExpensesReport from './expenses-report'
import SalesReport from './sales-report'

export default function ReportsPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-left no-print">
        <h1 className="text-3xl font-bold font-headline">
          Financial Reports
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Analyze your business performance with comprehensive financial statements.
        </p>
      </div>

       <div className="flex flex-col md:flex-row gap-4 justify-between items-center no-print">
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
          <PopoverContent className="w-auto p-0" align="start">
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
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
        </Button>
      </div>

      <Tabs defaultValue="pnl" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto no-print">
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <div className="printable-area">
            <TabsContent value="pnl">
              <ProfitLossStatement dateRange={date} />
            </TabsContent>
            <TabsContent value="balance-sheet">
              <BalanceSheet dateRange={date} />
            </TabsContent>
            <TabsContent value="cash-flow">
              <CashFlowStatement dateRange={date} />
            </TabsContent>
            <TabsContent value="expenses">
              <ExpensesReport dateRange={date} />
            </TabsContent>
            <TabsContent value="sales">
              <SalesReport dateRange={date} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
