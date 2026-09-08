// Prisma 7: client sinh vào app/generated/prisma, không còn nằm trong node_modules.
// Seed chạy bằng tsx ngoài Next nên dùng đường dẫn tương đối, không dùng alias @/.
import { PrismaClient } from '../app/generated/prisma/client';
import { Part, SectionCode, Level } from '../app/generated/prisma/enums';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Thiếu DATABASE_URL — xem docs/setup.md');

// Prisma 7 bắt buộc driver adapter.
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });

const PARTS = [
  { code: Part.LISTENING,         nameJa: '聴解',   nameVi: 'Nghe hiểu',      questionCount: 25, timeLimitSec: 2700, order: 1 },
  { code: Part.LISTENING_READING, nameJa: '聴読解', nameVi: 'Nghe kèm đọc',   questionCount: 25, timeLimitSec: 1800, order: 2 },
  { code: Part.READING,           nameJa: '読解',   nameVi: 'Đọc hiểu',       questionCount: 30, timeLimitSec: 1800, order: 3 },
];

const SECTIONS = [
  { code: SectionCode.L1,  part: Part.LISTENING,         nameJa: '場面把握問題',   nameVi: 'Nắm bắt tình huống',  questionCount: 5,  order: 1, hasAudio: true,  hasMaterial: true,
    descriptionVi: 'Nhìn tranh tình huống, nghe và chọn câu nói phù hợp với bối cảnh.' },
  { code: SectionCode.L2,  part: Part.LISTENING,         nameJa: '発言聴解問題',   nameVi: 'Nghe hiểu phát ngôn', questionCount: 10, order: 2, hasAudio: true,  hasMaterial: true,
    descriptionVi: 'Xem ảnh tình huống, nghe một lượt phát ngôn và chọn cách đáp lại đúng. Trọng tâm là kính ngữ.' },
  { code: SectionCode.L3,  part: Part.LISTENING,         nameJa: '総合聴解問題',   nameVi: 'Nghe hiểu tổng hợp',  questionCount: 10, order: 3, hasAudio: true,  hasMaterial: true,
    descriptionVi: 'Xem tranh minh hoạ, nghe hội thoại dài trong bối cảnh công ty và trả lời nhiều câu.' },

  { code: SectionCode.LR1, part: Part.LISTENING_READING, nameJa: '状況把握問題',   nameVi: 'Nắm bắt bối cảnh',    questionCount: 5,  order: 1, hasAudio: true,  hasMaterial: true,
    descriptionVi: 'Xem ảnh hoặc sơ đồ, nghe và xác định tình huống đang diễn ra.' },
  { code: SectionCode.LR2, part: Part.LISTENING_READING, nameJa: '資料聴読解問題', nameVi: 'Nghe kèm tài liệu',   questionCount: 10, order: 2, hasAudio: true,  hasMaterial: true,
    descriptionVi: 'Vừa nghe vừa đọc bảng số liệu, biểu đồ hoặc văn bản nội bộ.' },
  { code: SectionCode.LR3, part: Part.LISTENING_READING, nameJa: '総合聴読解問題', nameVi: 'Nghe-đọc tổng hợp',   questionCount: 10, order: 3, hasAudio: true,  hasMaterial: true,
    descriptionVi: 'Kết hợp nhiều nguồn thông tin: audio, tài liệu và biểu đồ.' },

  { code: SectionCode.R1,  part: Part.READING,           nameJa: '語彙・文法問題', nameVi: 'Từ vựng và ngữ pháp', questionCount: 10, order: 1, hasAudio: false, hasMaterial: false,
    descriptionVi: 'Chọn từ hoặc mẫu ngữ pháp đúng cho ngữ cảnh công sở.' },
  { code: SectionCode.R2,  part: Part.READING,           nameJa: '表現読解問題',   nameVi: 'Đọc hiểu diễn đạt',   questionCount: 10, order: 2, hasAudio: false, hasMaterial: true,
    descriptionVi: 'Đọc email, thông báo ngắn và chọn cách diễn đạt phù hợp.' },
  { code: SectionCode.R3,  part: Part.READING,           nameJa: '総合読解問題',   nameVi: 'Đọc hiểu tổng hợp',   questionCount: 10, order: 3, hasAudio: false, hasMaterial: true,
    descriptionVi: 'Đọc báo cáo, 稟議書, biểu đồ dài và trả lời nhiều câu.' },
];

const BANDS = [
  { level: Level.J5,      minScore: 0,   maxScore: 199, order: 1 },
  { level: Level.J4,      minScore: 200, maxScore: 319, order: 2 },
  { level: Level.J3,      minScore: 320, maxScore: 419, order: 3 },
  { level: Level.J2,      minScore: 420, maxScore: 529, order: 4 },
  { level: Level.J1,      minScore: 530, maxScore: 599, order: 5 },
  { level: Level.J1_PLUS, minScore: 600, maxScore: 800, order: 6 },
];

