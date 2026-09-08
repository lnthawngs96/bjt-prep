import type { PartDef, SectionDef } from '@/lib/prisma-types';
import { Part, SectionCode } from '@/lib/prisma-types';

/**
 * Cấu trúc đề BJT — cố định, đối chiếu với trang chính thức kanken.or.jp/bjt.
 * Giữ ĐỒNG BỘ với prisma/seed.ts. Khi nối DB thật, bảng PartDef/SectionDef
 * thay chỗ file này và hai nguồn phải khớp từng con số.
 */

export const MOCK_PARTS: PartDef[] = [
  { code: Part.LISTENING, nameJa: '聴解', nameVi: 'Nghe hiểu', questionCount: 25, timeLimitSec: 2700, order: 1 },
  { code: Part.LISTENING_READING, nameJa: '聴読解', nameVi: 'Nghe kèm đọc', questionCount: 25, timeLimitSec: 1800, order: 2 },
  { code: Part.READING, nameJa: '読解', nameVi: 'Đọc hiểu', questionCount: 30, timeLimitSec: 1800, order: 3 },
];

export const MOCK_SECTIONS: SectionDef[] = [
  {
    code: SectionCode.L1, part: Part.LISTENING, nameJa: '場面把握問題', nameVi: 'Nắm bắt tình huống',
    questionCount: 5, order: 1, hasAudio: true, hasMaterial: true,
    descriptionVi: 'Nhìn tranh tình huống, nghe và chọn câu nói phù hợp với bối cảnh.',
  },
  {
    code: SectionCode.L2, part: Part.LISTENING, nameJa: '発言聴解問題', nameVi: 'Nghe hiểu phát ngôn',
    questionCount: 10, order: 2, hasAudio: true, hasMaterial: true,
    descriptionVi: 'Xem ảnh tình huống, nghe một lượt phát ngôn và chọn cách đáp lại đúng. Trọng tâm là kính ngữ.',
  },
  {
    code: SectionCode.L3, part: Part.LISTENING, nameJa: '総合聴解問題', nameVi: 'Nghe hiểu tổng hợp',
    questionCount: 10, order: 3, hasAudio: true, hasMaterial: true,
    descriptionVi: 'Xem tranh minh hoạ, nghe hội thoại dài trong bối cảnh công ty và trả lời nhiều câu.',
  },
  {
    code: SectionCode.LR1, part: Part.LISTENING_READING, nameJa: '状況把握問題', nameVi: 'Nắm bắt bối cảnh',
    questionCount: 5, order: 1, hasAudio: true, hasMaterial: true,
    descriptionVi: 'Xem ảnh hoặc sơ đồ, nghe và xác định tình huống đang diễn ra.',
  },
  {
    code: SectionCode.LR2, part: Part.LISTENING_READING, nameJa: '資料聴読解問題', nameVi: 'Nghe kèm tài liệu',
    questionCount: 10, order: 2, hasAudio: true, hasMaterial: true,
    descriptionVi: 'Vừa nghe vừa đọc bảng số liệu, biểu đồ hoặc văn bản nội bộ.',
  },
  {
    code: SectionCode.LR3, part: Part.LISTENING_READING, nameJa: '総合聴読解問題', nameVi: 'Nghe-đọc tổng hợp',
    questionCount: 10, order: 3, hasAudio: true, hasMaterial: true,
    descriptionVi: 'Kết hợp nhiều nguồn thông tin: audio, tài liệu và biểu đồ.',
  },
  {
    code: SectionCode.R1, part: Part.READING, nameJa: '語彙・文法問題', nameVi: 'Từ vựng và ngữ pháp',
    questionCount: 10, order: 1, hasAudio: false, hasMaterial: false,
    descriptionVi: 'Chọn từ hoặc mẫu ngữ pháp đúng cho ngữ cảnh công sở.',
  },
  {
    code: SectionCode.R2, part: Part.READING, nameJa: '表現読解問題', nameVi: 'Đọc hiểu diễn đạt',
    questionCount: 10, order: 2, hasAudio: false, hasMaterial: true,
    descriptionVi: 'Đọc email, thông báo ngắn và chọn cách diễn đạt phù hợp.',
  },
  {
    code: SectionCode.R3, part: Part.READING, nameJa: '総合読解問題', nameVi: 'Đọc hiểu tổng hợp',
    questionCount: 10, order: 3, hasAudio: false, hasMaterial: true,
    descriptionVi: 'Đọc báo cáo, 稟議書, biểu đồ dài và trả lời nhiều câu.',
  },
];

/** Bậc điểm — J5 0–199 · J4 200–319 · J3 320–419 · J2 420–529 · J1 530–599 · J1+ 600–800 */
export const MOCK_SCORING_BANDS = [
  { level: 'J5', minScore: 0, maxScore: 199, order: 1 },
  { level: 'J4', minScore: 200, maxScore: 319, order: 2 },
  { level: 'J3', minScore: 320, maxScore: 419, order: 3 },
  { level: 'J2', minScore: 420, maxScore: 529, order: 4 },
  { level: 'J1', minScore: 530, maxScore: 599, order: 5 },
  { level: 'J1_PLUS', minScore: 600, maxScore: 800, order: 6 },
] as const;
