
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useFinancials, type AddExpenseData } from '@/context/financial-context'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { expenseCategories } from '@/app/finance/expense-form'

const formSchema = z.object({
  description: z.string().min(3, { message: "Description must be at least 3 characters." }),
  category: z.enum(expenseCategories),
  amount: z.coerce.number().min(1, { message: "Amount must be greater than zero." }),
  date: z.date({
    required_error: "A date is required.",
  }),
});


function PostExpensePageContent() {
    const { addExpense } = useFinancials();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: '',
            amount: 0,
            date: new Date(),
        },
    });

    const handleSaveExpense = (expenseData: AddExpenseData) => {
        addExpense(expenseData);
        toast({
            title: "Expense Posted Successfully",
            description: "Your expense has been submitted and is awaiting approval in the Finance tab.",
        });
        form.reset();
    };

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div className="text-left">
                <h1 className="text-3xl font-bold font-headline">
                Post New Expense
                </h1>
                <p className="text-muted-foreground mt-2">
                Quickly submit a new business expense. It will be sent to the finance department for approval.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Details</CardTitle>
                    <CardDescription>Fill in the form below to record a new business expense.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSaveExpense)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Expense Description</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. LUKU electricity payment" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Expense Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select expense category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Amount (TSh)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 50000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            Submit Expense
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PostExpensePage() {
    return (
        <PostExpensePageContent />
    )
}