// Bộ nhãn khởi đầu. Đây là bảng quyết định app có hữu ích hay không —
// không có nó thì chỉ nói được "bạn yếu phần 聴読解", quá chung để hành động.
const TAGS = [
  // function — chức năng ngôn ngữ
  ['keigo-phone',      'Kính ngữ trong hội thoại điện thoại', '電話の敬語',   'function'],
  ['keigo-facetoface', 'Kính ngữ khi gặp mặt',                '対面の敬語',   'function'],
  ['indirect-order',   'Chỉ thị gián tiếp của cấp trên',      '間接的な指示', 'function'],
  ['polite-refusal',   'Từ chối lịch sự',                     '丁寧な断り',   'function'],
  ['apology-customer', 'Xin lỗi khách hàng',                  '謝罪',         'function'],
  ['request-permission','Đề nghị và xin phép',                '依頼・許可',   'function'],
  ['progress-report',  'Báo cáo tiến độ',                     '進捗報告',     'function'],
  ['confirm-info',     'Xác nhận lại thông tin',              '確認',         'function'],

  // document — loại tài liệu
  ['doc-email-internal','Email nội bộ',      '社内メール',   'document'],
  ['doc-email-client',  'Email khách hàng',  '社外メール',   'document'],
  ['doc-notice',        'Thông báo',         '通知',         'document'],
  ['doc-minutes',       'Biên bản họp',      '議事録',       'document'],
  ['doc-ringi',         'Đơn xin phê duyệt', '稟議書',       'document'],
  ['doc-schedule',      'Lịch trình',        'スケジュール', 'document'],
  ['chart-bar',         'Biểu đồ cột',       '棒グラフ',     'document'],
  ['chart-line',        'Biểu đồ đường',     '折れ線グラフ', 'document'],
  ['table-numbers',     'Bảng số liệu',      '数値表',       'document'],

  // scenario — bối cảnh
  ['sc-meeting',   'Họp',                  '会議',       'scenario'],
  ['sc-phone',     'Điện thoại',           '電話',       'scenario'],
  ['sc-visitor',   'Tiếp khách',           '来客対応',   'scenario'],
  ['sc-meishi',    'Trao đổi danh thiếp',  '名刺交換',   'scenario'],
  ['sc-report-boss','Báo cáo cấp trên',    '上司へ報告', 'scenario'],
  ['sc-colleague', 'Trao đổi với đồng nghiệp', '同僚との会話', 'scenario'],
];

const VOCAB_TOPICS = [
  ['kaigi-houkoku',  'Họp hành và báo cáo',        '会議・報告'],
  ['denwa-taiou',    'Điện thoại và tiếp khách',   '電話・来客対応'],
  ['mail-bunsho',    'Email và văn bản',           'メール・文書'],
  ['eigyou-suuji',   'Kinh doanh và số liệu',      '営業・数字'],
  ['jinji-soshiki',  'Nhân sự và tổ chức',         '人事・組織'],
  ['keigo-hyougen',  'Biểu đạt kính ngữ',          '敬語表現'],
];

async function main() {
  for (const p of PARTS) {
    await db.partDef.upsert({ where: { code: p.code }, create: p, update: p });
  }
  for (const s of SECTIONS) {
    await db.sectionDef.upsert({ where: { code: s.code }, create: s, update: s });
  }
  for (const b of BANDS) {
    await db.scoringBand.upsert({ where: { level: b.level }, create: b, update: b });
  }
  await db.scoringConfig.upsert({
    where: { id: 'active' },
    create: { id: 'active', version: 1, rules: { pointsPerQuestion: 10 } },
    update: {},
  });
  for (const [i, [slug, nameVi, nameJa, category]] of TAGS.entries()) {
    await db.tag.upsert({
      where: { slug },
      create: { slug, nameVi, nameJa, category, order: i },
      update: { nameVi, nameJa, category, order: i },
    });
  }
  for (const [i, [slug, nameVi, nameJa]] of VOCAB_TOPICS.entries()) {
    await db.vocabTopic.upsert({
      where: { slug },
      create: { slug, nameVi, nameJa, order: i },
      update: { nameVi, nameJa, order: i },
    });
  }

  console.log(`Seed xong: ${PARTS.length} phần · ${SECTIONS.length} section · ${BANDS.length} bậc · ${TAGS.length} nhãn · ${VOCAB_TOPICS.length} chủ đề từ vựng`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
