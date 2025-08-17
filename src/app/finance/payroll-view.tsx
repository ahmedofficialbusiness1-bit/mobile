
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, UserPlus, Info, Wallet, CheckCircle } from 'lucide-react';
import { EmployeeForm } from './employee-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PayslipDialog, type PayrollData } from './payslip-dialog';
import { PaymentDialog } from '@/components/payment-dialog';
import { useToast } from '@/hooks/use-toast';
import type { PaymentMethod, Employee } from '@/context/financial-context';
import { useFinancials } from '@/context/financial-context';


// Simplified calculation functions for Tanzanian context (for demonstration)
const calculateNSSF = (gross: number) => {
    // NSSF is 20% of basic salary, 10% from employee, 10% from employer.
    // For this purpose, let's assume 'salary' is the basic salary and we deduct the employee's 10%.
    return gross * 0.10;
};

const calculatePAYE = (taxableIncome: number) => {
    if (taxableIncome <= 300000) return 0;
    if (taxableIncome <= 500000) return (taxableIncome - 300000) * 0.075;
    if (taxableIncome <= 700000) return 15000 + (taxableIncome - 500000) * 0.15;
    if (taxableIncome <= 900000) return 45000 + (taxableIncome - 700000) * 0.20;
    return 85000 + (taxableIncome - 900000) * 0.25;
};


export default function PayrollView() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, processPayroll, payrollHistory, cashBalances } = useFinancials();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [payslipEmployee, setPayslipEmployee] = React.useState<PayrollData | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const isPayrollRun = payrollHistory.some(run => run.month === currentMonth);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  }

  const handleViewPayslip = (employee: PayrollData) => {
    setPayslipEmployee(employee);
  }

  const handleDeleteEmployee = (id: string) => {
    deleteEmployee(id);
    toast({
        title: "Employee Deleted",
        description: "The employee has been removed from the payroll.",
        variant: "destructive"
    });
  }
  
    const payrollData = employees.map(emp => {
      const nssf = calculateNSSF(emp.salary);
      const otherDeductions = 0; // Placeholder for other deductions like loans
      const totalDeductions = nssf + otherDeductions;
      const taxableIncome = emp.salary - nssf; // NSSF is deducted before tax
      const paye = calculatePAYE(taxableIncome);
      const netSalary = emp.salary - totalDeductions - paye;
      return {
          ...emp,
          nssf,
          paye,
          totalDeductions,
          taxableIncome,
          netSalary,
      }
    })

    const totals = {
      gross: payrollData.reduce((acc, emp) => acc + emp.salary, 0),
      deductions: payrollData.reduce((acc, emp) => acc + emp.totalDeductions, 0),
      paye: payrollData.reduce((acc, emp) => acc + emp.paye, 0),
      net: payrollData.reduce((acc, emp) => acc + emp.netSalary, 0),
    }

  const handlePayAll = (paymentData: { amount: number, paymentMethod: PaymentMethod }) => {
    try {
        processPayroll(paymentData, totals.gross);
        toast({
            title: "Payroll Processed Successfully",
            description: `Paid TSh ${totals.net.toLocaleString()} to ${employees.length} employees for ${currentMonth} via ${paymentData.paymentMethod}.`,
            variant: "default",
        })
        setIsPaymentDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Processing Payroll",
            description: error.message,
        });
    }
  }

  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'>) => {
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, employeeData);
       toast({
            title: "Employee Updated",
            description: `${employeeData.name}'s details have been updated.`
        });
    } else {
      addEmployee(employeeData);
      toast({
            title: "Employee Registered",
            description: `${employeeData.name} has been added to the payroll.`
        });
    }
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>Manage employee salaries, deductions, and payroll taxes.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleAddEmployee}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Employee
                </Button>
                 {isPayrollRun ? (
                    <Button disabled variant="outline">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Payroll Run for {currentMonth}
                    </Button>
                ) : (
                    <Button variant="default" onClick={() => setIsPaymentDialogOpen(true)} disabled={employees.length === 0}>
                        <Wallet className="mr-2 h-4 w-4" />
                        Pay All Employees
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Gross Salary</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Taxable Income</TableHead>
                  <TableHead className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 justify-end">
                          PAYE <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Employee Withholding Tax</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.length > 0 ? (
                  payrollData.map(employee => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="avatar placeholder" />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium whitespace-nowrap">{employee.name}</div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">{employee.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">{employee.salary.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{employee.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{employee.taxableIncome.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{employee.paye.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">{employee.netSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewPayslip(employee)}>View Payslip</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEmployee(employee.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No employees registered yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold">
                    <TableCell>Total Company Expense</TableCell>
                    <TableCell className="text-right">{totals.gross.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">{totals.paye.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{totals.net.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />
      <PayslipDialog
        isOpen={!!payslipEmployee}
        onClose={() => setPayslipEmployee(null)}
        payrollData={payslipEmployee}
      />
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSubmit={handlePayAll}
        title={`Confirm Payroll for ${currentMonth}`}
        description={`You are about to pay a total of TSh ${totals.net.toLocaleString()} to ${employees.length} employees. Please select the payment method.`}
        totalAmount={totals.net}
      />
    </>
  );
}
