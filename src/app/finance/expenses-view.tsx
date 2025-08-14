
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, CheckCircle2, MoreHorizontal, Search } from 'lucide-react';
import { ExpenseForm } from './expense-form';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PaymentDialog } from '@/components/payment-dialog';
import { useFinancials, type PaymentMethod, type Expense, type AddExpenseData } from '@/context/financial-context';

export default function ExpensesView() {
  const { expenses, addExpense, approveExpense, cashBalances } = useFinancials();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();

  const handleSaveExpense = (expenseData: AddExpenseData) => {
    addExpense(expenseData);
    toast({
      title: "Tarakilishi Limeongezwa",
      description: "Tarakilishi jipya linasubiri kuthibitishwa.",
    });
    setIsFormOpen(false);
  };

  const openApprovalDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsPaymentDialogOpen(true);
  }

  const handleApproveExpense = (paymentMethod: PaymentMethod) => {
    if (!selectedExpense) return;

    const balance = cashBalances[paymentMethod.toLowerCase() as keyof typeof cashBalances];
    if (selectedExpense.amount > balance) {
        toast({
            variant: "destructive",
            title: "Insufficient Funds",
            description: `You do not have enough money in your ${paymentMethod} account to approve this expense.`,
        });
        return;
    }

    approveExpense(selectedExpense.id, paymentMethod);
    toast({
      title: "Tarakilishi Limethibitishwa",
      description: `Tarakilishi limelipwa kwa ${paymentMethod} na litahesabiwa kwenye vitabu vya fedha.`,
      variant: 'default',
    });
    setIsPaymentDialogOpen(false);
    setSelectedExpense(null);
  };
  
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = filteredExpenses
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = filteredExpenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Usimamizi wa Matumizi</CardTitle>
            <CardDescription>Fuatilia na thibitisha matumizi ya kila siku ya biashara.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Andika Tarakilishi
          </Button>
        </CardHeader>
        <CardContent>
           <div className="mb-4">
             <div className="relative w-full max-w-sm">
               <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder="Tafuta kwa maelezo au aina..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Maelezo</TableHead>
                  <TableHead>Aina</TableHead>
                  <TableHead>Tarehe</TableHead>
                  <TableHead>Hali</TableHead>
                  <TableHead>Njia ya Malipo</TableHead>
                  <TableHead className="text-right">Kiasi</TableHead>
                  <TableHead className="text-center">Kitendo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium whitespace-nowrap">{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{format(expense.date, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={expense.status === 'Approved' ? 'default' : 'secondary'}
                          className={cn(
                            expense.status === 'Approved' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
                            expense.status === 'Pending' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30'
                          )}
                        >
                          {expense.status === 'Approved' ? 'Limethibitishwa' : 'Inasubiri'}
                        </Badge>
                      </TableCell>
                       <TableCell>{expense.paymentMethod || '---'}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">TSh {expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {expense.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApprovalDialog(expense)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Thibitisha
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Hakuna matumizi yanayofanana na ulivyotafuta.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold">
                  <TableCell colSpan={5}>Jumla (Yaliyothibitishwa)</TableCell>
                  <TableCell className="text-right" colSpan={2}>
                    TSh {totalApproved.toLocaleString()}
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell colSpan={5} className="font-semibold text-amber-700">Jumla (Yanayosubiri)</TableCell>
                  <TableCell className="text-right font-semibold text-amber-700" colSpan={2}>
                    TSh {totalPending.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpense}
      />
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSubmit={handleApproveExpense}
        title="Thibitisha Matumizi"
        description="Chagua njia ya malipo iliyotumika kwa matumizi haya."
      />
    </>
  );
}
