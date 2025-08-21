

'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { differenceInYears, format, isAfter } from 'date-fns';
import type { SaleFormData, VatRate } from '@/app/sales/sale-form';
import type { InvoiceFormData, InvoiceItem } from '@/app/invoices/invoice-form';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
import { 
    collection, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc, 
    updateDoc, 
    Timestamp,
    writeBatch,
    query,
    where,
    getDocs,
    setDoc,
    getDoc,
    runTransaction
} from 'firebase/firestore';


// --- Type Definitions ---
export type PaymentMethod = "Cash" | "Mobile" | "Bank" | "Credit" | "Prepaid";

const toDate = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    // Handle cases where timestamp might be a string or number from Firestore
    if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
      return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date(); // Fallback, though should be avoided
}

export interface Transaction {
    id: string;
    userId: string;
    name: string;
    phone: string;
    amount: number;
    netAmount: number;
    vatAmount: number;
    status: 'Paid' | 'Credit';
    date: Date;
    paymentMethod: PaymentMethod;
    product: string;
    productId: string;
    quantity: number;
    notes?: string;
}

export interface Payable {
    id: string;
    userId: string;
    supplierName: string;
    product: string;
    amount: number;
    date: Date;
    status: 'Unpaid' | 'Paid';
    paymentMethod?: PaymentMethod;
}

export interface CustomerPrepayment {
    id: string;
    userId: string;
    customerName: string;
    phone: string;
    prepaidAmount: number;
    date: Date;
    status: 'Active' | 'Used' | 'Refunded';
}

export interface Customer {
    id: string;
    userId: string;
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
  userId: string;
  name: string;
  category: string;
  description?: string;
  barcode?: string;
  initialStock: number;
  currentStock: number;
  uom: string; 
  reorderLevel: number;
  reorderQuantity: number;
  purchasePrice: number;
  sellingPrice: number; // This will no longer be used for sales calculation but kept for reference
  entryDate: Date;
  expiryDate?: Date;
  lastUpdated: Date;
  location?: string;
  batchNumber?: string;
  supplier?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
}


export interface Asset {
    id: string;
    userId: string;
    name: string;
    cost: number;
    acquisitionDate: Date;
    depreciationRate: number;
    status: 'Active' | 'Sold' | 'Written Off';
    accumulatedDepreciation: number;
    netBookValue: number;
    source: 'Capital' | 'Purchase';
}

export type AddAssetData = Omit<Asset, 'id' | 'status' | 'accumulatedDepreciation' | 'netBookValue' | 'source' | 'userId'>;

export interface CapitalContribution {
  id: string;
  userId: string;
  date: Date;
  description: string;
  type: 'Cash' | 'Bank' | 'Asset' | 'Liability' | 'Drawing';
  amount: number;
}

export interface OwnerLoan {
    id: string; 
    userId: string;
    date: Date;
    description: string;
    amount: number;
    repaid: number;
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  position: string;
  salary: number;
  avatar: string;
}

export interface PayrollRun {
    id: string;
    userId: string;
    employeeId: string;
    month: string;
    date: Date;
    grossSalary: number;
    netSalary: number;
    paymentMethod: PaymentMethod;
}


export interface Expense {
  id: string;
  userId: string;
  description: string;
  category: 'Umeme' | 'Maji' | 'Usafiri' | 'Mawasiliano' | 'Kodi' | 'Manunuzi Ofisi' | 'Matangazo' | 'Mishahara' | 'Mengineyo';
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved';
  paymentMethod?: PaymentMethod;
}

export type AddExpenseData = Omit<Expense, 'id' | 'status' | 'paymentMethod' | 'userId'>;

export interface PurchaseOrderItem {
  description: string
  modelNo?: string
  quantity: number
  unitPrice: number
  uom: string
  totalPrice: number
}

