
'use client'

import * as React from 'react'
import { PlusCircle, MoreHorizontal, DollarSign, Users, CreditCard } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFinancials, type Transaction } from '@/context/financial-context'
import { format } from 'date-fns'
import { SaleForm, type SaleFormData } from './sale-form'
import { useToast } from '@/hooks/use-toast'

export default function SalesPage() {
  const { transactions, products, addSale, cashBalances } = useFinancials()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const { toast } = useToast()

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
  const todaySales = transactions.filter(t => format(t.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length
  const creditSales = transactions.filter(t => t.status === 'Credit').length

  const handleSaveSale = (data: SaleFormData) => {
    try {
        addSale(data);
        toast({
            title: 'Sale Recorded Successfully',
            description: `A sale of ${data.quantity} x ${data.productName} has been recorded.`,
        });
        setIsFormOpen(false);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Recording Sale',
            description: error.message,
        })
    }
  }

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Sales Management
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Track and manage all your sales activities from a single place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">TSh {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">All time sales revenue</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
                <CreditCard className="h-5 w-5 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">+{todaySales}</p>
                 <p className="text-xs text-muted-foreground">transactions recorded today</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Credits</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{creditSales}</p>
                 <p className="text-xs text-muted-foreground">customers on credit</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>
                    A log of all sales transactions recorded in the system.
                </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Sale
            </Button>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {transactions.length > 0 ? (
                    transactions.map((sale) => (
                    <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.name}</TableCell>
                        <TableCell>{sale.product}</TableCell>
                        <TableCell>{format(sale.date, 'PPP')}</TableCell>
                        <TableCell>
                            <Badge variant={sale.status === 'Paid' ? 'default' : 'secondary'}>
                                {sale.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        TSh {sale.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Generate Receipt</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No sales recorded yet.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
      </Card>
    </div>
    <SaleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSale}
        products={products}
    />
    </>
  )
}
