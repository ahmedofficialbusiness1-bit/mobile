import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Point of Sale (POS)", description: "Android/Web based POS system." },
    { name: "Barcode/QR Scanning", description: "Fast product scanning." },
    { name: "Bundle Pricing", description: "Create special offers and bundles." },
    { name: "Loyalty Programs", description: "Reward your returning customers." },
    { name: "WhatsApp Receipts", description: "Send digital receipts via WhatsApp." },
    { name: "Split Tender", description: "Accept cash and mobile money in one transaction." },
    { name: "Layaway", description: "Manage partial payments and deposits." },
]

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Sales & POS
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage all your sales activities from a single place.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
            <Card key={feature.name}>
                <CardHeader>
                    <CardTitle>{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
