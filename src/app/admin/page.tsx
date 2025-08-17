
'use client'

import * as React from 'react'
import {
  MoreHorizontal,
  Search,
  CheckCircle,
  PauseCircle,
  Trash2,
  User,
  Shield,
  XCircle
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type CustomerStatus = 'Active' | 'Suspended'
type PaymentStatus = 'Paid' | 'Unpaid'

interface AdminCustomer {
  id: string
  name: string
  phone: string
  joinedDate: Date
  accountStatus: CustomerStatus
  paymentStatus: PaymentStatus
}

const initialCustomers: AdminCustomer[] = [
  {
    id: 'cust_001',
    name: 'Juma Kondo Supplies',
    phone: '0712345678',
    joinedDate: new Date('2024-05-01'),
    accountStatus: 'Active',
    paymentStatus: 'Paid',
  },
  {
    id: 'cust_002',
    name: 'Mariam\'s Boutique',
    phone: '0755123456',
    joinedDate: new Date('2024-04-15'),
    accountStatus: 'Active',
    paymentStatus: 'Unpaid',
  },
  {
    id: 'cust_003',
    name: 'Kilimo Fresh Farm',
    phone: '0688987654',
    joinedDate: new Date('2024-02-20'),
    accountStatus: 'Suspended',
    paymentStatus: 'Unpaid',
  },
   {
    id: 'cust_004',
    name: 'Pwani Hardware',
    phone: '0784112233',
    joinedDate: new Date('2024-06-10'),
    accountStatus: 'Active',
    paymentStatus: 'Paid',
  },
]

export default function AdminPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = React.useState<AdminCustomer[]>(initialCustomers)
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleStatusChange = (id: string, newStatus: CustomerStatus) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, accountStatus: newStatus } : c))
    toast({
      title: 'Account Status Updated',
      description: `The customer's account has been set to ${newStatus}.`,
    })
  }
  
  const handlePaymentMark = (id: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, paymentStatus: 'Paid' } : c))
     toast({
      title: 'Payment Marked as Paid',
      description: `The customer has been marked as paid for the current cycle.`,
    })
  }

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id))
     toast({
      title: 'Customer Account Deleted',
      description: 'The customer account has been permanently deleted.',
      variant: 'destructive',
    })
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-primary"/>
              SaaS Admin Panel
            </CardTitle>
            <CardDescription>
              Manage all customer accounts and their subscription status.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-center">Account Status</TableHead>
                  <TableHead className="text-center">Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                         <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                                <User/>
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium whitespace-nowrap">{customer.name}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">{customer.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell className="whitespace-nowrap">
                        {customer.joinedDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={customer.accountStatus === 'Active' ? 'default' : 'secondary'}
                         className={cn(
                            customer.accountStatus === 'Active' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
                            customer.accountStatus === 'Suspended' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30'
                          )}
                        >
                          {customer.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant={customer.paymentStatus === 'Paid' ? 'default' : 'outline'}>
                          {customer.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                                disabled={customer.paymentStatus === 'Paid'}
                                onClick={() => handlePaymentMark(customer.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            {customer.accountStatus === 'Active' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(customer.id, 'Suspended')}
                              >
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Suspend Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(customer.id, 'Active')}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reactivate Account
                              </DropdownMenuItem>
                            )}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action is permanent and cannot be undone. This will permanently delete the customer's account and all their data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
