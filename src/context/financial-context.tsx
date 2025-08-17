
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { differenceInYears, format, isAfter } from 'date-fns';
import type { SaleFormData, VatRate } from '@/app/sales/sale-form';
import type { InvoiceFormData, InvoiceItem } from '@/app/invoices/invoice-form';
import { db } from '@/lib/firebase';
import { 
    collection, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc, 
    updateDoc, 
    Timestamp,
    writeBatch
} from 'firebase/firestore';


// --- Type Definitions ---
export type PaymentMethod = "Cash" | "Mobile" | "Bank" | "Credit" | "Prepaid";

const toDate = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    // Handle cases where it might already be a Date object during optimistic updates
    return timestamp;
}

export interface Transaction {
    id: string;
    name: string;
    phone: string;
    amount: number; // This is now grossAmount (including VAT)
    netAmount: number; // Amount before VAT
    vatAmount: number; // The VAT part of the amount
    status: 'Paid' | 'Credit';
    date: Date;
    paymentMethod: PaymentMethod;
    product: string;
    productId: string; // Keep track of product ID for stock reversal
    quantity: number; // Keep track of quantity for stock reversal
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

export interface UserAccount {
    id: string;
    companyName: string;
    email: string;
    phone: string;
    country: string;
}


export interface Product {
  id: string;
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
}

export interface OwnerLoan {
    id: string; // Will be the same as the capital contribution id
    date: Date;
    description: string;
    amount: number;
    repaid: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number; // Gross Salary
  avatar: string;
}

export interface PayrollRun {
    id: string;
    employeeId: string;
    month: string; // e.g., "May 2024"
    date: Date;
    grossSalary: number;
    netSalary: number;
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

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    issueDate: Date;
    dueDate: Date;
    items: InvoiceItem[];
    subtotal: number;
    vatAmount: number;
    totalAmount: number;
    status: 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Void';
}


// --- Context Definition ---
interface FinancialContextType {
    transactions: Transaction[];
    payables: Payable[];
    prepayments: CustomerPrepayment[];
    customers: Customer[];
    userAccounts: UserAccount[];
    products: Product[];
    assets: Asset[];
    capitalContributions: CapitalContribution[];
    ownerLoans: OwnerLoan[];
    expenses: Expense[];
    employees: Employee[];
    payrollHistory: PayrollRun[];
    purchaseOrders: PurchaseOrder[];
    invoices: Invoice[];
    cashBalances: { cash: number; bank: number; mobile: number };
    addSale: (saleData: SaleFormData) => Promise<void>;
    deleteSale: (saleId: string) => Promise<void>;
    markReceivableAsPaid: (id: string, amount: number, paymentMethod: PaymentMethod) => Promise<void>;
    markPayableAsPaid: (id: string, amount: number, paymentMethod: PaymentMethod) => Promise<void>;
    markPrepaymentAsUsed: (id: string) => Promise<void>;
    markPrepaymentAsRefunded: (id: string) => Promise<void>;
    addCustomer: (customerData: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (id: string, customerData: Omit<Customer, 'id'>) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    addUserAccount: (userData: Omit<UserAccount, 'id'> & { id: string }) => Promise<void>;
    deleteUserAccount: (id: string) => Promise<void>;
    addProduct: (productData: Omit<Product, 'id' | 'status'>) => Promise<void>;
    updateProduct: (id: string, productData: Omit<Product, 'id' | 'status'>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addAsset: (assetData: AddAssetData) => Promise<void>;
    sellAsset: (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => Promise<void>;
    writeOffAsset: (id: string) => Promise<void>;
    addCapitalContribution: (data: Omit<CapitalContribution, 'id'>) => Promise<void>;
    repayOwnerLoan: (loanId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => Promise<void>;
    addExpense: (data: AddExpenseData) => Promise<void>;
    approveExpense: (id: string, paymentData: { amount: number, paymentMethod: PaymentMethod }) => Promise<void>;
    deleteExpense: (id: string, paymentInfo?: { amount: number, paymentMethod: PaymentMethod }) => Promise<void>;
    addEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
    updateEmployee: (id: string, employeeData: Omit<Employee, 'id'>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    processPayroll: (paymentData: { amount: number, paymentMethod: PaymentMethod }, employeesToPay: { employeeId: string; grossSalary: number; netSalary: number }[]) => Promise<void>;
    paySingleEmployee: (data: { employeeId: string; grossSalary: number; netSalary: number; paymentMethod: PaymentMethod; }) => Promise<void>;
    addPurchaseOrder: (data: Omit<PurchaseOrder, 'id'>) => Promise<void>;
    deletePurchaseOrder: (poId: string) => Promise<void>;
    receivePurchaseOrder: (poId: string) => Promise<void>;
    payPurchaseOrder: (poId: string, paymentData: { amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' }) => Promise<void>;
    addInvoice: (invoiceData: InvoiceFormData) => Promise<void>;
    payInvoice: (invoiceId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => Promise<void>;
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

const getProductStatus = (product: Omit<Product, 'status'>): Product['status'] => {
    const now = new Date();
    if (product.expiryDate && isAfter(now, toDate(product.expiryDate))) {
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

function useFirestoreCollection<T>(collectionName: string, dateFields: string[] = ['date']) {
    const [data, setData] = useState<T[]>([]);

    const stableDateFields = useMemo(() => dateFields, [JSON.stringify(dateFields)]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
            const collectionData = snapshot.docs.map(doc => {
                const docData = doc.data();
                for (const field of stableDateFields) {
                    if (docData[field]) {
                        docData[field] = toDate(docData[field]);
                    }
                }
                return { id: doc.id, ...docData } as T;
            });
            setData(collectionData);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
        });

        return () => unsubscribe();
    }, [collectionName, stableDateFields]);

    return data;
}


// --- Context Provider ---
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const transactions = useFirestoreCollection<Transaction>('transactions', ['date']);
    const payables = useFirestoreCollection<Payable>('payables', ['date']);
    const prepayments = useFirestoreCollection<CustomerPrepayment>('prepayments', ['date']);
    const customers = useFirestoreCollection<Customer>('customers');
    const userAccounts = useFirestoreCollection<UserAccount>('userAccounts');
    const initialProducts = useFirestoreCollection<Product>('products', ['entryDate', 'expiryDate', 'lastUpdated']);
    const employees = useFirestoreCollection<Employee>('employees');
    const payrollHistory = useFirestoreCollection<PayrollRun>('payrollHistory', ['date']);
    const capitalContributions = useFirestoreCollection<CapitalContribution>('capitalContributions', ['date']);
    const initialAssets = useFirestoreCollection<Asset>('assets', ['acquisitionDate']);
    const expenses = useFirestoreCollection<Expense>('expenses', ['date']);
    const purchaseOrders = useFirestoreCollection<PurchaseOrder>('purchaseOrders', ['purchaseDate', 'expectedDeliveryDate']);
    const invoices = useFirestoreCollection<Invoice>('invoices', ['issueDate', 'dueDate']);

    const assets = useMemo(() => {
        return initialAssets.map(asset => {
            if (asset.status === 'Active') {
                const { accumulatedDepreciation, netBookValue } = calculateDepreciation(asset);
                return { ...asset, accumulatedDepreciation, netBookValue };
            }
            return asset;
        })
    }, [initialAssets]);

    const products = useMemo(() => {
        return initialProducts.map(product => ({
            ...product,
            status: getProductStatus(product)
        }))
    }, [initialProducts]);


    const [ownerLoans, setOwnerLoans] = useState<OwnerLoan[]>([]);
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

        // Outflows from paying suppliers/POs
        purchaseOrders.forEach(p => {
             if (p.paymentStatus === 'Paid' && p.paymentMethod !== 'Credit') {
                 const total = p.items.reduce((sum, i) => sum + i.totalPrice, 0);
                 if (p.paymentMethod === 'Cash') cash -= total;
                 if (p.paymentMethod === 'Bank Transfer') bank -= total;
                 if (p.paymentMethod === 'Mpesa') mobile -= total;
             }
        });
        
        // Payroll Payments
        payrollHistory.forEach(run => {
            if (run.paymentMethod === 'Cash') cash -= run.netSalary;
            if (run.paymentMethod === 'Bank') bank -= run.netSalary;
            if (run.paymentMethod === 'Mobile') mobile -= run.netSalary;
        });

        setCashBalances({ cash, bank, mobile });

    }, [transactions, capitalContributions, expenses, payrollHistory, purchaseOrders]);

    useEffect(() => {
        recalculateBalances();
    }, [recalculateBalances]);

    useEffect(() => {
       setOwnerLoans(prevOwnerLoans => {
            return capitalContributions
                .filter(c => c.type === 'Liability')
                .map(c => {
                    const existingLoan = prevOwnerLoans.find(l => l.id === c.id);
                    return {
                        id: c.id,
                        date: c.date,
                        description: c.description,
                        amount: c.amount,
                        repaid: existingLoan?.repaid || 0
                    };
                });
        });
    }, [capitalContributions]);


    const addSale = async (saleData: SaleFormData) => {
        const product = products.find(p => p.id === saleData.productId);
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.currentStock < saleData.quantity) {
            throw new Error(`Not enough stock for ${product.name}. Only ${product.currentStock} available.`);
        }
        
        const netAmount = product.sellingPrice * saleData.quantity;
        const vatAmount = netAmount * saleData.vatRate;
        const grossAmount = netAmount + vatAmount;

        const newTransaction = {
            name: saleData.customerName,
            phone: saleData.customerPhone,
            amount: grossAmount,
            netAmount: netAmount,
            vatAmount: vatAmount,
            status: saleData.paymentMethod === 'Credit' ? 'Credit' : 'Paid',
            date: new Date(),
            paymentMethod: saleData.paymentMethod,
            product: product.name,
            productId: product.id,
            quantity: saleData.quantity,
        };
        
        const batch = writeBatch(db);

        const transactionRef = collection(db, 'transactions');
        batch.set(doc(transactionRef), newTransaction);

        const productRef = doc(db, 'products', saleData.productId);
        const updatedStock = product.currentStock - saleData.quantity;
        const newStatus = getProductStatus({ ...product, currentStock: updatedStock });
        batch.update(productRef, { currentStock: updatedStock, status: newStatus, lastUpdated: new Date() });

        if (saleData.customerType === 'new') {
            const customerRef = collection(db, 'customers');
            batch.set(doc(customerRef), {
                name: saleData.customerName,
                phone: saleData.customerPhone,
                email: '',
                address: '',
            });
        }
        
        await batch.commit();
    }
    
    const deleteSale = async (saleId: string) => {
        const saleToDelete = transactions.find(t => t.id === saleId);
        if (!saleToDelete) {
            throw new Error("Sale not found.");
        }

        const batch = writeBatch(db);

        // Delete the sale transaction
        const saleRef = doc(db, 'transactions', saleId);
        batch.delete(saleRef);

        // Reverse the stock
        const product = products.find(p => p.id === saleToDelete.productId);
        if (product) {
            const productRef = doc(db, 'products', product.id);
            const updatedStock = product.currentStock + saleToDelete.quantity;
            const newStatus = getProductStatus({ ...product, currentStock: updatedStock });
            batch.update(productRef, { currentStock: updatedStock, status: newStatus, lastUpdated: new Date() });
        }

        await batch.commit();
    };


    const markReceivableAsPaid = async (id: string, amount: number, paymentMethod: PaymentMethod) => {
        const receivableToUpdate = transactions.find(t => t.id === id);
        if (!receivableToUpdate) return;
        
        const remainingAmount = receivableToUpdate.amount - amount;

        const paymentTransaction = {
            name: receivableToUpdate.name,
            phone: receivableToUpdate.phone,
            amount: amount,
            netAmount: amount / (1 + (receivableToUpdate.vatAmount / receivableToUpdate.netAmount)),
            vatAmount: amount - (amount / (1 + (receivableToUpdate.vatAmount / receivableToUpdate.netAmount))),
            status: 'Paid',
            date: new Date(),
            paymentMethod: paymentMethod,
            product: `Payment for ${receivableToUpdate.product}`,
            notes: "Debt Repayment",
            productId: '',
            quantity: 0,
        };
        
        const batch = writeBatch(db);
        
        const transactionCollectionRef = collection(db, 'transactions');
        batch.set(doc(transactionCollectionRef), paymentTransaction);

        const receivableRef = doc(db, 'transactions', id);
        if (remainingAmount <= 0) {
            batch.delete(receivableRef);
        } else {
            const originalNet = receivableToUpdate.netAmount;
            const originalGross = receivableToUpdate.amount;
            const newGross = remainingAmount;
            const newNet = (newGross / originalGross) * originalNet;
            const newVat = newGross - newNet;
            batch.update(receivableRef, { amount: newGross, netAmount: newNet, vatAmount: newVat });
        }
        
        await batch.commit();
    };

    const markPayableAsPaid = async (id: string, amount: number, paymentMethod: PaymentMethod) => {
        const balance = cashBalances[paymentMethod.toLowerCase() as keyof typeof cashBalances];
        if (amount > balance) {
            throw new Error(`Insufficient funds in ${paymentMethod} account.`);
        }
        const payableRef = doc(db, 'payables', id);
        await updateDoc(payableRef, { status: 'Paid', paymentMethod: paymentMethod });
    };

    const markPrepaymentAsUsed = async (id: string) => {
        await updateDoc(doc(db, 'prepayments', id), { status: 'Used' });
    };

    const markPrepaymentAsRefunded = async (id: string) => {
        await updateDoc(doc(db, 'prepayments', id), { status: 'Refunded' });
    };

    const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
        await addDoc(collection(db, 'customers'), customerData);
    };

    const updateCustomer = async (id: string, customerData: Omit<Customer, 'id'>) => {
        await updateDoc(doc(db, 'customers', id), customerData);
    };

    const deleteCustomer = async (id: string) => {
        await deleteDoc(doc(db, 'customers', id));
    };

    const addUserAccount = async (userData: Omit<UserAccount, 'id'> & { id: string }) => {
        const { id, ...data } = userData;
        await addDoc(collection(db, 'userAccounts'), data);
    }

    const deleteUserAccount = async (id: string) => {
        await deleteDoc(doc(db, 'userAccounts', id));
    }
    
    const addProduct = async (productData: Omit<Product, 'id' | 'status'>) => {
        const newProduct = {
            ...productData,
            status: getProductStatus(productData),
            initialStock: productData.currentStock,
            entryDate: new Date(),
            lastUpdated: new Date(),
        };
        await addDoc(collection(db, 'products'), newProduct);
    };
    
    const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'status'>) => {
        const updatedProduct = {
            ...productData,
            status: getProductStatus(productData),
            lastUpdated: new Date(),
        };
        await updateDoc(doc(db, 'products', id), updatedProduct);
    };

    const deleteProduct = async (id: string) => {
        await deleteDoc(doc(db, 'products', id));
    };

    const addAsset = async (assetData: AddAssetData) => {
        const newAssetData = {
            ...assetData,
            status: 'Active',
            accumulatedDepreciation: 0,
            netBookValue: assetData.cost,
            source: 'Purchase'
        };
        await addDoc(collection(db, 'assets'), newAssetData);
    };
    
    const sellAsset = async (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => {
        const assetToSell = assets.find(a => a.id === id);
        if (!assetToSell) return;

        const batch = writeBatch(db);

        const assetRef = doc(db, 'assets', id);
        batch.update(assetRef, { status: 'Sold', netBookValue: 0 });

        const newTransaction = {
            name: "Asset Sale",
            phone: "",
            amount: sellPrice,
            netAmount: sellPrice,
            vatAmount: 0,
            status: paymentMethod === 'Credit' ? 'Credit' : 'Paid',
            date: new Date(),
            paymentMethod: paymentMethod,
            product: assetToSell.name,
            notes: 'Asset Sale',
            productId: '',
            quantity: 0
        };
        const transactionRef = collection(db, 'transactions');
        batch.set(doc(transactionRef), newTransaction);
        
        await batch.commit();
    };

    const writeOffAsset = async (id: string) => {
        await updateDoc(doc(db, 'assets', id), { status: 'Written Off', netBookValue: 0 });
    };
    
    const addCapitalContribution = async (data: Omit<CapitalContribution, 'id'>) => {
        const batch = writeBatch(db);
        const capRef = collection(db, 'capitalContributions');
        batch.set(doc(capRef), data);

        if (data.type === 'Asset') {
            const assetData = {
                name: data.description,
                cost: data.amount,
                acquisitionDate: data.date,
                depreciationRate: 0,
                status: 'Active',
                accumulatedDepreciation: 0,
                netBookValue: data.amount,
                source: 'Capital'
            };
            const assetRef = collection(db, 'assets');
            batch.set(doc(assetRef), assetData);
        }
        await batch.commit();
    };
    
    const repayOwnerLoan = async (loanId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => {
        const balance = cashBalances[paymentMethod.toLowerCase() as keyof typeof cashBalances];
        if (amount > balance) {
            throw new Error(`Insufficient funds in ${paymentMethod} account.`);
        }
    };

    const addExpense = async (data: AddExpenseData) => {
        const newExpense = { ...data, status: 'Pending' };
        await addDoc(collection(db, 'expenses'), newExpense);
    };
    
    const approveExpense = async (id: string, paymentData: { amount: number, paymentMethod: PaymentMethod }) => {
        const { amount, paymentMethod } = paymentData;
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < amount) {
            throw new Error(`Insufficient funds in ${paymentMethod} account. Required: ${amount}, Available: ${cashBalances[balanceKey]}`);
        }
        await updateDoc(doc(db, 'expenses', id), { status: 'Approved', paymentMethod });
    };

    const deleteExpense = async (id: string, paymentInfo?: { amount: number, paymentMethod: PaymentMethod }) => {
        await deleteDoc(doc(db, 'expenses', id));
    };

    const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
        await addDoc(collection(db, 'employees'), employeeData);
    };

    const updateEmployee = async (id: string, employeeData: Omit<Employee, 'id'>) => {
        await updateDoc(doc(db, 'employees', id), employeeData);
    };

    const deleteEmployee = async (id: string) => {
        await deleteDoc(doc(db, 'employees', id));
    };
    
    const processPayroll = async (paymentData: { amount: number, paymentMethod: PaymentMethod }, employeesToPay: { employeeId: string; grossSalary: number; netSalary: number }[]) => {
        const { amount, paymentMethod } = paymentData;
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < amount) {
            throw new Error(`Insufficient funds for payroll in ${paymentMethod}. Required: ${amount}, Available: ${cashBalances[balanceKey]}`);
        }

        const currentMonth = format(new Date(), 'MMMM yyyy');
        const batch = writeBatch(db);

        const payrollRef = collection(db, 'payrollHistory');
        employeesToPay.forEach(emp => {
            const newRun = {
                employeeId: emp.employeeId,
                month: currentMonth,
                date: new Date(),
                grossSalary: emp.grossSalary,
                netSalary: emp.netSalary,
                paymentMethod: paymentMethod
            };
            batch.set(doc(payrollRef), newRun);
        });

        const totalGross = employeesToPay.reduce((sum, emp) => sum + emp.grossSalary, 0);
        const expenseRef = collection(db, 'expenses');
        const newExpense = {
            description: `Payroll for ${employeesToPay.length} employees for ${currentMonth}`,
            category: 'Mishahara',
            amount: totalGross,
            date: new Date(),
            status: 'Approved',
            paymentMethod: paymentMethod
        };
        batch.set(doc(expenseRef), newExpense);

        await batch.commit();
    };
    
    const paySingleEmployee = async (data: { employeeId: string; grossSalary: number; netSalary: number; paymentMethod: PaymentMethod; }) => {
        const { netSalary, paymentMethod, grossSalary, employeeId } = data;
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < netSalary) {
            throw new Error(`Insufficient funds for payroll in ${paymentMethod}. Required: ${netSalary}, Available: ${cashBalances[balanceKey]}`);
        }

        const currentMonth = format(new Date(), 'MMMM yyyy');
        const employee = employees.find(e => e.id === employeeId);
        const batch = writeBatch(db);

        const newPayrollRun = {
            employeeId: employeeId,
            month: currentMonth,
            date: new Date(),
            grossSalary: grossSalary,
            netSalary: netSalary,
            paymentMethod: paymentMethod
        };
        batch.set(doc(collection(db, 'payrollHistory')), newPayrollRun);

        const newExpense = {
            description: `Salary for ${employee?.name || employeeId} for ${currentMonth}`,
            category: 'Mishahara',
            amount: grossSalary,
            date: new Date(),
            status: 'Approved',
            paymentMethod: paymentMethod
        };
        batch.set(doc(collection(db, 'expenses')), newExpense);

        await batch.commit();
    };

