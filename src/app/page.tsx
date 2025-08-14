
"use client"

import * as React from 'react'
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns"
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
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
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


type PaymentMethod = "Cash" | "Mobile" | "Bank" | "Credit";

interface Transaction {
    name: string;
    email: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Credit';
    date: Date;
    paymentMethod: PaymentMethod;
}


// Expanded dummy data with dates and payment methods
const allTransactions: Transaction[] = [
  { name: 'Liam Johnson', email: 'liam@example.com', amount: 250000, status: 'Paid', date: new Date('2024-05-20'), paymentMethod: 'Mobile' },
  { name: 'Olivia Smith', email: 'olivia@example.com', amount: 150000, status: 'Paid', date: new Date('2024-05-18'), paymentMethod: 'Cash' },
  { name: 'Noah Williams', email: 'noah@example.com', amount: 350000, status: 'Credit', date: new Date('2024-05-15'), paymentMethod: 'Credit' },
  { name: 'Emma Brown', email: 'emma@example.com', amount: 450000, status: 'Paid', date: new Date('2024-05-12'), paymentMethod: 'Bank' },
  { name: 'James Jones', email: 'james@example.com', amount: 550000, status: 'Paid', date: new Date('2024-05-10'), paymentMethod: 'Mobile' },
  { name: 'Ava Garcia', email: 'ava@example.com', amount: 200000, status: 'Paid', date: new Date('2024-04-25'), paymentMethod: 'Cash' },
  { name: 'Isabella Miller', email: 'isabella@example.com', amount: 175000, status: 'Paid', date: new Date('2024-04-22'), paymentMethod: 'Bank' },
  { name: 'Sophia Davis', email: 'sophia@example.com', amount: 320000, status: 'Credit', date: new Date('2024-04-18'), paymentMethod: 'Credit' },
  { name: 'Mia Rodriguez', email: 'mia@example.com', amount: 500000, status: 'Paid', date: new Date('2024-04-11'), paymentMethod: 'Mobile' },
  { name: 'Lucas Wilson', email: 'lucas@example.com', amount: 600000, status: 'Paid', date: new Date('2024-03-30'), paymentMethod: 'Bank' },
  { name: 'Henry Moore', email: 'henry@example.com', amount: 75000, status: 'Paid', date: new Date('2023-12-15'), paymentMethod: 'Cash' },
  { name: 'Grace Taylor', email: 'grace@example.com', amount: 95000, status: 'Paid', date: new Date('2023-11-05'), paymentMethod: 'Mobile' },
];

const allChartData = [
  { month: 'Jan', sales: 1860000 },
  { month: 'Feb', sales: 3050000 },
  { month: 'Mar', sales: 2370000 },
  { month: 'Apr', sales: 730000 },
  { month: 'May', sales: 2090000 },
  { month: 'Jun', sales: 2140000 },
  { month: 'Jul', sales: 2860000 },
  { month: 'Aug', sales: 3250000 },
  { month: 'Sep', sales: 2570000 },
  { month: 'Oct', sales: 1730000 },
  { month: 'Nov', sales: 2990000 },
  { month: 'Dec', sales: 2540000 },
];

const allProducts = [
    { id: 'PROD-001', name: 'Mchele (Super)', initialStock: 100, currentStock: 80, entryDate: new Date('2024-04-01') },
    { id: 'PROD-002', name: 'Unga wa Ngano (Azam)', initialStock: 200, currentStock: 150, entryDate: new Date('2024-03-15') },
    { id: 'PROD-003', name: 'Mafuta ya Alizeti (Korie)', initialStock: 50, currentStock: 45, entryDate: new Date('2024-01-10') },
    { id: 'PROD-004', name: 'Sabuni ya Maji (Klin)', initialStock: 120, currentStock: 70, entryDate: new Date('2024-02-05') },
    { id: 'PROD-005', name: 'Sukari (Kilombero)', initialStock: 300, currentStock: 100, entryDate: new Date('2024-05-01') },
    { id: 'PROD-006', name: 'Nido Milk Powder', initialStock: 80, currentStock: 75, entryDate: new Date('2023-11-20') },
];

