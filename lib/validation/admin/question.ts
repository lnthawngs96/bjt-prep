import { z } from 'zod';
import { idSchema, levelSchema, optionalInt, optionalText, requiredText, statusSchema } from './common';

export const questionOptionInputSchema = z.object({
  order: z.number().int().min(1).max(4),
  /** null = phương án được đọc trong audio (chỉ L1, L2, LR1 — kiểm ở server theo section của group). */
  textJa: optionalText,
  isCorrect: z.boolean(),
  distractorNote: optionalText,
});

export const questionInputSchema = z
  .object({
    groupId: idSchema,
    order: z.number().int().min(1, 'Thứ tự từ 1'),
    level: levelSchema,
    stemJa: requiredText,
    stemVi: optionalText,
    audioStartMs: optionalInt,
    audioEndMs: optionalInt,
    explanationVi: optionalText,
    businessNoteVi: optionalText,
    status: statusSchema,
    options: z.array(questionOptionInputSchema).length(4, 'Đúng 4 phương án'),
    tagIds: z.array(idSchema).default([]),
    vocabLinks: z.array(z.object({ vocabId: idSchema, relevance: z.enum(['tested', 'appears']) })).default([]),
    grammarLinks: z
      .array(z.object({ grammarId: idSchema, relevance: z.enum(['tested', 'appears']) }))
      .default([]),
  })
  .superRefine((q, ctx) => {
    const correct = q.options.filter((o) => o.isCorrect).length;
    if (correct !== 1) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Phải có đúng một đáp án đúng' });
    }
    const orders = new Set(q.options.map((o) => o.order));
    if (orders.size !== 4) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Thứ tự phương án phải là 1, 2, 3, 4' });
    }
    if (q.audioStartMs != null && q.audioEndMs != null && q.audioEndMs < q.audioStartMs) {
      ctx.addIssue({ code: 'custom', path: ['audioEndMs'], message: 'Kết thúc phải sau bắt đầu' });
    }
  });

export type QuestionInput = z.infer<typeof questionInputSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionInputSchema>;
