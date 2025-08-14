import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
    { name: "Job Costing", description: "Track costs for construction or maintenance jobs." },
    { name: "Work in Progress (WIP) Tracking", description: "Monitor the status of ongoing projects." },
    { name: "Progress Billing", description: "Bill clients based on project milestones." },
]

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Projects & Jobs
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage project costs, progress, and billing.
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
