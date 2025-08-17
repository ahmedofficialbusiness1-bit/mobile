
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Product } from '@/context/financial-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface InventoryDataTableProps {
  products: Product[]
  onEdit: (product: Product) => void
}

export function InventoryDataTable({ products, onEdit }: InventoryDataTableProps) {
  const getStatusVariant = (status: Product['status']) => {
    switch (status) {
      case 'In Stock':
        return 'default'
      case 'Low Stock':
        return 'secondary'
      case 'Out of Stock':
        return 'destructive'
      case 'Expired':
        return 'outline'
      default:
        return 'default'
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Qty in Stock</TableHead>
            <TableHead className="text-right">Reorder Lvl</TableHead>
            <TableHead className="text-right">Reorder Qty</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">
                  {product.id.toUpperCase()}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right font-medium">
                  {product.currentStock.toLocaleString()} {product.uom}
                </TableCell>
                <TableCell className="text-right">{product.reorderLevel.toLocaleString()}</TableCell>
                <TableCell className="text-right">{product.reorderQuantity.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {product.sellingPrice.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {(
                    product.currentStock * product.purchasePrice
                  ).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={getStatusVariant(product.status)}
                    className={cn(
                      product.status === 'Low Stock' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30',
                      product.status === 'Expired' && 'text-foreground'
                    )}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(product)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No products found for the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
