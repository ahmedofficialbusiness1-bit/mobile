import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Executive Dashboards", description: "High-level overview of business performance." },
    { name: "Drill-Through Analysis", description: "Dig deeper into your data for insights." },
    { name: "Demand Forecasting", description: "Predict future sales and demand." },
    { name: "Cashflow Stress Tests", description: "Simulate financial scenarios to assess resilience." },
]

export default function BIPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          BI & Forecasting
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Gain powerful insights with business intelligence and forecasting tools.
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
