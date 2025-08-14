import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Risk Register", description: "Identify, assess, and manage business risks." },
    { name: "Internal Controls", description: "Define and monitor internal control systems." },
    { name: "Incident Management", description: "Track and resolve operational incidents." },
    { name: "Segregation of Duties (SoD) Violations", description: "Detect and prevent conflicts of interest." },
]

export default function GRCPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Governance, Risk & Audit (GRC)
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Strengthen your governance and risk management framework.
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
