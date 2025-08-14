
'use client'

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { EmployeeForm } from './employee-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  avatar: string;
}

const initialEmployees: Employee[] = [
  { id: 'emp-001', name: 'Asha Juma', position: 'Sales Manager', salary: 1200000, avatar: 'https://placehold.co/40x40.png' },
  { id: 'emp-002', name: 'David Chen', position: 'Accountant', salary: 950000, avatar: 'https://placehold.co/40x40.png' },
  { id: 'emp-003', name: 'Fatuma Said', position: 'Marketing Officer', salary: 750000, avatar: 'https://placehold.co/40x40.png' },
];

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

  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'>) => {
    if (selectedEmployee) {
      // Update existing employee
      setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? { ...selectedEmployee, ...employeeData } : emp));
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        ...employeeData
      };
      setEmployees([...employees, newEmployee]);
    }
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

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
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Gross Salary (TSh)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length > 0 ? (
                  employees.map(employee => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="avatar placeholder" />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell className="text-right">{employee.salary.toLocaleString()}</TableCell>
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
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No employees registered yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
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
