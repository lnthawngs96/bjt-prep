import type { ContentSourceKey } from '@/constants/common/contentSources';
import type { GrammarExample, GrammarPoint } from '@/lib/prisma-types';
import { ContentStatus, Level, Register } from '@/lib/prisma-types';
import { stamps } from './_shared';

type G = [
  id: string, slug: string, pattern: string, formation: string, meaningVi: string,
  register: Register, level: Level, usageNoteVi: string, commonMistakeVi: string | null, jlpt: string | null,
  // Nguồn tham khảo — xem chú thích cùng tên trong mock/vocab.ts.
  sourceKey?: ContentSourceKey | null,
];

const R = Register;
const L = Level;

const raw: G[] = [
  ['g-sasete-itadaku', 'sasete-itadaku', '〜させていただく', 'V使役形 + ていただく',
    'Xin phép được làm việc gì đó', R.KENJOUGO, L.J2,
    'Dùng khi xin phép làm một việc với người trên. Hai điều kiện phải cùng đúng: việc đó cần sự cho phép của đối phương, VÀ mình được lợi từ việc đó.',
    'Người Việt hay dùng お〜になる cho hành động của chính mình. お提出になる là tự tôn kính bản thân — lỗi kính ngữ nặng nhất và phổ biến nhất.',
    'N3', 'keigo-shishin-2007'],
  ['g-temorau', 'temorau-shiji', '〜てもらいましょう / 〜てもらう', 'Vて + もらう',
    'Nhờ/để người khác làm cho mình', R.TEINEIGO, L.J3,
    'Khi CẤP TRÊN dùng dạng này với cấp dưới thì đó là CHỈ THỊ, không phải đề nghị — dù hình thức nghe mềm.',
    'Nghe 〜てもらいましょう tưởng là lời mời nên trả lời như đang được hỏi ý. Thực tế việc đã được giao, chỉ còn xác nhận hạn chót.',
    'N4'],
  ['g-degozaimasu', 'degozaimasu', '〜でございます', 'N + でございます',
    'Là (thể lịch sự cao nhất của です)', R.TEINEIGO, L.J3,
    'Dùng khi tự giới thiệu công ty mình hoặc trình bày với khách. Trang trọng hơn です一 bậc.',
    'Dùng でございます cho hành động của khách. Nó là thể lịch sự về BẢN THÂN/sự vật, không phải tôn kính đối phương.',
    'N3', 'keigo-shishin-2007'],
  ['g-oh-suru', 'o-suru', 'お〜する / ご〜する', 'お + V連用形 + する',
    'Khiêm nhường hoá hành động của mình hướng tới người trên', R.KENJOUGO, L.J3,
    'Chỉ dùng khi hành động của mình CÓ tác động tới người nghe: お待ちする, お送りする, ご連絡する.',
    'Dùng cho hành động không liên quan đến đối phương, ví dụ お帰りする để nói mình về — sai, vì việc mình về không tác động tới ai.',
    'N4', 'keigo-shishin-2007'],
  ['g-oh-ni-naru', 'o-ni-naru', 'お〜になる / ご〜になる', 'お + V連用形 + になる',
    'Tôn kính hoá hành động của người trên', R.SONKEIGO, L.J3,
    'Chỉ dùng cho hành động của NGƯỜI KHÁC ở vị trí trên mình.',
    'Ghép nhầm với hành động của chính mình. Đây là cặp đối xứng với お〜する — nhớ theo cặp thì khó lẫn hơn nhớ rời.',
    'N4', 'keigo-shishin-2007'],
  ['g-teoku', 'teoku', '〜ておく', 'Vて + おく',
    'Làm trước để chuẩn bị cho việc sau', R.PLAIN, L.J4,
    '〜ておいてください là chỉ thị chuẩn bị. Hình thức nghe nhẹ nhưng vẫn là mệnh lệnh có hạn chót.',
    'Hiểu thành lời gợi ý nên không làm. Trong công sở Nhật, 〜ておいてください luôn là việc phải xong.',
    'N4'],
  ['g-zu-ni', 'zu-ni', '〜ず / 〜ずに', 'V未然形 + ず',
    'Không làm gì đó mà... (phủ định văn viết)', R.WRITTEN, L.J2,
    'Dạng văn viết của 〜ないで. Rất hay gặp trong báo cáo và email: 人手が足りず、外注しました。',
    'する biến thành せず chứ không phải しず. Đây là ngoại lệ duy nhất nhưng gặp liên tục.',
    'N3'],
  ['g-ni-tsuite', 'ni-tsukimashite', '〜につきましては', 'N + につきましては',
    'Về vấn đề..., liên quan tới...', R.WRITTEN, L.J2,
    'Bản trang trọng của 〜については. Dùng để chuyển chủ đề trong email công việc.',
    null, 'N3'],
  ['g-kaneru', 'kaneru', '〜かねます', 'V連用形 + かねます',
    'Không thể làm (từ chối gián tiếp)', R.KENJOUGO, L.J1,
    'Cách từ chối lịch sự nhất. 「いたしかねます」mềm hơn 「できません」rất nhiều.',
    'Hiểu nhầm thành có thể làm được, vì hình thức không có ない. かねます = KHÔNG thể, かねません = CÓ thể xảy ra (điều xấu). Hai cái ngược nhau.',
    'N2'],
  ['g-you-ni', 'you-ni-onegai', '〜ようお願いいたします', 'V辞書形 + ようお願いいたします',
    'Kính mong quý vị làm...', R.WRITTEN, L.J2,
    'Kết thư khi cần đối phương hành động. Trang trọng hơn 〜てください nhiều bậc.',
    null, 'N2'],
];

