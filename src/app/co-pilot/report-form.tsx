'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateReport, GenerateReportOutput } from '@/ai/flows/generate-report'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUp, Loader2, Sparkles } from 'lucide-react'

const formSchema = z.object({
  language: z.enum(['Swahili', 'English']),
  businessMetrics: z.string().min(10, 'Please describe the business metrics.'),
  additionalInstructions: z.string().optional(),
})

export default function ReportForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateReportOutput | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'Swahili',
      businessMetrics: '',
      additionalInstructions: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setResult(null)
    try {
      const res = await generateReport(values)
      setResult(res)
    } catch (error) {
      console.error('Report generation failed', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Generate Business Report</CardTitle>
            <CardDescription>
              Create a report on key business metrics in your preferred language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Swahili">Swahili</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessMetrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Business Metrics</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Sales: TSh 10M, Revenue: TSh 8M, Expenses: TSh 3M, Profit: TSh 5M for Q1."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Focus on the profit margin and compare it to the previous quarter."
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" /> Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {result && (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> Generated Report</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-body bg-muted p-4 rounded-md">{result.report}</pre>
          </CardContent>
        </>
      )}
    </Card>
  )
}
