import type { VocabEntry, VocabExample, VocabRelation, VocabTopic } from '@/lib/prisma-types';
import { ContentStatus, Level, PartOfSpeech, Register } from '@/lib/prisma-types';
import { stamps } from './_shared';

/** Chủ đề từ vựng — giữ ĐỒNG BỘ với prisma/seed.ts. */
export const MOCK_VOCAB_TOPICS: VocabTopic[] = [
  { id: 'vt-kaigi-houkoku', slug: 'kaigi-houkoku', nameVi: 'Họp hành và báo cáo', nameJa: '会議・報告', order: 0 },
  { id: 'vt-denwa-taiou', slug: 'denwa-taiou', nameVi: 'Điện thoại và tiếp khách', nameJa: '電話・来客対応', order: 1 },
  { id: 'vt-mail-bunsho', slug: 'mail-bunsho', nameVi: 'Email và văn bản', nameJa: 'メール・文書', order: 2 },
  { id: 'vt-eigyou-suuji', slug: 'eigyou-suuji', nameVi: 'Kinh doanh và số liệu', nameJa: '営業・数字', order: 3 },
  { id: 'vt-jinji-soshiki', slug: 'jinji-soshiki', nameVi: 'Nhân sự và tổ chức', nameJa: '人事・組織', order: 4 },
  { id: 'vt-keigo-hyougen', slug: 'keigo-hyougen', nameVi: 'Biểu đạt kính ngữ', nameJa: '敬語表現', order: 5 },
];

type V = [
  id: string, headword: string, kana: string, pos: PartOfSpeech, meaningVi: string,
  level: Level, topicId: string, register: Register | null, noteVi: string | null,
];

const P = PartOfSpeech;
const R = Register;
const L = Level;

