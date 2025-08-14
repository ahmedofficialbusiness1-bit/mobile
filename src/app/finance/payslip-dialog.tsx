
'use client'

import * as React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

function PayslipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono">{value}</p>
    </div>
  )
}

export function PayslipDialog({ isOpen, onClose, payrollData }: PayslipDialogProps) {
  const payslipContentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = payslipContentRef.current;
    if (content) {
      const printWindow = window.open('', '_blank', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Payslip</title>');
        
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
      <DialogContent className="sm:max-w-sm p-0">
        <div ref={payslipContentRef} className="p-4">
            <DialogHeader className="p-2 text-center">
              <DialogTitle className="text-xl font-bold">PAYSLIP</DialogTitle>
              <DialogDescription>
                  {payPeriod}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
                <div className="flex justify-between items-start pt-2">
                    <div>
                        <h3 className="font-bold text-sm">DiraBiz Inc.</h3>
                        <p className="text-xs text-muted-foreground">123 Business Rd, Dar es Salaam</p>
                    </div>
                    <Logo />
                </div>

                <Separator />
                
                <div className="space-y-1">
                    <h4 className="font-semibold text-sm mb-1">Employee Details</h4>
                     <div className="text-xs space-y-1">
                        <p><span className="text-muted-foreground">Name:</span> {payrollData.name}</p>
                        <p><span className="text-muted-foreground">Position:</span> {payrollData.position}</p>
                        <p><span className="text-muted-foreground">ID:</span> {payrollData.id}</p>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-semibold text-sm">Earnings</h4>
                        <PayslipRow label="Gross Salary" value={payrollData.salary.toLocaleString()} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-semibold text-sm">Deductions</h4>
                        <PayslipRow label="NSSF (10%)" value={payrollData.nssf.toLocaleString()} />
                        <PayslipRow label="PAYE" value={payrollData.paye.toLocaleString()} />
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <PayslipRow label="Total Earnings" value={`TSh ${payrollData.salary.toLocaleString()}`} />
                    <PayslipRow label="Total Deductions" value={`TSh ${(payrollData.totalDeductions + payrollData.paye).toLocaleString()}`} />
                    
                    <div className="flex justify-between font-bold text-base bg-muted p-2 rounded-md mt-2">
                        <span>Net Salary</span>
                        <span>TSh {payrollData.netSalary.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="sm:justify-end bg-muted/50 p-2 border-t">
            <Button type="button" size="sm" variant="outline" onClick={onClose}>
                Close
            </Button>
            <Button type="button" size="sm" onClick={handlePrint}>
                Print / Download
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