const allProductSalesData = [
    { date: new Date('2024-05-20'), name: 'Mchele', sales: 45000 },
    { date: new Date('2024-05-20'), name: 'Unga', sales: 30000 },
    { date: new Date('2024-05-18'), name: 'Sukari', sales: 60000 },
    { date: new Date('2024-05-15'), name: 'Mafuta', sales: 85000 },
    { date: new Date('2024-05-12'), name: 'Sabuni', sales: 20000 },
    { date: new Date('2024-04-25'), name: 'Mchele', sales: 50000 },
    { date: new Date('2024-04-22'), name: 'Unga', sales: 35000 },
    { date: new Date('2024-04-18'), name: 'Nido', sales: 75000 },
    { date: new Date('2024-04-11'), name: 'Sukari', sales: 55000 },
    { date: new Date('2024-03-30'), name: 'Mchele', sales: 90000 },
    { date: new Date('2024-03-15'), name: 'Unga', sales: 40000 },
];

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

interface DashboardData {
  totalRevenue: number;
  newCustomers: number;
  sales: number;
  inventoryValue: number;
  recentTransactions: Transaction[];
  chartData: typeof allChartData;
  slowMovingProducts: SlowMovingProduct[];
  paymentBreakdown: PaymentBreakdown;
  productSales: ProductSales[];
}

export default function DashboardPage() {
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
      recentTransactions: [],
      chartData: [],
      slowMovingProducts: [],
      paymentBreakdown: { cash: 0, mobile: 0, bank: 0, credit: 0 },
      productSales: []
    });

    React.useEffect(() => {
        const fromDate = date?.from || startOfMonth(new Date());
        const toDate = date?.to || endOfMonth(new Date());

        const filteredTransactions = allTransactions.filter(t => t.date >= fromDate && t.date <= toDate);
        
        const totalRevenue = filteredTransactions.reduce((acc, t) => acc + (t.status === 'Paid' ? t.amount : 0), 0);
        const sales = filteredTransactions.length;
        const newCustomers = new Set(filteredTransactions.map(t => t.email)).size;

        const paymentBreakdown = filteredTransactions.reduce((acc, t) => {
            if (t.paymentMethod === 'Cash') acc.cash += t.amount;
            if (t.paymentMethod === 'Mobile') acc.mobile += t.amount;
            if (t.paymentMethod === 'Bank') acc.bank += t.amount;
            if (t.paymentMethod === 'Credit') acc.credit += t.amount;
            return acc;
        }, { cash: 0, mobile: 0, bank: 0, credit: 0 });

        const fromMonth = fromDate.getMonth();
        const toMonth = toDate.getMonth();
        const fromYear = fromDate.getFullYear();
        
        const filteredChartData = allChartData.filter((d, index) => {
            const monthDate = new Date(`${fromYear}-${index + 1}-01`);
            return monthDate >= startOfMonth(fromDate) && monthDate <= endOfMonth(toDate);
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

        const filteredProductSales = allProductSalesData.filter(p => p.date >= fromDate && p.date <= toDate);
        const productSalesSummary = filteredProductSales.reduce((acc, current) => {
            const existingProduct = acc.find(p => p.name === current.name);
            if (existingProduct) {
                existingProduct.sales += current.sales;
            } else {
                acc.push({ name: current.name, sales: current.sales });
            }
            return acc;
        }, [] as ProductSales[]);


        setDashboardData({
            totalRevenue,
            newCustomers,
            sales,
            inventoryValue: 120483200,
            recentTransactions: filteredTransactions.slice(0, 5),
            chartData: filteredChartData.length > 0 ? filteredChartData : allChartData.slice(fromMonth, toMonth + 1),
            slowMovingProducts: slowMovingProducts,
            paymentBreakdown,
            productSales: productSalesSummary
        });

    }, [date]);

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
              transactions in the period
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
              Breakdown of sales by payment method for the selected period.
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
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-xl font-bold">TSh {dashboardData.paymentBreakdown.credit.toLocaleString()}</p>
                </div>
            </div>
          </CardContent>
        </Card>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Showing transactions for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentTransactions.length > 0 ? dashboardData.recentTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{transaction.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {transaction.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                           transaction.status === 'Paid' ? 'default' : 'secondary'
                        }
                        className={cn(
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
            <CardDescription>An overview of your monthly sales.</CardDescription>
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
                    tickFormatter={(value) => `TSh ${Math.floor(value / 1000000)}M`}
                  />
                  <Tooltip
                    content={<ChartTooltipContent formatter={(value, name) => [`TSh ${Number(value).toLocaleString()}`, "Sales"]}/>}
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
                            <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
    </div>
  )
}

    