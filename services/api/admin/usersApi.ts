import { patchJson } from '@/services/api/common/apiResult';
import type { ReportResolveInput, UserRoleInput } from '@/lib/validation/admin/user';

/** PATCH /api/admin/users/[id] — đổi vai trò. */
export const handlePatchAdminUser = (id: string, body: UserRoleInput) =>
  patchJson<{ id: string }>(`/api/admin/users/${id}`, body);

/** PATCH /api/admin/reports/[id] — đóng báo lỗi. */
export const handlePatchAdminReport = (id: string, body: ReportResolveInput) =>
  patchJson<{ id: string }>(`/api/admin/reports/${id}`, body);
