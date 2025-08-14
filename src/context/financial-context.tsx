'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Type Definitions ---
export type PaymentMethod = "Cash" | "Mobile" | "Bank" | "Credit";

export interface Transaction {
    id: string;
    name: string;
    phone: string;
    amount: number;
    status: 'Paid' | 'Credit';
    date: Date;
    paymentMethod: PaymentMethod;
    product: 'Mchele' | 'Unga' | 'Sukari' | 'Mafuta' | 'Sabuni' | 'Nido';
}

export interface Payable {
    id: string;
    supplierName: string;
    product: string;
    amount: number;
    date: Date;
}

export interface CustomerPrepayment {
    id: string;
    customerName: string;
    phone: string;
    prepaidAmount: number;
    date: Date;
}

export interface Product {
    id: string;
    name: string;
    initialStock: number;
    currentStock: number;
    entryDate: Date;
}

// --- Initial Mock Data ---
const initialTransactions: Transaction[] = [
  { id: 'txn-001', name: 'Liam Johnson', phone: '+255712345678', amount: 45000, status: 'Paid', date: new Date('2024-05-20'), paymentMethod: 'Mobile', product: 'Mchele' },
  { id: 'txn-002', name: 'Olivia Smith', phone: '+255755123456', amount: 30000, status: 'Paid', date: new Date('2024-05-20'), paymentMethod: 'Cash', product: 'Unga' },
  { id: 'rec-001', name: 'Noah Williams', phone: '+255688990011', amount: 60000, status: 'Credit', date: new Date('2024-05-18'), paymentMethod: 'Credit', product: 'Sukari' },
  { id: 'txn-003', name: 'Emma Brown', phone: '+255788112233', amount: 85000, status: 'Paid', date: new Date('2024-05-15'), paymentMethod: 'Bank', product: 'Mafuta' },
  { id: 'txn-004', name: 'James Jones', phone: '+255655443322', amount: 20000, status: 'Paid', date: new Date('2024-05-12'), paymentMethod: 'Mobile', product: 'Sabuni' },
  { id: 'txn-005', name: 'Ava Garcia', phone: '+255714556677', amount: 50000, status: 'Paid', date: new Date('2024-04-25'), paymentMethod: 'Cash', product: 'Mchele' },
  { id: 'txn-006', name: 'Isabella Miller', phone: '+255766778899', amount: 35000, status: 'Paid', date: new Date('2024-04-22'), paymentMethod: 'Bank', product: 'Unga' },
  { id: 'rec-002', name: 'Sophia Davis', phone: '+255677889900', amount: 75000, status: 'Credit', date: new Date('2024-04-18'), paymentMethod: 'Credit', product: 'Nido' },
  { id: 'txn-007', name: 'Mia Rodriguez', phone: '+255718990011', amount: 55000, status: 'Paid', date: new Date('2024-04-11'), paymentMethod: 'Mobile', product: 'Sukari' },
  { id: 'txn-008', name: 'Lucas Wilson', phone: '+255622334455', amount: 90000, status: 'Paid', date: new Date('2024-03-30'), paymentMethod: 'Bank', product: 'Mchele' },
  { id: 'txn-009', name: 'Zoe Martinez', phone: '+255713445566', amount: 40000, status: 'Paid', date: new Date('2024-03-15'), paymentMethod: 'Cash', product: 'Unga' },
  { id: 'txn-010', name: 'Amelia Harris', phone: '+255758990011', amount: 48000, status: 'Paid', date: new Date('2024-02-15'), paymentMethod: 'Mobile', product: 'Sabuni'},
  { id: 'txn-011', name: 'Elijah Clark', phone: '+255689001122', amount: 72000, status: 'Paid', date: new Date('2024-01-20'), paymentMethod: 'Bank', product: 'Nido'},
  { id: 'txn-012', name: 'Henry Moore', phone: '+255717654321', amount: 7500, status: 'Paid', date: new Date('2023-12-15'), paymentMethod: 'Cash', product: 'Sukari' },
  { id: 'txn-013', name: 'Grace Taylor', phone: '+255754987654', amount: 9500, status: 'Paid', date: new Date('2023-11-05'), paymentMethod: 'Mobile', product: 'Mchele' },
  { id: 'txn-014', name: 'Benjamin Anderson', phone: '+255688123789', amount: 12000, status: 'Paid', date: new Date('2023-10-10'), paymentMethod: 'Bank', product: 'Unga'},
  { id: 'rec-003', name: 'Charlotte Thomas', phone: '+255787456123', amount: 21000, status: 'Credit', date: new Date('2023-09-22'), paymentMethod: 'Credit', product: 'Mafuta'},
  { id: 'txn-015', name: 'Daniel White', phone: '+255655789456', amount: 13000, status: 'Paid', date: new Date('2023-08-01'), paymentMethod: 'Mobile', product: 'Sabuni'},
];