const raw: V[] = [
  // ---- 会議・報告 ----
  ['v-tasseiritsu', '達成率', 'たっせいりつ', P.NOUN, 'Tỉ lệ đạt mục tiêu', L.J3, 'vt-kaigi-houkoku', null,
    'Đây mới là con số được đánh giá trong báo cáo, không phải 実績 (số tuyệt đối). Khu vực bán ít nhưng vượt chỉ tiêu vẫn được ghi nhận.'],
  ['v-kaizenan', '改善案', 'かいぜんあん', P.NOUN, 'Phương án cải thiện', L.J3, 'vt-kaigi-houkoku', null,
    'Không đạt số thì nộp 改善案 bằng văn bản — phản xạ mặc định ở công ty Nhật, không phải giải thích thêm.'],
  ['v-gijiroku', '議事録', 'ぎじろく', P.NOUN, 'Biên bản họp', L.J3, 'vt-kaigi-houkoku', null,
    'Thường do người trẻ nhất trong phòng ghi và gửi trong ngày. Sai tên người phát biểu là lỗi nặng.'],
  ['v-shinchoku', '進捗', 'しんちょく', P.NOUN, 'Tiến độ', L.J2, 'vt-kaigi-houkoku', null, null],
  ['v-uchiawase', '打ち合わせ', 'うちあわせ', P.NOUN, 'Buổi trao đổi, họp bàn', L.J4, 'vt-kaigi-houkoku', null,
    'Nhẹ hơn 会議. Vài người, không cần biên bản chính thức.'],
  ['v-ringisho', '稟議書', 'りんぎしょ', P.NOUN, 'Đơn xin phê duyệt', L.J1, 'vt-kaigi-houkoku', R.WRITTEN,
    'Văn bản chuyền tay qua nhiều cấp để lấy dấu. Đặc thù Nhật, không có khái niệm tương đương gọn trong tiếng Việt.'],
  ['v-dashin', '打診', 'だしん', P.NOUN, 'Thăm dò ý kiến trước', L.J2, 'vt-kaigi-houkoku', null,
    'Nhẹ hơn 予約 hay 決定 nhiều. Lịch chưa được chốt cho tới khi đối phương đồng ý.'],
  ['v-shuujitsu', '終日', 'しゅうじつ', P.NOUN, 'Cả ngày', L.J2, 'vt-kaigi-houkoku', R.WRITTEN,
    'Văn viết, dùng trên lịch và thông báo. Nói miệng thường dùng 一日中.'],

  // ---- 電話・来客対応 ----
  ['v-mairu', '参る', 'まいる', P.VERB_U, 'Đi/đến (khiêm nhường)', L.J3, 'vt-denwa-taiou', R.KENJOUGO,
    'Khiêm nhường của 行く và 来る. Nói về người TRONG công ty mình với người ngoài thì dùng từ này.'],
  ['v-irassharu', 'いらっしゃる', 'いらっしゃる', P.VERB_U, 'Đi/đến/có mặt (tôn kính)', L.J3, 'vt-denwa-taiou', R.SONKEIGO,
    'Tôn kính của 行く・来る・いる. Chỉ dùng cho người ngoài hoặc cấp trên — dùng cho đồng nghiệp mình trước mặt khách là sai.'],
  ['v-haiken', '拝見する', 'はいけんする', P.VERB_IRR, 'Xem (khiêm nhường)', L.J3, 'vt-denwa-taiou', R.KENJOUGO,
    'Khiêm nhường của 見る. Cặp đối là ご覧になる (tôn kính).'],
  ['v-goran', 'ご覧になる', 'ごらんになる', P.VERB_U, 'Xem (tôn kính)', L.J3, 'vt-denwa-taiou', R.SONKEIGO, null],
  ['v-ossharu', 'おっしゃる', 'おっしゃる', P.VERB_U, 'Nói (tôn kính)', L.J3, 'vt-denwa-taiou', R.SONKEIGO, null],
  ['v-mousu', '申す', 'もうす', P.VERB_U, 'Nói (khiêm nhường)', L.J3, 'vt-denwa-taiou', R.KENJOUGO,
    'Tự giới thiệu tên luôn dùng 〜と申します, không dùng 〜と言います trong công việc.'],
  ['v-raikyaku', '来客', 'らいきゃく', P.NOUN, 'Khách đến thăm', L.J4, 'vt-denwa-taiou', null, null],
  ['v-meishi', '名刺', 'めいし', P.NOUN, 'Danh thiếp', L.J5, 'vt-denwa-taiou', null,
    'Nhận bằng hai tay, đọc ngay, đặt lên bàn theo thứ tự chỗ ngồi. Nhét túi quần là thất lễ.'],
  ['v-osoreiru', '恐れ入ります', 'おそれいります', P.EXPRESSION, 'Xin phép/xin lỗi làm phiền', L.J3, 'vt-denwa-taiou', R.KENJOUGO,
    'Mở đầu khi nhờ vả hoặc cắt ngang. Mềm hơn すみません và trang trọng hơn nhiều.'],

  // ---- メール・文書 ----
  ['v-nouki', '納期', 'のうき', P.NOUN, 'Hạn giao hàng', L.J3, 'vt-mail-bunsho', null, null],
  ['v-daitaian', '代替案', 'だいたいあん', P.NOUN, 'Phương án thay thế', L.J2, 'vt-mail-bunsho', null,
    'Email xin lỗi trong kinh doanh Nhật gần như luôn kết bằng một 代替案. Chỉ xin lỗi mà không đưa lối ra bị coi là đẩy việc sang đối phương.'],
  ['v-osewa', 'お世話になっております', 'おせわになっております', P.EXPRESSION, 'Cảm ơn vì đã luôn giúp đỡ', L.J4, 'vt-mail-bunsho', R.TEINEIGO,
    'Câu mở đầu mặc định của mọi email công việc. Thiếu nó thì email nghe cộc lốc.'],
  ['v-nanitozo', '何卒', 'なにとぞ', P.ADVERB, 'Kính mong, rất mong', L.J2, 'vt-mail-bunsho', R.WRITTEN,
    'Chỉ dùng văn viết. Đi kèm よろしくお願い申し上げます ở cuối thư.'],
  ['v-tsukimashite', 'つきましては', 'つきましては', P.EXPRESSION, 'Do đó, vì vậy', L.J2, 'vt-mail-bunsho', R.WRITTEN,
    'Nối từ phần trình bày tình hình sang phần đề nghị. Thấy từ này là biết câu sau mới là mục đích của thư.'],
  ['v-genjiten', '現時点', 'げんじてん', P.NOUN, 'Tại thời điểm hiện tại', L.J2, 'vt-mail-bunsho', R.WRITTEN,
    'Tín hiệu rào trước: thông tin sau đó vẫn có thể đổi. Người Nhật hiếm khi cam kết tuyệt đối khi tình hình chưa ổn.'],
  ['v-tenpu', '添付', 'てんぷ', P.NOUN, 'Đính kèm', L.J4, 'vt-mail-bunsho', null, null],

  // ---- 営業・数字 ----
  ['v-oguchi', '大口', 'おおぐち', P.NOUN, 'Đơn hàng lớn, khách lớn', L.J2, 'vt-eigyou-suuji', null,
    'Đối lập với 小口. 大口の取引先 là khách hàng chủ lực, mất một khách như vậy đủ làm hụt cả quý.'],
  ['v-jisseki', '実績', 'じっせき', P.NOUN, 'Kết quả thực tế', L.J3, 'vt-eigyou-suuji', null, null],
  ['v-uchiwake', '内訳', 'うちわけ', P.NOUN, 'Chi tiết cấu thành', L.J2, 'vt-eigyou-suuji', null,
    'Không phải tổng số mà là bảng phân rã. Bị hỏi 内訳 nghĩa là phải tách nhỏ con số ra.'],
  ['v-gaichuu', '外注', 'がいちゅう', P.NOUN, 'Thuê ngoài', L.J2, 'vt-eigyou-suuji', null,
    'Trong họp thường nói tắt là 外に出す — nghĩa là thuê ngoài, không phải "đưa ra ngoài" theo nghĩa đen.'],
  ['v-shiboru', '絞る', 'しぼる', P.VERB_U, 'Siết lại, thu hẹp', L.J2, 'vt-eigyou-suuji', null,
    'Siết lại chứ KHÔNG phải bỏ hẳn. Nhầm mức độ ở đây là lỗi hay gặp từ J2 trở lên.'],
  ['v-mikomu', '見込む', 'みこむ', P.VERB_U, 'Dự kiến, ước tính', L.J2, 'vt-eigyou-suuji', null, null],

  // ---- 人事・組織 ----
  ['v-hitode', '人手', 'ひとで', P.NOUN, 'Nhân lực, người làm', L.J3, 'vt-jinji-soshiki', null,
    '人手が足りない là cách nói thường ngày cho tình trạng thiếu người, khác 人材 (nhân tài) mang nghĩa chất lượng.'],
  ['v-saiyou', '採用', 'さいよう', P.NOUN, 'Tuyển dụng', L.J4, 'vt-jinji-soshiki', null, null],
];

