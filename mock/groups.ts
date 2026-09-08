import type { GroupMaterial, QuestionGroup } from '@/lib/prisma-types';
import { ContentStatus, Level, SectionCode } from '@/lib/prisma-types';
import { stamps } from './_shared';

/**
 * QuestionGroup (大問) là đơn vị dữ liệu trung tâm, KHÔNG phải Question.
 * Một audio hoặc một bảng số liệu phục vụ nhiều câu.
 * Mọi câu đều thuộc một group, kể cả câu 語彙・文法 đứng một mình —
 * group đó có 1 câu và 0 tài liệu. Một đường đi duy nhất, query đơn giản hơn.
 */

export const MOCK_GROUPS: QuestionGroup[] = [
  {
    id: 'grp-lr2-007',
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    titleAdmin: '営業部 第3四半期 売上報告',
    instructionJa: '次の会話を聞きながら資料を見て、質問に答えてください。',
    instructionVi: 'Vừa nghe hội thoại vừa xem bảng số liệu, rồi trả lời câu hỏi.',
    status: ContentStatus.PUBLISHED,
    createdById: null,
    ...stamps,
  },
  {
    id: 'grp-l2-014',
    sectionCode: SectionCode.L2,
    level: Level.J3,
    titleAdmin: '受付での来客対応',
    instructionJa: '写真を見ながら発言を聞いて、最も適切な応答を選んでください。',
    instructionVi: 'Xem ảnh, nghe phát ngôn rồi chọn cách đáp lại phù hợp nhất.',
    status: ContentStatus.PUBLISHED,
    createdById: null,
    ...stamps,
  },
  {
    id: 'grp-r1-033',
    sectionCode: SectionCode.R1,
    level: Level.J3,
    titleAdmin: '語彙・文法 — 敬語の使い分け',
    instructionJa: '（　）に入る最も適切なものを選んでください。',
    instructionVi: 'Chọn phương án phù hợp nhất điền vào chỗ trống.',
    status: ContentStatus.PUBLISHED,
    createdById: null,
    ...stamps,
  },
  {
    id: 'grp-r2-021',
    sectionCode: SectionCode.R2,
    level: Level.J2,
    titleAdmin: '納期変更のお詫びメール',
    instructionJa: '次のメールを読んで、質問に答えてください。',
    instructionVi: 'Đọc email sau rồi trả lời câu hỏi.',
    status: ContentStatus.PUBLISHED,
    createdById: null,
    ...stamps,
  },
  {
    id: 'grp-lr2-008',
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    titleAdmin: '運営コスト推移',
    instructionJa: '次の会話を聞きながらグラフを見て、質問に答えてください。',
    instructionVi: 'Vừa nghe hội thoại vừa xem biểu đồ, rồi trả lời câu hỏi.',
    status: ContentStatus.PUBLISHED,
    createdById: null,
    ...stamps,
  },
  {
    id: 'grp-lr2-009',
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    titleAdmin: '来週の会議スケジュール調整',
    instructionJa: '次の会話を聞きながらスケジュール表を見て、質問に答えてください。',
    instructionVi: 'Vừa nghe hội thoại vừa xem bảng lịch, rồi trả lời câu hỏi.',
    status: ContentStatus.PUBLISHED,
    createdById: null,
    ...stamps,
  },
];

export const MOCK_GROUP_BY_ID = new Map(MOCK_GROUPS.map((g) => [g.id, g]));

/** Bảng nối group ↔ material. Một tài liệu dùng lại được ở nhiều group. */
export const MOCK_GROUP_MATERIALS: GroupMaterial[] = [
  { groupId: 'grp-lr2-007', materialId: 'mat-lr2-007-audio', order: 1 },
  { groupId: 'grp-lr2-007', materialId: 'mat-lr2-007-table', order: 2 },
  { groupId: 'grp-l2-014', materialId: 'mat-l2-014-audio', order: 1 },
  { groupId: 'grp-l2-014', materialId: 'mat-l2-014-image', order: 2 },
  { groupId: 'grp-r2-021', materialId: 'mat-r2-021-doc', order: 1 },
  { groupId: 'grp-lr2-008', materialId: 'mat-lr2-008-audio', order: 1 },
  { groupId: 'grp-lr2-008', materialId: 'mat-lr2-008-chart', order: 2 },
  { groupId: 'grp-lr2-009', materialId: 'mat-lr2-009-audio', order: 1 },
  { groupId: 'grp-lr2-009', materialId: 'mat-lr2-009-table', order: 2 },
  // grp-r1-033 cố tình KHÔNG có tài liệu — câu 語彙・文法 đứng một mình.
];
