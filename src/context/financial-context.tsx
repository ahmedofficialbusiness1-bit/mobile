
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
    shopId: string;
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
    shopId: string;
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
    shopId: string;
    customerName: string;
    phone: string;
    prepaidAmount: number;
    date: Date;
    status: 'Active' | 'Used' | 'Refunded';
}

export interface Customer {
    id: string;
    userId: string;
    shopId: string;
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

export interface Shop {
    id: string;
    userId: string;
    name: string;
    location?: string;
}


export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  barcode?: string;
  initialStock: number;
  mainStock: number;
  shopStock: number; // This will now be a calculated total of stockByShop
  stockByShop: Record<string, number>; // { [shopId]: quantity }
  currentStock: number; // calculated field based on active shop
  uom: string; 
  reorderLevel: number;
  reorderQuantity: number;
  purchasePrice: number;
  entryDate: Date;
  expiryDate?: Date;
  lastUpdated: Date;
  location?: string;
  batchNumber?: string;
  supplier?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
}

export interface DamagedGood {
    id: string;
    userId: string;
    shopId: string;
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    date: Date;
}

export interface StockRequest {
    id: string;
    userId: string;
    shopId: string;
    shopName: string;
    productId: string;
    productName: string;
    quantity: number;
    requestDate: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
    notes?: string;
}


export interface Asset {
    id: string;
    userId: string;
    shopId: string;
    name: string;
    cost: number;
    acquisitionDate: Date;
    depreciationRate: number;
    status: 'Active' | 'Sold' | 'Written Off';
    accumulatedDepreciation: number;
    netBookValue: number;
    source: 'Capital' | 'Purchase';
}

export type AddAssetData = Omit<Asset, 'id' | 'status' | 'accumulatedDepreciation' | 'netBookValue' | 'source' | 'userId' | 'shopId'>;

export interface CapitalContribution {
  id: string;
  userId: string;
  shopId: string;
  date: Date;
  description: string;
  type: 'Cash' | 'Bank' | 'Asset' | 'Liability';
  amount: number;
}

export interface OwnerLoan {
    id: string; 
    userId: string;
    shopId: string;
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
    shopId: string;
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
  shopId: string;
  description: string;
  category: 'Umeme' | 'Maji' | 'Usafiri' | 'Mawasiliano' | 'Kodi' | 'Manunuzi Ofisi' | 'Matangazo' | 'Mishahara' | 'Mengineyo';
  amount: number;
  date: Date;
  status: 'Pending' | 'Approved';
  paymentMethod?: PaymentMethod;
}

export type AddExpenseData = Omit<Expense, 'id' | 'status' | 'paymentMethod' | 'userId' | 'shopId'>;

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
  shopId: string;
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
    shopId: string;
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

export interface FundTransfer {
    id: string;
    userId: string;
    shopId: string;
    date: Date;
    from: 'Cash' | 'Bank' | 'Mobile';
    to: 'Cash' | 'Bank' | 'Mobile';
    amount: number;
    notes?: string;
}


