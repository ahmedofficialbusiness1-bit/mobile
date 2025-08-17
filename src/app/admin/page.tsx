
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
  XCircle,
  ExternalLink
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
import { useFinancials, type Customer } from '@/context/financial-context'

interface DisplayCustomer extends Customer {
    joinedDate: Date;
    accountStatus: 'Active' | 'Suspended';
    paymentStatus: 'Paid' | 'Unpaid';
}

export default function AdminPage() {
  const { toast } = useToast()
  const { customers, deleteCustomer } = useFinancials()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [displayCustomers, setDisplayCustomers] = React.useState<DisplayCustomer[]>([]);

  React.useEffect(() => {
     // This syncs the local display state when the context (from Firestore) changes
    setDisplayCustomers(customers.map(c => ({
        ...c,
        joinedDate: new Date(), // Dummy data for display
        accountStatus: 'Active', // Default status
        paymentStatus: 'Unpaid' // Default status
    })));
  }, [customers]);


  const handleStatusChange = (id: string, newStatus: 'Active' | 'Suspended') => {
    // In a real app, this should update a 'status' field in the customer's Firestore document.
    // For now, it only updates the local state.
    setDisplayCustomers(displayCustomers.map(c => c.id === id ? { ...c, accountStatus: newStatus } : c))
    toast({
      title: 'Account Status Updated',
      description: `The customer's account has been set to ${newStatus}. Please complete this action in the Firebase Console.`,
    })
  }
  
  const handlePaymentMark = (id: string) => {
    // In a real app, you would also update this in Firestore
    setDisplayCustomers(displayCustomers.map(c => c.id === id ? { ...c, paymentStatus: 'Paid' } : c))
     toast({
      title: 'Payment Marked as Paid',
      description: `The customer has been marked as paid for the current cycle.`,
    })
  }

  const handleDelete = (id: string) => {
    deleteCustomer(id);
     toast({
      title: 'Customer Record Deleted',
      description: 'The customer has been removed from the list. Please delete their account from the Firebase Console as well.',
      variant: 'destructive',
    })
  }

  const filteredCustomers = displayCustomers.filter(
    (customer) => {
        const nameMatch = customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = customer.phone && customer.phone.includes(searchTerm);
        return nameMatch || phoneMatch;
    }
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
            <CardDescription className="max-w-xl">
              Manage all customer accounts and their subscription status. For full user management like deleting or suspending login, please use the Firebase Console.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" asChild>
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4"/>
                    Open Firebase Console
                </a>
            </Button>
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by name or phone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
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
                            <div className="font-medium whitespace-nowrap">{customer.name || 'No Name'}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">{customer.phone || 'No Phone'}</div>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell className="whitespace-nowrap">
                        {customer.email}
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
                                            This action will only remove the customer's record from this list. To fully delete their login account, you must do so from the Firebase Console.
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
                      No customers found in the database.
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
