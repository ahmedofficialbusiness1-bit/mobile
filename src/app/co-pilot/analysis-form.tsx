'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { analyzeLoss, RootCauseAnalysisOutput } from '@/ai/flows/root-cause-analysis'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Search } from 'lucide-react'

const formSchema = z.object({
  financialReport: z.string().min(20, 'Please provide the financial report details.'),
  context: z.string().optional(),
})

export default function AnalysisForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RootCauseAnalysisOutput | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialReport: '',
      context: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setResult(null)
    try {
      const res = await analyzeLoss(values)
      setResult(res)
    } catch (error) {
      console.error('Analysis failed', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Root Cause Analysis of Losses</CardTitle>
            <CardDescription>
              Analyze a financial report to find the root causes of any losses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="financialReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Report</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the financial report outlining losses."
                      {...field}
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Context (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., There was a supplier price increase in the last quarter."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Analyze Loss
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {result && (
        <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Summary</h3>
                <p className="text-sm p-4 bg-muted rounded-md">{result.summary}</p>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Contributing Factors</h3>
                <ul className="list-disc list-inside space-y-1 text-sm p-4 bg-muted rounded-md">
                    {result.factors.map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1 text-sm p-4 bg-muted rounded-md">
                    {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
            </div>
        </CardContent>
        </>
      )}
    </Card>
  )
}
