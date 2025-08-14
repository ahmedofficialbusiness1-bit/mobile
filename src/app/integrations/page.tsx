import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const integrations = [
    { name: "Mobile Money", description: "Connect with M-Pesa, Tigo Pesa, Airtel Money." },
    { name: "Bank Feeds", description: "Auto-reconciliation with major banks." },
    { name: "E-Invoicing", description: "Connectors for TRA, KRA, URA, and RRA." },
    { name: "E-commerce", description: "Integrate with Shopify and WooCommerce." },
    { name: "WhatsApp Business API", description: "Automate communication and sales." },
    { name: "USSD Gateways", description: "Provide services over USSD." },
    { name: "GS1 Barcodes", description: "Standardized product barcoding." },
]

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Integrations
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Connect DiraBiz with the tools and services you already use.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
            <Card key={integration.name}>
                <CardHeader>
                    <CardTitle>{integration.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{integration.description}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
