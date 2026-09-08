import { z } from 'zod';
import { optionalInt } from './common';

/**
 * Media giai đoạn này là file tĩnh đặt tay trong public/. Form "đăng ký"
 * đường dẫn tương đối; bytes, thời lượng và sóng tính ở trình duyệt.
 * TODO(r2): khi có R2, r2Key là key trong bucket và có endpoint upload thật.
 */
export const mediaInputSchema = z.object({
  r2Key: z
    .string()
    .trim()
    .min(1, 'Bắt buộc')
    .regex(/^[a-zA-Z0-9_\-./]+$/, 'Chỉ chữ, số, gạch, chấm và dấu /')
    .refine((s) => !s.startsWith('/') && !s.includes('..'), 'Đường dẫn tương đối trong public/, không có ..'),
  mime: z.string().trim().min(1, 'Bắt buộc'),
  bytes: z.number().int().min(0),
  durationMs: optionalInt,
  waveform: z.array(z.number().min(0).max(100)).max(200).nullable().default(null),
});

export type MediaInput = z.infer<typeof mediaInputSchema>;
