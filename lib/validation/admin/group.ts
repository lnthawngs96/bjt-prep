import { z } from 'zod';
import { idSchema, levelSchema, optionalText, requiredText, sectionCodeSchema, statusSchema } from './common';

export const groupInputSchema = z.object({
  sectionCode: sectionCodeSchema,
  level: levelSchema,
  titleAdmin: requiredText,
  instructionJa: optionalText,
  instructionVi: optionalText,
  status: statusSchema,
  /** Tài liệu gắn vào group, theo thứ tự hiển thị. */
  materials: z.array(z.object({ materialId: idSchema, order: z.number().int().min(1) })).default([]),
});

export type GroupInput = z.infer<typeof groupInputSchema>;
