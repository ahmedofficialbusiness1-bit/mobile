import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Attendance Tracking", description: "Track employee attendance via USSD or FaceID." },
    { name: "Country-Specific Payroll", description: "Payroll rules for Tanzania, Kenya, etc." },
    { name: "Advances & Loans", description: "Manage employee salary advances and loans." },
    { name: "Leave Management", description: "Handle leave requests and tracking." },
    { name: "Contract Templates", description: "Use templates for employment contracts." },
]

export default function HRPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          HR & Payroll
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage your human resources and payroll with ease.
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
