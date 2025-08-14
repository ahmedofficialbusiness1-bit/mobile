
'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, WalletCards, CheckCircle, Trash2 } from 'lucide-react'

// --- Mock Data (Same as Dashboard for consistency) ---

interface Receivable {
    id: string;
    name: string;
    phone: string;
    amount: number;
    product: string;
    date: Date;
}

interface Payable {
    id: string;
    supplierName: string;
    product: string;
    amount: number;
    date: Date;
}

interface Prepayment {
    id: string;
    customerName: string;
    phone: string;
    prepaidAmount: number;
}

const initialReceivables: Receivable[] = [
  { id: 'rec-001', name: 'Noah Williams', phone: '+255688990011', amount: 60000, product: 'Sukari', date: new Date('2024-05-18') },
  { id: 'rec-002', name: 'Sophia Davis', phone: '+255677889900', amount: 75000, product: 'Nido', date: new Date('2024-04-18') },
  { id: 'rec-003', name: 'Charlotte Thomas', phone: '+255787456123', amount: 21000, product: 'Mafuta', date: new Date('2023-09-22')},
];

const initialPayables: Payable[] = [
    { id: 'pay-001', supplierName: "Azam Mills", product: "Unga wa Ngano (50kg)", amount: 2500000, date: new Date("2024-05-10")},
    { id: 'pay-002', supplierName: "Kilombero Sugar", product: "Sukari (20 bags)", amount: 1800000, date: new Date("2024-05-02")},
    { id: 'pay-003', supplierName: "Korie Oils", product: "Mafuta ya Alizeti (100L)", amount: 3200000, date: new Date("2024-04-28")},
];

const initialPrepayments: Prepayment[] = [
    { id: 'pre-001', customerName: "Asha Bakari", phone: "+255712112233", prepaidAmount: 15000 },
    { id: 'pre-002', customerName: "John Okello", phone: "+255756445566", prepaidAmount: 50000 },
    { id: 'pre-003', customerName: "Fatuma Said", phone: "+255688776655", prepaidAmount: 22500 },
];

export default function FinancePage() {
    const [receivables, setReceivables] = React.useState(initialReceivables)
    const [payables, setPayables] = React.useState(initialPayables)
    const [prepayments, setPrepayments] = React.useState(initialPrepayments)

    const totalReceivable = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalPayable = payables.reduce((sum, item) => sum + item.amount, 0);
    const totalPrepayment = prepayments.reduce((sum, item) => sum + item.prepaidAmount, 0);

    const handleMarkAsPaid = (id: string, type: 'receivable' | 'payable') => {
        if (type === 'receivable') {
            setReceivables(receivables.filter(item => item.id !== id))
        } else {
            setPayables(payables.filter(item => item.id !== id))
        }
        // In a real app, you'd show a success toast here.
    }
    
    const handleUsePrepayment = (id: string) => {
        setPrepayments(prepayments.filter(item => item.id !== id))
        // In a real app, you'd show a success toast here.
    }


  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Finance Management
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Track and manage your company's financial health, from debts to customer deposits.
        </p>
      </div>

      <Tabs defaultValue="receivable" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receivable">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="payable">Accounts Payable</TabsTrigger>
          <TabsTrigger value="prepaid">Customer Deposits</TabsTrigger>
        </TabsList>

        <TabsContent value="receivable">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-red-500" />
                        Accounts Receivable
                    </CardTitle>
                    <CardDescription>
                        Customers you have sold to on credit. Click 'Mark as Paid' once they settle their debt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receivables.length > 0 ? (
                                receivables.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">{item.phone}</div>
                                        </TableCell>
                                        <TableCell>{item.product}</TableCell>
                                        <TableCell>{item.date.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">TSh {item.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(item.id, 'receivable')}>
                                                <CheckCircle className="mr-2 h-4 w-4"/>
                                                Mark as Paid
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No outstanding credits. All customers have paid.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="font-bold text-lg">Total Receivable</TableCell>
                                <TableCell className="text-right font-bold text-lg">TSh {totalReceivable.toLocaleString()}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="payable">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-6 w-6 text-green-500" />
                        Accounts Payable
                    </CardTitle>
                    <CardDescription>
                        Suppliers you have purchased from on credit. Click 'Mark as Paid' once you settle the debt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payables.length > 0 ? (
                                payables.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell><div className="font-medium">{item.supplierName}</div></TableCell>
                                        <TableCell>{item.product}</TableCell>
                                        <TableCell>{item.date.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">TSh {item.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(item.id, 'payable')}>
                                                <CheckCircle className="mr-2 h-4 w-4"/>
                                                Mark as Paid
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No outstanding payables. All suppliers have been paid.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="font-bold text-lg">Total Payable</TableCell>
                                <TableCell className="text-right font-bold text-lg">TSh {totalPayable.toLocaleString()}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="prepaid">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <WalletCards className="h-6 w-6 text-blue-500" />
                        Customer Deposits (Prepaid)
                    </CardTitle>
                    <CardDescription>
                        Customers with a prepaid balance. This balance is automatically used on their next order, or you can manually mark it as refunded.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Prepaid Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prepayments.length > 0 ? (
                                prepayments.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.customerName}</div>
                                            <div className="text-sm text-muted-foreground">{item.phone}</div>
                                        </TableCell>
                                        <TableCell className="text-right">TSh {item.prepaidAmount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleUsePrepayment(item.id)}>
                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                Mark as Used/Refunded
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No customer deposits found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold text-lg">Total Deposits</TableCell>
                                <TableCell className="text-right font-bold text-lg">TSh {totalPrepayment.toLocaleString()}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
