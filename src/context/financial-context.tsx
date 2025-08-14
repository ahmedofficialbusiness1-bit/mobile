
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { differenceInYears } from 'date-fns';

// --- Type Definitions ---
export type PaymentMethod = "Cash" | "Mobile" | "Bank" | "Credit" | "Prepaid";

export interface Transaction {
    id: string;
    name: string;
    phone: string;
    amount: number;
    status: 'Paid' | 'Credit';
    date: Date;
    paymentMethod: PaymentMethod;
    product: string;
    notes?: string;
}

export interface Payable {
    id: string;
    supplierName: string;
    product: string;
    amount: number;
    date: Date;
    status: 'Unpaid' | 'Paid';
    paymentMethod?: PaymentMethod;
}

export interface CustomerPrepayment {
    id: string;
    customerName: string;
    phone: string;
    prepaidAmount: number;
    date: Date;
    status: 'Active' | 'Used' | 'Refunded';
}

export interface Product {
    id: string;
    name: string;
    initialStock: number;
    currentStock: number;
    entryDate: Date;
}

export interface Asset {
    id: string;
    name: string;
    cost: number;
    acquisitionDate: Date;
    depreciationRate: number; // Annual percentage
    status: 'Active' | 'Sold' | 'Written Off';
    accumulatedDepreciation: number;
    netBookValue: number;
    source: 'Capital' | 'Purchase';
}

export type AddAssetData = Omit<Asset, 'id' | 'status' | 'accumulatedDepreciation' | 'netBookValue' | 'source'>;

export interface CapitalContribution {
  id: string;
  date: Date;
  description: string;
  type: 'Cash' | 'Bank' | 'Asset' | 'Liability' | 'Drawing';
  amount: number;
  source?: 'Cash' | 'Bank' | 'Mobile';
}

export interface OwnerLoan {
    id: string; // Will be the same as the capital contribution id
    date: Date;
    description: string;
    amount: number;
    repaid: number;
}

export interface DrawingData {
  amount: number;
  source: 'Cash' | 'Bank' | 'Mobile';
  description: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Umeme' | 'Maji' | 'Usafiri' | 'Mawasiliano' | 'Kodi' | 'Manunuzi Ofisi' | 'Matangazo' | 'Mengineyo';
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved';
  paymentMethod?: PaymentMethod;
}

export type AddExpenseData = Omit<Expense, 'id' | 'status' | 'paymentMethod'>;

