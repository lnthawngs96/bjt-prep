import { z } from 'zod';

/** Body của POST /api/attempts — mở một lượt làm bài. */
export const startAttemptBodySchema = z
  .object({
    questionSetId: z.string().min(1).optional(),
    mockTestId: z.string().min(1).optional(),
  })
  .refine((b) => Boolean(b.questionSetId || b.mockTestId), {
    message: 'Cần questionSetId hoặc mockTestId',
  });

/** Body của POST /api/attempts/[attemptId]/submit — chỉ gửi lựa chọn thô. */
export const submitBodySchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionId: z.string().min(1).nullable(),
      }),
    )
    .max(200),
});

export type SubmitBody = z.infer<typeof submitBodySchema>;
