import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Bill of Materials (BOM)", description: "Define recipes and material requirements." },
    { name: "Work Centers", description: "Manage production stages and resources." },
    { name: "Yield Tracking", description: "Monitor production output and efficiency." },
    { name: "Batch Costing", description: "Calculate the cost of each production batch." },
    { name: "Energy Tracking", description: "Monitor energy consumption in production." },
]

export default function ProductionPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Production & Recipe/BOM
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage your manufacturing and production processes efficiently.
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