    const addPurchaseOrder = async (data: Omit<PurchaseOrder, 'id'>) => {
        const batch = writeBatch(db);
        const poRef = collection(db, 'purchaseOrders');
        batch.set(doc(poRef), data);

        if (data.paymentStatus === 'Unpaid') {
            const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const newPayable = {
                supplierName: data.supplierName,
                product: `From PO #${data.poNumber}`,
                amount: totalAmount,
                date: data.purchaseDate,
                status: 'Unpaid'
            };
            const payableRef = collection(db, 'payables');
            batch.set(doc(payableRef), newPayable);
        }
        await batch.commit();
    }
    
    const deletePurchaseOrder = async (poId: string) => {
        await deleteDoc(doc(db, 'purchaseOrders', poId));
    }

    const receivePurchaseOrder = async (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        const batch = writeBatch(db);
        const poRef = doc(db, 'purchaseOrders', poId);
        batch.update(poRef, { receivingStatus: 'Received' });

        for (const item of po.items) {
            const existingProduct = products.find(p => p.name.toLowerCase() === item.description.toLowerCase());
            if (existingProduct) {
                const productRef = doc(db, 'products', existingProduct.id);
                const newStock = existingProduct.currentStock + item.quantity;
                const newStatus = getProductStatus({ ...existingProduct, currentStock: newStock });
                batch.update(productRef, { currentStock: newStock, status: newStatus, lastUpdated: new Date() });
            } else {
                const newProductData = {
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
                    status: 'In Stock'
                };
                const productRef = doc(collection(db, 'products'));
                batch.set(productRef, newProductData);
            }
        }
        await batch.commit();
    }
    
