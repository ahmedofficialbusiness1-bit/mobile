
"use client"

import * as React from 'react'
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  DollarSign,
  Users,
  CreditCard,
  Package,
  Calendar as CalendarIcon,
  Archive,
  Landmark,
  Smartphone,
  Wallet,
  BarChart2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useFinancials, Transaction, Payable, CustomerPrepayment } from '@/context/financial-context'


interface SlowMovingProduct {
    id: string;
    name: string;
    entryDate: Date;
    soldPercentage: number;
}

interface PaymentBreakdown {
    cash: number;
    mobile: number;
    bank: number;
    credit: number;
}

interface ProductSales {
    name: string;
    sales: number;
}

interface ChartData {
    month: string;
    sales: number;
}

interface DashboardData {
  totalRevenue: number;
  newCustomers: number;
  sales: number;
  inventoryValue: number;
  transactions: Transaction[];
  chartData: ChartData[];
  slowMovingProducts: SlowMovingProduct[];
  paymentBreakdown: PaymentBreakdown;
  productSales: ProductSales[];
  accountsReceivable: Transaction[];
  accountsPayable: Payable[];
  customerPrepayments: CustomerPrepayment[];
  totalReceivable: number;
  totalPayable: number;
  totalPrepayments: number;
}

export default function DashboardPage() {
    const { transactions: allTransactions, payables: allPayables, prepayments: allPrepayments, products: allProducts } = useFinancials();

    const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    })
    const [selectedPreset, setSelectedPreset] = React.useState<string>("month");
    const [dashboardData, setDashboardData] = React.useState<DashboardData>({
      totalRevenue: 0,
      newCustomers: 0,
      sales: 0,
      inventoryValue: 120483200,
      transactions: [],
      chartData: [],
      slowMovingProducts: [],
      paymentBreakdown: { cash: 0, mobile: 0, bank: 0, credit: 0 },
      productSales: [],
      accountsReceivable: [],
      accountsPayable: [],
      customerPrepayments: [],
      totalReceivable: 0,
      totalPayable: 0,
      totalPrepayments: 0,
    });

    React.useEffect(() => {
        const fromDate = date?.from;
        const toDate = date?.to;

        if (!fromDate || !toDate) {
            return;
        }

        const filteredTransactions = allTransactions.filter(t => isWithinInterval(t.date, { start: fromDate, end: toDate }));
        const originalSalesTransactions = filteredTransactions.filter(t => !t.notes?.includes('Debt Repayment'));

        const totalRevenue = filteredTransactions.reduce((acc, t) => acc + (t.status === 'Paid' ? t.amount : 0), 0);
        const sales = originalSalesTransactions.length;
        
        // New customers are only counted from original sales, not debt repayments
        const customerPhonesInPeriod = new Set(originalSalesTransactions.map(t => t.phone));
        // Get all customer phones from before the period to check if they are new
        const pastTransactions = allTransactions.filter(t => t.date < fromDate);
        const pastCustomerPhones = new Set(pastTransactions.map(t => t.phone));
        const newCustomers = Array.from(customerPhonesInPeriod).filter(phone => !pastCustomerPhones.has(phone)).length;

        const paymentBreakdown = filteredTransactions.reduce((acc, t) => {
            if (t.status === 'Paid') {
                if (t.paymentMethod === 'Cash') acc.cash += t.amount;
                if (t.paymentMethod === 'Mobile') acc.mobile += t.amount;
                if (t.paymentMethod === 'Bank') acc.bank += t.amount;
            }
            return acc;
        }, { cash: 0, mobile: 0, bank: 0, credit: 0 });
        
        const creditTotal = allTransactions
          .filter(t => t.status === 'Credit')
          .reduce((sum, t) => sum + t.amount, 0);

        paymentBreakdown.credit = creditTotal;

        const monthlySales = filteredTransactions
          .filter(t => t.status === 'Paid')
          .reduce((acc, t) => {
            const monthKey = format(t.date, 'MMM yy');
            if (!acc[monthKey]) {
              acc[monthKey] = { month: monthKey, sales: 0 };
            }
            acc[monthKey].sales += t.amount;
            return acc;
          }, {} as Record<string, ChartData>);
        
        const chartData = Object.values(monthlySales).sort((a,b) => {
            const dateA = new Date(a.month.split(" ")[1], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(a.month.split(" ")[0]));
            const dateB = new Date(b.month.split(" ")[1], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(b.month.split(" ")[0]));
            return dateA.getTime() - dateB.getTime();
        });


        const threeMonthsAgo = subMonths(new Date(), 3);
        const slowMovingProducts = allProducts
            .filter(p => p.entryDate < threeMonthsAgo)
            .map(p => {
                const sold = p.initialStock - p.currentStock;
                const soldPercentage = (sold / p.initialStock) * 100;
                return { ...p, soldPercentage };
            })
            .filter(p => p.soldPercentage < 50)
            .sort((a, b) => a.soldPercentage - b.soldPercentage);

        const productSalesSummary = originalSalesTransactions
            .filter(t => t.status === 'Paid' || t.status === 'Credit')
            .reduce((acc, current) => {
                const existingProduct = acc.find(p => p.name === current.product);
                if (existingProduct) {
                    existingProduct.sales += current.amount;
                } else {
                    acc.push({ name: current.product, sales: current.amount });
                }
                return acc;
            }, [] as ProductSales[]);

        const accountsReceivable = allTransactions
            .filter(t => t.status === 'Credit')
            .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        const totalReceivable = accountsReceivable.reduce((acc, item) => acc + item.amount, 0);
            
        const accountsPayable = allPayables.sort((a, b) => b.date.getTime() - a.date.getTime());

        const totalPayable = accountsPayable.reduce((acc, item) => acc + item.amount, 0);
        
        const customerPrepayments = allPrepayments.sort((a, b) => b.prepaidAmount - a.prepaidAmount);
        
        const totalPrepayments = customerPrepayments.reduce((acc, item) => acc + item.prepaidAmount, 0);

        setDashboardData({
            totalRevenue,
            newCustomers,
            sales,
            inventoryValue: 120483200,
            transactions: filteredTransactions.sort((a,b) => b.date.getTime() - a.date.getTime()),
            chartData,
            slowMovingProducts: slowMovingProducts,
            paymentBreakdown,
            productSales: productSalesSummary,
            accountsReceivable,
            accountsPayable,
            customerPrepayments,
            totalReceivable,
            totalPayable,
            totalPrepayments,
        });

    }, [date, allTransactions, allPayables, allPrepayments, allProducts]);

    const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const now = new Date();
        switch (value) {
            case 'today':
                setDate({ from: now, to: now });
                break;
            case 'last7':
                setDate({ from: addDays(now, -6), to: now });
                break;
            case 'month':
                setDate({ from: startOfMonth(now), to: endOfMonth(now) });
                break;
            case 'lastMonth':
                const lastMonth = subMonths(now, 1);
                setDate({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
                break;
            case 'year':
                setDate({ from: startOfYear(now), to: endOfYear(now) });
                break;
            case 'all':
                // A reasonable "all time" start date
                setDate({ from: new Date('2023-01-01'), to: endOfYear(now) });
                break;
        }
    }


  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-2">
         <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
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
                <span>Pick a date</span>
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
         <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSh {dashboardData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              for the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardData.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              in the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardData.sales}</div>
            <p className="text-xs text-muted-foreground">
              new transactions in the period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSh {dashboardData.inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              current value
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Sales Breakdown</CardTitle>
            <CardDescription>
              Breakdown of total sales by payment method. Credit is total outstanding debt.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-4">
                <div className="p-2 bg-background rounded-md">
                    <Wallet className="h-6 w-6 text-green-600"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Cash</p>
                    <p className="text-xl font-bold">TSh {dashboardData.paymentBreakdown.cash.toLocaleString()}</p>
                </div>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-4">
                <div className="p-2 bg-background rounded-md">
                    <Smartphone className="h-6 w-6 text-blue-600"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Mobile Money</p>
                    <p className="text-xl font-bold">TSh {dashboardData.paymentBreakdown.mobile.toLocaleString()}</p>
                </div>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-4">
                <div className="p-2 bg-background rounded-md">
                    <Landmark className="h-6 w-6 text-purple-600"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="text-xl font-bold">TSh {dashboardData.paymentBreakdown.bank.toLocaleString()}</p>
                </div>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-4">
                <div className="p-2 bg-background rounded-md">
                    <CreditCard className="h-6 w-6 text-orange-600"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Credits</p>
                    <p className="text-xl font-bold">TSh {dashboardData.paymentBreakdown.credit.toLocaleString()}</p>
                </div>
            </div>
          </CardContent>
        </Card>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Showing all transactions for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.transactions.length > 0 ? dashboardData.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {transaction.phone}
                      </div>
                    </TableCell>
                     <TableCell>
                        <div className="font-medium">{transaction.notes || transaction.product}</div>
                        <Badge
                        variant={
                           transaction.status === 'Paid' ? 'default' : 'secondary'
                        }
                        className={cn('mt-1',
                           transaction.status === 'Paid' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
                           transaction.status === 'Credit' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30',
                        )}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      +TSh {transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                        No transactions for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>An overview of your monthly revenue for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={{
                sales: {
                  label: "Sales",
                  color: "hsl(var(--primary))",
                },
              }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.chartData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `TSh ${Math.floor(Number(value) / 1000)}k`}
                  />
                  <Tooltip
                    content={<ChartTooltipContent formatter={(value) => `TSh ${Number(value).toLocaleString()}`}/>}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-muted-foreground" />
                Slow-Moving Products
            </CardTitle>
            <CardDescription>
              Products in stock for over 3 months with less than 50% sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stocked On</TableHead>
                  <TableHead className="text-right w-[150px]">Sold Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.slowMovingProducts.length > 0 ? (
                  dashboardData.slowMovingProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {product.id}
                        </div>
                      </TableCell>
                      <TableCell>{format(product.entryDate, 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">{product.soldPercentage.toFixed(1)}%</span>
                            <Progress value={product.soldPercentage} className="h-2 w-20" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No slow-moving products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-muted-foreground"/>
                    Product Sales
                </CardTitle>
                <CardDescription>
                    Total sales per product for the selected period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    sales: {
                      label: "Sales",
                      color: "hsl(var(--chart-2))",
                    },
                  }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.productSales} layout="vertical">
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `TSh ${Number(value)/1000}k`}/>
                            <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                            <Tooltip
                                content={<ChartTooltipContent formatter={(value, name) => [`TSh ${Number(value).toLocaleString()}`, "Sales"]}/>}
                                cursor={{ fill: 'hsl(var(--muted))' }}
                            />
                            <Bar dataKey="sales" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                        Accounts Receivable
                    </CardTitle>
                    <CardDescription>
                        List of customers who you have sold to on credit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardData.accountsReceivable.length > 0 ? (
                                dashboardData.accountsReceivable.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">{item.phone}</div>
                                        </TableCell>
                                        <TableCell>{item.product}</TableCell>
                                        <TableCell className="text-right">TSh {item.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No outstanding credits.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">TSh {dashboardData.totalReceivable.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-green-500" />
                        Accounts Payable
                    </CardTitle>
                    <CardDescription>
                        List of suppliers you have purchased from on credit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardData.accountsPayable.length > 0 ? (
                                dashboardData.accountsPayable.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.supplierName}</div>
                                        </TableCell>
                                        <TableCell>{item.product}</TableCell>
                                        <TableCell className="text-right">TSh {item.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No outstanding payables.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">TSh {dashboardData.totalPayable.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <WalletCards className="h-5 w-5 text-blue-500" />
                        Customer Deposits
                    </CardTitle>
                    <CardDescription>
                        List of customers with a prepaid balance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Prepaid Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardData.customerPrepayments.length > 0 ? (
                                dashboardData.customerPrepayments.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.customerName}</div>
                                             <div className="text-sm text-muted-foreground">{item.phone}</div>
                                        </TableCell>
                                        <TableCell className="text-right">TSh {item.prepaidAmount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No customer deposits found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">TSh {dashboardData.totalPrepayments.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

    