import type { Question, QuestionGrammar, QuestionOption, QuestionTag, QuestionVocab } from '@/lib/prisma-types';
import { ContentStatus, Level, SectionCode } from '@/lib/prisma-types';
import { stamps } from './_shared';

/**
 * Mỗi câu phải có đủ explanationVi · businessNoteVi · distractorNote từng phương án.
 * Với người học chưa đi làm, biết VÌ SAO ba phương án kia sai còn quan trọng hơn
 * biết phương án nào đúng — đó là chỗ màn hình kết quả tạo ra giá trị thật.
 */

type Q = Omit<Question, 'createdAt' | 'updatedAt'>;

const base = {
  stemFurigana: null,
  correctRate: null,
  discrimination: null,
  attemptCount: 0,
  status: ContentStatus.PUBLISHED,
  createdById: null,
  reviewedById: null,
} satisfies Partial<Q>;

const q: Q[] = [
  /* ---- grp-lr2-007 · 資料聴読解 · 3 câu DÙNG CHUNG một audio và một bảng ---- */
  {
    ...base,
    id: 'q-lr2-007-1',
    groupId: 'grp-lr2-007',
    order: 1,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '達成率が最も高かった地域はどこですか。',
    stemVi: 'Khu vực nào có tỉ lệ đạt mục tiêu cao nhất?',
    audioStartMs: 5200,
    audioEndMs: 18400,
    explanationVi:
      'Đọc cột 達成率 trong bảng: 東北 122% cao hơn 関東 111% và 九州 102%. Bẫy nằm ở chỗ hội thoại khen 田中 (関東) trước và nhắc tên anh ta nhiều nhất, nên người nghe dễ chọn theo ấn tượng âm thanh thay vì đọc bảng. Với dạng 資料聴読解, con số trong tài liệu luôn thắng cảm giác từ audio.',
    businessNoteVi:
      'Trong báo cáo Nhật, 達成率 (tỉ lệ đạt) mới là thước đo được đánh giá, không phải 実績 (số tuyệt đối). 東北 bán ít nhất về giá trị nhưng vượt chỉ tiêu nhiều nhất — và đó là điều được ghi nhận.',
  },
  {
    ...base,
    id: 'q-lr2-007-2',
    groupId: 'grp-lr2-007',
    order: 2,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '佐藤さんが説明した、目標に届かなかった理由は何ですか。',
    stemVi: 'Anh Sato giải thích lý do không đạt mục tiêu là gì?',
    audioStartMs: 25600,
    audioEndMs: 37000,
    explanationVi:
      'Sato nói 「大口の取引先が一社、発注を来期に回した」— một khách hàng lớn dời đơn hàng sang quý sau. Chú ý 回した ở đây nghĩa là "chuyển sang", không phải "huỷ". Đơn hàng vẫn còn, chỉ là rơi vào kỳ khác.',
    businessNoteVi:
      'Khi bị cấp trên hỏi 原因の分析はできていますか, câu trả lời được mong đợi là một nguyên nhân cụ thể và kiểm chứng được, không phải lời xin lỗi. Sato mở đầu bằng 申し訳ございません rồi mới đưa dữ kiện — đúng trình tự công sở Nhật.',
  },
  {
    ...base,
    id: 'q-lr2-007-3',
    groupId: 'grp-lr2-007',
    order: 3,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '課長が指示した内容として、最も適切なものはどれですか。',
    stemVi: 'Nội dung mà trưởng phòng chỉ thị, phương án nào phù hợp nhất?',
    audioStartMs: 37000,
    audioEndMs: 59000,
    explanationVi:
      'Trưởng phòng nói 「佐藤さんに来週の会議までに改善案をまとめてもらいましょう」. Khi cấp trên dùng 〜てもらいましょう / 〜させる với cấp dưới thì đó là CHỈ THỊ, không phải đề nghị — dù hình thức ngữ pháp nghe mềm. Mốc 来週の会議までに xác định hạn chót; ba phương án còn lại không có mốc thời gian nào được nhắc trong hội thoại.',
    businessNoteVi:
      '達成率 dưới 100% thường kéo theo yêu cầu 改善案 bằng văn bản trước cuộc họp tuần sau. Đây là phản xạ mặc định ở công ty Nhật: không đạt số thì nộp phương án cải thiện, không phải giải thích thêm.',
  },

  /* ---- grp-l2-014 · 発言聴解 · có ẢNH ---- */
  {
    ...base,
    id: 'q-l2-014-1',
    groupId: 'grp-l2-014',
    order: 1,
    sectionCode: SectionCode.L2,
    level: Level.J3,
    stemJa: '受付として、最も適切な応答はどれですか。',
    stemVi: 'Với vai lễ tân, cách đáp lại nào phù hợp nhất?',
    audioStartMs: 0,
    audioEndMs: 11000,
    explanationVi:
      'Khách là người ngoài công ty, còn 山田 là người TRONG công ty mình. Nói về người nhà mình với người ngoài thì phải hạ mình: gọi 「山田」không kèm 様/さん, và dùng 謙譲語 「参ります」. 「お待ちしております」cũng là 謙譲語, đúng vai.',
    businessNoteVi:
      'Đây là chỗ người học sai nhiều nhất: 内 và 外. Trong công ty gọi 山田さん hay 山田課長, nhưng trước mặt khách thì gọi trống 山田. Gọi 山田様 với khách nghe như đang tôn kính đồng nghiệp mình trước mặt khách — vừa sai vừa mất lịch sự.',
  },

  /* ---- grp-r1-033 · 語彙・文法 · câu đứng một mình, group 1 câu 0 tài liệu ---- */
  {
    ...base,
    id: 'q-r1-033-1',
    groupId: 'grp-r1-033',
    order: 1,
    sectionCode: SectionCode.R1,
    level: Level.J3,
    stemJa: '部長、資料は明日までに（　）よろしいでしょうか。',
    stemVi: 'Thưa trưởng phòng, tài liệu để đến mai tôi ( ) có được không ạ?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Người nói xin phép LÀM một việc với người trên, nên dùng 謙譲語 「提出させていただいて」— thể sai khiến + ていただく, nghĩa là "xin được cho phép tôi nộp". Đây là mẫu xin phép chuẩn trong công sở.',
    businessNoteVi:
      '〜させていただく bị lạm dụng đến mức có cả tranh luận trong tiếng Nhật hiện đại. Dùng đúng khi có hai điều kiện: việc mình làm cần sự cho phép của đối phương, VÀ mình được lợi từ việc đó. Xin gia hạn nộp tài liệu thoả cả hai.',
  },

  /* ---- grp-r2-021 · 表現読解 · 2 câu dùng chung email ---- */
  {
    ...base,
    id: 'q-r2-021-1',
    groupId: 'grp-r2-021',
    order: 1,
    sectionCode: SectionCode.R2,
    level: Level.J2,
    stemJa: 'このメールで中村さんが最も伝えたいことは何ですか。',
    stemVi: 'Điều anh Nakamura muốn truyền đạt nhất trong email này là gì?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Email có ba tầng: báo trễ hàng (sự việc), xin lỗi (thái độ), rồi đề xuất giao trước một phần (giải pháp). Trọng tâm là tầng cuối — 「代替案として一部を先行してお届けすることも可能でございます」kèm câu hỏi 「ご都合はいかがでしょうか」đang chờ khách trả lời.',
    businessNoteVi:
      'Email xin lỗi trong kinh doanh Nhật gần như luôn kết bằng một phương án thay thế. Chỉ xin lỗi mà không đưa lối ra bị coi là đẩy việc sang cho đối phương.',
  },
  {
    ...base,
    id: 'q-r2-021-2',
    groupId: 'grp-r2-021',
    order: 2,
    sectionCode: SectionCode.R2,
    level: Level.J2,
    stemJa: '新しい納品予定日はいつですか。',
    stemVi: 'Ngày giao hàng dự kiến mới là ngày nào?',
    audioStartMs: null,
    audioEndMs: null,
    explanationVi:
      'Email viết 「現時点では10月12日の納品を見込んでおります」. 10月5日 là ngày đã hứa ban đầu và đã không giữ được — đọc lướt rất dễ bắt nhầm con số xuất hiện trước.',
    businessNoteVi:
      '現時点では ("tại thời điểm hiện tại") là một tín hiệu cần đọc ra: ngày này vẫn có thể đổi tiếp. Người Nhật hiếm khi cam kết tuyệt đối khi tình hình chưa ổn định, và cụm này là cách rào trước.',
  },

  /* ---- grp-lr2-008 · biểu đồ cột · 4 câu ---- */
  {
    ...base,
    id: 'q-lr2-008-1',
    groupId: 'grp-lr2-008',
    order: 1,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '中村さんが最初に指摘した項目はどれですか。',
    stemVi: 'Mục nào là mục anh Nakamura chỉ ra đầu tiên?',
    audioStartMs: 4600,
    audioEndMs: 10200,
    explanationVi:
      'Nakamura nói 「外注費が第2四半期から急に伸びていますね」. Nhìn biểu đồ: 外注費 đi từ 640 lên 720 rồi 980 và 1140 — tăng liên tục. 人件費 gần như đi ngang nên không phải điểm đáng chú ý.',
    businessNoteVi:
      'Khi cấp trên hỏi 「気になる点はありますか」, câu trả lời được mong đợi là chỉ vào MỘT điểm bất thường cụ thể kèm dữ liệu, không phải nhận xét chung chung. Nakamura nêu đúng khoản mục và đúng mốc thời gian.',
  },
  {
    ...base,
    id: 'q-lr2-008-2',
    groupId: 'grp-lr2-008',
    order: 2,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '外注費が増えた理由は何ですか。',
    stemVi: 'Lý do chi phí thuê ngoài tăng là gì?',
    audioStartMs: 10200,
    audioEndMs: 17400,
    explanationVi:
      'Trưởng phòng nói 「人手が足りず、開発の一部を外に出したためです」— thiếu người nên đẩy một phần công việc phát triển ra ngoài. 〜ず là dạng phủ định văn viết của 〜ないで.',
    businessNoteVi:
      '外に出す trong bối cảnh công ty nghĩa là thuê ngoài (外注), không phải "đưa ra ngoài" theo nghĩa đen. Đây là cách nói tắt rất thường gặp trong họp.',
  },
  {
    ...base,
    id: 'q-lr2-008-3',
    groupId: 'grp-lr2-008',
    order: 3,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '来期の広告費について、部長はどう説明していますか。',
    stemVi: 'Về chi phí quảng cáo kỳ tới, trưởng phòng giải thích thế nào?',
    audioStartMs: 17400,
    audioEndMs: 31200,
    explanationVi:
      'Trưởng phòng nói 「広告を絞って、その分を採用に回す方針です」— siết quảng cáo và chuyển phần đó sang tuyển dụng. Chú ý 絞る (siết lại) chứ không phải bỏ hẳn, và その分 chỉ đúng phần tiền cắt được.',
    businessNoteVi:
      'Việc cắt quảng cáo để dồn vào tuyển dụng nối thẳng với câu trước: thiếu người nên phải thuê ngoài, thuê ngoài đắt, nên giải pháp gốc là tuyển thêm. Dạng 総合 luôn thưởng cho người ghép được mạch nhân quả giữa các phát ngôn.',
  },
  {
    ...base,
    id: 'q-lr2-008-4',
    groupId: 'grp-lr2-008',
    order: 4,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '中村さんが明日までにすることは何ですか。',
    stemVi: 'Việc anh Nakamura phải làm trước ngày mai là gì?',
    audioStartMs: 31200,
    audioEndMs: 38600,
    explanationVi:
      'Trưởng phòng chỉ thị 「外注費の内訳を明日までに整理しておいてください」— sắp xếp bảng chi tiết của khoản thuê ngoài. 内訳 là "chi tiết cấu thành", không phải tổng số.',
    businessNoteVi:
      '〜ておいてください là chỉ thị chuẩn bị trước cho một việc sẽ dùng đến sau. Hình thức nghe nhẹ nhưng vẫn là mệnh lệnh có hạn chót — không phải lời gợi ý.',
  },

  /* ---- grp-lr2-009 · bảng lịch họp · 3 câu ---- */
  {
    ...base,
    id: 'q-lr2-009-1',
    groupId: 'grp-lr2-009',
    order: 1,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '鈴木さんが必要としている会議室の時間はどれくらいですか。',
    stemVi: 'Anh Suzuki cần phòng họp trong khoảng bao lâu?',
    audioStartMs: 12800,
    audioEndMs: 18000,
    explanationVi: 'Suzuki nói 「2時間ほどです」. ほど ở đây là "khoảng", không phải mốc chính xác.',
    businessNoteVi:
      'Khi đặt phòng họp, người Nhật thường nói kèm 午後がありがたいです — nêu mong muốn nhưng để ngỏ, tránh áp đặt lịch lên người trên.',
  },
  {
    ...base,
    id: 'q-lr2-009-2',
    groupId: 'grp-lr2-009',
    order: 2,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '水曜日の午後が使えない理由は何ですか。',
    stemVi: 'Lý do chiều thứ Tư không dùng được là gì?',
    audioStartMs: 18000,
    audioEndMs: 26400,
    explanationVi:
      'Phòng họp thứ Tư chiều thì TRỐNG — bảng cho thấy 四半期予算会議 chỉ chiếm 09:30〜12:00. Vấn đề là trưởng phòng bận: 「その日は私が予算会議で終日出られません」. Đây là bẫy chính của câu: phải ghép bảng với audio, chỉ đọc bảng sẽ kết luận ngược.',
    businessNoteVi:
      '終日 nghĩa là cả ngày, dù cuộc họp ghi trên lịch chỉ kéo dài buổi sáng. Họp ngân sách quý thường có phần chuẩn bị và trao đổi kéo dài sau đó, nên người tham dự khoá cả ngày.',
  },
  {
    ...base,
    id: 'q-lr2-009-3',
    groupId: 'grp-lr2-009',
    order: 3,
    sectionCode: SectionCode.LR2,
    level: Level.J2,
    stemJa: '最終的に、鈴木さんはいつで先方に打診しますか。',
    stemVi: 'Cuối cùng anh Suzuki sẽ đề xuất với đối tác vào lúc nào?',
    audioStartMs: 26400,
    audioEndMs: 46200,
    explanationVi:
      'Suzuki chốt 「木曜の14時から16時で先方に打診いたします」. Suy ra từ ba ràng buộc: cần 2 tiếng, buổi chiều, và thứ Năm phải xong trước 16 giờ vì có phỏng vấn.',
    businessNoteVi:
      '打診する là "thăm dò ý kiến trước", nhẹ hơn 予約する hay 決める. Với đối tác, lịch chưa được chốt cho đến khi họ đồng ý — dùng sai động từ ở đây là hiểu sai mức độ cam kết.',
  },
];

