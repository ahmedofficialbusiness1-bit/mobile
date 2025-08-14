import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Lead Management", description: "Track and manage potential customers." },
    { name: "Sales Routes", description: "Optimize routes for field sales agents." },
    { name: "Geo-fencing", description: "Set geographical boundaries for sales activities." },
    { name: "Van Sales (Duka \u2192 Duka)", description: "Manage sales directly from a delivery van." },
    { name: "Order-on-WhatsApp", description: "Allow customers to place orders via WhatsApp." },
]

export default function CRMPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          CRM & Field Sales
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage customer relationships and field sales operations.
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
