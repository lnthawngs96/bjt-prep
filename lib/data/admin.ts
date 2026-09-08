/**
 * API tầng dữ liệu cho trang quản trị.
 *
 * KHÔNG có nguồn mock: admin là nơi tạo ra nội dung thật, chỉ có nghĩa khi
 * có database. Layout /admin kiểm USE_DB và hiện hướng dẫn bật DB khi thiếu.
 * Mọi hàm ghi chạy trong transaction và ghi AuditLog.
 */
export { getAdminLookups, getAdminOverview } from './sources/db/admin/lookups';
export {
  getAdminQuestions,
  getAdminQuestionEditor,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from './sources/db/admin/questions';
export { getAdminGroups, createGroup, updateGroup, deleteGroup } from './sources/db/admin/groups';
export {
  getAdminMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getAdminMedia,
  createMedia,
  updateMedia,
  deleteMedia,
} from './sources/db/admin/materials';
export { getAdminVocab, createVocab, updateVocab, deleteVocab } from './sources/db/admin/vocab';
export { getAdminGrammar, createGrammar, updateGrammar, deleteGrammar } from './sources/db/admin/grammar';
export {
  getAdminSets,
  createSet,
  updateSet,
  deleteSet,
  getAdminMockTests,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  publishMockTest,
  unpublishMockTest,
} from './sources/db/admin/sets';
export {
  getAdminUsers,
  setUserRole,
  getAdminQuestionStats,
  STAT_MIN_ATTEMPTS,
  getAdminReports,
  resolveReport,
} from './sources/db/admin/users';
