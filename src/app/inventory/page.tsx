
'use client'

import * as React from 'react'
import { PageGuard } from '@/components/security/page-guard'
import { PlusCircle, Search, Package, Clock, ShoppingCart, TrendingUp, X, Send } from 'lucide-react'
import { useFinancials, type Product, type DamagedGood, type StockRequest } from '@/context/financial-context'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { InventorySummaryCards } from './inventory-summary-cards'
import { differenceInDays, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns'
import { AddProductForm } from './add-product-form'
import { useToast } from '@/hooks/use-toast'
import { TransferStockForm } from './transfer-stock-form'
import { ReportDamageForm } from './report-damage-form'
import { cn } from '@/lib/utils'
import { DamagedGoodsTable } from './damaged-goods-table'
import { InventoryDataTable } from './inventory-data-table'
import { RequestStockForm } from './request-stock-form'
import { StockRequestsTable } from './stock-requests-table'


interface AgingData {
  new: number;
  threeMonths: number;
  sixMonths: number;
  overYear: number;
}

interface MonthlyStockData {
  opening: number;
  purchases: number;
  sales: number;
  closing: number;
}

function InventoryPageContent() {
  const { 
    products, 
    transactions, 
    purchaseOrders, 
    damagedGoods, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    transferStock, 
    reportDamage, 
    shops, 
    activeShopId,
    stockRequests,
    createStockRequest,
    approveStockRequest,
    rejectStockRequest
  } = useFinancials()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isTransferFormOpen, setIsTransferFormOpen] = React.useState(false);
  const [isDamageFormOpen, setIsDamageFormOpen] = React.useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeFilter, setActiveFilter] = React.useState('All')
  
  const isHeadquarters = activeShopId === null;

 const filteredProducts = React.useMemo(() => {
    const today = new Date();
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) => {
        if (activeFilter === 'All') return true;
        
        if (['In Stock', 'Low Stock', 'Out of Stock', 'Expired'].includes(activeFilter)) {
            return product.status === activeFilter;
        }

        const daysInStock = differenceInDays(today, product.entryDate);
        switch(activeFilter) {
            case 'new': return daysInStock <= 90;
            case 'threeMonths': return daysInStock > 90 && daysInStock <= 180;
            case 'sixMonths': return daysInStock > 180 && daysInStock <= 365;
            case 'overYear': return daysInStock > 365;
            default: return true;
        }
      })
  }, [products, searchTerm, activeFilter])

  const agingData = React.useMemo(() => {
    const today = new Date();
    return filteredProducts.reduce((acc, product) => {
        const daysInStock = differenceInDays(today, product.entryDate);
        if (daysInStock > 365) acc.overYear++;
        else if (daysInStock > 180) acc.sixMonths++;
        else if (daysInStock > 90) acc.threeMonths++;
        else acc.new++;
        return acc;
    }, { new: 0, threeMonths: 0, sixMonths: 0, overYear: 0 });
  }, [filteredProducts]);

  const monthlyStockData = React.useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const salesThisMonthQty = transactions
      .filter(t => isWithinInterval(t.date, { start: monthStart, end: monthEnd }))
      .reduce((sum, t) => sum + t.quantity, 0);

    const purchasesThisMonthQty = purchaseOrders
      .filter(po => po.receivingStatus === 'Received' && isWithinInterval(po.purchaseDate, { start: monthStart, end: monthEnd }))
      .reduce((sum, po) => sum + po.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    const currentStockTotal = filteredProducts.reduce((sum, p) => sum + (activeShopId === null ? p.mainStock + p.shopStock : p.currentStock), 0);
    
    const openingStock = currentStockTotal - purchasesThisMonthQty + salesThisMonthQty;

    const closingStock = currentStockTotal;

    return {
        opening: Math.max(0, openingStock), 
        purchases: purchasesThisMonthQty,
        sales: salesThisMonthQty,
        closing: closingStock,
    };
  }, [filteredProducts, transactions, purchaseOrders, activeShopId]);

  const handleSaveProduct = (data: Omit<Product, 'id' | 'status'>) => {
    if (selectedProduct) {
      updateProduct(selectedProduct.id, data)
      toast({
        title: 'Product Updated',
        description: `${data.name} has been updated.`,
      })
    } else {
      addProduct(data)
      toast({
        title: 'Product Added',
        description: `${data.name} has been added to your inventory.`,
      })
    }
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const handleAddClick = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    deleteProduct(product.id)
    toast({
        title: 'Product Deleted',
        description: `${product.name} has been deleted from inventory.`,
        variant: 'destructive',
    })
  }

  const handleTransferClick = (product: Product) => {
    setSelectedProduct(product);
    setIsTransferFormOpen(true);
  };
  
  const handleDamageClick = (product: Product) => {
    if (!activeShopId) {
        toast({
            variant: 'destructive',
            title: 'No Shop Selected',
            description: 'Please select a specific shop before reporting damages.',
        });
        return;
    }
    setSelectedProduct(product);
    setIsDamageFormOpen(true);
  }

  const handleSaveTransfer = (quantity: number, toShopId: string) => {
    if (selectedProduct) {
        transferStock(selectedProduct.id, quantity, toShopId)
            .then(() => {
                toast({
                    title: 'Stock Transferred',
                    description: `${quantity} units of ${selectedProduct.name} moved to shop inventory.`,
                });
                setIsTransferFormOpen(false);
                setSelectedProduct(null);
            })
            .catch(error => {
                 toast({
                    variant: 'destructive',
                    title: 'Transfer Failed',
                    description: error.message,
                });
            })
    }
  };
  
  const handleSaveDamage = (quantity: number, reason: string) => {
      if (selectedProduct) {
          reportDamage(selectedProduct.id, quantity, reason)
           .then(() => {
                toast({
                    title: 'Damage Reported',
                    description: `${quantity} units of ${selectedProduct.name} marked as damaged.`,
                });
                setIsDamageFormOpen(false);
                setSelectedProduct(null);
            })
            .catch(error => {
                 toast({
                    variant: 'destructive',
                    title: 'Failed to Report Damage',
                    description: error.message,
                });
            })
      }
  }
  
  const handleSaveRequest = (productId: string, productName: string, quantity: number, notes: string) => {
    createStockRequest(productId, productName, quantity, notes)
    .then(() => {
        toast({
            title: 'Request Sent',
            description: 'Your stock request has been sent to headquarters for approval.',
        });
        setIsRequestFormOpen(false);
    })
    .catch(error => {
        toast({
            variant: 'destructive',
            title: 'Request Failed',
            description: error.message,
        });
    })
  }
  
  const handleFilterChange = (newFilter: string) => {
      setActiveFilter(prev => prev === newFilter ? 'All' : newFilter);
  }

  const agingFilters = [
    { id: 'new', label: 'New (< 3 Months)', value: agingData.new },
    { id: 'threeMonths', label: '> 3 Months', value: agingData.threeMonths },
    { id: 'sixMonths', label: '> 6 Months', value: agingData.sixMonths },
    { id: 'overYear', label: '> 1 Year', value: agingData.overYear },
  ];


  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Inventory & Warehousing
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Keep your stock levels accurate and optimized.
        </p>
      </div>

      <InventorySummaryCards products={filteredProducts} onFilterChange={handleFilterChange} activeFilter={activeFilter} />
      
       <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground"/>
                Stock Aging Analysis
            </CardTitle>
            <CardDescription>
                Click a category to filter the product list below.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {agingFilters.map(filter => (
                 <div 
                    key={filter.id} 
                    className={cn("p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted", activeFilter === filter.id && "ring-2 ring-primary")}
                    onClick={() => handleFilterChange(filter.id)}
                >
                    <p className="text-sm text-muted-foreground">{filter.label}</p>
                    <p className="text-2xl font-bold">{filter.value}</p>
                </div>
            ))}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground"/>
                This Month's Stock Movement
            </CardTitle>
            <CardDescription>
                Summary of stock changes for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Opening Stock</span>
                </div>
                <span className="font-bold text-lg">{monthlyStockData.opening}</span>
            </div>
             <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Purchases</span>
                </div>
                <span className="font-bold text-lg">{monthlyStockData.purchases}</span>
            </div>
             <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Sales</span>
                </div>
                <span className="font-bold text-lg">{monthlyStockData.sales}</span>
            </div>
             <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-foreground" />
                    <span className="font-bold">Closing Stock</span>
                </div>
                <span className="font-extrabold text-xl">{monthlyStockData.closing}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isHeadquarters ? "main" : "shop"} className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <CardTitle>Product & Stock Management</CardTitle>
                <CardDescription>
                    Manage and track all products in your inventory.
                </CardDescription>
             </div>
             <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                {isHeadquarters && <TabsTrigger value="main">Main Inventory</TabsTrigger>}
                <TabsTrigger value="shop">Shop Inventory</TabsTrigger>
                <TabsTrigger value="requests">Stock Requests</TabsTrigger>
                <TabsTrigger value="damaged">Damaged Goods</TabsTrigger>
             </TabsList>
          </div>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search product name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                 {activeFilter !== 'All' && (
                    <Button variant="ghost" onClick={() => setActiveFilter('All')}>
                        <X className="mr-2 h-4 w-4"/>
                        Clear Filter: {activeFilter}
                    </Button>
                )}
                {isHeadquarters ? (
                    <Button onClick={handleAddClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                ) : (
                    <Button onClick={() => setIsRequestFormOpen(true)}>
                        <Send className="mr-2 h-4 w-4" />
                        Request Stock
                    </Button>
                )}
              </div>
            {isHeadquarters && (
                <TabsContent value="main">
                    <InventoryDataTable 
                        products={filteredProducts} 
                        onEdit={handleEditClick} 
                        onDelete={handleDeleteClick} 
                        onTransfer={handleTransferClick}
                        onDamage={handleDamageClick}
                        inventoryType="main"
                    />
                </TabsContent>
            )}
            <TabsContent value="shop">
                 <InventoryDataTable 
                    products={filteredProducts.filter(p => p.currentStock > 0)}
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick}
                     onDamage={handleDamageClick}
                    inventoryType="shop"
                />
            </TabsContent>
             <TabsContent value="requests">
                <StockRequestsTable
                    requests={stockRequests}
                    isHeadquarters={isHeadquarters}
                    onApprove={approveStockRequest}
                    onReject={rejectStockRequest}
                />
            </TabsContent>
            <TabsContent value="damaged">
                <DamagedGoodsTable damagedGoods={damagedGoods} />
            </TabsContent>
        </CardContent>
      </Tabs>
    </div>
    {isHeadquarters && (
      <AddProductForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
      />
    )}
    <TransferStockForm
        isOpen={isTransferFormOpen}
        onClose={() => setIsTransferFormOpen(false)}
        onSave={handleSaveTransfer}
        product={selectedProduct}
        shops={shops}
    />
     <ReportDamageForm
        isOpen={isDamageFormOpen}
        onClose={() => setIsDamageFormOpen(false)}
        onSave={handleSaveDamage}
        product={selectedProduct}
    />
     <RequestStockForm
        isOpen={isRequestFormOpen}
        onClose={() => setIsRequestFormOpen(false)}
        onSave={handleSaveRequest}
        products={products.filter(p => p.mainStock > 0)}
    />
    </>
  )
}

export default function InventoryPage() {
    return (
        <PageGuard tabId="inventory">
            <InventoryPageContent />
        </PageGuard>
    )
}
