
'use client'

import * as React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import ProfitLossStatement from './profit-loss-statement'
import BalanceSheet from './balance-sheet'
import CashFlowStatement from './cash-flow-statement'
import ExpensesReport from './expenses-report'
import SalesReport from './sales-report'

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Financial Reports
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Analyze your business performance with comprehensive financial statements.
        </p>
      </div>

      <Tabs defaultValue="pnl" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="pnl">
          <ProfitLossStatement />
        </TabsContent>
        <TabsContent value="balance-sheet">
          <BalanceSheet />
        </TabsContent>
        <TabsContent value="cash-flow">
          <CashFlowStatement />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpensesReport />
        </TabsContent>
        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
