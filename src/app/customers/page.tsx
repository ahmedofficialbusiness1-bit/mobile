
'use client'

import * as React from 'react'
import { PlusCircle, MoreHorizontal, Search } from 'lucide-react'
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
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useFinancials, type Customer } from '@/context/financial-context'
import { CustomerForm } from './customer-form'
import { useToast } from '@/hooks/use-toast'

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = useFinancials()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleSaveCustomer = (data: Omit<Customer, 'id'>) => {
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, data);
      toast({
        title: 'Customer Updated',
        description: `${data.name}'s details have been updated.`,
      })
    } else {
      addCustomer(data);
      toast({
        title: 'Customer Added',
        description: `${data.name} has been added to your customer list.`,
      })
    }
    setIsFormOpen(false)
    setSelectedCustomer(null)
  }

  const handleAddNew = () => {
    setSelectedCustomer(null)
    setIsFormOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const filteredCustomers = customers.filter(customer =>
    (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View, add, and manage your customer information.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name or phone..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Customer
                </Button>
              </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.contactPerson || '---'}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email || '---'}</TableCell>
                        <TableCell>{customer.location || '---'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>View History</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(customer)}>Edit Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
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
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />
    </>
  )
}
