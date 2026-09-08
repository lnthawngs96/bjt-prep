import { z } from 'zod';
import { idSchema, levelSchema, optionalInt, optionalText, posSchema, registerSchema, requiredText, statusSchema } from './common';

export const VOCAB_RELATIONS = ['synonym', 'antonym', 'sonkeigo', 'kenjougo', 'teineigo'] as const;

export const vocabExampleInputSchema = z.object({
  sentenceJa: requiredText,
  sentenceKana: optionalText,
  meaningVi: requiredText,
  contextTag: optionalText,
  audioId: optionalText,
});

export const vocabInputSchema = z.object({
  headword: requiredText,
  readingKana: requiredText,
  accent: optionalInt,
  pos: posSchema,
  meaningVi: requiredText,
  meaningEn: optionalText,
  level: levelSchema,
  topicId: optionalText,
  register: registerSchema.nullable().optional().transform((v) => v ?? null),
  audioId: optionalText,
  noteVi: optionalText,
  status: statusSchema,
  examples: z.array(vocabExampleInputSchema).default([]),
  /** 言う → おっしゃる (sonkeigo) / 申す (kenjougo). */
  relations: z.array(z.object({ relatedId: idSchema, relation: z.enum(VOCAB_RELATIONS) })).default([]),
});

export type VocabInput = z.infer<typeof vocabInputSchema>;
