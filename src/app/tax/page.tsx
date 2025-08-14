import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "VAT, Withholding, Excise", description: "Calculate and manage various taxes." },
    { name: "E-Invoicing Connectors", description: "Hooks for TRA, KRA, URA, RRA systems." },
    { name: "Payroll Taxes", description: "Automate payroll tax calculations." },
    { name: "Immutable Audit Trail", description: "Secure and tamper-proof transaction history." },
]

export default function TaxPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Tax & Compliance
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Stay compliant with local tax regulations.
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
