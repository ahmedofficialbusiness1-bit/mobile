
'use client'

import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import type { StockRequest } from '@/context/financial-context'
import { cn } from '@/lib/utils'

interface StockRequestsTableProps {
  requests: StockRequest[]
  isHeadquarters: boolean
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function StockRequestsTable({ requests, isHeadquarters, onApprove, onReject }: StockRequestsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {isHeadquarters && <TableHead>Shop</TableHead>}
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            {isHeadquarters && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length > 0 ? (
            requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium whitespace-nowrap">{format(req.requestDate, 'PPP')}</TableCell>
                {isHeadquarters && <TableCell>{req.shopName}</TableCell>}
                <TableCell>{req.productName}</TableCell>
                <TableCell className="text-right">{req.quantity}</TableCell>
                <TableCell>
                   <Badge
                    className={cn(
                      req.status === 'Approved' && 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
                      req.status === 'Rejected' && 'bg-red-500/20 text-red-700 hover:bg-red-500/30',
                      req.status === 'Pending' && 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30'
                    )}
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>{req.notes}</TableCell>
                {isHeadquarters && (
                    <TableCell className="text-right">
                        {req.status === 'Pending' && (
                        <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-green-50 hover:bg-green-100 text-green-700" onClick={() => onApprove(req.id)}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-700" onClick={() => onReject(req.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        )}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isHeadquarters ? 7 : 6} className="h-24 text-center">
                No stock requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
