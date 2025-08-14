import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Multi-Warehouse", description: "Manage stock across multiple locations." },
    { name: "Lot/Expiry/Serial Tracking", description: "Track items by lot, expiry, or serial number." },
    { name: "Cycle Counting", description: "Perform regular, partial stock takes." },
    { name: "Reorder Points", description: "Set automatic alerts for low stock." },
    { name: "FEFO Picking", description: "Ensure First-Expired, First-Out for perishable goods." },
]

export default function InventoryPage() {
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