export const MOCK_VOCAB: VocabEntry[] = raw.map(
  ([id, headword, readingKana, pos, meaningVi, level, topicId, register, noteVi]) => ({
    id,
    headword,
    readingKana,
    accent: null,
    pos,
    meaningVi,
    meaningEn: null,
    level,
    topicId,
    register,
    audioId: null,
    noteVi,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  }),
);

export const MOCK_VOCAB_BY_ID = new Map(MOCK_VOCAB.map((v) => [v.id, v]));

/* ============================================================
   VÍ DỤ
   ============================================================ */

type E = [vocabId: string, ja: string, vi: string, contextTag: string | null];

const rawEx: E[] = [
  ['v-tasseiritsu', '東北は達成率122%で、全地域で最も高い結果となりました。', 'Tohoku đạt 122%, cao nhất trong tất cả khu vực.', 'meeting'],
  ['v-kaizenan', '来週の会議までに改善案をまとめておいてください。', 'Hãy tổng hợp phương án cải thiện trước cuộc họp tuần sau.', 'meeting'],
  ['v-mairu', '山田はただいま参りますので、少々お待ちくださいませ。', 'Anh Yamada sẽ ra ngay, xin quý khách chờ một chút.', 'phone'],
  ['v-irassharu', '田中様はもうこちらにいらっしゃいましたか。', 'Ngài Tanaka đã đến đây chưa ạ?', 'phone'],
  ['v-mousu', '丸紅商事の小林と申します。', 'Tôi là Kobayashi từ công ty thương mại Marubeni.', 'phone'],
  ['v-daitaian', '代替案として、一部を先行してお届けすることも可能でございます。', 'Xin đề xuất phương án thay thế: chúng tôi có thể giao trước một phần.', 'email'],
  ['v-genjiten', '現時点では10月12日の納品を見込んでおります。', 'Tại thời điểm hiện tại, chúng tôi dự kiến giao hàng ngày 12 tháng 10.', 'email'],
  ['v-oguchi', '大口の取引先が一社、発注を来期に回しました。', 'Một khách hàng lớn đã dời đơn hàng sang kỳ sau.', 'meeting'],
  ['v-uchiwake', '外注費の内訳を明日までに整理しておいてください。', 'Hãy sắp xếp bảng chi tiết chi phí thuê ngoài trước ngày mai.', 'meeting'],
  ['v-shiboru', '来期は広告を絞って、その分を採用に回す方針です。', 'Kỳ tới chủ trương siết quảng cáo và chuyển phần đó sang tuyển dụng.', 'meeting'],
  ['v-dashin', '木曜の14時から16時で先方に打診いたします。', 'Tôi sẽ thăm dò ý đối tác về khung 14–16 giờ thứ Năm.', 'meeting'],
  ['v-ringisho', 'この金額ですと、稟議書での承認が必要になります。', 'Với số tiền này thì cần phê duyệt bằng đơn ringisho.', 'report'],
];

export const MOCK_VOCAB_EXAMPLES: VocabExample[] = rawEx.map(([vocabId, sentenceJa, meaningVi, contextTag], i) => ({
  id: `vex-${vocabId}-${i}`,
  vocabId,
  sentenceJa,
  sentenceKana: null,
  meaningVi,
  contextTag,
  audioId: null,
  order: 0,
}));

/* ============================================================
   QUAN HỆ 尊敬語 / 謙譲語 — chỗ người học BJT sai nhiều nhất
   ============================================================ */

export const MOCK_VOCAB_RELATIONS: VocabRelation[] = [
  { vocabId: 'v-irassharu', relatedId: 'v-mairu', relation: 'kenjougo' },
  { vocabId: 'v-mairu', relatedId: 'v-irassharu', relation: 'sonkeigo' },
  { vocabId: 'v-goran', relatedId: 'v-haiken', relation: 'kenjougo' },
  { vocabId: 'v-haiken', relatedId: 'v-goran', relation: 'sonkeigo' },
  { vocabId: 'v-ossharu', relatedId: 'v-mousu', relation: 'kenjougo' },
  { vocabId: 'v-mousu', relatedId: 'v-ossharu', relation: 'sonkeigo' },
  { vocabId: 'v-jisseki', relatedId: 'v-tasseiritsu', relation: 'synonym' },
];
