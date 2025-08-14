import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, QrCode, ShieldCheck } from 'lucide-react'
import { Logo } from './logo'
import Image from 'next/image'

const receiptItems = [
  { description: 'Unga wa Ngano (Azam)', qty: 2, price: 3500 },
  { description: 'Mchele (Super)', qty: 5, price: 2800 },
  { description: 'Sukari (Kilombero)', qty: 1, price: 3200 },
  { description: 'Mafuta ya Alizeti (Korie)', qty: 1, price: 8500 },
]

export function DigitalReceipt() {
  const subtotal = receiptItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  )
  const tax = subtotal * 0.18
  const total = subtotal + tax

  return (
    <Card className="shadow-lg font-sans">
      <CardHeader className="items-center bg-muted/50">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
          <span className="text-2xl font-bold font-headline text-foreground">
            PAYMENT SUCCESSFUL
          </span>
        </div>
        <div className="text-muted-foreground text-sm">
          Receipt #R-202405-0188
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="font-semibold text-muted-foreground text-xs">
              BILLED TO
            </div>
            <div className="font-medium">Juma Doe</div>
            <div className="text-sm text-muted-foreground">
              +255 712 345 678
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-muted-foreground text-xs">
              DATE
            </div>
            <div className="font-medium">May 21, 2024</div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">ITEM</TableHead>
              <TableHead className="text-center">QTY</TableHead>
              <TableHead className="text-right">AMOUNT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receiptItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className="text-center">{item.qty}</TableCell>
                <TableCell className="text-right">
                  {(item.qty * item.price).toLocaleString('en-US')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal.toLocaleString('en-US')} TSh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT (18%)</span>
            <span>{tax.toLocaleString('en-US')} TSh</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{total.toLocaleString('en-US')} TSh</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="https://placehold.co/128x128.png"
            width={128}
            height={128}
            alt="QR Code"
            data-ai-hint="qr code"
          />
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">Receipt Verified</span>
          </div>
          <p className="text-xs text-muted-foreground break-all">
            Hash: 0x1a2b...c3d4e5f6
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-center justify-center text-center bg-muted/50 py-4">
        <p className="text-sm font-semibold">Ahsante! Thank you for your business.</p>
        <p className="text-xs text-muted-foreground">Powered by DiraBiz</p>
      </CardFooter>
    </Card>
  )
}
