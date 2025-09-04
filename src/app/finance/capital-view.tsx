
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { CapitalForm } from './capital-form';
import { useToast } from '@/hooks/use-toast';
import { useFinancials, type CapitalContribution } from '@/context/financial-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function CapitalView() {
  const { capitalContributions, addCapitalContribution, updateCapitalContribution, deleteCapitalContribution } = useFinancials();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedCapital, setSelectedCapital] = React.useState<CapitalContribution | null>(null);
  const { toast } = useToast();

  const handleSaveCapital = (data: Omit<CapitalContribution, 'id' | 'userId' | 'shopId'>) => {
    if (selectedCapital) {
      updateCapitalContribution(selectedCapital.id, data);
      toast({
        title: "Capital Updated",
        description: "The capital contribution has been updated.",
      });
    } else {
      addCapitalContribution(data);
      toast({
        title: "Capital Introduced Successfully",
        description: `A new capital of TSh ${data.amount.toLocaleString()} has been recorded.`,
      });
    }
    setIsFormOpen(false);
    setSelectedCapital(null);
  };

  const handleEdit = (capital: CapitalContribution) => {
    setSelectedCapital(capital);
    setIsFormOpen(true);
  };

  const handleDelete = (capital: CapitalContribution) => {
    deleteCapitalContribution(capital.id, capital.type, capital.amount);
     toast({
      title: "Capital Contribution Deleted",
      description: `The contribution of TSh ${capital.amount.toLocaleString()} has been removed.`,
      variant: 'destructive'
    });
  }
  
  const handleAddNew = () => {
    setSelectedCapital(null);
    setIsFormOpen(true);
  }

  const totalCapital = capitalContributions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Capital Management</CardTitle>
            <CardDescription>Monitor owner's equity, investments, and drawings.</CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Introduce New Capital
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount (TSh)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capitalContributions.length > 0 ? (
                  capitalContributions.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">{format(item.date, 'PPP')}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right font-mono">{item.amount.toLocaleString()}</TableCell>
                       <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete this capital contribution and reverse the transaction. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
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
                      No capital contributions recorded yet for this shop.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold text-lg">
                  <TableCell colSpan={3}>Total Contributed Capital (This Shop)</TableCell>
                  <TableCell className="text-right" colSpan={2}>
                    TSh {totalCapital.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      <CapitalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCapital}
        capital={selectedCapital}
      />
    </>
  );
}
