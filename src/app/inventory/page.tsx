
'use client'

import * as React from 'react'
import { PageGuard } from '@/components/security/page-guard'
import { PlusCircle, Search, Package, Clock, ShoppingCart, TrendingUp } from 'lucide-react'
import { useFinancials, type Product } from '@/context/financial-context'
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
import { InventoryDataTable } from './inventory-data-table'
import { differenceInDays, startOfMonth, isWithinInterval } from 'date-fns'
import { AddProductForm } from './add-product-form'
import { useToast } from '@/hooks/use-toast'
import { TransferStockForm } from './transfer-stock-form'

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
  const { products, transactions, purchaseOrders, addProduct, updateProduct, deleteProduct, transferStock } = useFinancials()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isTransferFormOpen, setIsTransferFormOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('All')
  const [agingData, setAgingData] = React.useState<AgingData>({ new: 0, threeMonths: 0, sixMonths: 0, overYear: 0 });
  const [monthlyStockData, setMonthlyStockData] = React.useState<MonthlyStockData>({ opening: 0, purchases: 0, sales: 0, closing: 0 });


  const filteredProducts = React.useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) => {
        if (statusFilter === 'All') return true
        return product.status === statusFilter
      })
  }, [products, searchTerm, statusFilter])
  
  React.useEffect(() => {
    // Calculate Stock Aging
    const today = new Date();
    const agingCounts = products.reduce((acc, product) => {
        const daysInStock = differenceInDays(today, product.entryDate);
        if (daysInStock > 365) {
            acc.overYear++;
        } else if (daysInStock > 180) {
            acc.sixMonths++;
        } else if (daysInStock > 90) {
            acc.threeMonths++;
        } else {
            acc.new++;
        }
        return acc;
    }, { new: 0, threeMonths: 0, sixMonths: 0, overYear: 0 });
    setAgingData(agingCounts);

    // Calculate Monthly Stock Movement
    const monthStart = startOfMonth(today);
    const monthInterval = { start: monthStart, end: today };

    const salesThisMonth = transactions
        .filter(t => isWithinInterval(t.date, monthInterval) && (t.status === 'Paid' || t.status === 'Credit'))
        .length;

    const purchasesThisMonth = purchaseOrders
      .filter(po => po.receivingStatus === 'Received' && isWithinInterval(po.purchaseDate, monthInterval))
      .reduce((sum, po) => sum + po.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
      
    const currentStockTotal = products.reduce((sum, p) => sum + p.mainStock + p.shopStock, 0);
    const openingStock = currentStockTotal - purchasesThisMonth + salesThisMonth;
    const closingStock = currentStockTotal;

    setMonthlyStockData({
        opening: openingStock,
        purchases: purchasesThisMonth,
        sales: salesThisMonth,
        closing: closingStock,
    })

  }, [products, transactions, purchaseOrders]);

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

  const handleSaveTransfer = (quantity: number) => {
    if (selectedProduct) {
        transferStock(selectedProduct.id, quantity)
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

      <InventorySummaryCards products={products} />
      
       <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground"/>
                Stock Aging Analysis
            </CardTitle>
            <CardDescription>
                Breakdown of products by how long they've been in stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">New (&lt; 3 Months)</p>
                <p className="text-2xl font-bold">{agingData.new}</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">&gt; 3 Months</p>
                <p className="text-2xl font-bold">{agingData.threeMonths}</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">&gt; 6 Months</p>
                <p className="text-2xl font-bold">{agingData.sixMonths}</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">&gt; 1 Year</p>
                <p className="text-2xl font-bold">{agingData.overYear}</p>
            </div>
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

      <Tabs defaultValue="main">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <CardTitle>Product List</CardTitle>
                <CardDescription>
                    Manage and track all products in your inventory.
                </CardDescription>
             </div>
             <TabsList>
                <TabsTrigger value="main">Main Inventory</TabsTrigger>
                <TabsTrigger value="shop">Shop Inventory</TabsTrigger>
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
                <Button onClick={handleAddClick}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            <TabsContent value="main">
                <InventoryDataTable 
                    products={filteredProducts} 
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick} 
                    onTransfer={handleTransferClick}
                    inventoryType="main"
                />
            </TabsContent>
            <TabsContent value="shop">
                 <InventoryDataTable 
                    products={filteredProducts} 
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick}
                    inventoryType="shop"
                />
            </TabsContent>
        </CardContent>
      </Tabs>
    </div>
    <AddProductForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
    />
    <TransferStockForm
        isOpen={isTransferFormOpen}
        onClose={() => setIsTransferFormOpen(false)}
        onSave={handleSaveTransfer}
        product={selectedProduct}
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
