
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Employee Records", description: "Maintain a central database of all employees." },
    { name: "Leave Management", description: "Track and approve employee leave requests." },
    { name: "Performance Reviews", description: "Conduct and record employee performance appraisals." },
    { name: "Recruitment", description: "Manage job postings and candidate applications." },
]

export default function HRPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          HR & Payroll
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage employee salaries, deductions, and payroll taxes.
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
