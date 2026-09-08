import { adminCrud } from './adminCrudApi';
import { postJson } from '@/services/api/common/apiResult';
import type { SetInput } from '@/lib/validation/admin/set';
import type { MockTestInput } from '@/lib/validation/admin/mockTest';

const sets = adminCrud<SetInput>('/api/admin/sets');
const mockTests = adminCrud<MockTestInput>('/api/admin/mock-tests');

/** POST /api/admin/sets */
export const handlePostAdminSets = sets.create;
/** PATCH /api/admin/sets/[id] */
export const handlePatchAdminSet = sets.update;
/** DELETE /api/admin/sets/[id] */
export const handleDeleteAdminSet = sets.remove;

/** POST /api/admin/mock-tests */
export const handlePostAdminMockTests = mockTests.create;
/** PATCH /api/admin/mock-tests/[id] */
export const handlePatchAdminMockTest = mockTests.update;
/** DELETE /api/admin/mock-tests/[id] */
export const handleDeleteAdminMockTest = mockTests.remove;
/** POST /api/admin/mock-tests/[id]/publish — server kiểm đủ 80 câu. */
export const handlePostAdminMockTestPublish = (id: string) =>
  postJson<{ id: string }>(`/api/admin/mock-tests/${id}/publish`, {});
/** POST /api/admin/mock-tests/[id]/unpublish */
export const handlePostAdminMockTestUnpublish = (id: string) =>
  postJson<{ id: string }>(`/api/admin/mock-tests/${id}/unpublish`, {});