const initialPayables: Payable[] = [
    { id: 'pay-001', supplierName: "Azam Mills", product: "Unga wa Ngano (50kg)", amount: 2500000, date: new Date("2024-05-10")},
    { id: 'pay-002', supplierName: "Kilombero Sugar", product: "Sukari (20 bags)", amount: 1800000, date: new Date("2024-05-02")},
    { id: 'pay-003', supplierName: "Korie Oils", product: "Mafuta ya Alizeti (100L)", amount: 3200000, date: new Date("2024-04-28")},
];

const initialPrepayments: CustomerPrepayment[] = [
    { id: 'pre-001', customerName: "Asha Bakari", phone: "+255712112233", prepaidAmount: 15000, date: new Date(2024, 4, 20) },
    { id: 'pre-002', customerName: "John Okello", phone: "+255756445566", prepaidAmount: 50000, date: new Date(2024, 4, 15) },
    { id: 'pre-003', customerName: "Fatuma Said", phone: "+255688776655", prepaidAmount: 22500, date: new Date(2024, 4, 1) },
];

const initialProducts: Product[] = [
    { id: 'PROD-001', name: 'Mchele', initialStock: 100, currentStock: 80, entryDate: new Date('2024-04-01') },
    { id: 'PROD-002', name: 'Unga', initialStock: 200, currentStock: 150, entryDate: new Date('2024-03-15') },
    { id: 'PROD-003', name: 'Mafuta', initialStock: 50, currentStock: 45, entryDate: new Date('2024-01-10') },
    { id: 'PROD-004', name: 'Sabuni', initialStock: 120, currentStock: 70, entryDate: new Date('2024-02-05') },
    { id: 'PROD-005', name: 'Sukari', initialStock: 300, currentStock: 100, entryDate: new Date('2024-05-01') },
    { id: 'PROD-006', name: 'Nido', initialStock: 80, currentStock: 75, entryDate: new Date('2023-11-20') },
];

// --- Context Definition ---
interface FinancialContextType {
    transactions: Transaction[];
    payables: Payable[];
    prepayments: CustomerPrepayment[];
    products: Product[];
    markReceivableAsPaid: (id: string) => void;
    markPayableAsPaid: (id: string) => void;
    usePrepayment: (id: string) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// --- Context Provider ---
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [payables, setPayables] = useState<Payable[]>(initialPayables);
    const [prepayments, setPrepayments] = useState<CustomerPrepayment[]>(initialPrepayments);
    const [products, setProducts] = useState<Product[]>(initialProducts);

    const markReceivableAsPaid = (id: string) => {
        setTransactions(prevTransactions =>
            prevTransactions.map(t =>
                t.id === id ? { ...t, status: 'Paid', paymentMethod: 'Cash' } : t
            )
        );
    };

    const markPayableAsPaid = (id: string) => {
        setPayables(prevPayables => prevPayables.filter(p => p.id !== id));
    };

    const usePrepayment = (id: string) => {
        setPrepayments(prevPrepayments => prevPrepayments.filter(p => p.id !== id));
    };

    const value = {
        transactions,
        payables,
        prepayments,
        products,
        markReceivableAsPaid,
        markPayableAsPaid,
        usePrepayment
    };

    return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

// --- Custom Hook to use the Context ---
export const useFinancials = (): FinancialContextType => {
    const context = useContext(FinancialContext);
    if (context === undefined) {
        throw new Error('useFinancials must be used within a FinancialProvider');
    }
    return context;
};
