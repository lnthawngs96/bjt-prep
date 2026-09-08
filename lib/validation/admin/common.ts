import { z } from 'zod';
import { ContentStatus, Level, MaterialKind, Part, PartOfSpeech, Register, SectionCode, UserRole } from '@/lib/prisma-types';

/**
 * Mảnh zod dùng chung cho form admin. Enum lấy thẳng từ Prisma để không
 * bao giờ lệch schema.
 */

export const idSchema = z.string().min(1, 'Bắt buộc');
export const statusSchema = z.enum(ContentStatus);
export const levelSchema = z.enum(Level);
export const sectionCodeSchema = z.enum(SectionCode);
export const partSchema = z.enum(Part);
export const materialKindSchema = z.enum(MaterialKind);
export const registerSchema = z.enum(Register);
export const posSchema = z.enum(PartOfSpeech);
export const userRoleSchema = z.enum(UserRole);

/** Chuỗi tuỳ chọn: '' từ form thành null. */
export const optionalText = z
  .string()
  .trim()
  .transform((s) => (s === '' ? null : s))
  .nullable()
  .optional()
  .transform((s) => s ?? null);

export const requiredText = z.string().trim().min(1, 'Bắt buộc');

/** Số nguyên không âm; '' hoặc null từ form thành null. */
export const optionalInt = z
  .union([z.number().int().min(0), z.null(), z.literal('')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? null : v));

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Bắt buộc')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Chỉ chữ thường, số và dấu gạch ngang');

export const orderedItemSchema = z.object({ id: idSchema, order: z.number().int().min(0) });
