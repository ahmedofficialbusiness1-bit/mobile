
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
import type { PaymentMethod } from '@/context/financial-context';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentMethod: PaymentMethod) => void;
  title?: string;
  description?: string;
}

export function PaymentDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Mark as Paid", 
  description = "Select the payment method used to settle this transaction." 
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  const handleSubmit = () => {
    onSubmit(paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} defaultValue={paymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Mobile">Mobile Money</SelectItem>
              <SelectItem value="Bank">Bank</SelectItem>
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
