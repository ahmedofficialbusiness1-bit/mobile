import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline">
          Invoices
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Create and manage customer invoices.
        </p>
      </div>
      <Card>
          <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>This feature is coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Coming Soon</p>
              </div>
          </CardContent>
      </Card>
    </div>
  )
}
