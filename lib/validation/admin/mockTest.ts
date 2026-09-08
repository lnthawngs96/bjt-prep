import { z } from 'zod';
import { idSchema, optionalText, requiredText, sectionCodeSchema } from './common';

/**
 * Trạng thái KHÔNG nằm trong form: publish đi qua endpoint riêng có kiểm
 * đủ 80 câu (validateMockTestComposition). Form chỉ lưu DRAFT hoặc giữ nguyên.
 */
export const mockTestInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Bắt buộc')
    .regex(/^[A-Z0-9-]+$/, 'Chữ in hoa, số và gạch ngang, ví dụ MT-04'),
  titleVi: requiredText,
  descVi: optionalText,
  items: z
    .array(z.object({ groupId: idSchema, sectionCode: sectionCodeSchema, order: z.number().int().min(1) }))
    .default([]),
});

export type MockTestInput = z.infer<typeof mockTestInputSchema>;
