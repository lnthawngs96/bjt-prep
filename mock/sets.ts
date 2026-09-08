import type { QuestionSet, QuestionSetItem } from '@/lib/prisma-types';
import { ContentStatus, Level, SectionCode } from '@/lib/prisma-types';
import { stamps } from './_shared';

/**
 * Bộ luyện tập. Một group dùng lại được ở nhiều nơi — nối bằng bảng trung gian
 * QuestionSetItem, không nhúng cứng. Cùng một group có thể vừa nằm trong bộ
 * luyện tập, vừa nằm trong đề thi thử, vừa nằm trong bộ "ôn điểm yếu".
 */

export const MOCK_SETS: QuestionSet[] = [
  {
    id: 'set-lr2-005',
    sectionCode: SectionCode.LR2,
    level: Level.J3,
    indexNo: 5,
    titleVi: 'Báo cáo doanh số quý',
    descVi: 'Nghe hội thoại họp phòng kinh doanh kèm bảng số liệu.',
    estMinutes: 12,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-lr2-006',
    sectionCode: SectionCode.LR2,
    level: Level.J3,
    indexNo: 6,
    titleVi: 'Lịch họp và phòng ban',
    descVi: 'Đọc bảng lịch, nghe trao đổi điều chỉnh thời gian họp.',
    estMinutes: 12,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-lr2-007',
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    indexNo: 7,
    titleVi: 'Doanh số theo khu vực',
    descVi: 'Ba tài liệu: bảng doanh số, biểu đồ chi phí và lịch họp. Trọng tâm là chỉ thị gián tiếp của cấp trên.',
    estMinutes: 15,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-l2-014',
    sectionCode: SectionCode.L2,
    level: Level.J3,
    indexNo: 14,
    titleVi: 'Tiếp khách tại quầy lễ tân',
    descVi: 'Xem ảnh tình huống, nghe phát ngôn và chọn cách đáp lại. Trọng tâm 内 và 外.',
    estMinutes: 8,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-r2-021',
    sectionCode: SectionCode.R2,
    level: Level.J2,
    indexNo: 21,
    titleVi: 'Email xin lỗi và đề xuất thay thế',
    descVi: 'Đọc email báo trễ hàng, tìm ý chính và mốc thời gian.',
    estMinutes: 10,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-l1-001',
    sectionCode: SectionCode.L1,
    level: Level.J3,
    indexNo: 1,
    titleVi: 'Trao đổi danh thiếp',
    descVi: 'Nhìn ảnh, nghe câu hỏi và bốn phương án. Màn hình chỉ có số, giống kỳ thi thật.',
    estMinutes: 5,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-l3-001',
    sectionCode: SectionCode.L3,
    level: Level.J2,
    indexNo: 1,
    titleVi: 'Đổi lịch họp định kỳ',
    descVi: 'Hội thoại dài giữa trưởng phòng và nhân viên, ba câu hỏi về lịch, tài liệu và người vắng mặt.',
    estMinutes: 8,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-lr1-001',
    sectionCode: SectionCode.LR1,
    level: Level.J3,
    indexNo: 1,
    titleVi: 'Chuyển máy điện thoại',
    descVi: 'Nhìn ảnh bàn làm việc, nghe cuộc gọi và nắm tình huống. Phương án đọc trong audio.',
    estMinutes: 5,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-lr3-001',
    sectionCode: SectionCode.LR3,
    level: Level.J2,
    indexNo: 1,
    titleVi: 'Chuẩn bị họp ra mắt sản phẩm',
    descVi: 'Ba nguồn cùng lúc: bảng tiến độ, email của trưởng phòng và hội thoại họp.',
    estMinutes: 12,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
  {
    id: 'set-r3-001',
    sectionCode: SectionCode.R3,
    level: Level.J2,
    indexNo: 1,
    titleVi: 'Đọc 稟議書 mua thiết bị',
    descVi: 'Đọc đơn xin phê duyệt, tìm mục đích, số tiền và nội dung ghi chú.',
    estMinutes: 10,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  },
];

export const MOCK_SET_BY_ID = new Map(MOCK_SETS.map((s) => [s.id, s]));

/**
 * Bộ 7 gom cả ba group LR2 → đúng 10 câu (3 + 4 + 3).
 * Đây là bộ dùng để nghiệm thu luồng làm bài đầy đủ.
 */
export const MOCK_SET_ITEMS: QuestionSetItem[] = [
  { setId: 'set-lr2-007', groupId: 'grp-lr2-007', order: 1 },
  { setId: 'set-lr2-007', groupId: 'grp-lr2-008', order: 2 },
  { setId: 'set-lr2-007', groupId: 'grp-lr2-009', order: 3 },
  { setId: 'set-lr2-005', groupId: 'grp-lr2-007', order: 1 },
  { setId: 'set-lr2-006', groupId: 'grp-lr2-009', order: 1 },
  { setId: 'set-l2-014', groupId: 'grp-l2-014', order: 1 },
  { setId: 'set-r2-021', groupId: 'grp-r2-021', order: 1 },
  { setId: 'set-l1-001', groupId: 'grp-l1-001', order: 1 },
  { setId: 'set-l3-001', groupId: 'grp-l3-001', order: 1 },
  { setId: 'set-lr1-001', groupId: 'grp-lr1-001', order: 1 },
  { setId: 'set-lr3-001', groupId: 'grp-lr3-001', order: 1 },
  { setId: 'set-r3-001', groupId: 'grp-r3-001', order: 1 },
];