    const payPurchaseOrder = async (poId: string, paymentData: { amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' }) => {
        const { amount, paymentMethod } = paymentData;
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < amount) {
            throw new Error(`Insufficient funds in ${paymentMethod} account.`);
        }

        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        const batch = writeBatch(db);
        const poRef = doc(db, 'purchaseOrders', poId);
        batch.update(poRef, { paymentStatus: 'Paid', paymentMethod });

        const payable = payables.find(p => p.product === `From PO #${po.poNumber}`);
        if (payable) {
            const payableRef = doc(db, 'payables', payable.id);
            batch.update(payableRef, { status: 'Paid', paymentMethod });
        } else {
             const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0);
             const newExpense = {
                description: `Payment for PO #${po.poNumber}`,
                category: 'Manunuzi Ofisi',
                amount: totalAmount,
                date: new Date(),
                status: 'Approved',
                paymentMethod: paymentMethod,
            };
            batch.set(doc(collection(db, 'expenses')), newExpense);
        }
        await batch.commit();
    }

    const addInvoice = async (invoiceData: InvoiceFormData) => {
        const subtotal = invoiceData.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatAmount = subtotal * invoiceData.vatRate;
        const totalAmount = subtotal + vatAmount;

        const batch = writeBatch(db);
        
        const newInvoiceData = {
            invoiceNumber: invoiceData.invoiceNumber,
            customerId: invoiceData.customerId,
            customerName: invoiceData.customerName,
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            items: invoiceData.items,
            subtotal,
            vatAmount,
            totalAmount,
            status: 'Pending',
        };
        const invoiceRef = doc(collection(db, 'invoices'));
        batch.set(invoiceRef, newInvoiceData);

        const newTransaction = {
            name: invoiceData.customerName,
            phone: invoiceData.customerPhone,
            amount: totalAmount,
            netAmount: subtotal,
            vatAmount: vatAmount,
            status: 'Credit',
            date: invoiceData.issueDate,
            paymentMethod: 'Credit',
            product: `Invoice #${invoiceData.invoiceNumber}`,
            notes: 'Invoice Sale',
            productId: 'invoice',
            quantity: 1
        };
        const transactionRef = doc(collection(db, 'transactions'));
        batch.set(transactionRef, newTransaction);
        
        for (const item of invoiceData.items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const productRef = doc(db, 'products', item.productId);
                const updatedStock = product.currentStock - item.quantity;
                const newStatus = getProductStatus({ ...product, currentStock: updatedStock });
                batch.update(productRef, { currentStock: updatedStock, status: newStatus, lastUpdated: new Date() });
            }
        }
        
