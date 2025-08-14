
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

export interface PayrollData {
  id: string;
  name: string;
  position: string;
  salary: number; // Gross
  nssf: number;
  paye: number;
  totalDeductions: number;
  netSalary: number;
}

interface PayslipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payrollData: PayrollData | null;
}

export function PayslipDialog({ isOpen, onClose, payrollData }: PayslipDialogProps) {
  const payslipContentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = payslipContentRef.current;
    if (content) {
      const printWindow = window.open('', '_blank', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Payslip</title>');
        
        // This is a bit of a hack to get the styles, but necessary for external window printing
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
                } catch (e) {
                    console.warn('Could not read stylesheet rules', e);
                    return '';
                }
            }).join('');

        printWindow.document.write(`<style>${styles}</style></head><body>`);
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        // Use timeout to ensure content is loaded before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    }
  };


  if (!payrollData) {
    return null;
  }
  
  const payPeriod = format(new Date(), 'MMMM yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div ref={payslipContentRef}>
            <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">PAYSLIP</DialogTitle>
            <DialogDescription className="text-center">
                {payPeriod}
            </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold">DiraBiz Inc.</h3>
                        <p className="text-sm text-muted-foreground">123 Business Rd, Dar es Salaam</p>
                    </div>
                    <Logo />
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold mb-2">Employee Details</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p className="text-muted-foreground">Employee Name:</p>
                        <p className="font-medium">{payrollData.name}</p>
                        <p className="text-muted-foreground">Position:</p>
                        <p className="font-medium">{payrollData.position}</p>
                        <p className="text-muted-foreground">Employee ID:</p>
                        <p className="font-medium">{payrollData.id}</p>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Earnings</h4>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Gross Salary</TableCell>
                                    <TableCell className="text-right">{payrollData.salary.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Deductions</h4>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>NSSF (10%)</TableCell>
                                    <TableCell className="text-right">{payrollData.nssf.toLocaleString()}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>PAYE</TableCell>
                                    <TableCell className="text-right">{payrollData.paye.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between font-medium text-sm">
                        <span>Total Earnings</span>
                        <span>TSh {payrollData.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-sm">
                        <span>Total Deductions</span>
                        <span>TSh {(payrollData.totalDeductions + payrollData.paye).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base bg-muted p-2 rounded-md">
                        <span>Net Salary</span>
                        <span>TSh {payrollData.netSalary.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
                Close
            </Button>
            <Button type="button" onClick={handlePrint}>
                Print / Download
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