export const MOCK_QUESTIONS: Question[] = q.map((x) => ({ ...x, ...stamps }));
export const MOCK_QUESTION_BY_ID = new Map(MOCK_QUESTIONS.map((x) => [x.id, x]));

/* ============================================================
   PHƯƠNG ÁN — isCorrect và distractorNote KHÔNG BAO GIỜ xuống client trước khi nộp
   ============================================================ */

type Opt = [order: number, textJa: string, isCorrect: boolean, distractorNote: string | null];

const OPTIONS: Record<string, Opt[]> = {
  'q-lr2-007-1': [
    [1, '関東', false, 'Sai. 関東 đạt 111%, cao nhưng không phải cao nhất. Đây là bẫy chính: hội thoại khen 田中 trước tiên nên tai nghe nhớ khu vực này.'],
    [2, '関西', false, 'Sai. 関西 chỉ đạt 82%, là khu vực duy nhất không đạt mục tiêu.'],
    [3, '九州', false, 'Sai. 九州 đạt 102%, thấp nhất trong ba khu vực có vượt chỉ tiêu.'],
    [4, '東北', true, null],
  ],
  'q-lr2-007-2': [
    [1, '担当者が急に退職したから。', false, 'Sai. Hội thoại không nhắc gì đến chuyện nhân sự nghỉ việc.'],
    [2, '大口の取引先が発注を来期に回したから。', true, null],
    [3, '製品の品質に問題があったから。', false, 'Sai. Vấn đề chất lượng xuất hiện ở tài liệu khác, không có trong hội thoại này.'],
    [4, '目標の設定が高すぎたから。', false, 'Sai. Sato không đổ lỗi cho mục tiêu — nếu nói vậy trong họp thì đó là hành vi bị đánh giá xấu ở công ty Nhật.'],
  ],
  'q-lr2-007-3': [
    [1, '田中さんに関西の支援に入ってもらう。', false, 'Sai. Trưởng phòng có khen 田中 nhưng không hề giao việc hỗ trợ 関西.'],
    [2, '佐藤さんに来週までに改善案を出させる。', true, null],
    [3, '九州の目標を来期から引き上げる。', false, 'Sai. 九州 đạt 102% và được nhắc thoáng qua, không có chỉ thị nào về mục tiêu kỳ sau.'],
    [4, '東北の実績を全社に共有する。', false, 'Gần đúng nhưng không phải chỉ thị chính. Trưởng phòng có nói muốn chia sẻ số liệu 東北, nhưng câu hỏi hỏi 指示した内容 — việc giao cho người khác làm kèm hạn chót, tức là phần của 佐藤.'],
  ],
  'q-l2-014-1': [
    [1, '山田様は少々お待ちください。', false, 'Sai hai chỗ: gọi đồng nghiệp là 山田様 trước mặt khách, và 「お待ちください」lại đang bảo KHÁCH chờ trong khi chủ ngữ là 山田様 — câu không khớp ngữ pháp lẫn vai vế.'],
    [2, '山田はただいま参りますので、少々お待ちくださいませ。', true, null],
    [3, '山田さんが今いらっしゃいますので、お待ちになってください。', false, 'Sai. いらっしゃる là 尊敬語 — dùng để tôn kính người của công ty mình trước mặt khách. Đúng ra phải hạ mình bằng 参る.'],
    [4, '山田課長をお呼びしてまいります。', false, 'Sai. Gắn chức danh 課長 vào tên khi nói với người ngoài cũng là tôn kính người nhà. Với khách chỉ gọi trống 山田.'],
  ],
  'q-r1-033-1': [
    [1, 'お提出になって', false, 'Sai. お〜になる là 尊敬語, dùng cho hành động của NGƯỜI TRÊN. Ở đây người nộp là chính mình nên thành ra tự tôn kính bản thân — lỗi kính ngữ nặng nhất và cũng phổ biến nhất.'],
    [2, '提出させていただいて', true, null],
    [3, '提出してくださって', false, 'Sai. 〜てくださる là người khác làm cho mình. Câu này thành ra nhờ trưởng phòng đi nộp tài liệu.'],
    [4, '提出いたしまして', false, 'Ngữ pháp không sai nhưng không phải xin phép, mà là thông báo mình sẽ nộp. Câu có 「よろしいでしょうか」nên phải là xin phép.'],
  ],
  'q-lr2-008-1': [
    [1, '人件費', false, 'Sai. 人件費 gần như đi ngang (1820 → 1850 → 1910 → 1880), không phải điểm bất thường. Đây là cột cao nhất nên mắt dễ bắt trước.'],
    [2, '外注費', true, null],
    [3, '広告費', false, 'Sai. 広告費 có thay đổi nhưng là giảm, và người nêu ra là chính Nakamura ở lượt SAU, không phải điểm anh ta chỉ ra đầu tiên.'],
    [4, '設備費', false, 'Sai. Biểu đồ không có khoản mục này.'],
  ],
  'q-lr2-008-2': [
    [1, '原材料の価格が上がったから。', false, 'Sai. Hội thoại không nhắc đến giá nguyên vật liệu.'],
    [2, '人手が足りず、開発の一部を外注したから。', true, null],
    [3, '広告の量を増やしたから。', false, 'Sai. Quảng cáo giảm chứ không tăng, và cũng không liên quan đến chi phí thuê ngoài.'],
    [4, '新しい設備を導入したから。', false, 'Sai. Không có chỗ nào nói về đầu tư thiết bị.'],
  ],
  'q-lr2-008-3': [
    [1, '広告費を今のまま維持する。', false, 'Sai. Trưởng phòng nói rõ 絞る — siết lại, tức là giảm tiếp.'],
    [2, '広告を減らし、その分を採用に回す。', true, null],
    [3, '広告費を大幅に増やす。', false, 'Sai, ngược hoàn toàn với xu hướng trên biểu đồ và với lời trưởng phòng.'],
    [4, '広告を完全にやめる。', false, 'Quá mạnh. 絞る là siết lại chứ không phải bỏ hẳn — đây là bẫy về mức độ, rất hay gặp ở J2 trở lên.'],
  ],
  'q-lr2-008-4': [
    [1, '外注先に見積もりを依頼する。', false, 'Sai. Không có chỉ thị nào về việc xin báo giá.'],
    [2, '外注費の内訳を整理する。', true, null],
    [3, '採用計画をまとめる。', false, 'Sai. Tuyển dụng là phương hướng của kỳ tới, không phải việc giao cho Nakamura làm trước ngày mai.'],
    [4, '広告の効果を分析する。', false, 'Sai. Nakamura có hỏi về quảng cáo nhưng không được giao phân tích.'],
  ],
  'q-lr2-009-1': [
    [1, '1時間', false, 'Sai. Suzuki nói 2時間ほど.'],
    [2, '1時間半', false, 'Sai. 1時間半 là độ dài của 定例部会 trên bảng, không phải nhu cầu của Suzuki.'],
    [3, '2時間', true, null],
    [4, '3時間', false, 'Sai. Không có con số này trong hội thoại.'],
  ],
  'q-lr2-009-2': [
    [1, '第2会議室が終日埋まっているから。', false, 'Sai. Bảng cho thấy thứ Tư chỉ có họp ngân sách 09:30〜12:00, buổi chiều phòng còn trống. Đây là bẫy chính — chỉ đọc bảng mà không nghe audio sẽ chọn phương án này.'],
    [2, '課長が予算会議で終日出られないから。', true, null],
    [3, '取引先の都合が悪いから。', false, 'Sai. Hội thoại chưa hề liên lạc với đối tác — mới đang bàn nội bộ.'],
    [4, '人事部が会議室を予約しているから。', false, 'Sai. 人事部 dùng phòng vào thứ Năm chứ không phải thứ Tư.'],
  ],
  'q-lr2-009-3': [
    [1, '水曜の14時から16時', false, 'Sai. Thứ Tư phòng trống nhưng trưởng phòng bận cả ngày.'],
    [2, '木曜の14時から16時', true, null],
    [3, '木曜の16時から18時', false, 'Sai. 16 giờ thứ Năm đã có phỏng vấn tuyển dụng — trưởng phòng nói rõ それより前なら大丈夫.'],
    [4, '金曜の13時から15時', false, 'Sai. Thứ Sáu 13:00〜14:30 đã có báo cáo thăm khách hàng, và cũng không đủ 2 tiếng liền.'],
  ],
  'q-r2-021-1': [
    [1, '注文をキャンセルしたいということ。', false, 'Sai. Không có chỗ nào nói huỷ đơn. Ngược lại, người viết đang tìm cách giao được hàng.'],
    [2, '納期が遅れるので、一部を先に届ける案を提案していること。', true, null],
    [3, '製品の価格を値上げしたいということ。', false, 'Sai. Email không nhắc gì đến giá.'],
    [4, '取引を今後停止したいということ。', false, 'Sai. Kết thư bằng 「何卒よろしくお願い申し上げます」— là mong tiếp tục hợp tác, không phải chấm dứt.'],
  ],
  'q-r2-021-2': [
    [1, '10月5日', false, 'Sai. Đây là ngày đã hứa ban đầu và chính là ngày KHÔNG giữ được. Con số này xuất hiện trước trong thư nên rất dễ bắt nhầm khi đọc lướt.'],
    [2, '10月12日', true, null],
    [3, '10月20日', false, 'Sai. Con số này không có trong thư.'],
    [4, 'まだ決まっていない。', false, 'Sai. Thư có nêu ngày dự kiến cụ thể. 現時点では chỉ báo hiệu ngày có thể đổi, chứ không phải chưa quyết định.'],
  ],
};