// --- Context Definition ---
interface FinancialContextType {
    allTransactions: Transaction[];
    allPayables: Payable[];
    allPrepayments: CustomerPrepayment[];
    allCustomers: Customer[];
    userAccounts: UserAccount[];
    allShops: Shop[];
    activeShop: Shop | null;
    setActiveShopId: (shopId: string | null) => void;
    activeShopId: string | null;
    companyName: string;
    allProducts: Product[];
    allDamagedGoods: DamagedGood[];
    allStockRequests: StockRequest[];
    initialAssets: Asset[];
    allCapitalContributions: CapitalContribution[];
    allOwnerLoans: OwnerLoan[];
    allExpenses: Expense[];
    employees: Employee[];
    allPayrollHistory: PayrollRun[];
    allPurchaseOrders: PurchaseOrder[];
    allInvoices: Invoice[];
    allFundTransfers: FundTransfer[];
    transactions: Transaction[];
    payables: Payable[];
    prepayments: CustomerPrepayment[];
    customers: Customer[];
    shops: Shop[];
    products: Product[];
    damagedGoods: DamagedGood[];
    stockRequests: StockRequest[];
    assets: Asset[];
    capitalContributions: CapitalContribution[];
    ownerLoans: OwnerLoan[];
    expenses: Expense[];
    payrollHistory: PayrollRun[];
    purchaseOrders: PurchaseOrder[];
    invoices: Invoice[];
    fundTransfers: FundTransfer[];
    cashBalances: { cash: number; bank: number; mobile: number };
    addSale: (saleData: SaleFormData) => Promise<void>;
    deleteSale: (saleId: string) => Promise<void>;
    transferSale: (saleId: string, toShopId: string) => Promise<void>;
    adjustTransactionVat: (transactionId: string, newVatRate: VatRate) => Promise<void>;
    markReceivableAsPaid: (id: string, amount: number, paymentMethod: PaymentMethod) => Promise<void>;
    deleteReceivable: (receivableId: string) => Promise<void>;
    markPayableAsPaid: (id: string, amount: number, paymentMethod: PaymentMethod) => Promise<void>;
    deletePayable: (payableId: string) => Promise<void>;
    markPrepaymentAsUsed: (id: string) => Promise<void>;
    markPrepaymentAsRefunded: (id: string) => Promise<void>;
    addCustomer: (customerData: Omit<Customer, 'id' | 'userId' | 'shopId'>) => Promise<void>;
    updateCustomer: (id: string, customerData: Omit<Customer, 'id' | 'userId' | 'shopId'>) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    addUserAccount: (userData: Omit<UserAccount, 'id'> & { id: string }) => Promise<void>;
    deleteUserAccount: (id: string) => Promise<void>;
    addShop: (shopData: Omit<Shop, 'id' | 'userId'>) => Promise<void>;
    updateShop: (id: string, shopData: Omit<Shop, 'id' | 'userId'>) => Promise<void>;
    deleteShop: (id: string) => Promise<void>;
    addProduct: (productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'shopStock' | 'currentStock' | 'stockByShop'>) => Promise<void>;
    updateProduct: (id: string, productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'shopStock' | 'currentStock' | 'stockByShop'>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    transferStock: (productId: string, quantity: number, fromShopId: string | null, toShopId: string) => Promise<void>;
    reportDamage: (productId: string, quantity: number, reason: string) => Promise<void>;
    createStockRequest: (productId: string, productName: string, quantity: number, notes: string) => Promise<void>;
    approveStockRequest: (requestId: string) => Promise<void>;
    rejectStockRequest: (requestId: string) => Promise<void>;
    addAsset: (assetData: AddAssetData) => Promise<void>;
    sellAsset: (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => Promise<void>;
    writeOffAsset: (id: string) => Promise<void>;
    addCapitalContribution: (data: Omit<CapitalContribution, 'id' | 'userId' | 'shopId'>) => Promise<void>;
    updateCapitalContribution: (id: string, data: Omit<CapitalContribution, 'id' | 'userId' | 'shopId'>) => Promise<void>;
    deleteCapitalContribution: (id: string, type: string, amount: number) => Promise<void>;
    repayOwnerLoan: (loanId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile', notes: string) => Promise<void>;
    addExpense: (data: AddExpenseData) => Promise<void>;
    approveExpense: (id: string, paymentData: { amount: number, paymentMethod: PaymentMethod }) => Promise<void>;
    deleteExpense: (expenseId: string, paymentDetails?: { amount: number, paymentMethod: PaymentMethod }) => Promise<void>;
    addEmployee: (employeeData: Omit<Employee, 'id' | 'userId'>) => Promise<void>;
    updateEmployee: (id: string, employeeData: Omit<Employee, 'id' | 'userId'>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    processPayroll: (paymentData: { amount: number, paymentMethod: PaymentMethod }, employeesToPay: { employeeId: string; grossSalary: number; netSalary: number }[]) => Promise<void>;
    paySingleEmployee: (data: { employeeId: string; grossSalary: number; netSalary: number; paymentMethod: PaymentMethod; }) => Promise<void>;
    addPurchaseOrder: (data: Omit<PurchaseOrder, 'id' | 'userId' | 'shopId'>) => Promise<void>;
    updatePurchaseOrder: (poId: string, data: Omit<PurchaseOrder, 'id' | 'userId' | 'shopId'>) => Promise<void>;
    deletePurchaseOrder: (poId: string) => Promise<void>;
    receivePurchaseOrder: (poId: string) => Promise<void>;
    payPurchaseOrder: (poId: string, paymentData: { amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' }) => Promise<void>;
    transferPurchaseOrder: (poId: string, toShopId: string) => Promise<void>;
    addInvoice: (invoiceData: InvoiceFormData) => Promise<void>;
    updateInvoice: (invoiceId: string, invoiceData: InvoiceFormData) => Promise<void>;
    deleteInvoice: (invoiceId: string) => Promise<void>;
    payInvoice: (invoiceId: string, amount: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile') => Promise<void>;
    transferInvoice: (invoiceId: string, toShopId: string) => Promise<void>;
    addFundTransfer: (data: Omit<FundTransfer, 'id' | 'userId' | 'shopId'>) => Promise<void>;
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

const getProductStatus = (product: Partial<Product>, stockLevel: number): Product['status'] => {
    const now = new Date();

    if (product.expiryDate && isAfter(now, toDate(product.expiryDate))) {
        return 'Expired';
    }
    if (stockLevel <= 0) {
        return 'Out of Stock';
    }
    if (product.reorderLevel && stockLevel <= product.reorderLevel) {
        return 'Low Stock';
    }
    return 'In Stock';
}

function useFirestoreCollection<T>(collectionName: string, dateFields: string[] = ['date'], defaultShopId?: string | null) {
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
                const docData: any = doc.data();
                const parsedDateFields = JSON.parse(stableDateFields);
                for (const field of parsedDateFields) {
                    if (docData[field]) {
                        docData[field] = toDate(docData[field]);
                    }
                }
                
                // MIGRATION LOGIC: Assign a default shopId if it doesn't exist
                if (!docData.shopId && defaultShopId) {
                    docData.shopId = defaultShopId;
                }
                
                return { id: doc.id, ...docData } as T;
            });
            setData(collectionData);
        }, (error) => {
            console.error(`Error fetching ${stableCollectionName}:`, error);
        });

        return () => unsubscribe();
    }, [stableCollectionName, stableDateFields, user, authLoading, defaultShopId]);

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
    const [activeShopId, setActiveShopId] = useState<string | null>(null);
    const allShops = useFirestoreCollection<Shop>('shops');

    // Find the default shop ID for data migration once shops are loaded
    const defaultShopIdForMigration = useMemo(() => {
        const targetShop = allShops.find(s => s.name === "Mlandege Home Store 1");
        return targetShop ? targetShop.id : null;
    }, [allShops]);
    
    const allTransactions = useFirestoreCollection<Transaction>('transactions', ['date'], defaultShopIdForMigration);
    const allPayables = useFirestoreCollection<Payable>('payables', ['date'], defaultShopIdForMigration);
    const allPrepayments = useFirestoreCollection<CustomerPrepayment>('prepayments', ['date'], defaultShopIdForMigration);
    const allCustomers = useFirestoreCollection<Customer>('customers', [], defaultShopIdForMigration);
    const userAccounts = useFirestoreUserAccounts();
    const allProducts = useFirestoreCollection<Product>('products', ['entryDate', 'expiryDate', 'lastUpdated']);
    const allDamagedGoods = useFirestoreCollection<DamagedGood>('damagedGoods', ['date'], defaultShopIdForMigration);
    const allStockRequests = useFirestoreCollection<StockRequest>('stockRequests', ['requestDate']);
    const employees = useFirestoreCollection<Employee>('employees');
    const allPayrollHistory = useFirestoreCollection<PayrollRun>('payrollHistory', ['date'], defaultShopIdForMigration);
    const allCapitalContributions = useFirestoreCollection<CapitalContribution>('capitalContributions', ['date'], defaultShopIdForMigration);
    const initialAssets = useFirestoreCollection<Asset>('assets', ['acquisitionDate'], defaultShopIdForMigration);
    const allExpenses = useFirestoreCollection<Expense>('expenses', ['date'], defaultShopIdForMigration);
    const allPurchaseOrders = useFirestoreCollection<PurchaseOrder>('purchaseOrders', ['purchaseDate', 'expectedDeliveryDate'], defaultShopIdForMigration);
    const allInvoices = useFirestoreCollection<Invoice>('invoices', ['issueDate', 'dueDate'], defaultShopIdForMigration);
    const allFundTransfers = useFirestoreCollection<FundTransfer>('fundTransfers', ['date'], defaultShopIdForMigration);

    const activeShop = useMemo(() => {
        if (activeShopId === null) return null;
        return allShops.find(shop => shop.id === activeShopId) || null;
    }, [allShops, activeShopId]);

    // --- Filtered Data based on Active Shop ---
    const transactions = useMemo(() => activeShopId ? allTransactions.filter(t => t.shopId === activeShopId) : allTransactions, [allTransactions, activeShopId]);
    const payables = useMemo(() => activeShopId ? allPayables.filter(p => p.shopId === activeShopId) : allPayables, [allPayables, activeShopId]);
    const prepayments = useMemo(() => activeShopId ? allPrepayments.filter(p => p.shopId === activeShopId) : allPrepayments, [allPrepayments, activeShopId]);
    const customers = useMemo(() => activeShopId ? allCustomers.filter(c => c.shopId === activeShopId) : allCustomers, [allCustomers, activeShopId]);
    const shops = useMemo(() => allShops, [allShops]);
    const damagedGoods = useMemo(() => activeShopId ? allDamagedGoods.filter(d => d.shopId === activeShopId) : allDamagedGoods, [allDamagedGoods, activeShopId]);
    const stockRequests = useMemo(() => activeShopId ? allStockRequests.filter(sr => sr.shopId === activeShopId) : allStockRequests, [allStockRequests, activeShopId]);
    const payrollHistory = useMemo(() => activeShopId ? allPayrollHistory.filter(p => p.shopId === activeShopId) : allPayrollHistory, [allPayrollHistory, activeShopId]);
    const capitalContributions = useMemo(() => activeShopId ? allCapitalContributions.filter(c => c.shopId === activeShopId) : allCapitalContributions, [allCapitalContributions, activeShopId]);
    const expenses = useMemo(() => activeShopId ? allExpenses.filter(e => e.shopId === activeShopId) : allExpenses, [allExpenses, activeShopId]);
    const purchaseOrders = useMemo(() => activeShopId ? allPurchaseOrders.filter(po => po.shopId === activeShopId) : allPurchaseOrders, [allPurchaseOrders, activeShopId]);
    const invoices = useMemo(() => activeShopId ? allInvoices.filter(i => i.shopId === activeShopId) : allInvoices, [allInvoices, activeShopId]);
    const assetsData = useMemo(() => activeShopId ? initialAssets.filter(a => a.shopId === activeShopId) : initialAssets, [initialAssets, activeShopId]);
    const fundTransfers = useMemo(() => activeShopId ? allFundTransfers.filter(ft => ft.shopId === activeShopId) : allFundTransfers, [allFundTransfers, activeShopId]);

    const currentUserAccount = React.useMemo(() => {
        if (!user || userAccounts.length === 0 || authLoading) return null;
        const account = userAccounts.find(acc => acc.id === user.uid);
        return account;
    }, [user, userAccounts, authLoading]);

    const companyName = useMemo(() => currentUserAccount?.companyName || "DiraBiz", [currentUserAccount]);

    const assets = useMemo(() => {
        return assetsData.map(asset => {
            if (asset.status === 'Active') {
                const { accumulatedDepreciation, netBookValue } = calculateDepreciation(asset);
                return { ...asset, accumulatedDepreciation, netBookValue };
            }
            return asset;
        })
    }, [assetsData]);

    const products = useMemo(() => {
        return allProducts.map(product => {
            const stockByShop = product.stockByShop || {};
            const totalShopStock = Object.values(stockByShop).reduce((sum, qty) => sum + qty, 0);
            
            const currentShopStock = activeShopId ? (stockByShop[activeShopId] || 0) : product.mainStock;
            
            const stockLevelForStatus = activeShopId ? currentShopStock : (product.mainStock || 0);

            return {
                ...product,
                shopStock: totalShopStock,
                currentStock: currentShopStock,
                status: getProductStatus(product, stockLevelForStatus),
            }
        })
    }, [allProducts, activeShopId]);


    const ownerLoans = useMemo(() => {
        const loans = activeShopId ? allCapitalContributions.filter(c => c.shopId === activeShopId) : allCapitalContributions;
        return loans
            .filter(c => c.type === 'Liability')
            .map(c => {
                return {
                    id: c.id,
                    userId: c.userId,
                    shopId: c.shopId,
                    date: c.date,
                    description: c.description,
                    amount: c.amount,
                    repaid: 0 
                };
            });
    }, [allCapitalContributions, activeShopId]);

    const cashBalances = useMemo(() => {
        const calculateBalancesForShop = (shopId: string) => {
            let cash = 0, bank = 0, mobile = 0;

            allCapitalContributions.filter(c => c.shopId === shopId).forEach(c => {
                if (c.type === 'Cash') cash += c.amount;
                if (c.type === 'Bank') bank += c.amount;
            });

            allTransactions.filter(t => t.shopId === shopId && t.status === 'Paid').forEach(t => {
                if (t.paymentMethod === 'Cash') cash += t.amount;
                else if (t.paymentMethod === 'Bank') bank += t.amount;
                else if (t.paymentMethod === 'Mobile') mobile += t.amount;
            });
            
            allPrepayments.filter(p => p.shopId === shopId && p.status === 'Active').forEach(p => {
                 bank += p.prepaidAmount;
            });

            allExpenses.filter(e => e.shopId === shopId && e.status === 'Approved' && e.paymentMethod).forEach(e => {
                if (e.paymentMethod === 'Cash') cash -= e.amount;
                else if (e.paymentMethod === 'Bank') bank -= e.amount;
                else if (e.paymentMethod === 'Mobile') mobile -= e.amount;
            });

            allPayrollHistory.filter(p => p.shopId === shopId).forEach(pr => {
                if (pr.paymentMethod === 'Cash') cash -= pr.netSalary;
                else if (pr.paymentMethod === 'Bank') bank -= pr.netSalary;
                else if (pr.paymentMethod === 'Mobile') mobile -= pr.netSalary;
            });
            
            allFundTransfers.filter(ft => ft.shopId === shopId).forEach(ft => {
                if (ft.from === 'Cash') cash -= ft.amount;
                if (ft.from === 'Bank') bank -= ft.amount;
                if (ft.from === 'Mobile') mobile -= ft.amount;

                if (ft.to === 'Cash') cash += ft.amount;
                if (ft.to === 'Bank') bank += ft.amount;
                if (ft.to === 'Mobile') mobile += ft.amount;
            });

            return { cash, bank, mobile };
        };

        if (activeShopId) {
            return calculateBalancesForShop(activeShopId);
        } else {
            // HQ View: Sum of all branches
            return allShops.reduce((acc, shop) => {
                const shopBalance = calculateBalancesForShop(shop.id);
                acc.cash += shopBalance.cash;
                acc.bank += shopBalance.bank;
                acc.mobile += shopBalance.mobile;
                return acc;
            }, { cash: 0, bank: 0, mobile: 0 });
        }
    }, [activeShopId, allShops, allCapitalContributions, allTransactions, allPrepayments, allExpenses, allPayrollHistory, allFundTransfers]);


    const addSale = async (saleData: SaleFormData) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop selected.");
        const productRef = doc(db, 'products', saleData.productId);
        
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) throw new Error("Product not found");

            const product = {id: productDoc.id, ...productDoc.data()} as Product;
            const shopStock = product.stockByShop?.[activeShopId] || 0;

            if (shopStock < saleData.quantity) {
                throw new Error(`Not enough stock in shop for ${product.name}. Only ${shopStock} available.`);
            }
            
            const grossAmount = saleData.unitPrice * saleData.quantity;
            const netAmount = grossAmount / (1 + saleData.vatRate);
            const vatAmount = grossAmount - netAmount;

            const newTransaction = {
                userId: user.uid,
                shopId: activeShopId,
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
            
            const transRef = doc(collection(db, 'transactions'));
            transaction.set(transRef, newTransaction);

            const updatedStockByShop = { ...(product.stockByShop || {}), [activeShopId]: shopStock - saleData.quantity };
            
            transaction.update(productRef, { stockByShop: updatedStockByShop, lastUpdated: new Date() });

            if (saleData.customerType === 'new') {
                const customerQuery = query(collection(db, 'customers'), where('phone', '==', saleData.customerPhone), where('userId', '==', user.uid));
                const existingCustomer = await getDocs(customerQuery);
                if (existingCustomer.empty) {
                     const custRef = doc(collection(db, 'customers'));
                     transaction.set(custRef, {
                        userId: user.uid,
                        shopId: activeShopId,
                        name: saleData.customerName,
                        phone: saleData.customerPhone,
                    });
                }
            }
        });
    }
    
    const deleteSale = async (saleId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const saleRef = doc(db, 'transactions', saleId);
        
        await runTransaction(db, async (transaction) => {
            const saleDoc = await transaction.get(saleRef);
            if (!saleDoc.exists()) throw new Error("Sale not found.");
            
            const saleToDelete = saleDoc.data() as Transaction;
            
            if (saleToDelete.productId && saleToDelete.shopId) {
                const productRef = doc(db, 'products', saleToDelete.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    const product = productDoc.data() as Product;
                    const currentShopStock = product.stockByShop?.[saleToDelete.shopId] || 0;
                    const updatedStockByShop = { ...(product.stockByShop || {}), [saleToDelete.shopId]: currentShopStock + saleToDelete.quantity };
                    transaction.update(productRef, { stockByShop: updatedStockByShop, lastUpdated: new Date() });
                }
            }

            transaction.delete(saleRef);
        });
    };

    const transferSale = async (saleId: string, toShopId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const saleRef = doc(db, 'transactions', saleId);

        await runTransaction(db, async (transaction) => {
            const saleDoc = await transaction.get(saleRef);
            if (!saleDoc.exists()) throw new Error("Sale not found.");
            
            const saleToMove = saleDoc.data() as Transaction;
            const fromShopId = saleToMove.shopId;
            const { productId, quantity } = saleToMove;

            if (fromShopId === toShopId) throw new Error("Cannot transfer to the same branch.");

            // Reverse stock from old branch and apply to new branch
            if (productId && productId !== 'invoice') {
                const productRef = doc(db, 'products', productId);
                const productDoc = await transaction.get(productRef);
                const product = productDoc.exists() ? productDoc.data() as Product : null;
                
                const fromShopStock = product?.stockByShop?.[fromShopId] || 0;
                const toShopStock = product?.stockByShop?.[toShopId] || 0;

                const updatedStockByShop = {
                    ...(product?.stockByShop || {}),
                    [fromShopId]: fromShopStock + quantity,
                    [toShopId]: toShopStock - quantity,
                };
                
                if (product) {
                    transaction.update(productRef, { stockByShop: updatedStockByShop, lastUpdated: new Date() });
                }
            }

            // Update the shopId on the sale record
            transaction.update(saleRef, { shopId: toShopId });
        });
    };

    const adjustTransactionVat = async (transactionId: string, newVatRate: VatRate) => {
        if (!user) throw new Error("User not authenticated.");
        const transactionRef = doc(db, 'transactions', transactionId);

        await runTransaction(db, async (firestoreTransaction) => {
            const transDoc = await firestoreTransaction.get(transactionRef);
            if (!transDoc.exists()) {
                throw new Error("Transaction not found.");
            }
            const currentTransaction = transDoc.data() as Transaction;
            const grossAmount = currentTransaction.amount;
            
            const newNetAmount = grossAmount / (1 + newVatRate);
            const newVatAmount = grossAmount - newNetAmount;

            firestoreTransaction.update(transactionRef, {
                netAmount: newNetAmount,
                vatAmount: newVatAmount
            });
        });
    };

    const markReceivableAsPaid = async (id: string, amount: number, paymentMethod: PaymentMethod) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const receivableRef = doc(db, 'transactions', id);
        
        await runTransaction(db, async (transaction) => {
            const receivableDoc = await transaction.get(receivableRef);
            if (!receivableDoc.exists()) throw new Error("Receivable not found.");
            
            const receivableToUpdate = receivableDoc.data() as Transaction;
            const remainingAmount = receivableToUpdate.amount - amount;

            const paymentTransaction = {
                userId: user.uid,
                shopId: activeShopId,
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
    
    const deleteReceivable = async (receivableId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const receivableRef = doc(db, 'transactions', receivableId);
        
        await runTransaction(db, async (transaction) => {
            const receivableDoc = await transaction.get(receivableRef);
            if (!receivableDoc.exists()) throw new Error("Receivable not found.");

            const receivable = receivableDoc.data() as Transaction;
            
            if (receivable.productId && receivable.productId !== 'invoice') {
                const productRef = doc(db, 'products', receivable.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    const product = productDoc.data() as Product;
                    const currentShopStock = product.stockByShop?.[receivable.shopId] || 0;
                    const updatedStockByShop = {
                        ...(product.stockByShop || {}),
                        [receivable.shopId]: currentShopStock + receivable.quantity,
                    };
                    transaction.update(productRef, { stockByShop: updatedStockByShop });
                }
            }
            transaction.delete(receivableRef);
        });
    }


    const markPayableAsPaid = async (id: string, amount: number, paymentMethod: PaymentMethod) => {
        const payableRef = doc(db, 'payables', id);
        
        await runTransaction(db, async (transaction) => {
            const payableDoc = await transaction.get(payableRef);
            if (!payableDoc.exists()) throw new Error("Payable not found.");
            
            const payableData = payableDoc.data() as Payable;
            if (!user || !payableData.shopId) throw new Error("User or shop ID missing.");

            const remainingAmount = payableData.amount - amount;

            if (remainingAmount <= 0) {
                transaction.update(payableRef, { status: 'Paid', amount: 0, paymentMethod: paymentMethod });
            } else {
                transaction.update(payableRef, { amount: remainingAmount });
            }

            const newExpense = {
                userId: user.uid,
                shopId: payableData.shopId,
                description: `Payment for ${payableData.product} to ${payableData.supplierName}`,
                category: 'Manunuzi Ofisi',
                amount: amount,
                date: new Date(),
                status: 'Approved',
                paymentMethod: paymentMethod,
            };
            const expenseRef = doc(collection(db, 'expenses'));
            transaction.set(expenseRef, newExpense);

            if (payableData.product.startsWith('From PO #')) {
                const poNumber = payableData.product.replace('From PO #', '').trim();
                const poQuery = query(collection(db, 'purchaseOrders'), where('poNumber', '==', poNumber), where('userId', '==', user.uid));
                const poSnap = await getDocs(poQuery);
                if (!poSnap.empty) {
                    const poRef = poSnap.docs[0].ref;
                    const poData = poSnap.docs[0].data() as PurchaseOrder;
                    const poTotal = poData.items.reduce((sum, item) => sum + item.totalPrice, 0);

                    // A simple check if total amount paid equals PO total. For partial payments, more logic is needed.
                    if (amount >= poData.items.reduce((sum, item) => sum + item.totalPrice, 0)) {
                         transaction.update(poRef, { paymentStatus: 'Paid' });
                    }
                }
            }
        });
    };

    const deletePayable = async (payableId: string) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'payables', payableId));
    };


    const markPrepaymentAsUsed = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'prepayments', id), { status: 'Used' });
    };

    const markPrepaymentAsRefunded = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'prepayments', id), { status: 'Refunded' });
    };

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'userId' | 'shopId'>) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop selected.");
        await addDoc(collection(db, 'customers'), { ...customerData, userId: user.uid, shopId: activeShopId });
    };

    const updateCustomer = async (id: string, customerData: Omit<Customer, 'id' | 'userId' | 'shopId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'customers', id), customerData);
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
    
    const addShop = async (shopData: Omit<Shop, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await addDoc(collection(db, 'shops'), { ...shopData, userId: user.uid });
    };

    const updateShop = async (id: string, shopData: Omit<Shop, 'id' | 'userId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'shops', id), { ...shopData, userId: user.uid });
    };

    const deleteShop = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'shops', id));
    };

    const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'shopStock' | 'currentStock' | 'stockByShop'>) => {
        if (!user) throw new Error("User not authenticated.");
        const { expiryDate, ...restOfProductData } = productData;
        const newProduct: any = {
            ...restOfProductData,
            userId: user.uid,
            status: getProductStatus({ ...restOfProductData } as Product, restOfProductData.mainStock),
            initialStock: restOfProductData.mainStock,
            shopStock: 0,
            stockByShop: {},
            entryDate: new Date(),
            lastUpdated: new Date(),
        };

        if (expiryDate) {
            newProduct.expiryDate = expiryDate;
        }
        
        await addDoc(collection(db, 'products'), newProduct);
    };
    
    const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'status' | 'userId' | 'lastUpdated' | 'initialStock' | 'entryDate' | 'shopStock' | 'currentStock' | 'stockByShop'>) => {
        if (!user) throw new Error("User not authenticated.");
        const originalProduct = products.find(p => p.id === id);
        if (!originalProduct) throw new Error("Product not found.");
        
        const totalShopStock = Object.values(originalProduct.stockByShop || {}).reduce((sum, qty) => sum + qty, 0);
        
        const updatedProductData = {
            ...productData,
            initialStock: originalProduct.initialStock,
            stockByShop: originalProduct.stockByShop,
            shopStock: totalShopStock,
            entryDate: originalProduct.entryDate,
            lastUpdated: new Date(),
             userId: user.uid,
        };
        await updateDoc(doc(db, 'products', id), updatedProductData);
    };

    const deleteProduct = async (id: string) => {
        if (!user) throw new Error("User not authenticated.");
        await deleteDoc(doc(db, 'products', id));
    };

    const transferStock = async (productId: string, quantity: number, fromShopId: string | null, toShopId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const productRef = doc(db, 'products', productId);

        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) throw new Error("Product not found");

            const product = productDoc.data() as Product;
            const currentStockByShop = product.stockByShop || {};
            let newMainStock = product.mainStock;
            let fromShopStock = 0;
            
            // Determine source stock and validate
            if (fromShopId === null) { // From Main Inventory (HQ)
                if (product.mainStock < quantity) {
                    throw new Error(`Insufficient stock in main inventory. Available: ${product.mainStock}`);
                }
                newMainStock = product.mainStock - quantity;
            } else { // From another shop
                fromShopStock = currentStockByShop[fromShopId] || 0;
                if (fromShopStock < quantity) {
                    throw new Error(`Insufficient stock in the source shop. Available: ${fromShopStock}`);
                }
            }

            // Prepare updated stock levels for all involved shops
            const toShopStock = currentStockByShop[toShopId] || 0;
            const updatedStockByShop = { 
                ...currentStockByShop,
                [toShopId]: toShopStock + quantity
            };

            if (fromShopId !== null) {
                updatedStockByShop[fromShopId] = fromShopStock - quantity;
            }
            
            transaction.update(productRef, {
                mainStock: newMainStock,
                stockByShop: updatedStockByShop,
                lastUpdated: new Date()
            });
        });
    };

    const reportDamage = async (productId: string, quantity: number, reason: string) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const productRef = doc(db, 'products', productId);
        
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) throw new Error("Product not found");
            
            const product = productDoc.data() as Product;
            const shopStock = product.stockByShop?.[activeShopId] || 0;

            if (shopStock < quantity) {
                throw new Error(`Cannot report more damaged goods than available in this shop. Available: ${shopStock}`);
            }

            const updatedStockByShop = { ...(product.stockByShop || {}), [activeShopId]: shopStock - quantity };

            transaction.update(productRef, { stockByShop: updatedStockByShop, lastUpdated: new Date() });

            const damageRecord = {
                userId: user.uid,
                shopId: activeShopId,
                productId,
                productName: product.name,
                quantity,
                reason,
                date: new Date(),
            };
            const damageRef = doc(collection(db, 'damagedGoods'));
            transaction.set(damageRef, damageRecord);
        });
    }
    
    const createStockRequest = async (productId: string, productName: string, quantity: number, notes: string) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");

        const shop = shops.find(s => s.id === activeShopId);
        if (!shop) throw new Error("Shop not found.");

        const newRequest = {
            userId: user.uid,
            shopId: activeShopId,
            shopName: shop.name,
            productId,
            productName,
            quantity,
            requestDate: new Date(),
            status: 'Pending',
            notes,
        };
        await addDoc(collection(db, 'stockRequests'), newRequest);
    };

    const approveStockRequest = async (requestId: string) => {
        const request = allStockRequests.find(r => r.id === requestId);
        if (!request) throw new Error("Request not found.");
        if (request.productId === 'new-product-request') {
             // For new products, just mark as approved. HQ needs to add it manually.
             await updateDoc(doc(db, 'stockRequests', requestId), { status: 'Approved' });
        } else {
            await transferStock(request.productId, request.quantity, null, request.shopId);
            await updateDoc(doc(db, 'stockRequests', requestId), { status: 'Approved' });
        }
    };

    const rejectStockRequest = async (requestId: string) => {
        await updateDoc(doc(db, 'stockRequests', requestId), { status: 'Rejected' });
    };

    const addAsset = async (assetData: AddAssetData) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop selected.");
        const newAssetData = {
            ...assetData,
            userId: user.uid,
            shopId: activeShopId,
            status: 'Active',
            accumulatedDepreciation: 0,
            netBookValue: assetData.cost,
            source: 'Purchase'
        };
        await addDoc(collection(db, 'assets'), newAssetData);
    };
    
    const sellAsset = async (id: string, sellPrice: number, paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Credit') => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const assetToSell = assets.find(a => a.id === id);
        if (!assetToSell) return;

        const batch = writeBatch(db);

        const assetRef = doc(db, 'assets', id);
        batch.update(assetRef, { status: 'Sold', netBookValue: 0 });

        const newTransaction = {
            userId: user.uid,
            shopId: activeShopId,
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
    
    const addCapitalContribution = async (data: Omit<CapitalContribution, 'id' | 'userId' | 'shopId'>) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        
        const dataToSave = {
            ...data,
            userId: user.uid,
            shopId: activeShopId,
        };

        const batch = writeBatch(db);
        const capRef = collection(db, 'capitalContributions');
        batch.set(doc(capRef), dataToSave);

        if (data.type === 'Asset') {
            const assetData = {
                userId: user.uid,
                shopId: activeShopId,
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

    const updateCapitalContribution = async (id: string, data: Omit<CapitalContribution, 'id' | 'userId' | 'shopId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'capitalContributions', id), data);
    };

    const deleteCapitalContribution = async (id: string, type: string, amount: number) => {
        if (!user) throw new Error("User not authenticated.");
        // Reversal logic for cash/bank can be added here if needed,
        // but deleting the record is the primary action.
        await deleteDoc(doc(db, 'capitalContributions', id));
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
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const newExpense = { ...data, userId: user.uid, shopId: activeShopId, status: 'Pending' };
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
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
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
                shopId: activeShopId,
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
            shopId: activeShopId,
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
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
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
            shopId: activeShopId,
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
            shopId: activeShopId,
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

    const addPurchaseOrder = async (data: Omit<PurchaseOrder, 'id' | 'userId' | 'shopId'>) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const batch = writeBatch(db);
        const poRef = collection(db, 'purchaseOrders');
        batch.set(doc(poRef), { ...data, userId: user.uid, shopId: activeShopId });

        if (data.paymentStatus === 'Unpaid') {
            const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
            const newPayable = {
                userId: user.uid,
                shopId: activeShopId,
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
    
    const updatePurchaseOrder = async (poId: string, data: Omit<PurchaseOrder, 'id' | 'userId' | 'shopId'>) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'purchaseOrders', poId), data);
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
                        const newStock = productData.mainStock - item.quantity;
                        transaction.update(productRef, { mainStock: newStock });
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
                const newStock = existingProduct.mainStock + item.quantity;
                batch.update(productRef, { mainStock: newStock, lastUpdated: new Date() });
            } else {
                const newProductData = {
                    userId: user.uid,
                    name: item.description,
                    description: item.description,
                    category: 'General',
                    initialStock: item.quantity,
                    mainStock: item.quantity,
                    shopStock: 0,
                    stockByShop: {},
                    uom: item.uom,
                    reorderLevel: 10,
                    reorderQuantity: 20,
                    purchasePrice: item.unitPrice,
                    entryDate: new Date(),
                    lastUpdated: new Date(),
                    supplier: po.supplierName,
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
            throw new Error(`Insufficient funds in ${paymentMethod} account. Required: ${amount}, Available: ${cashBalances[balanceKey].toLocaleString()}`);
        }

        const po = purchaseOrders.find(p => p.id === poId);
        if (!po) return;

        const batch = writeBatch(db);
        
        const payableQuery = query(
            collection(db, 'payables'), 
            where('product', '==', `From PO #${po.poNumber}`),
            where('userId', '==', user.uid)
        );
        const payableSnap = await getDocs(payableQuery);
        
        if (!payableSnap.empty) {
            const payableDoc = payableSnap.docs[0];
            const payableRef = doc(db, 'payables', payableDoc.id);
            const payableData = payableDoc.data() as Payable;
            
            const remainingAmount = payableData.amount - amount;
            if (remainingAmount <= 0) {
                batch.update(payableRef, { status: 'Paid', amount: 0 });
                const poRef = doc(db, 'purchaseOrders', poId);
                batch.update(poRef, { paymentStatus: 'Paid', paymentMethod });
            } else {
                batch.update(payableRef, { amount: remainingAmount });
            }
        } else {
            // This case handles direct payment for a PO that wasn't on credit initially
            const poRef = doc(db, 'purchaseOrders', poId);
            batch.update(poRef, { paymentStatus: 'Paid', paymentMethod });
        }
        
        // Always record the expense for the payment made
        const newExpense = {
            userId: user.uid,
            shopId: po.shopId,
            description: `Payment for PO #${po.poNumber}`,
            category: 'Manunuzi Ofisi',
            amount: amount,
            date: new Date(),
            status: 'Approved',
            paymentMethod: paymentMethod,
        };
        batch.set(doc(collection(db, 'expenses')), newExpense);

        await batch.commit();
    }

    const transferPurchaseOrder = async (poId: string, toShopId: string) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'purchaseOrders', poId), { shopId: toShopId });
    }

    const addInvoice = async (invoiceData: InvoiceFormData) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const subtotal = invoiceData.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatAmount = subtotal * invoiceData.vatRate;
        const totalAmount = subtotal + vatAmount;

        const batch = writeBatch(db);
        
        const newInvoiceData = {
            userId: user.uid,
            shopId: activeShopId,
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
            shopId: activeShopId,
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
    
    const updateInvoice = async (invoiceId: string, invoiceData: InvoiceFormData) => {
        if (!user) throw new Error("User not authenticated.");
        const subtotal = invoiceData.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatAmount = subtotal * invoiceData.vatRate;
        const totalAmount = subtotal + vatAmount;

        const batch = writeBatch(db);
        
        const updatedInvoiceData = {
            // Note: userId and shopId are not updated
            invoiceNumber: invoiceData.invoiceNumber,
            customerId: invoiceData.customerId,
            customerName: invoiceData.customerName,
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            items: invoiceData.items,
            subtotal,
            vatAmount,
            totalAmount,
        };
        const invoiceRef = doc(db, 'invoices', invoiceId);
        batch.update(invoiceRef, updatedInvoiceData);

        const transactionQuery = query(
            collection(db, 'transactions'),
            where('product', '==', `Invoice #${invoiceData.invoiceNumber}`),
            where('userId', '==', user.uid)
        );
        const transactionSnap = await getDocs(transactionQuery);
        if (!transactionSnap.empty) {
            const transactionRef = doc(db, 'transactions', transactionSnap.docs[0].id);
            batch.update(transactionRef, {
                name: invoiceData.customerName,
                phone: invoiceData.customerPhone,
                amount: totalAmount,
                netAmount: subtotal,
                vatAmount: vatAmount,
                date: invoiceData.issueDate,
            });
        }
        
        await batch.commit();
    }

    const deleteInvoice = async (invoiceId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const batch = writeBatch(db);
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (!invoice) return;

        const invoiceRef = doc(db, 'invoices', invoiceId);
        batch.delete(invoiceRef);

        const transactionQuery = query(
            collection(db, 'transactions'),
            where('product', '==', `Invoice #${invoice.invoiceNumber}`),
            where('userId', '==', user.uid)
        );
        const transactionSnap = await getDocs(transactionQuery);
        if (!transactionSnap.empty) {
            const transactionRef = doc(db, 'transactions', transactionSnap.docs[0].id);
            batch.delete(transactionRef);
        }

        await batch.commit();
    }


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
    
    const transferInvoice = async (invoiceId: string, toShopId: string) => {
        if (!user) throw new Error("User not authenticated.");
        await updateDoc(doc(db, 'invoices', invoiceId), { shopId: toShopId });
    }
    
    const addFundTransfer = async (data: Omit<FundTransfer, 'id' | 'userId' | 'shopId'>) => {
        if (!user || !activeShopId) throw new Error("User not authenticated or no active shop.");
        const fromBalance = cashBalances[data.from.toLowerCase() as keyof typeof cashBalances];
        if (data.amount > fromBalance) {
            throw new Error(`Insufficient funds in ${data.from} account. Available: ${fromBalance.toLocaleString()}`);
        }
        await addDoc(collection(db, 'fundTransfers'), { ...data, userId: user.uid, shopId: activeShopId });
    };

    useEffect(() => {
        const addInitialCapital = async () => {
            if (user) {
                const capQuery = query(collection(db, 'capitalContributions'), where('userId', '==', user.uid));
                const capSnap = await getDocs(capQuery);
                if (capSnap.empty) {
                    const batch = writeBatch(db);
                    const capitalRef = collection(db, 'capitalContributions');
                    batch.set(doc(capitalRef), {
                        userId: user.uid,
                        shopId: defaultShopIdForMigration || 'default',
                        date: new Date('2024-01-01'),
                        description: 'Initial Capital Injection',
                        type: 'Cash',
                        amount: 1018850
                    });
                    batch.set(doc(capitalRef), {
                        userId: user.uid,
                        shopId: defaultShopIdForMigration || 'default',
                        date: new Date('2024-01-02'),
                        description: 'Second Cash Injection',
                        type: 'Cash',
                        amount: 1566000
                    });
                     batch.set(doc(capitalRef), {
                        userId: user.uid,
                        shopId: defaultShopIdForMigration || 'default',
                        date: new Date('2024-01-03'),
                        description: 'Third Cash Injection',
                        type: 'Cash',
                        amount: 1566000
                    });
                    await batch.commit();
                }
            }
        };
        addInitialCapital();
    }, [user, defaultShopIdForMigration]);


    const contextValue: FinancialContextType | undefined = useMemo(() => {
        if (authLoading) {
            return undefined;
        }
        return {
            allTransactions,
            allPayables,
            allPrepayments,
            allCustomers,
            userAccounts,
            allShops,
            activeShop,
            setActiveShopId,
            activeShopId,
            companyName,
            allProducts,
            allDamagedGoods,
            allStockRequests,
            initialAssets,
            allCapitalContributions,
            allOwnerLoans,
            allExpenses,
            employees,
            allPayrollHistory,
            allPurchaseOrders,
            allInvoices,
            allFundTransfers,
            transactions,
            payables,
            prepayments,
            customers,
            shops,
            products,
            damagedGoods,
            stockRequests,
            assets,
            capitalContributions,
            ownerLoans,
            expenses,
            payrollHistory,
            purchaseOrders,
            invoices,
            fundTransfers,
            cashBalances,
            addSale,
            deleteSale,
            transferSale,
            adjustTransactionVat,
            markReceivableAsPaid,
            deleteReceivable,
            markPayableAsPaid,
            deletePayable,
            markPrepaymentAsUsed,
            markPrepaymentAsRefunded,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            addUserAccount,
            deleteUserAccount,
            addShop,
            updateShop,
            deleteShop,
            addProduct,
            updateProduct,
            deleteProduct,
            transferStock,
            reportDamage,
            createStockRequest,
            approveStockRequest,
            rejectStockRequest,
            addAsset,
            sellAsset,
            writeOffAsset,
            addCapitalContribution,
            updateCapitalContribution,
            deleteCapitalContribution,
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
            updatePurchaseOrder,
            deletePurchaseOrder,
            receivePurchaseOrder,
            payPurchaseOrder,
            transferPurchaseOrder,
            addInvoice,
            updateInvoice,
            deleteInvoice,
            payInvoice,
            transferInvoice,
            addFundTransfer
        };
    }, [
        authLoading, allTransactions, allPayables, allPrepayments, allCustomers, userAccounts,
        allShops, activeShop, activeShopId, companyName, allProducts, allDamagedGoods, allStockRequests,
        initialAssets, allCapitalContributions, allOwnerLoans, allExpenses, employees, allPayrollHistory,
        allPurchaseOrders, allInvoices, allFundTransfers, transactions, payables, prepayments, customers,
        shops, products, damagedGoods, stockRequests, assets, capitalContributions, ownerLoans,
        expenses, payrollHistory, purchaseOrders, invoices, fundTransfers, cashBalances
    ]);


    if (authLoading || !contextValue) {
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

    














    
