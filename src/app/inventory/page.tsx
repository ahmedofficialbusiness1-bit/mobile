
'use client'

import * as React from 'react'
import { PlusCircle, Search } from 'lucide-react'
import { useFinancials } from '@/context/financial-context'
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

export default function InventoryPage() {
  const { products } = useFinancials()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('All')

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

  return (
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

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            Manage and track all products in your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="In Stock">In Stock</TabsTrigger>
                <TabsTrigger value="Low Stock">Low Stock</TabsTrigger>
                <TabsTrigger value="Out of Stock">Out of Stock</TabsTrigger>
                <TabsTrigger value="Expired">Expired</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search product name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>
            <TabsContent value={statusFilter}>
                <InventoryDataTable products={filteredProducts} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
