
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
import { useFinancials, type UserAccount } from '@/context/financial-context'

interface DisplayUser extends UserAccount {
    accountStatus: 'Active' | 'Suspended';
    paymentStatus: 'Paid' | 'Unpaid';
}

export default function AdminPage() {
  const { toast } = useToast()
  const { userAccounts, deleteUserAccount } = useFinancials()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [displayUsers, setDisplayUsers] = React.useState<DisplayUser[]>([]);

  React.useEffect(() => {
     // This syncs the local display state when the context changes
    setDisplayUsers(userAccounts.map(u => ({
        ...u,
        accountStatus: 'Active', // Default status
        paymentStatus: 'Unpaid' // Default status
    })));
  }, [userAccounts]);


  const handleStatusChange = (id: string, newStatus: 'Active' | 'Suspended') => {
    setDisplayUsers(displayUsers.map(u => u.id === id ? { ...u, accountStatus: newStatus } : u))
    toast({
      title: 'Account Status Updated',
      description: `The user's account has been set to ${newStatus}. Please complete this action in the Firebase Console.`,
    })
  }
  
  const handlePaymentMark = (id: string) => {
    setDisplayUsers(displayUsers.map(u => u.id === id ? { ...u, paymentStatus: 'Paid' } : u))
     toast({
      title: 'Payment Marked as Paid',
      description: `The user has been marked as paid for the current cycle.`,
    })
  }

  const handleDelete = (id: string) => {
    deleteUserAccount(id);
     toast({
      title: 'User Account Record Deleted',
      description: 'The user has been removed from this list. Please delete their account from the Firebase Console as well.',
      variant: 'destructive',
    })
  }

  const filteredUsers = displayUsers.filter(
    (user) => {
        const nameMatch = user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = user.phone && user.phone.includes(searchTerm);
        const countryMatch = user.country && user.country.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || phoneMatch || countryMatch;
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
              Manage all user accounts and their subscription status. For full user management like deleting or suspending login, please use the Firebase Console.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" asChild>
                <a href="https://console.firebase.google.com/project/dirabiz/authentication/users" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4"/>
                    Open Firebase Console
                </a>
            </Button>
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by company, phone, or country..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-center">Account Status</TableHead>
                  <TableHead className="text-center">Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                         <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                                <User/>
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium whitespace-nowrap">{user.companyName || 'No Name'}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">{user.phone || 'No Phone'}</div>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell className="whitespace-nowrap">
                        {user.email}
                      </TableCell>
                       <TableCell className="whitespace-nowrap">
                        {user.country}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={user.accountStatus === 'Active' ? 'default' : 'secondary'}
                         className={cn(
                            user.accountStatus === 'Active' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
                            user.accountStatus === 'Suspended' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30'
                          )}
                        >
                          {user.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant={user.paymentStatus === 'Paid' ? 'default' : 'outline'}>
                          {user.paymentStatus}
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
                            <DropdownMenuItem asChild>
                                <a href={`https://console.firebase.google.com/project/dirabiz/authentication/users/${user.id}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View in Firebase
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                disabled={user.paymentStatus === 'Paid'}
                                onClick={() => handlePaymentMark(user.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            {user.accountStatus === 'Active' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'Suspended')}
                              >
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Suspend Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'Active')}
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
                                            This action will only remove the user's record from this list. To fully delete their login account, you must do so from the Firebase Console.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(user.id)}>
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      No user accounts found.
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
