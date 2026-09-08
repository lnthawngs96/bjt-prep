import type { MockTest, MockTestItem } from '@/lib/prisma-types';
import { ContentStatus, SectionCode } from '@/lib/prisma-types';
import { stamps, T1 } from './_shared';

/**
 * Đề thi thử. Giai đoạn giao diện mới có metadata — chưa đủ 80 câu.
 * Trước khi PUBLISHED phải kiểm: tổng câu theo từng section khớp bảng
 * SectionDef (5/10/10 · 5/10/10 · 10/10/10 = 80).
 * Màn /admin/mock-tests khoá nút publish khi chưa đủ và báo rõ thiếu section nào.
 */

export const MOCK_TESTS: MockTest[] = [
  {
    id: 'mt-01',
    code: 'MT-01',
    titleVi: 'Đề thi thử số 1',
    descVi: 'Đề cân bằng, độ khó quanh mức J3.',
    status: ContentStatus.PUBLISHED,
    publishedAt: T1,
    ...stamps,
  },
  {
    id: 'mt-02',
    code: 'MT-02',
    titleVi: 'Đề thi thử số 2',
    descVi: 'Nặng phần 聴読解, nhiều bảng số liệu và biểu đồ.',
    status: ContentStatus.PUBLISHED,
    publishedAt: T1,
    ...stamps,
  },
  {
    id: 'mt-03',
    code: 'MT-03',
    titleVi: 'Đề thi thử số 3',
    descVi: 'Độ khó quanh mức J2. Nhiều câu về kính ngữ và chỉ thị gián tiếp.',
    status: ContentStatus.PUBLISHED,
    publishedAt: T1,
    ...stamps,
  },
];

export const MOCK_TEST_BY_ID = new Map(MOCK_TESTS.map((m) => [m.id, m]));

/**
 * Giai đoạn giao diện chỉ lắp vài group mẫu vào MT-03 để màn admin có gì mà đếm
 * và để cảnh báo "chưa đủ 80 câu" hiện ra được.
 */
export const MOCK_TEST_ITEMS: MockTestItem[] = [
  { mockTestId: 'mt-03', groupId: 'grp-l2-014', sectionCode: SectionCode.L2, order: 1 },
  { mockTestId: 'mt-03', groupId: 'grp-lr2-007', sectionCode: SectionCode.LR2, order: 2 },
  { mockTestId: 'mt-03', groupId: 'grp-lr2-008', sectionCode: SectionCode.LR2, order: 3 },
  { mockTestId: 'mt-03', groupId: 'grp-lr2-009', sectionCode: SectionCode.LR2, order: 4 },
  { mockTestId: 'mt-03', groupId: 'grp-r1-033', sectionCode: SectionCode.R1, order: 5 },
  { mockTestId: 'mt-03', groupId: 'grp-r2-021', sectionCode: SectionCode.R2, order: 6 },
];
