
'use client'

import { DollarSign, Package, Archive, AlertTriangle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product } from '@/context/financial-context'
import { cn } from '@/lib/utils'


interface InventorySummaryCardsProps {
  products: Product[]
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export function InventorySummaryCards({ products, onFilterChange, activeFilter }: InventorySummaryCardsProps) {
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

  const summaryFilters = [
    { id: 'Low Stock', label: 'Low Stock Items', value: lowStockItems, icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'Out of Stock', label: 'Out of Stock', value: outOfStockItems, icon: Package, color: 'text-red-500' },
    { id: 'Expired', label: 'Expired Items', value: expiredItems, icon: Archive, color: 'text-muted-foreground' },
  ];

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
      
      {summaryFilters.map(filter => (
         <Card 
            key={filter.id} 
            className={cn("cursor-pointer hover:bg-muted/50", activeFilter === filter.id && "ring-2 ring-primary")}
            onClick={() => onFilterChange(filter.id)}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{filter.label}</CardTitle>
            <filter.icon className={cn("h-5 w-5", filter.color)} />
            </CardHeader>
            <CardContent>
            <p className="text-2xl font-bold">{filter.value}</p>
            <p className="text-xs text-muted-foreground">Items matching this status</p>
            </CardContent>
        </Card>
      ))}
    </div>
  )
}