export const MOCK_OPTIONS: QuestionOption[] = Object.entries(OPTIONS).flatMap(([questionId, opts]) =>
  opts.map(([order, textJa, isCorrect, distractorNote]) => ({
    id: `${questionId}-o${order}`,
    questionId,
    order,
    textJa,
    isCorrect,
    distractorNote,
  })),
);

/* ============================================================
   LIÊN KẾT NGƯỢC — sai câu nào thì biết ôn gì
   ============================================================ */

export const MOCK_QUESTION_TAGS: QuestionTag[] = [
  { questionId: 'q-lr2-007-1', tagId: 'tag-table-numbers' },
  { questionId: 'q-lr2-007-2', tagId: 'tag-progress-report' },
  { questionId: 'q-lr2-007-2', tagId: 'tag-sc-meeting' },
  { questionId: 'q-lr2-007-3', tagId: 'tag-indirect-order' },
  { questionId: 'q-lr2-007-3', tagId: 'tag-sc-report-boss' },
  { questionId: 'q-lr2-007-3', tagId: 'tag-table-numbers' },
  { questionId: 'q-l2-014-1', tagId: 'tag-keigo-facetoface' },
  { questionId: 'q-l2-014-1', tagId: 'tag-sc-visitor' },
  { questionId: 'q-r1-033-1', tagId: 'tag-request-permission' },
  { questionId: 'q-r2-021-1', tagId: 'tag-doc-email-client' },
  { questionId: 'q-r2-021-1', tagId: 'tag-apology-customer' },
  { questionId: 'q-r2-021-2', tagId: 'tag-doc-email-client' },
  { questionId: 'q-lr2-008-1', tagId: 'tag-chart-bar' },
  { questionId: 'q-lr2-008-2', tagId: 'tag-chart-bar' },
  { questionId: 'q-lr2-008-3', tagId: 'tag-sc-meeting' },
  { questionId: 'q-lr2-008-4', tagId: 'tag-indirect-order' },
  { questionId: 'q-lr2-009-1', tagId: 'tag-doc-schedule' },
  { questionId: 'q-lr2-009-2', tagId: 'tag-doc-schedule' },
  { questionId: 'q-lr2-009-3', tagId: 'tag-confirm-info' },
  { questionId: 'q-lr2-009-3', tagId: 'tag-sc-colleague' },
];

