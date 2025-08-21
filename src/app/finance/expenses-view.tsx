
'use client'

import * as React from 'react';
import { format, isWithinInterval, startOfMonth, endOfMonth, addDays, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, CheckCircle2, Search, Trash2, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { ExpenseForm } from './expense-form';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PaymentDialog } from '@/components/payment-dialog';
import { useFinancials, type PaymentMethod, type Expense, type AddExpenseData } from '@/context/financial-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function ExpensesView() {
  const { expenses, addExpense, approveExpense, deleteExpense } = useFinancials();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();

  const [date, setDate] = React.useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    })
  const [selectedPreset, setSelectedPreset] = React.useState<string>("month");

  const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const now = new Date();
        switch (value) {
            case 'today':
                setDate({ from: now, to: now });
                break;
            case 'week':
                setDate({ from: startOfWeek(now), to: endOfWeek(now) });
                break;
            case 'month':
                setDate({ from: startOfMonth(now), to: endOfMonth(now) });
                break;
            case 'year':
                setDate({ from: startOfYear(now), to: endOfYear(now) });
                break;
            case 'all':
                setDate({ from: new Date('2020-01-01'), to: endOfYear(addDays(now, 1)) });
                break;
        }
    }


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

  const handleApproveExpense = async (paymentData: { amount: number, paymentMethod: PaymentMethod }) => {
    if (!selectedExpense) return;
    try {
        await approveExpense(selectedExpense.id, paymentData);
        toast({
          title: "Tarakilishi Limethibitishwa",
          description: `Tarakilishi limelipwa kwa ${paymentData.paymentMethod} na litahesabiwa kwenye vitabu vya fedha.`,
          variant: 'default',
        });
        setIsPaymentDialogOpen(false);
        setSelectedExpense(null);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Approving Expense",
            description: error.message,
        });
    }
  };
  
  const handleDeleteExpense = (expense: Expense) => {
    deleteExpense(expense.id, expense.status === 'Approved' ? { amount: expense.amount, paymentMethod: expense.paymentMethod! } : undefined);
    toast({
        title: 'Expense Deleted',
        description: 'The expense has been successfully deleted.',
        variant: 'destructive'
    })
  }
  
  const filteredExpenses = React.useMemo(() => expenses.filter(expense => 
    (expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    date?.from && date?.to && isWithinInterval(expense.date, { start: date.from, end: addDays(date.to, 1) })
  ), [expenses, searchTerm, date]);

  const totalPending = filteredExpenses
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = filteredExpenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
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
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 no-print">
              <div className="relative w-full sm:max-w-xs">
               <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder="Tafuta kwa maelezo au aina..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
             <div className="flex items-center gap-2 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal md:w-[260px]",
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
                      <span>Pick a date range</span>
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
                  <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
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
                  <TableHead className="text-center no-print">Kitendo</TableHead>
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
                      <TableCell className="text-center no-print">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {expense.status === 'Pending' && (
                                    <DropdownMenuItem onClick={() => openApprovalDialog(expense)}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Thibitisha
                                    </DropdownMenuItem>
                                )}
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
                                                This action will permanently delete this expense. If it was already approved, the transaction will be reversed.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteExpense(expense)} className="bg-destructive hover:bg-destructive/90">
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
        totalAmount={selectedExpense?.amount}
      />
    </>
  );
}
