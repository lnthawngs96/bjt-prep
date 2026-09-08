import { z } from 'zod';
import { userRoleSchema } from './common';

export const userRoleInputSchema = z.object({ role: userRoleSchema });
export type UserRoleInput = z.infer<typeof userRoleInputSchema>;

export const reportResolveSchema = z.object({ status: z.enum(['resolved', 'rejected']) });
export type ReportResolveInput = z.infer<typeof reportResolveSchema>;
