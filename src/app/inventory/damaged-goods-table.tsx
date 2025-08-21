
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
import type { DamagedGood } from '@/context/financial-context'

interface DamagedGoodsTableProps {
  damagedGoods: DamagedGood[]
}

export function DamagedGoodsTable({ damagedGoods }: DamagedGoodsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Reported</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {damagedGoods.length > 0 ? (
            damagedGoods.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-nowrap">{format(item.date, 'PPP')}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell>{item.reason}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No damaged goods have been reported.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