// --- Initial Mock Data ---
const initialTransactions: Transaction[] = [
    { id: 'txn-001', name: 'Liam Johnson', phone: '+255712345678', amount: 45000, status: 'Paid', date: new Date(2024, 4, 20), paymentMethod: 'Mobile', product: 'Mchele' },
    { id: 'txn-002', name: 'Olivia Smith', phone: '+255755123456', amount: 30000, status: 'Paid', date: new Date(2024, 4, 20), paymentMethod: 'Cash', product: 'Unga' },
    { id: 'rec-001', name: 'Noah Williams', phone: '+255688990011', amount: 60000, status: 'Credit', date: new Date(2024, 4, 18), paymentMethod: 'Credit', product: 'Sukari' },
    { id: 'txn-003', name: 'Emma Brown', phone: '+255788112233', amount: 85000, status: 'Paid', date: new Date(2024, 4, 15), paymentMethod: 'Bank', product: 'Mafuta' },
    { id: 'txn-004', name: 'James Jones', phone: '+255655443322', amount: 20000, status: 'Paid', date: new Date(2024, 4, 12), paymentMethod: 'Mobile', product: 'Sabuni' },
    { id: 'txn-005', name: 'Ava Garcia', phone: '+255714556677', amount: 50000, status: 'Paid', date: new Date(2024, 3, 25), paymentMethod: 'Cash', product: 'Mchele' },
    { id: 'txn-006', name: 'Isabella Miller', phone: '+255766778899', amount: 35000, status: 'Paid', date: new Date(2024, 3, 22), paymentMethod: 'Bank', product: 'Unga' },
    { id: 'rec-002', name: 'Sophia Davis', phone: '+255677889900', amount: 75000, status: 'Credit', date: new Date(2024, 3, 18), paymentMethod: 'Credit', product: 'Nido' },
    { id: 'txn-007', name: 'Mia Rodriguez', phone: '+255718990011', amount: 55000, status: 'Paid', date: new Date(2024, 3, 11), paymentMethod: 'Mobile', product: 'Sukari' },
    { id: 'txn-008', name: 'Lucas Wilson', phone: '+255622334455', amount: 90000, status: 'Paid', date: new Date(2024, 2, 30), paymentMethod: 'Bank', product: 'Mchele' },
    { id: 'txn-009', name: 'Zoe Martinez', phone: '+255713445566', amount: 40000, status: 'Paid', date: new Date(2024, 2, 15), paymentMethod: 'Cash', product: 'Unga' },
    { id: 'txn-010', name: 'Amelia Harris', phone: '+255758990011', amount: 48000, status: 'Paid', date: new Date(2024, 1, 15), paymentMethod: 'Mobile', product: 'Sabuni'},
    { id: 'txn-011', name: 'Elijah Clark', phone: '+255689001122', amount: 72000, status: 'Paid', date: new Date(2024, 0, 20), paymentMethod: 'Bank', product: 'Nido'},
    { id: 'txn-012', name: 'Henry Moore', phone: '+255717654321', amount: 7500, status: 'Paid', date: new Date(2023, 11, 15), paymentMethod: 'Cash', product: 'Sukari' },
    { id: 'txn-013', name: 'Grace Taylor', phone: '+255754987654', amount: 9500, status: 'Paid', date: new Date(2023, 10, 5), paymentMethod: 'Mobile', product: 'Mchele' },
    { id: 'txn-014', name: 'Benjamin Anderson', phone: '+255688123789', amount: 12000, status: 'Paid', date: new Date(2023, 9, 10), paymentMethod: 'Bank', product: 'Unga'},
    { id: 'rec-003', name: 'Charlotte Thomas', phone: '+255787456123', amount: 21000, status: 'Credit', date: new Date(2023, 8, 22), paymentMethod: 'Credit', product: 'Mafuta'},
    { id: 'txn-015', name: 'Daniel White', phone: '+255655789456', amount: 13000, status: 'Paid', date: new Date(2023, 7, 1), paymentMethod: 'Mobile', product: 'Sabuni'},
];

const initialPayables: Payable[] = [
    { id: 'pay-001', supplierName: "Azam Mills", product: "Unga wa Ngano (50kg)", amount: 2500000, date: new Date(2024, 4, 10), status: 'Unpaid'},
    { id: 'pay-002', supplierName: "Kilombero Sugar", product: "Sukari (20 bags)", amount: 1800000, date: new Date(2024, 4, 2), status: 'Unpaid'},
    { id: 'pay-003', supplierName: "Korie Oils", product: "Mafuta ya Alizeti (100L)", amount: 3200000, date: new Date(2024, 3, 28), status: 'Unpaid'},
];

const initialPrepayments: CustomerPrepayment[] = [
    { id: 'pre-001', customerName: "Asha Bakari", phone: "+255712112233", prepaidAmount: 15000, date: new Date(2024, 4, 20), status: 'Active' },
    { id: 'pre-002', customerName: "John Okello", phone: "+255756445566", prepaidAmount: 50000, date: new Date(2024, 4, 15), status: 'Active' },
    { id: 'pre-003', customerName: "Fatuma Said", phone: "+255688776655", prepaidAmount: 22500, date: new Date(2024, 4, 1), status: 'Active' },
];

const initialProducts: Product[] = [
    { id: 'PROD-001', name: 'Mchele', initialStock: 100, currentStock: 80, entryDate: new Date(2024, 3, 1) },
    { id: 'PROD-002', name: 'Unga', initialStock: 200, currentStock: 150, entryDate: new Date(2024, 2, 15) },
    { id: 'PROD-003', name: 'Mafuta', initialStock: 50, currentStock: 45, entryDate: new Date(2024, 0, 10) },
    { id: 'PROD-004', name: 'Sabuni', initialStock: 120, currentStock: 70, entryDate: new Date(2024, 1, 5) },
    { id: 'PROD-005', name: 'Sukari', initialStock: 300, currentStock: 100, entryDate: new Date(2024, 4, 1) },
    { id: 'PROD-006', name: 'Nido', initialStock: 80, currentStock: 75, entryDate: new Date(2023, 10, 20) },
];

