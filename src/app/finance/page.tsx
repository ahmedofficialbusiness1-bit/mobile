import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Chart of Accounts (EAC)", description: "Standardized chart of accounts for East Africa." },
    { name: "Accounts Receivable/Payable", description: "Track invoices and bills." },
    { name: "Auto-Reconciliation", description: "Reconcile bank and mobile money statements automatically." },
    { name: "Fixed Assets", description: "Manage asset depreciation and lifecycle." },
    { name: "Accruals & Multi-Currency", description: "Handle accruals and multiple currencies (TZS, KES, etc.)." },
    { name: "Consolidation", description: "Consolidate financial data from multiple entities." },
]

export default function FinancePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Finance & Accounting
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          A complete accounting suite for your business.
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
