
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { differenceInYears, format } from 'date-fns';

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

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number; // Gross Salary
  avatar: string;
}

export interface PayrollRun {
    month: string; // e.g., "May 2024"
    date: Date;
    totalGross: number;
    totalNet: number;
    paymentMethod: PaymentMethod;
}


export interface Expense {
  id: string;
  description: string;
  category: 'Umeme' | 'Maji' | 'Usafiri' | 'Mawasiliano' | 'Kodi' | 'Manunuzi Ofisi' | 'Matangazo' | 'Mishahara' | 'Mengineyo';
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved';
  paymentMethod?: PaymentMethod;
}

export type AddExpenseData = Omit<Expense, 'id' | 'status' | 'paymentMethod'>;

export interface PurchaseOrderItem {
  description: string
  quantity: number
  unitPrice: number
  sellingPrice: number
  uom: string
  totalPrice: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  purchaseDate: Date
  supplierName: string
  contactInformation?: string
  referenceNumber?: string
  items: PurchaseOrderItem[]
  paymentTerms: 'Cash' | 'Credit 30 days' | 'Credit 60 days'
  paymentStatus: 'Paid' | 'Unpaid'
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mpesa' | 'Credit'
  invoiceNumber?: string
  shippingMethod?: string
  expectedDeliveryDate?: Date
  receivingStatus: 'Pending' | 'Partial' | 'Received'
  shippingCost: number
  taxes: number
  otherCharges: number
}

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
    employees: Employee[];
    payrollHistory: PayrollRun[];
    purchaseOrders: PurchaseOrder[];
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
    addEmployee: (employeeData: Omit<Employee, 'id'>) => void;
    updateEmployee: (id: string, employeeData: Omit<Employee, 'id'>) => void;
    deleteEmployee: (id: string) => void;
    processPayroll: (paymentMethod: PaymentMethod, totalGross: number, totalNet: number) => void;
    addPurchaseOrder: (data: Omit<PurchaseOrder, 'id'>) => void;
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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payables, setPayables] = useState<Payable[]>([]);
    const [prepayments, setPrepayments] = useState<CustomerPrepayment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([]);
    const [capitalContributions, setCapitalContributions] = useState<CapitalContribution[]>([]);
    const [ownerLoans, setOwnerLoans] = useState<OwnerLoan[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
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
        
        // Payroll Payments
        payrollHistory.forEach(run => {
            if (run.paymentMethod === 'Cash') cash -= run.totalNet;
            if (run.paymentMethod === 'Bank') bank -= run.totalNet;
            if (run.paymentMethod === 'Mobile') mobile -= run.totalNet;
        });

        setCashBalances({ cash, bank, mobile });

    }, [transactions, capitalContributions, expenses, payables, payrollHistory]);

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
    }, [capitalContributions, transactions, expenses, payables, payrollHistory, recalculateBalances, ownerLoans]);


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
        // Record a drawing for the repayment amount
        const newDrawing: CapitalContribution = {
            id: `draw-repay-${Date.now()}`,
            date: new Date(),
            description: `Owner Loan Repayment: ${notes}`,
            type: 'Drawing',
            amount: amount,
            source: paymentMethod
        };
        setCapitalContributions(prev => [...prev, newDrawing]);

        // Update the repaid amount on the loan
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
            source: data.source,
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

    const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
        const newEmployee: Employee = {
            id: `emp-${Date.now()}`,
            ...employeeData
        };
        setEmployees(prev => [...prev, newEmployee]);
    };

    const updateEmployee = (id: string, employeeData: Omit<Employee, 'id'>) => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...employeeData } : emp));
    };

    const deleteEmployee = (id: string) => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
    };
    
    const processPayroll = (paymentMethod: PaymentMethod, totalGross: number, totalNet: number) => {
        const currentMonth = format(new Date(), 'MMMM yyyy');
        
        const newPayrollRun: PayrollRun = {
            month: currentMonth,
            date: new Date(),
            totalGross,
            totalNet,
            paymentMethod
        };
        setPayrollHistory(prev => [...prev, newPayrollRun]);

        const newExpense: Expense = {
            id: `exp-payroll-${Date.now()}`,
            description: `Payroll for ${currentMonth}`,
            category: 'Mishahara',
            amount: totalGross,
            date: new Date(),
            status: 'Approved',
            paymentMethod: paymentMethod
        };
        setExpenses(prev => [...prev, newExpense]);
    };

    const addPurchaseOrder = (data: Omit<PurchaseOrder, 'id'>) => {
        const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        ...data,
        }
        setPurchaseOrders(prev => [...prev, newPO])
    }


    const contextValue: FinancialContextType = {
        transactions,
        payables,
        prepayments,
        products,
        assets,
        capitalContributions,
        ownerLoans,
        expenses,
        employees,
        payrollHistory,
        cashBalances,
        purchaseOrders,
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
        approveExpense,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        processPayroll,
        addPurchaseOrder
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
