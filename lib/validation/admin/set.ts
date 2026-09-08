import { z } from 'zod';
import { idSchema, levelSchema, optionalInt, optionalText, requiredText, sectionCodeSchema, statusSchema } from './common';

export const setInputSchema = z.object({
  sectionCode: sectionCodeSchema,
  level: levelSchema,
  indexNo: z.number().int().min(1, 'Số bộ từ 1'),
  titleVi: requiredText,
  descVi: optionalText,
  estMinutes: optionalInt,
  status: statusSchema,
  items: z.array(z.object({ groupId: idSchema, order: z.number().int().min(1) })).default([]),
});

export type SetInput = z.infer<typeof setInputSchema>;
