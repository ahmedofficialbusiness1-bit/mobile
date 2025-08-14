// This file is machine-generated - edit with caution!

'use server';

/**
 * @fileOverview An AI co-pilot that can generate reports on key business metrics in Swahili or English.
 *
 * - generateReport - A function that handles the report generation process.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  language: z
    .enum(['Swahili', 'English'])
    .describe('The language in which the report should be generated.'),
  businessMetrics: z
    .string()
    .describe(
      'The key business metrics to include in the report, such as sales, revenue, expenses, and profit.'
    ),
  additionalInstructions: z
    .string()
    .optional()
    .describe('Any additional instructions or context for generating the report.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.string().describe('The generated report in the specified language.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an AI co-pilot that helps business owners understand their performance.
  You can generate reports on key business metrics in Swahili or English.

  Please generate a report in {{language}} based on the following business metrics:
  {{businessMetrics}}

  Here are some additional instructions:
  {{additionalInstructions}}
  `,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
