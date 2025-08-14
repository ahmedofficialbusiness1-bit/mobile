// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent for performing root cause analysis of losses.
 *
 * - analyzeLoss - A function that handles the root cause analysis process.
 * - RootCauseAnalysisInput - The input type for the analyzeLoss function.
 * - RootCauseAnalysisOutput - The return type for the analyzeLoss function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RootCauseAnalysisInputSchema = z.object({
  financialReport: z
    .string()
    .describe('A detailed financial report outlining losses.'),
  context: z
    .string()
    .optional()
    .describe('Additional context or information related to the losses.'),
});
export type RootCauseAnalysisInput = z.infer<typeof RootCauseAnalysisInputSchema>;

const RootCauseAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the root cause analysis.'),
  factors: z
    .array(z.string())
    .describe('Key factors contributing to the losses.'),
  recommendations: z
    .array(z.string())
    .describe('Recommended actions to address the identified factors.'),
});
export type RootCauseAnalysisOutput = z.infer<typeof RootCauseAnalysisOutputSchema>;

export async function analyzeLoss(input: RootCauseAnalysisInput): Promise<RootCauseAnalysisOutput> {
  return rootCauseAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rootCauseAnalysisPrompt',
  input: {schema: RootCauseAnalysisInputSchema},
  output: {schema: RootCauseAnalysisOutputSchema},
  prompt: `You are an AI co-pilot specializing in financial analysis.

  Your task is to perform a root cause analysis of financial losses based on the provided financial report and any additional context.

  Financial Report:
  {{financialReport}}

  Context:
  {{context}}

  Identify the key factors contributing to the losses and provide actionable recommendations to address these factors.

  Ensure that the summary is concise and the factors and recommendations are clear and specific.
  The output should be easily understandable by a manager seeking to implement corrective actions.
`,
});

const rootCauseAnalysisFlow = ai.defineFlow(
  {
    name: 'rootCauseAnalysisFlow',
    inputSchema: RootCauseAnalysisInputSchema,
    outputSchema: RootCauseAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
