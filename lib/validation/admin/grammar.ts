import { z } from 'zod';
import { levelSchema, optionalText, registerSchema, requiredText, slugSchema, statusSchema } from './common';

export const grammarExampleInputSchema = z.object({
  sentenceJa: requiredText,
  meaningVi: requiredText,
  contextTag: optionalText,
  /** Ví dụ về cách dùng SAI — học kính ngữ mà không thấy ví dụ sai thì khó nhớ. */
  isNegative: z.boolean().default(false),
  noteVi: optionalText,
  audioId: optionalText,
});

export const grammarInputSchema = z.object({
  slug: slugSchema,
  pattern: requiredText,
  formation: requiredText,
  meaningVi: requiredText,
  register: registerSchema,
  level: levelSchema,
  usageNoteVi: optionalText,
  commonMistakeVi: optionalText,
  jlptLevel: optionalText,
  status: statusSchema,
  examples: z.array(grammarExampleInputSchema).default([]),
});

export type GrammarInput = z.infer<typeof grammarInputSchema>;
