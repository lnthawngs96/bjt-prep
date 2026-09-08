import { adminCrud } from './adminCrudApi';
import type { MaterialInput } from '@/lib/validation/admin/material';
import type { MediaInput } from '@/lib/validation/admin/media';

const materials = adminCrud<MaterialInput>('/api/admin/materials');
const media = adminCrud<MediaInput>('/api/admin/media');

/** POST /api/admin/materials */
export const handlePostAdminMaterials = materials.create;
/** PATCH /api/admin/materials/[id] */
export const handlePatchAdminMaterial = materials.update;
/** DELETE /api/admin/materials/[id] */
export const handleDeleteAdminMaterial = materials.remove;

/** POST /api/admin/media */
export const handlePostAdminMedia = media.create;
/** PATCH /api/admin/media/[id] */
export const handlePatchAdminMediaItem = media.update;
/** DELETE /api/admin/media/[id] */
export const handleDeleteAdminMediaItem = media.remove;
