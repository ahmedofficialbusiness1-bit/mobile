import { config } from 'dotenv';
config();

import '@/ai/flows/translate-financial-terms.ts';
import '@/ai/flows/generate-report.ts';
import '@/ai/flows/root-cause-analysis.ts';
import '@/ai/flows/explain-discrepancies.ts';