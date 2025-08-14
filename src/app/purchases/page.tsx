import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Request for Quotation (RFQ)", description: "Manage and send RFQs to suppliers." },
    { name: "Local Purchase Order (LPO)", description: "Create and track LPOs." },
    { name: "Goods Received Note (GRN)", description: "Confirm and document received goods." },
    { name: "3-Way Matching", description: "Automated matching of PO, Invoice, and GRN." },
    { name: "Supplier Scorecards", description: "Rate and track supplier performance." },
]

export default function PurchasesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Purchases & Suppliers
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Streamline your procurement and supplier management process.
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
