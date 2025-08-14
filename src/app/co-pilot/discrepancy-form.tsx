'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { explainDiscrepancies, ExplainDiscrepanciesOutput } from '@/ai/flows/explain-discrepancies'
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
import { Loader2, Sparkles, HelpCircle } from 'lucide-react'

const formSchema = z.object({
  financialRecords: z.string().min(20, 'Please provide sufficient financial records.'),
  query: z.string().min(10, 'Please ask a specific question about the discrepancy.'),
})

export default function DiscrepancyForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExplainDiscrepanciesOutput | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialRecords: '',
      query: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setResult(null)
    try {
      const res = await explainDiscrepancies(values)
      setResult(res)
    } catch (error) {
      console.error('Explanation failed', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Explain Financial Discrepancy</CardTitle>
            <CardDescription>
              Get a plain language explanation for discrepancies in your financial records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="financialRecords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Records</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the relevant financial records here, e.g., journal entries, bank statement lines, etc."
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
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discrepancy Query</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Why does invoice #INV-003 not match the payment received on May 15th?"
                      {...field}
                      rows={2}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Explaining...
                </>
              ) : (
                <>
                  <HelpCircle className="mr-2 h-4 w-4" /> Explain Discrepancy
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {result && (
         <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm p-4 bg-muted rounded-md space-y-2">
              <p className="font-semibold">Explanation:</p>
              <p>{result.explanation}</p>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
