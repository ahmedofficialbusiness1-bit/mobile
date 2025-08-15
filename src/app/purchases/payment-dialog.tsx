
'use client'

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PurchaseOrder } from '@/context/financial-context';

interface PurchasePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poId: string, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => void;
  purchaseOrder: PurchaseOrder | null;
}

export function PurchasePaymentDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  purchaseOrder
}: PurchasePaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile'>('Bank');

  if (!purchaseOrder) return null;

  const handleSubmit = () => {
    onSubmit(purchaseOrder.id, paymentMethod);
  };

  const totalAmount = purchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark PO #{purchaseOrder.poNumber} as Paid</DialogTitle>
          <DialogDescription>
            You are about to pay TSh {totalAmount.toLocaleString()} to {purchaseOrder.supplierName}. Please select the payment method.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select onValueChange={(value) => setPaymentMethod(value as 'Cash' | 'Bank' | 'Mobile')} defaultValue={paymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Mobile">Mobile Money</SelectItem>
              <SelectItem value="Bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