        await batch.commit();
    };

    const payInvoice = async (invoiceId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        const batch = writeBatch(db);

        const invoiceRef = doc(db, 'invoices', invoiceId);
        batch.update(invoiceRef, { status: 'Paid' });
        
        const transaction = transactions.find(t => t.product === `Invoice #${invoice.invoiceNumber}`);
        if (transaction) {
            const transactionRef = doc(db, 'transactions', transaction.id);
            batch.delete(transactionRef);

            const paymentTransaction = { ...transaction, status: 'Paid', amount, paymentMethod, date: new Date(), notes: 'Invoice Payment' };
            batch.set(doc(collection(db, 'transactions')), paymentTransaction);
        }

        await batch.commit();
    };


    const contextValue: FinancialContextType = {
        transactions,
        payables,
        prepayments,
        customers,
        userAccounts,
        products,
        assets,
        capitalContributions,
        ownerLoans,
        expenses,
        employees,
        payrollHistory,
        cashBalances,
        purchaseOrders,
        invoices,
        addSale,
        deleteSale,
        markReceivableAsPaid,
        markPayableAsPaid,
        markPrepaymentAsUsed,
        markPrepaymentAsRefunded,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addUserAccount,
        deleteUserAccount,
        addProduct,
        updateProduct,
        deleteProduct,
        addAsset,
        sellAsset,
        writeOffAsset,
        addCapitalContribution,
        repayOwnerLoan,
        addExpense,
        approveExpense,
        deleteExpense,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        processPayroll,
        paySingleEmployee,
        addPurchaseOrder,
        deletePurchaseOrder,
        receivePurchaseOrder,
        payPurchaseOrder,
        addInvoice,
        payInvoice
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