const initialCapital: CapitalContribution[] = [
  { id: 'cap-001', date: new Date(2023, 0, 15), description: 'Initial Capital Injection', type: 'Cash', amount: 25000000 },
  { id: 'cap-002', date: new Date(2023, 5, 10), description: 'Toyota Hilux van for delivery', type: 'Asset', amount: 15000000 },
  { id: 'cap-003', date: new Date(2024, 2, 1), description: 'Owner loan to business', type: 'Liability', amount: 5000000 },
];

const initialAssets: Asset[] = initialCapital
    .filter(c => c.type === 'Asset')
    .map(c => ({
        id: c.id,
        name: c.description,
        cost: c.amount,
        acquisitionDate: c.date,
        depreciationRate: 25, // Default rate
        status: 'Active',
        accumulatedDepreciation: 0,
        netBookValue: c.amount,
        source: 'Capital'
    }));

const initialExpenses: Expense[] = [
  { id: 'exp-001', description: 'Umeme wa LUKU ofisini', category: 'Umeme', amount: 50000, date: new Date(2024, 4, 20), status: 'Approved', paymentMethod: 'Mobile' },
  { id: 'exp-002', description: 'Nauli ya kwenda kwa mteja', category: 'Usafiri', amount: 15000, date: new Date(2024, 4, 22), status: 'Pending' },
  { id: 'exp-003', description: 'Manunuzi ya karatasi na wino', category: 'Manunuzi Ofisi', amount: 75000, date: new Date(2024, 4, 18), status: 'Approved', paymentMethod: 'Cash' },
  { id: 'exp-004', description: 'Malipo ya vocha za simu', category: 'Mawasiliano', amount: 20000, date: new Date(2024, 4, 23), status: 'Pending' },
];


