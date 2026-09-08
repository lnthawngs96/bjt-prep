import { z } from 'zod';
import { idSchema, optionalText, requiredText, statusSchema } from './common';

/** Hình dạng cột `transcript` và `body` — khớp types/common/material.ts. */

export const transcriptLineSchema = z.object({
  speaker: z.string().trim().min(1, 'Bắt buộc'),
  role: z.string().trim().min(1, 'Bắt buộc'),
  text: z.string().trim().min(1, 'Bắt buộc'),
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(0),
});

export const tableBodySchema = z.object({
  caption: optionalText.transform((s) => s ?? undefined),
  headers: z.array(z.string()).min(1, 'Ít nhất một cột'),
  rows: z.array(z.array(z.string())).min(1, 'Ít nhất một dòng'),
  numericColumns: z.array(z.number().int().min(0)).default([]),
});

export const documentBodySchema = z.object({
  format: z.literal('markdown'),
  content: z.string().trim().min(1, 'Bắt buộc'),
});

export const chartBodySchema = z.object({
  chartType: z.enum(['bar']),
  caption: optionalText.transform((s) => s ?? undefined),
  categories: z.array(z.string().trim().min(1)).min(1, 'Ít nhất một nhóm'),
  series: z
    .array(z.object({ name: z.string().trim().min(1), values: z.array(z.number()) }))
    .min(1, 'Ít nhất một dãy'),
  axisLabels: z.object({ x: z.string().optional(), y: z.string().optional() }).optional(),
});

const base = {
  titleAdmin: requiredText,
  status: statusSchema,
  altText: optionalText,
};

/** Form đổi theo `kind`; discriminatedUnion cho lỗi đúng nhánh. */
export const materialInputSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('AUDIO'), ...base, mediaId: idSchema, transcript: z.array(transcriptLineSchema).default([]) }),
  z.object({ kind: z.literal('IMAGE'), ...base, mediaId: idSchema }),
  z.object({ kind: z.literal('TABLE'), ...base, body: tableBodySchema }),
  z.object({ kind: z.literal('DOCUMENT'), ...base, body: documentBodySchema }),
  z.object({ kind: z.literal('CHART'), ...base, body: chartBodySchema }),
]);

export type MaterialInput = z.infer<typeof materialInputSchema>;
export type TranscriptLineInput = z.infer<typeof transcriptLineSchema>;
