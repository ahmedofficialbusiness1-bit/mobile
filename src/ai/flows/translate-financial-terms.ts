'use server';

/**
 * @fileOverview Translates financial terms into simple Swahili or English.
 *
 * - translateFinancialTerms - A function that translates financial terms.
 * - TranslateFinancialTermsInput - The input type for the translateFinancialTerms function.
 * - TranslateFinancialTermsOutput - The return type for the translateFinancialTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateFinancialTermsInputSchema = z.object({
  financialTerm: z.string().describe('The financial term to translate.'),
  targetLanguage: z.enum(['Swahili', 'English']).describe('The target language for the translation.'),
});
export type TranslateFinancialTermsInput = z.infer<typeof TranslateFinancialTermsInputSchema>;

const TranslateFinancialTermsOutputSchema = z.object({
  translation: z.string().describe('The translation of the financial term.'),
});
export type TranslateFinancialTermsOutput = z.infer<typeof TranslateFinancialTermsOutputSchema>;

export async function translateFinancialTerms(input: TranslateFinancialTermsInput): Promise<TranslateFinancialTermsOutput> {
  return translateFinancialTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateFinancialTermsPrompt',
  input: {schema: TranslateFinancialTermsInputSchema},
  output: {schema: TranslateFinancialTermsOutputSchema},
  prompt: `You are an AI co-pilot that translates financial terms into simple language.

  Translate the following financial term into the specified language:

  Financial Term: {{{financialTerm}}}
  Target Language: {{{targetLanguage}}}
  Translation:`, 
});

const translateFinancialTermsFlow = ai.defineFlow(
  {
    name: 'translateFinancialTermsFlow',
    inputSchema: TranslateFinancialTermsInputSchema,
    outputSchema: TranslateFinancialTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
