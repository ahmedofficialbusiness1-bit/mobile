'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { translateFinancialTerms, TranslateFinancialTermsOutput } from '@/ai/flows/translate-financial-terms'
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
import { Send, Loader2, Sparkles } from 'lucide-react'

const formSchema = z.object({
  financialTerm: z.string().min(3, 'Please enter a financial term.'),
  targetLanguage: z.enum(['Swahili', 'English']),
})

export default function TranslateForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TranslateFinancialTermsOutput | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialTerm: '',
      targetLanguage: 'Swahili',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setResult(null)
    try {
      const res = await translateFinancialTerms(values)
      setResult(res)
    } catch (error) {
      console.error('Translation failed', error)
      // You can add a toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Translate Financial Term</CardTitle>
            <CardDescription>
              Translate a financial term into simple Swahili or English.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="financialTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Term</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Amortization' or 'Journal Entry'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Language</FormLabel>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Translate
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {result && (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Translation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{result.translation}</p>
          </CardContent>
        </>
      )}
    </Card>
  )
}
