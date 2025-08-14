
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { ExpenseForm } from './expense-form';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Expense {
  id: string;
  description: string;
  category: 'Umeme' | 'Maji' | 'Usafiri' | 'Mawasiliano' | 'Kodi' | 'Manunuzi Ofisi' | 'Matangazo' | 'Mengineyo';
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved';
}

const initialExpenses: Expense[] = [
  { id: 'exp-001', description: 'Umeme wa LUKU ofisini', category: 'Umeme', amount: 50000, date: new Date(2024, 4, 20), status: 'Approved' },
  { id: 'exp-002', description: 'Nauli ya kwenda kwa mteja', category: 'Usafiri', amount: 15000, date: new Date(2024, 4, 22), status: 'Pending' },
  { id: 'exp-003', description: 'Manunuzi ya karatasi na wino', category: 'Manunuzi Ofisi', amount: 75000, date: new Date(2024, 4, 18), status: 'Approved' },
  { id: 'exp-004', description: 'Malipo ya vocha za simu', category: 'Mawasiliano', amount: 20000, date: new Date(2024, 4, 23), status: 'Pending' },
];

export default function ExpensesView() {
  const [expenses, setExpenses] = React.useState<Expense[]>(initialExpenses);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'status'>) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      status: 'Pending',
      ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev]);
    toast({
      title: "Tarakilishi Limeongezwa",
      description: "Tarakilishi jipya linasubiri kuthibitishwa.",
    });
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, status: 'Approved' } : exp))
    );
    toast({
      title: "Tarakilishi Limethibitishwa",
      description: "Tarakilishi sasa litahesabiwa kwenye vitabu vya fedha.",
      variant: 'default',
    });
  };

  const totalPending = expenses
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = expenses
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Maelezo</TableHead>
                  <TableHead>Aina</TableHead>
                  <TableHead>Tarehe</TableHead>
                  <TableHead>Hali</TableHead>
                  <TableHead className="text-right">Kiasi</TableHead>
                  <TableHead className="text-center">Kitendo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map(expense => (
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
                      <TableCell className="text-right whitespace-nowrap">TSh {expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {expense.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveExpense(expense.id)}
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      Hakuna matumizi yaliyoandikwa bado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold">
                  <TableCell colSpan={4}>Jumla (Yaliyothibitishwa)</TableCell>
                  <TableCell className="text-right" colSpan={2}>
                    TSh {totalApproved.toLocaleString()}
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell colSpan={4} className="font-semibold text-amber-700">Jumla (Yanayosubiri)</TableCell>
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
    </>
  );
}