// --- Context Definition ---
interface FinancialContextType {
    transactions: Transaction[];
    payables: Payable[];
    prepayments: CustomerPrepayment[];
    products: Product[];
    assets: Asset[];
    capitalContributions: CapitalContribution[];
    ownerLoans: OwnerLoan[];
    expenses: Expense[];
    cashBalances: { cash: number; bank: number; mobile: number };
    markReceivableAsPaid: (id: string, paymentMethod: PaymentMethod) => void;
    markPayableAsPaid: (id: string, paymentMethod: PaymentMethod) => void;
    markPrepaymentAsUsed: (id: string) => void;
    markPrepaymentAsRefunded: (id: string) => void;
    addAsset: (assetData: AddAssetData) => void;
    sellAsset: (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => void;
    writeOffAsset: (id: string) => void;
    addCapitalContribution: (data: Omit<CapitalContribution, 'id'>) => void;
    repayOwnerLoan: (loanId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => void;
    addDrawing: (data: DrawingData) => void;
    addExpense: (data: AddExpenseData) => void;
    approveExpense: (id: string, paymentMethod: PaymentMethod) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// --- Helper Functions ---
const calculateDepreciation = (asset: Asset): { accumulatedDepreciation: number; netBookValue: number } => {
    const years = differenceInYears(new Date(), asset.acquisitionDate);
    if (years < 1) {
        return { accumulatedDepreciation: 0, netBookValue: asset.cost };
    }
    
    let netBookValue = asset.cost;
    let accumulatedDepreciation = 0;

    for (let i = 0; i < years; i++) {
        const depreciationForYear = netBookValue * (asset.depreciationRate / 100);
        netBookValue -= depreciationForYear;
        accumulatedDepreciation += depreciationForYear;
    }
    
    return { accumulatedDepreciation, netBookValue };
};

// --- Context Provider ---
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [payables, setPayables] = useState<Payable[]>(initialPayables);
    const [prepayments, setPrepayments] = useState<CustomerPrepayment[]>(initialPrepayments);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [capitalContributions, setCapitalContributions] = useState<CapitalContribution[]>(initialCapital);
    const [ownerLoans, setOwnerLoans] = useState<OwnerLoan[]>([]);
    const [assets, setAssets] = useState<Asset[]>(() => {
         return initialAssets.map(asset => {
            const { accumulatedDepreciation, netBookValue } = calculateDepreciation(asset);
            return { ...asset, accumulatedDepreciation, netBookValue };
        });
    });
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [cashBalances, setCashBalances] = useState({ cash: 0, bank: 0, mobile: 0 });

    const recalculateBalances = useCallback(() => {
        let cash = 0;
        let bank = 0;
        let mobile = 0;

        // Inflows from Capital
        capitalContributions.forEach(c => {
            if (c.type === 'Cash') cash += c.amount;
            if (c.type === 'Bank') bank += c.amount;
            if (c.type === 'Liability') {
              // Assume loans are given in cash unless specified
              cash += c.amount;
            }
        });

        // Outflows from Drawings
        capitalContributions.filter(c => c.type === 'Drawing').forEach(d => {
            if (d.source === 'Cash') cash -= d.amount;
            if (d.source === 'Bank') bank -= d.amount;
            if (d.source === 'Mobile') mobile -= d.amount;
        });

        // Inflows from Sales
        transactions.forEach(t => {
            if (t.status === 'Paid') {
                if (t.paymentMethod === 'Cash') cash += t.amount;
                if (t.paymentMethod === 'Bank') bank += t.amount;
                if (t.paymentMethod === 'Mobile') mobile += t.amount;
            }
        });
        
        // Outflows from Expenses
        expenses.forEach(e => {
            if (e.status === 'Approved') {
                if (e.paymentMethod === 'Cash') cash -= e.amount;
                if (e.paymentMethod === 'Bank') bank -= e.amount;
                if (e.paymentMethod === 'Mobile') mobile -= e.amount;
            }
        });

        // Outflows from paying suppliers
        payables.forEach(p => {
            if (p.status === 'Paid') {
                if (p.paymentMethod === 'Cash') cash -= p.amount;
                if (p.paymentMethod === 'Bank') bank -= p.amount;
                if (p.paymentMethod === 'Mobile') mobile -= p.amount;
            }
        });
        
        // Asset Sales
        transactions
            .filter(t => t.notes === 'Asset Sale')
            .forEach(t => {
                if (t.paymentMethod === 'Cash') cash += t.amount;
                if (t.paymentMethod === 'Bank') bank += t.amount;
                if (t.paymentMethod === 'Mobile') mobile += t.amount;
            });

        setCashBalances({ cash, bank, mobile });

    }, [transactions, capitalContributions, expenses, payables]);

    useEffect(() => {
        const loans = capitalContributions
            .filter(c => c.type === 'Liability')
            .map(c => ({
                id: c.id,
                date: c.date,
                description: c.description,
                amount: c.amount,
                repaid: ownerLoans.find(l => l.id === c.id)?.repaid || 0
            }));
        setOwnerLoans(loans);
        recalculateBalances();
    }, [capitalContributions, transactions, expenses, payables, recalculateBalances]);


    const markReceivableAsPaid = (id: string, paymentMethod: PaymentMethod) => {
        setTransactions(prev => {
            const receivable = prev.find(t => t.id === id);
            if (!receivable) return prev;
            
            const newTransaction: Transaction = {
                 id: `txn-${Date.now()}`,
                 name: receivable.name,
                 phone: receivable.phone,
                 amount: receivable.amount,
                 status: 'Paid',
                 date: new Date(),
                 paymentMethod: paymentMethod,
                 product: "Debt Repayment",
                 notes: "Debt Repayment"
            }

            return [...prev.filter(t => t.id !== id), newTransaction];
        });
    };

    const markPayableAsPaid = (id: string, paymentMethod: PaymentMethod) => {
        setPayables(prev =>
            prev.map(p =>
                p.id === id ? { ...p, status: 'Paid', paymentMethod: paymentMethod } : p
            )
        );
    };

    const markPrepaymentAsUsed = (id: string) => {
        setPrepayments(prev =>
            prev.map(p => (p.id === id ? { ...p, status: 'Used' } : p))
        );
    };

    const markPrepaymentAsRefunded = (id: string) => {
        setPrepayments(prev =>
            prev.map(p => (p.id === id ? { ...p, status: 'Refunded' } : p))
        );
    };
    
    const addAsset = (assetData: AddAssetData) => {
        const newAsset: Asset = {
            id: `ast-${Date.now()}`,
            ...assetData,
            status: 'Active',
            accumulatedDepreciation: 0,
            netBookValue: assetData.cost,
            source: 'Purchase'
        };
        const { accumulatedDepreciation, netBookValue } = calculateDepreciation(newAsset);
        newAsset.accumulatedDepreciation = accumulatedDepreciation;
        newAsset.netBookValue = netBookValue;
        setAssets(prev => [...prev, newAsset]);
    };
    
    const sellAsset = (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => {
        const assetToSell = assets.find(a => a.id === id);
        if (!assetToSell) return;

        setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'Sold', netBookValue: 0 } : a));

        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            name: "Asset Sale",
            phone: "",
            amount: sellPrice,
            status: paymentMethod === 'Credit' ? 'Credit' : 'Paid',
            date: new Date(),
            paymentMethod: paymentMethod,
            product: assetToSell.name,
            notes: 'Asset Sale',
        };
        setTransactions(prev => [...prev, newTransaction]);
    };

    const writeOffAsset = (id: string) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'Written Off', netBookValue: 0 } : a));
    };
    
    const addCapitalContribution = (data: Omit<CapitalContribution, 'id'>) => {
        const newContribution: CapitalContribution = {
            id: `cap-${Date.now()}`,
            ...data
        };
        setCapitalContributions(prev => [...prev, newContribution]);
    };
    
    const repayOwnerLoan = (loanId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => {
        // This function needs to reduce cash and also reduce the liability on the capital side.
        // For simplicity, let's just record a "negative" capital contribution (a drawing for loan repayment)
        const newDrawing: CapitalContribution = {
            id: `draw-${Date.now()}`,
            date: new Date(),
            description: `Loan Repayment: ${notes}`,
            type: 'Drawing',
            amount: amount,
            source: paymentMethod
        };
        setCapitalContributions(prev => [...prev, newDrawing]);

        // And update the repaid amount on the loan
        setOwnerLoans(prev => prev.map(loan => 
            loan.id === loanId ? { ...loan, repaid: loan.repaid + amount } : loan
        ));
    };
    
    const addDrawing = (data: DrawingData) => {
        const newDrawing: CapitalContribution = {
            id: `draw-${Date.now()}`,
            date: new Date(),
            description: data.description,
            type: 'Drawing',
            amount: data.amount,
            source: data.source
        };
        setCapitalContributions(prev => [...prev, newDrawing]);
    };

    const addExpense = (data: AddExpenseData) => {
        const newExpense: Expense = {
            id: `exp-${Date.now()}`,
            ...data,
            status: 'Pending'
        };
        setExpenses(prev => [...prev, newExpense]);
    };
    
    const approveExpense = (id: string, paymentMethod: PaymentMethod) => {
        setExpenses(prev => 
            prev.map(exp => 
                exp.id === id ? { ...exp, status: 'Approved', paymentMethod } : exp
            )
        );
    };


    const contextValue: FinancialContextType = {
        transactions,
        payables,
        prepayments,
        products,
        assets,
        capitalContributions,
        ownerLoans,
        expenses,
        cashBalances,
        markReceivableAsPaid,
        markPayableAsPaid,
        markPrepaymentAsUsed,
        markPrepaymentAsRefunded,
        addAsset,
        sellAsset,
        writeOffAsset,
        addCapitalContribution,
        repayOwnerLoan,
        addDrawing,
        addExpense,
        approveExpense
    };

    return (
        <FinancialContext.Provider value={contextValue}>
            {children}
        </FinancialContext.Provider>
    );
};

export const useFinancials = (): FinancialContextType => {
    const context = useContext(FinancialContext);
    if (context === undefined) {
        throw new Error('useFinancials must be used within a FinancialProvider');
    }
    return context;
};
