import { adminCrud } from './adminCrudApi';
import type { GroupInput } from '@/lib/validation/admin/group';

const api = adminCrud<GroupInput>('/api/admin/groups');

/** POST /api/admin/groups */
export const handlePostAdminGroups = api.create;
/** PATCH /api/admin/groups/[id] */
export const handlePatchAdminGroup = api.update;
/** DELETE /api/admin/groups/[id] */
export const handleDeleteAdminGroup = api.remove;
