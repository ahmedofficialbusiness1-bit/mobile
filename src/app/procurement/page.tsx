import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "E-Sourcing", description: "Find and evaluate new suppliers electronically." },
    { name: "Bid Comparison", description: "Compare quotes and bids from multiple vendors." },
    { name: "Vendor Compliance Pack", description: "Track supplier TIN, licenses, and expiry dates." },
]

export default function ProcurementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Procurement & Tendering
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage your tendering and procurement lifecycle.
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