export interface PurchaseOrder {
  id: string
  userId: string;
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
    userId: string;
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
    companyName: string;
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
    addCustomer: (customerData: Omit<Customer, 'id' | 'userId'>) => Promise<void>;
    updateCustomer: (id: string, customerData: Omit<Customer, 'id' | 'userId'>) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    addUserAccount: (userData: Omit<UserAccount, 'id'> & { id: string }) => Promise<void>;
    deleteUserAccount: (id: string) => Promise<void>;
    addProduct: (productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'sellingPrice'>) => Promise<void>;
    updateProduct: (id: string, productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'sellingPrice'>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addAsset: (assetData: AddAssetData) => Promise<void>;
    sellAsset: (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => Promise<void>;
    writeOffAsset: (id: string) => Promise<void>;
    addCapitalContribution: (data: Omit<CapitalContribution, 'id' | 'userId'>) => Promise<void>;
    repayOwnerLoan: (loanId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => Promise<void>;
    addExpense: (data: AddExpenseData) => Promise<void>;
    approveExpense: (id: string, paymentData: { amount: number, paymentMethod: PaymentMethod }) => Promise<void>;
    deleteExpense: (expenseId: string, paymentDetails?: { amount: number, paymentMethod: PaymentMethod }) => Promise<void>;
    addEmployee: (employeeData: Omit<Employee, 'id' | 'userId'>) => Promise<void>;
    updateEmployee: (id: string, employeeData: Omit<Employee, 'id' | 'userId'>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    processPayroll: (paymentData: { amount: number, paymentMethod: PaymentMethod }, employeesToPay: { employeeId: string; grossSalary: number; netSalary: number }[]) => Promise<void>;
    paySingleEmployee: (data: { employeeId: string; grossSalary: number; netSalary: number; paymentMethod: PaymentMethod; }) => Promise<void>;
    addPurchaseOrder: (data: Omit<PurchaseOrder, 'id' | 'userId'>) => Promise<void>;
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

const getProductStatus = (product: Omit<Product, 'status'|'id'|'userId'>): Product['status'] => {
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
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<T[]>([]);
    const stableCollectionName = collectionName;
    const stableDateFields = JSON.stringify(dateFields);

    useEffect(() => {
        if (authLoading || !user) {
            setData([]);
            return;
        }

        const q = query(collection(db, stableCollectionName), where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const collectionData = snapshot.docs.map(doc => {
                const docData = doc.data();
                const parsedDateFields = JSON.parse(stableDateFields);
                for (const field of parsedDateFields) {
                    if (docData[field]) {
                        docData[field] = toDate(docData[field]);
                    }
                }
                return { id: doc.id, ...docData } as T;
            });
            setData(collectionData);
        }, (error) => {
            console.error(`Error fetching ${stableCollectionName}:`, error);
        });

        return () => unsubscribe();
    }, [stableCollectionName, stableDateFields, user, authLoading]);

    return data;
}

function useFirestoreUserAccounts() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [data, setData] = useState<UserAccount[]>([]);
    
    useEffect(() => {
        if (authLoading || !user) {
            setData([]);
            return;
        }

        const fetchAccounts = async () => {
            if (isAdmin) {
                const q = collection(db, 'userAccounts');
                 const unsubscribe = onSnapshot(q, (snapshot) => {
                    const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
                    setData(accountsData);
                }, (error) => {
                    console.error('Error fetching userAccounts:', error);
                });
                return unsubscribe;
            } else {
                const userDocRef = doc(db, 'userAccounts', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setData([{ id: docSnap.id, ...docSnap.data() } as UserAccount]);
                } else {
                    setData([]);
                }
                return () => {}; // No real-time listener for single doc, so return empty unsub
            }
        };

        const unsubscribePromise = fetchAccounts();

        return () => {
            unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
        };
    }, [user, authLoading, isAdmin]);
    
    return data;
}


// --- Context Provider ---
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const transactions = useFirestoreCollection<Transaction>('transactions', ['date']);
    const payables = useFirestoreCollection<Payable>('payables', ['date']);
    const prepayments = useFirestoreCollection<CustomerPrepayment>('prepayments', ['date']);
    const customers = useFirestoreCollection<Customer>('customers');
    const userAccounts = useFirestoreUserAccounts();
    const initialProducts = useFirestoreCollection<Product>('products', ['entryDate', 'expiryDate', 'lastUpdated']);
    const employees = useFirestoreCollection<Employee>('employees');
    const payrollHistory = useFirestoreCollection<PayrollRun>('payrollHistory', ['date']);
    const capitalContributions = useFirestoreCollection<CapitalContribution>('capitalContributions', ['date']);
    const initialAssets = useFirestoreCollection<Asset>('assets', ['acquisitionDate']);
    const expenses = useFirestoreCollection<Expense>('expenses', ['date']);
    const purchaseOrders = useFirestoreCollection<PurchaseOrder>('purchaseOrders', ['purchaseDate', 'expectedDeliveryDate']);
    const invoices = useFirestoreCollection<Invoice>('invoices', ['issueDate', 'dueDate']);

    const currentUserAccount = React.useMemo(() => {
        if (!user || userAccounts.length === 0 || authLoading) return null;
        const account = userAccounts.find(acc => acc.id === user.uid);
        return account;
    }, [user, userAccounts, authLoading]);

    const companyName = useMemo(() => currentUserAccount?.companyName || "DiraBiz", [currentUserAccount]);

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


    const ownerLoans = useMemo(() => {
        return capitalContributions
            .filter(c => c.type === 'Liability')
            .map(c => {
                return {
                    id: c.id,
                    userId: c.userId,
                    date: c.date,
                    description: c.description,
                    amount: c.amount,
                    repaid: 0 
                };
            });
    }, [capitalContributions]);

    const cashBalances = useMemo(() => {
        let cash = 0;
        let bank = 0;
        let mobile = 0;

        capitalContributions.forEach(c => {
            if (c.type === 'Cash') cash += c.amount;
            else if (c.type === 'Bank') bank += c.amount;
        });

        transactions.forEach(t => {
            if (t.status === 'Paid') {
                if (t.paymentMethod === 'Cash') cash += t.amount;
                else if (t.paymentMethod === 'Bank') bank += t.amount;
                else if (t.paymentMethod === 'Mobile') mobile += t.amount;
            }
        });

        prepayments.forEach(p => {
            if (p.status === 'Active') {
                // Assuming prepayments hit the bank
                bank += p.prepaidAmount;
            }
        });
        
        expenses.forEach(e => {
            if (e.status === 'Approved' && e.paymentMethod) {
                if (e.paymentMethod === 'Cash') cash -= e.amount;
                else if (e.paymentMethod === 'Bank') bank -= e.amount;
                else if (e.paymentMethod === 'Mobile') mobile -= e.amount;
            }
        });
        
        return { cash, bank, mobile };
    }, [transactions, capitalContributions, expenses, prepayments]);

    const addSale = async (saleData: SaleFormData) => {
        if (!user) throw new Error("User not authenticated.");
        const productRef = doc(db, 'products', saleData.productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) throw new Error("Product not found");
        
        const product = {id: productSnap.id, ...productSnap.data()} as Product;

        if (product.currentStock < saleData.quantity) {
            throw new Error(`Not enough stock for ${product.name}. Only ${product.currentStock} available.`);
        }
        
        const grossAmount = saleData.unitPrice * saleData.quantity;
        const netAmount = grossAmount / (1 + saleData.vatRate);
        const vatAmount = grossAmount - netAmount;

        const newTransaction = {
            userId: user.uid,
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
        batch.set(doc(collection(db, 'transactions')), newTransaction);

        const updatedStock = product.currentStock - saleData.quantity;
        const newStatus = getProductStatus({ ...product, currentStock: updatedStock });
        batch.update(productRef, { currentStock: updatedStock, status: newStatus, lastUpdated: new Date() });

        if (saleData.customerType === 'new') {
            const customerQuery = query(collection(db, 'customers'), where('phone', '==', saleData.customerPhone), where('userId', '==', user.uid));
            const existingCustomer = await getDocs(customerQuery);
            if (existingCustomer.empty) {
                 batch.set(doc(collection(db, 'customers')), {
                    userId: user.uid,
                    name: saleData.customerName,
                    phone: saleData.customerPhone,
                });
            }
        }
        
        await batch.commit();
    }
    
    const deleteSale = async (saleId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const saleRef = doc(db, 'transactions', saleId);
        
        await runTransaction(db, async (transaction) => {
            const saleDoc = await transaction.get(saleRef);
            if (!saleDoc.exists()) throw new Error("Sale not found.");
            
            const saleToDelete = saleDoc.data() as Transaction;
            
            // Reverse stock
            if (saleToDelete.productId) {
                const productRef = doc(db, 'products', saleToDelete.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    const product = productDoc.data() as Product;
                    const updatedStock = product.currentStock + saleToDelete.quantity;
                    const newStatus = getProductStatus({ ...product, currentStock: updatedStock });
                    transaction.update(productRef, { currentStock: updatedStock, status: newStatus, lastUpdated: new Date() });
                }
            }

            // Delete the sale
            transaction.delete(saleRef);
        });
    };

    const markReceivableAsPaid = async (id: string, amount: number, paymentMethod: PaymentMethod) => {
        if (!user) throw new Error("User not authenticated.");
        const receivableRef = doc(db, 'transactions', id);
        
        await runTransaction(db, async (transaction) => {
            const receivableDoc = await transaction.get(receivableRef);
            if (!receivableDoc.exists()) throw new Error("Receivable not found.");
            
            const receivableToUpdate = receivableDoc.data() as Transaction;
            const remainingAmount = receivableToUpdate.amount - amount;

            const paymentTransaction = {
                userId: user.uid,
                name: receivableToUpdate.name,
                phone: receivableToUpdate.phone,
                amount: amount,
                netAmount: amount / (1 + (receivableToUpdate.vatAmount / receivableToUpdate.netAmount || 0.18)),
                vatAmount: amount - (amount / (1 + (receivableToUpdate.vatAmount / receivableToUpdate.netAmount || 0.18))),
                status: 'Paid',
                date: new Date(),
                paymentMethod: paymentMethod,
                product: `Payment for ${receivableToUpdate.product}`,
                notes: "Debt Repayment",
                productId: '',
                quantity: 0,
            };
            transaction.set(doc(collection(db, 'transactions')), paymentTransaction);

            if (remainingAmount <= 0) {
                transaction.delete(receivableRef);
            } else {
                const originalNet = receivableToUpdate.netAmount;
                const originalGross = receivableToUpdate.amount;
                const newGross = remainingAmount;
                const newNet = (newGross / originalGross) * originalNet;
                const newVat = newGross - newNet;
                transaction.update(receivableRef, { amount: newGross, netAmount: newNet, vatAmount: newVat });
            }
        });
    };

    const markPayableAsPaid = async (id: string, amount: number, paymentMethod: PaymentMethod) => {
        if (!user) throw new Error("User not authenticated.");
        if (paymentMethod === 'Credit' || paymentMethod === 'Prepaid') throw new Error("Invalid payment method for payables.");
        
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < amount) {
            throw new Error(`Insufficient funds in ${paymentMethod}. Required: ${amount}, Available: ${cashBalances[balanceKey].toLocaleString()}`);
        }

        const payableRef = doc(db, 'payables', id);
        await runTransaction(db, async (transaction) => {
            const payableDoc = await transaction.get(payableRef);
            if (!payableDoc.exists()) throw new Error("Payable not found.");

            const payableData = payableDoc.data() as Payable;
            const remainingAmount = payableData.amount - amount;

            if (remainingAmount <= 0) {
                 transaction.update(payableRef, { status: 'Paid', amount: 0 }); 
            } else {
                 transaction.update(payableRef, { amount: remainingAmount });
            }

            const newExpense = {
                userId: user.uid,
                description: `Payment for ${payableData.product} to ${payableData.supplierName}`,
                category: 'Manunuzi Ofisi',
                amount: amount,
                date: new Date(),
                status: 'Approved',
                paymentMethod: paymentMethod,
            };
            const expenseRef = doc(collection(db, 'expenses'));
            transaction.set(expenseRef, newExpense);
        });
    };


    const markPrepaymentAsUsed = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'prepayments', id), { status: 'Used' });
    };

    const markPrepaymentAsRefunded = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'prepayments', id), { status: 'Refunded' });
    };

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await addDoc(collection(db, 'customers'), { ...customerData, userId: user.uid });
    };

    const updateCustomer = async (id: string, customerData: Omit<Customer, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'customers', id), { ...customerData, userId: user.uid });
    };

    const deleteCustomer = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'customers', id));
    };

    const addUserAccount = async (userData: Omit<UserAccount, 'id'> & { id: string }) => {
        if (!user) return;
        const { id, ...data } = userData;
        await setDoc(doc(db, "userAccounts", id), data);
    }

    const deleteUserAccount = async (id: string) => {
        await deleteDoc(doc(db, 'userAccounts', id));
    }
    
    const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'sellingPrice'>) => {
        if (!user) throw new Error("User not authenticated.");
        const newProduct = {
            ...productData,
            sellingPrice: 0, // Not used, set to 0
            userId: user.uid,
            status: getProductStatus(productData as Product),
            initialStock: productData.currentStock,
            entryDate: new Date(),
            lastUpdated: new Date(),
        };
        await addDoc(collection(db, 'products'), newProduct);
    };
    
    const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'sellingPrice'>) => {
        if (!user) throw new Error("User not authenticated.");
        const originalProduct = products.find(p => p.id === id);
        if (!originalProduct) throw new Error("Product not found.");
        
        const updatedProductData = {
            ...productData,
            sellingPrice: 0,
            initialStock: originalProduct.initialStock, // Retain original values
            entryDate: originalProduct.entryDate,
            status: getProductStatus(productData as Product),
            lastUpdated: new Date(),
             userId: user.uid,
        };
        await updateDoc(doc(db, 'products', id), updatedProductData);
    };

    const deleteProduct = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'products', id));
    };

    const addAsset = async (assetData: AddAssetData) => {
        if (!user) throw new Error("User not authenticated.");
        const newAssetData = {
            ...assetData,
            userId: user.uid,
            status: 'Active',
            accumulatedDepreciation: 0,
            netBookValue: assetData.cost,
            source: 'Purchase'
        };
        await addDoc(collection(db, 'assets'), newAssetData);
    };
    
    const sellAsset = async (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => {
        if (!user) throw new Error("User not authenticated.");
        const assetToSell = assets.find(a => a.id === id);
        if (!assetToSell) return;

        const batch = writeBatch(db);

        const assetRef = doc(db, 'assets', id);
        batch.update(assetRef, { status: 'Sold', netBookValue: 0 });

        const newTransaction = {
            userId: user.uid,
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
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'assets', id), { status: 'Written Off', netBookValue: 0 });
    };
    
    const addCapitalContribution = async (data: Omit<CapitalContribution, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        
        const dataToSave = {
            ...data,
            userId: user.uid,
        };

        const batch = writeBatch(db);
        const capRef = collection(db, 'capitalContributions');
        batch.set(doc(capRef), dataToSave);

        if (data.type === 'Asset') {
            const assetData = {
                userId: user.uid,
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
        if (!user) throw new Error("User not authenticated.");
        const balance = cashBalances[paymentMethod.toLowerCase() as keyof typeof cashBalances];
        if (amount > balance) {
            throw new Error(`Insufficient funds in ${paymentMethod} account.`);
        }
        // This function needs full implementation if loan repayment tracking is added.
    };

    const addExpense = async (data: AddExpenseData) => {
        if (!user) throw new Error("User not authenticated.");
        const newExpense = { ...data, userId: user.uid, status: 'Pending' };
        await addDoc(collection(db, 'expenses'), newExpense);
    };
    
    const approveExpense = async (id: string, paymentData: { amount: number, paymentMethod: PaymentMethod }) => {
        if (!user) throw new Error("User not authenticated.");
        const { amount, paymentMethod } = paymentData;
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < amount) {
            throw new Error(`Insufficient funds in ${paymentMethod} account. Required: ${amount}, Available: ${cashBalances[balanceKey]}`);
        }
        await updateDoc(doc(db, 'expenses', id), { status: 'Approved', paymentMethod, userId: user.uid });
    };

    const deleteExpense = async (expenseId: string, paymentDetails?: { amount: number, paymentMethod: PaymentMethod }) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'expenses', expenseId));
    };

    const addEmployee = async (employeeData: Omit<Employee, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await addDoc(collection(db, 'employees'), { ...employeeData, userId: user.uid });
    };

    const updateEmployee = async (id: string, employeeData: Omit<Employee, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'employees', id), { ...employeeData, userId: user.uid });
    };

    const deleteEmployee = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'employees', id));
    };
    
    const processPayroll = async (paymentData: { amount: number, paymentMethod: PaymentMethod }, employeesToPay: { employeeId: string; grossSalary: number; netSalary: number }[]) => {
        if (!user) throw new Error("User not authenticated.");
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
                userId: user.uid,
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
            userId: user.uid,
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
        if (!user) throw new Error("User not authenticated.");
        const { netSalary, paymentMethod, grossSalary, employeeId } = data;
        const balanceKey = paymentMethod.toLowerCase() as keyof typeof cashBalances;
        if (cashBalances[balanceKey] < netSalary) {
            throw new Error(`Insufficient funds for payroll in ${paymentMethod}. Required: ${netSalary}, Available: ${cashBalances[balanceKey]}`);
        }

        const currentMonth = format(new Date(), 'MMMM yyyy');
        const employee = employees.find(e => e.id === employeeId);
        const batch = writeBatch(db);

        const newPayrollRun = {
            userId: user.uid,
            employeeId: employeeId,
            month: currentMonth,
            date: new Date(),
            grossSalary: grossSalary,
            netSalary: netSalary,
            paymentMethod: paymentMethod
        };
        batch.set(doc(collection(db, 'payrollHistory')), newPayrollRun);

        const newExpense = {
            userId: user.uid,
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

    const addPurchaseOrder = async (data: Omit<PurchaseOrder, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        const batch = writeBatch(db);
        const poRef = collection(db, 'purchaseOrders');
        batch.set(doc(poRef), { ...data, userId: user.uid });

        if (data.paymentStatus === 'Unpaid') {
            const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const newPayable = {
                userId: user.uid,
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
        if (!user) throw new Error("User not authenticated.");

        await runTransaction(db, async (transaction) => {
            const poRef = doc(db, 'purchaseOrders', poId);
            const poDoc = await transaction.get(poRef);
            if (!poDoc.exists()) throw new Error("Purchase Order not found.");
            
            const poToDelete = poDoc.data() as PurchaseOrder;

            // Delete associated payable if it exists
            const payableQuery = query(collection(db, 'payables'), where('product', '==', `From PO #${poToDelete.poNumber}`), where('userId', '==', user.uid));
            const payablesSnap = await getDocs(payableQuery);
            if (!payablesSnap.empty) {
                payablesSnap.forEach(doc => transaction.delete(doc.ref));
            }

            // Reverse stock if goods were received
            if (poToDelete.receivingStatus === 'Received') {
                for (const item of poToDelete.items) {
                    const productQuery = query(collection(db, 'products'), where('name', '==', item.description), where('userId', '==', user.uid));
                    const productSnap = await getDocs(productQuery);
                    if (!productSnap.empty) {
                        const productDoc = productSnap.docs[0];
                        const productRef = doc(db, 'products', productDoc.id);
                        const productData = productDoc.data() as Product;
                        const newStock = productData.currentStock - item.quantity;
                        const newStatus = getProductStatus({ ...productData, currentStock: newStock });
                        transaction.update(productRef, { currentStock: newStock, status: newStatus });
                    }
                }
            }

            // Delete the PO itself
            transaction.delete(poRef);
        });
    }

    const receivePurchaseOrder = async (poId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        const batch = writeBatch(db);
        const poRef = doc(db, 'purchaseOrders', poId);
        batch.update(poRef, { receivingStatus: 'Received' });

        for (const item of po.items) {
            const productQuery = query(collection(db, 'products'), where('name', '==', item.description), where('userId', '==', user.uid));
            const existingProductSnap = await getDocs(productQuery);

            if (!existingProductSnap.empty) {
                const existingProductDoc = existingProductSnap.docs[0];
                const existingProduct = { id: existingProductDoc.id, ...existingProductDoc.data() } as Product;
                const productRef = doc(db, 'products', existingProduct.id);
                const newStock = existingProduct.currentStock + item.quantity;
                const newStatus = getProductStatus({ ...existingProduct, currentStock: newStock });
                batch.update(productRef, { currentStock: newStock, status: newStatus, lastUpdated: new Date() });
            } else {
                const newProductData = {
                    userId: user.uid,
                    name: item.description,
                    description: item.description,
                    category: 'General',
                    initialStock: item.quantity,
                    currentStock: item.quantity,
                    uom: item.uom,
                    reorderLevel: 10,
                    reorderQuantity: 20,
                    purchasePrice: item.unitPrice,
                    sellingPrice: 0, // No longer set at purchase time
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
        if (!user) throw new Error("User not authenticated.");
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

        const payableQuery = query(
            collection(db, 'payables'), 
            where('product', '==', `From PO #${po.poNumber}`),
            where('userId', '==', user.uid)
        );
        const payableSnap = await getDocs(payableQuery);
        
        if (!payableSnap.empty) {
            const payableRef = doc(db, 'payables', payableSnap.docs[0].id);
            batch.update(payableRef, { status: 'Paid', paymentMethod });
        } else {
             const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0);
             const newExpense = {
                userId: user.uid,
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
        if (!user) throw new Error("User not authenticated.");
        const subtotal = invoiceData.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatAmount = subtotal * invoiceData.vatRate;
        const totalAmount = subtotal + vatAmount;

        const batch = writeBatch(db);
        
        const newInvoiceData = {
            userId: user.uid,
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
            userId: user.uid,
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
        
        await batch.commit();
    };

    const payInvoice = async (invoiceId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => {
        if (!user) throw new Error("User not authenticated.");
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        const batch = writeBatch(db);

        const invoiceRef = doc(db, 'invoices', invoiceId);
        batch.update(invoiceRef, { status: 'Paid' });
        
        const transactionQuery = query(
            collection(db, 'transactions'),
            where('product', '==', `Invoice #${invoice.invoiceNumber}`),
            where('userId', '==', user.uid)
        );
        const transactionSnap = await getDocs(transactionQuery);
        
        if (!transactionSnap.empty) {
            const transactionRef = doc(db, 'transactions', transactionSnap.docs[0].id);
            const transactionData = transactionSnap.docs[0].data() as Transaction;
            batch.delete(transactionRef);

            const paymentTransaction = { ...transactionData, status: 'Paid', amount, paymentMethod, date: new Date(), notes: 'Invoice Payment' };
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
        companyName,
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

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl font-semibold">Loading Financial Data...</div>
            </div>
        );
    }
    

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