export const MOCK_GRAMMAR: GrammarPoint[] = raw.map(
  ([id, slug, pattern, formation, meaningVi, register, level, usageNoteVi, commonMistakeVi, jlptLevel, sourceKey]) => ({
    id,
    slug,
    pattern,
    formation,
    meaningVi,
    register,
    level,
    usageNoteVi,
    commonMistakeVi,
    jlptLevel,
    sourceKey: sourceKey ?? null,
    sourceLocator: null,
    status: ContentStatus.PUBLISHED,
    ...stamps,
  }),
);

export const MOCK_GRAMMAR_BY_ID = new Map(MOCK_GRAMMAR.map((g) => [g.id, g]));
export const MOCK_GRAMMAR_BY_SLUG = new Map(MOCK_GRAMMAR.map((g) => [g.slug, g]));

/* ============================================================
   VÍ DỤ — isNegative đánh dấu ví dụ về cách dùng SAI.
   Học kính ngữ mà không thấy ví dụ sai thì rất khó nhớ.
   ============================================================ */

type Ex = [grammarId: string, ja: string, vi: string, isNegative: boolean, noteVi: string | null, ctx: string | null];

const rawEx: Ex[] = [
  ['g-sasete-itadaku', '部長、資料は明日までに提出させていただいてよろしいでしょうか。',
    'Thưa trưởng phòng, tài liệu để đến mai tôi xin phép được nộp có được không ạ?', false, null, 'report'],
  ['g-sasete-itadaku', '本日は休ませていただきます。', 'Hôm nay tôi xin phép được nghỉ.', false, null, 'report'],
  ['g-sasete-itadaku', '部長、資料はお提出になってよろしいでしょうか。',
    '(SAI) Thưa trưởng phòng, tài liệu tôi xin được nộp có được không ạ?', true,
    'Sai vì お〜になる là tôn kính, dùng cho hành động của người trên. Ở đây người nộp là chính mình nên thành ra tự tôn kính bản thân.', 'report'],

  ['g-temorau', '佐藤さんに来週の会議までに改善案をまとめてもらいましょう。',
    'Để anh Sato tổng hợp phương án cải thiện trước cuộc họp tuần sau.', false,
    'Trưởng phòng nói với cả phòng. Đây là chỉ thị giao cho Sato, không phải đang hỏi ý Sato.', 'meeting'],

  ['g-oh-suru', 'お荷物をお持ちいたします。', 'Để tôi xách hành lý giúp ạ.', false, null, 'phone'],
  ['g-oh-suru', '私は3時にお帰りします。', '(SAI) Tôi sẽ về lúc 3 giờ.', true,
    'Sai vì việc mình về nhà không tác động gì tới người nghe. お〜する chỉ dùng khi hành động của mình hướng tới đối phương. Đúng là 「3時に失礼いたします」.', 'colleague'],

  ['g-oh-ni-naru', '部長はもう資料をお読みになりましたか。', 'Trưởng phòng đã đọc tài liệu chưa ạ?', false, null, 'report'],

  ['g-kaneru', '申し訳ございませんが、その条件ではお受けいたしかねます。',
    'Rất xin lỗi, nhưng với điều kiện đó chúng tôi không thể nhận.', false, null, 'email'],
  ['g-kaneru', '対応が遅れますと、信用を失いかねません。',
    'Nếu xử lý chậm thì có thể mất uy tín.', false,
    'Chú ý: かねません nghĩa NGƯỢC với かねます. かねません = có khả năng xảy ra điều xấu.', 'meeting'],

  ['g-zu-ni', '人手が足りず、開発の一部を外に出しました。',
    'Vì thiếu người nên đã thuê ngoài một phần công việc phát triển.', false, null, 'meeting'],
  ['g-zu-ni', '確認しずに送信してしまいました。', '(SAI) Tôi đã gửi mà không kiểm tra.', true,
    'Sai. する biến thành せず chứ không phải しず. Đúng là 「確認せずに送信してしまいました」.', 'email'],

  ['g-teoku', '外注費の内訳を明日までに整理しておいてください。',
    'Hãy sắp xếp bảng chi tiết chi phí thuê ngoài trước ngày mai.', false, null, 'meeting'],

  ['g-degozaimasu', 'ミドリ工業の中村でございます。', 'Tôi là Nakamura của công ty Midori.', false, null, 'phone'],
  ['g-ni-tsuite', '納期につきましては、改めてご連絡いたします。',
    'Về hạn giao hàng, chúng tôi sẽ liên hệ lại sau.', false, null, 'email'],
  ['g-you-ni', 'ご確認くださいますようお願いいたします。', 'Kính mong quý vị kiểm tra giúp.', false, null, 'email'],
];

export const MOCK_GRAMMAR_EXAMPLES: GrammarExample[] = rawEx.map(
  ([grammarId, sentenceJa, meaningVi, isNegative, noteVi, contextTag], i) => ({
    id: `gex-${grammarId}-${i}`,
    grammarId,
    sentenceJa,
    meaningVi,
    contextTag,
    isNegative,
    noteVi,
    audioId: null,
    order: i,
  }),
);
