
'use client'

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, UserPlus, Info } from 'lucide-react';
import { EmployeeForm } from './employee-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number; // Gross Salary
  avatar: string;
}

const initialEmployees: Employee[] = [
  { id: 'emp-001', name: 'Asha Juma', position: 'Sales Manager', salary: 1200000, avatar: 'https://placehold.co/40x40.png' },
  { id: 'emp-002', name: 'David Chen', position: 'Accountant', salary: 950000, avatar: 'https://placehold.co/40x40.png' },
  { id: 'emp-003', name: 'Fatuma Said', position: 'Marketing Officer', salary: 750000, avatar: 'https://placehold.co/40x40.png' },
];

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
  const [employees, setEmployees] = React.useState<Employee[]>(initialEmployees);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  }

  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'>) => {
    if (selectedEmployee) {
      setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? { ...selectedEmployee, ...employeeData } : emp));
    } else {
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        ...employeeData
      };
      setEmployees([...employees, newEmployee]);
    }
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  const payrollData = employees.map(emp => {
      const nssf = calculateNSSF(emp.salary);
      const otherDeductions = 0; // Placeholder for other deductions like loans
      const totalDeductions = nssf + otherDeductions;
      const taxableIncome = emp.salary - nssf; // NSSF is deducted before tax
      const paye = calculatePAYE(taxableIncome);
      const netSalary = taxableIncome - paye - otherDeductions;
      return {
          ...emp,
          totalDeductions,
          taxableIncome,
          paye,
          netSalary,
      }
  })

  const totals = {
    gross: payrollData.reduce((acc, emp) => acc + emp.salary, 0),
    deductions: payrollData.reduce((acc, emp) => acc + emp.totalDeductions, 0),
    paye: payrollData.reduce((acc, emp) => acc + emp.paye, 0),
    net: payrollData.reduce((acc, emp) => acc + emp.netSalary, 0),
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>Manage employee salaries, deductions, and payroll taxes.</CardDescription>
            </div>
            <Button onClick={handleAddEmployee}>
                <UserPlus className="mr-2 h-4 w-4" />
                Register New Employee
            </Button>
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
                        <TooltipTrigger className="flex items-center gap-1">
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
                                <DropdownMenuItem>View Payslip</DropdownMenuItem>
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
                    <TableCell>Total</TableCell>
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
    </>
  );
}