export const MOCK_QUESTION_VOCAB: QuestionVocab[] = [
  { questionId: 'q-lr2-007-1', vocabId: 'v-tasseiritsu', relevance: 'tested' },
  { questionId: 'q-lr2-007-2', vocabId: 'v-oguchi', relevance: 'appears' },
  { questionId: 'q-lr2-007-3', vocabId: 'v-kaizenan', relevance: 'tested' },
  { questionId: 'q-lr2-007-3', vocabId: 'v-tasseiritsu', relevance: 'appears' },
  { questionId: 'q-l2-014-1', vocabId: 'v-mairu', relevance: 'tested' },
  { questionId: 'q-l2-014-1', vocabId: 'v-irassharu', relevance: 'tested' },
  { questionId: 'q-r2-021-1', vocabId: 'v-daitaian', relevance: 'tested' },
  { questionId: 'q-r2-021-2', vocabId: 'v-nouki', relevance: 'appears' },
];

export const MOCK_QUESTION_GRAMMAR: QuestionGrammar[] = [
  { questionId: 'q-lr2-007-3', grammarId: 'g-temorau', relevance: 'tested' },
  { questionId: 'q-r1-033-1', grammarId: 'g-sasete-itadaku', relevance: 'tested' },
  { questionId: 'q-r2-021-1', grammarId: 'g-degozaimasu', relevance: 'appears' },
];
