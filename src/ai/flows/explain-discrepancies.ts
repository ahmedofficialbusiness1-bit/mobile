// Explain discrepancies in financial records.
'use server';
/**
 * @fileOverview An AI co-pilot to explain discrepancies in financial records in plain language.
 *
 * - explainDiscrepancies - A function that handles the discrepancy explanation process.
 * - ExplainDiscrepanciesInput - The input type for the explainDiscrepancies function.
 * - ExplainDiscrepanciesOutput - The return type for the explainDiscrepancies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDiscrepanciesInputSchema = z.object({
  financialRecords: z
    .string()
    .describe('The financial records containing discrepancies.'),
  query: z.string().describe('The discrepancy to explain.'),
});
export type ExplainDiscrepanciesInput = z.infer<typeof ExplainDiscrepanciesInputSchema>;

const ExplainDiscrepanciesOutputSchema = z.object({
  explanation: z.string().describe('The plain language explanation of the discrepancy.'),
});
export type ExplainDiscrepanciesOutput = z.infer<typeof ExplainDiscrepanciesOutputSchema>;

export async function explainDiscrepancies(input: ExplainDiscrepanciesInput): Promise<ExplainDiscrepanciesOutput> {
  return explainDiscrepanciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDiscrepanciesPrompt',
  input: {schema: ExplainDiscrepanciesInputSchema},
  output: {schema: ExplainDiscrepanciesOutputSchema},
  prompt: `You are an AI co-pilot for accountants.

You will be provided with financial records and a specific query about a discrepancy.
Your goal is to explain the discrepancy in plain language, making it easy for the accountant to understand the root cause of the issue.

Financial Records: {{{financialRecords}}}

Discrepancy Query: {{{query}}}

Explanation:`,
});

const explainDiscrepanciesFlow = ai.defineFlow(
  {
    name: 'explainDiscrepanciesFlow',
    inputSchema: ExplainDiscrepanciesInputSchema,
    outputSchema: ExplainDiscrepanciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
