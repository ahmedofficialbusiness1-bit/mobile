
'use client'

import { DollarSign, Package, Archive, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product } from '@/context/financial-context'

interface InventorySummaryCardsProps {
  products: Product[]
}

export function InventorySummaryCards({ products }: InventorySummaryCardsProps) {
  const totalValue = products.reduce(
    (sum, p) => sum + (p.mainStock + p.shopStock) * p.purchasePrice,
    0
  )
  const lowStockItems = products.filter(
    (p) => p.status === 'Low Stock'
  ).length
  const outOfStockItems = products.filter(
    (p) => p.status === 'Out of Stock'
  ).length
  const expiredItems = products.filter(
    (p) => p.status === 'Expired'
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Inventory Value
          </CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            TSh {totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Based on purchase price</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{lowStockItems}</p>
          <p className="text-xs text-muted-foreground">Items below reorder level</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          <Package className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{outOfStockItems}</p>
          <p className="text-xs text-muted-foreground">Items with zero quantity</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Expired Items</CardTitle>
          <Archive className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{expiredItems}</p>
          <p className="text-xs text-muted-foreground">Items past their expiry date</p>
        </CardContent>
      </Card>
    </div>
  )
}
