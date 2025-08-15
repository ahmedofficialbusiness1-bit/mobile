
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { differenceInYears, format, isAfter } from 'date-fns';
import type { SaleFormData } from '@/app/sales/sale-form';

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

export interface Customer {
    id: string;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    location?: string;
}

export interface Product {
  id: string; // SKU
  name: string;
  category: string;
  description?: string;
  barcode?: string;
  initialStock: number;
  currentStock: number;
  uom: string; // Unit of Measure
  reorderLevel: number;
  reorderQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  entryDate: Date; // Date Received
  expiryDate?: Date;
  lastUpdated: Date;
  location?: string;
  batchNumber?: string;
  supplier?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
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
    customers: Customer[];
    products: Product[];
    assets: Asset[];
    capitalContributions: CapitalContribution[];
    ownerLoans: OwnerLoan[];
    expenses: Expense[];
    employees: Employee[];
    payrollHistory: PayrollRun[];
    purchaseOrders: PurchaseOrder[];
    cashBalances: { cash: number; bank: number; mobile: number };
    addSale: (saleData: SaleFormData) => void;
    markReceivableAsPaid: (id: string, amount: number, paymentMethod: PaymentMethod) => void;
    markPayableAsPaid: (id: string, amount: number, paymentMethod: PaymentMethod) => void;
    markPrepaymentAsUsed: (id: string) => void;
    markPrepaymentAsRefunded: (id: string) => void;
    addCustomer: (customerData: Omit<Customer, 'id'>) => void;
    updateCustomer: (id: string, customerData: Omit<Customer, 'id'>) => void;
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
    receivePurchaseOrder: (poId: string) => void;
    payPurchaseOrder: (poId: string, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => void;
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

const getProductStatus = (product: Omit<Product, 'status' | 'initialStock'>): Product['status'] => {
    const now = new Date();
    if (product.expiryDate && isAfter(now, product.expiryDate)) {
        return 'Expired';
    }
    if (product.currentStock <= 0) {
        return 'Out of Stock';
    }
    if (product.currentStock <= product.reorderLevel) {
        return 'Low Stock';
    }
    return 'In Stock';
}


// --- Context Provider ---
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payables, setPayables] = useState<Payable[]>([]);
    const [prepayments, setPrepayments] = useState<CustomerPrepayment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
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
        recalculateBalances();
    }, [recalculateBalances]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capitalContributions]);


    const addSale = (saleData: SaleFormData) => {
        const product = products.find(p => p.id === saleData.productId);
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.currentStock < saleData.quantity) {
            throw new Error(`Not enough stock for ${product.name}. Only ${product.currentStock} available.`);
        }

        // 1. Create new transaction
        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            name: saleData.customerName,
            phone: saleData.customerPhone,
            amount: product.sellingPrice * saleData.quantity,
            status: saleData.paymentMethod === 'Credit' ? 'Credit' : 'Paid',
            date: new Date(),
            paymentMethod: saleData.paymentMethod,
            product: product.name,
            notes: 'Retail Sale',
        };
        setTransactions(prev => [...prev, newTransaction].sort((a,b) => b.date.getTime() - a.date.getTime()));

        // 2. Update product stock
        setProducts(prev => prev.map(p => {
            if (p.id === saleData.productId) {
                const updatedProduct = {
                    ...p,
                    currentStock: p.currentStock - saleData.quantity,
                    lastUpdated: new Date(),
                };
                return {
                    ...updatedProduct,
                    status: getProductStatus(updatedProduct)
                }
            }
            return p;
        }));

        // 3. Add or update customer if they are new
        if (saleData.customerType === 'new') {
            setCustomers(prev => {
                const existingCustomer = prev.find(c => c.phone === saleData.customerPhone);
                if (existingCustomer) {
                    return prev; // Customer already exists
                }
                const newCustomer: Customer = {
                    id: `cust-${Date.now()}`,
                    name: saleData.customerName,
                    phone: saleData.customerPhone,
                };
                return [...prev, newCustomer];
            });
        }
    }

    const markReceivableAsPaid = (id: string, amount: number, paymentMethod: PaymentMethod) => {
        let receivableToUpdate = transactions.find(t => t.id === id);
        if (!receivableToUpdate) return;
        
        const remainingAmount = receivableToUpdate.amount - amount;

        // Create the payment transaction
        const paymentTransaction: Transaction = {
            id: `txn-pay-${Date.now()}`,
            name: receivableToUpdate.name,
            phone: receivableToUpdate.phone,
            amount: amount,
            status: 'Paid',
            date: new Date(),
            paymentMethod: paymentMethod,
            product: `Payment for ${receivableToUpdate.product}`,
            notes: "Debt Repayment"
        };
        
        if (remainingAmount <= 0) {
            // If fully paid, remove the credit transaction and add the payment transaction
            setTransactions(prev => [...prev.filter(t => t.id !== id), paymentTransaction]);
        } else {
            // If partially paid, update the credit transaction amount and add the payment transaction
            setTransactions(prev => [
                ...prev.map(t => t.id === id ? { ...t, amount: remainingAmount } : t),
                paymentTransaction
            ]);
        }
    };

    const markPayableAsPaid = (id: string, amount: number, paymentMethod: PaymentMethod) => {
        setPayables(prev => {
            const payable = prev.find(p => p.id === id);
            if (!payable) return prev;

            const remainingAmount = payable.amount - amount;

            if (remainingAmount <= 0) {
                return prev.map(p => p.id === id ? { ...p, status: 'Paid', amount: payable.amount, paymentMethod } : p);
            } else {
                return prev.map(p => p.id === id ? { ...p, amount: remainingAmount } : p);
            }
        });
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

    const addCustomer = (customerData: Omit<Customer, 'id'>) => {
        const newCustomer: Customer = {
            id: `cust-${Date.now()}`,
            ...customerData,
        };
        setCustomers(prev => [...prev, newCustomer]);
    };

    const updateCustomer = (id: string, customerData: Omit<Customer, 'id'>) => {
        setCustomers(prev =>
            prev.map(c => (c.id === id ? { id, ...customerData } : c))
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
        setPurchaseOrders(prev => [...prev, newPO]);

        if (newPO.paymentTerms.startsWith('Credit')) {
            const totalAmount = newPO.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const newPayable: Payable = {
                id: `payable-po-${newPO.id}`,
                supplierName: newPO.supplierName,
                product: `From PO #${newPO.poNumber}`,
                amount: totalAmount,
                date: newPO.purchaseDate,
                status: 'Unpaid'
            };
            setPayables(prev => [...prev, newPayable]);
        }
    }

    const receivePurchaseOrder = (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, receivingStatus: 'Received' } : p));
        
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            po.items.forEach(item => {
                const existingProductIndex = updatedProducts.findIndex(p => p.name.toLowerCase() === item.description.toLowerCase());
                
                if (existingProductIndex !== -1) {
                    const existingProduct = updatedProducts[existingProductIndex];
                    const newStock = existingProduct.currentStock + item.quantity;
                    const updatedProduct = {
                        ...existingProduct,
                        currentStock: newStock,
                        lastUpdated: new Date(),
                    };
                    updatedProducts[existingProductIndex] = {
                        ...updatedProduct,
                        status: getProductStatus(updatedProduct)
                    }
                } else {
                    const newProductData = {
                        id: `sku-${Date.now()}-${item.description.slice(0,5)}`,
                        name: item.description,
                        description: item.description,
                        category: 'General',
                        initialStock: item.quantity,
                        currentStock: item.quantity,
                        uom: item.uom,
                        reorderLevel: 10, 
                        reorderQuantity: 20,
                        purchasePrice: item.unitPrice,
                        sellingPrice: item.sellingPrice,
                        entryDate: new Date(),
                        lastUpdated: new Date(),
                        supplier: po.supplierName,
                    };
                     const newProduct: Product = {
                        ...newProductData,
                        status: getProductStatus(newProductData),
                    };
                    updatedProducts.push(newProduct);
                }
            });
            return updatedProducts;
        });
    }
    
    const payPurchaseOrder = (poId: string, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, paymentStatus: 'Paid', paymentMethod: paymentMethod as any } : p));

        const payableId = `payable-po-${poId}`;
        const existingPayable = payables.find(p => p.id === payableId);

        if (existingPayable) {
            markPayableAsPaid(payableId, existingPayable.amount, paymentMethod);
        } else {
             // If it was a cash purchase initially, record it as an expense now
             const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0);
             const newExpense: Expense = {
                id: `exp-po-${po.id}`,
                description: `Payment for PO #${po.poNumber}`,
                category: 'Manunuzi Ofisi', // Or a more suitable category
                amount: totalAmount,
                date: new Date(),
                status: 'Approved',
                paymentMethod: paymentMethod,
            };
            setExpenses(prev => [...prev, newExpense]);
        }
    }


    const contextValue: FinancialContextType = {
        transactions,
        payables,
        prepayments,
        customers,
        products,
        assets,
        capitalContributions,
        ownerLoans,
        expenses,
        employees,
        payrollHistory,
        cashBalances,
        purchaseOrders,
        addSale,
        markReceivableAsPaid,
        markPayableAsPaid,
        markPrepaymentAsUsed,
        markPrepaymentAsRefunded,
        addCustomer,
        updateCustomer,
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
        addPurchaseOrder,
        receivePurchaseOrder,
        payPurchaseOrder
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
