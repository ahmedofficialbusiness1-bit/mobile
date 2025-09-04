
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, ArrowRightLeft, ShieldAlert } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'


interface InventoryDataTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onTransfer: (product: Product) => void
  onDamage: (product: Product) => void
  inventoryType: 'main' | 'shop'
}

export function InventoryDataTable({ products, onEdit, onDelete, onTransfer, onDamage, inventoryType }: InventoryDataTableProps) {
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
                  {product.id.toUpperCase().substring(0,6)}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right font-medium">
                  {(inventoryType === 'main' ? product.mainStock : product.currentStock).toLocaleString()} {product.uom}
                </TableCell>
                <TableCell className="text-right">{product.reorderLevel.toLocaleString()}</TableCell>
                <TableCell className="text-right font-semibold">
                  {(
                    (inventoryType === 'main' ? product.mainStock : product.currentStock) * product.purchasePrice
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
                            <DropdownMenuItem onClick={() => onTransfer(product)}>
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Transfer Stock
                            </DropdownMenuItem>
                             <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(product)}>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDamage(product)}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Report Damage
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will permanently delete the product {product.name}. This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(product)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No products found for the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
